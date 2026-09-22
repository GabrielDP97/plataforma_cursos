import { db } from "../../infra/db";
import { course, category, courseCategory } from "../../infra/schema/course";
import { courseInstructors, COURSE_INSTRUCTOR_OWNER } from "../../infra/schema/ownership";
import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { isCourseOwner } from "../auth/ownership";

// ============================================================================
// Course CRUD
// ============================================================================

export interface CreateCourseInput {
  instructorId: string;
  title: string;
  description?: string;
  slug?: string;
  thumbnailUrl?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  slug?: string;
  thumbnailUrl?: string;
}

export interface CourseFilters {
  status?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Validates that a course exists and returns it.
 */
async function getCourseOrThrow(courseId: string) {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!result[0]) {
    throw new CourseError("COURSE_NOT_FOUND", "Course not found", 404);
  }
  return result[0];
}

/**
 * Generate a slug from title (simple version).
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCourse(input: CreateCourseInput) {
  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.title);

  // Check slug uniqueness
  const existingSlug = await db
    .select()
    .from(course)
    .where(eq(course.slug, slug))
    .limit(1);

  if (existingSlug[0]) {
    throw new CourseError("SLUG_TAKEN", "A course with this slug already exists", 409);
  }

  // Create the course
  const [created] = await db
    .insert(course)
    .values({
      title: input.title,
      description: input.description,
      slug,
      thumbnailUrl: input.thumbnailUrl,
      status: "draft",
    })
    .returning();

  // Add the instructor as owner
  await db.insert(courseInstructors).values({
    courseId: created.id,
    userId: input.instructorId,
    role: COURSE_INSTRUCTOR_OWNER,
  });

  return created;
}

export async function updateCourse(
  userId: string,
  courseId: string,
  input: UpdateCourseInput
) {
  await getCourseOrThrow(courseId);

  // Check ownership via course_instructors table
  const isOwner = await isCourseOwner(userId, courseId);
  if (!isOwner) {
    throw new CourseError("FORBIDDEN", "You do not have permission to update this course", 403);
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.thumbnailUrl !== undefined) updateData.thumbnailUrl = input.thumbnailUrl;

  const [updated] = await db
    .update(course)
    .set(updateData)
    .where(eq(course.id, courseId))
    .returning();

  return updated;
}

export async function deleteCourse(userId: string, courseId: string) {
  await getCourseOrThrow(courseId);

  // Only admin can delete
  // Note: This should be checked at the route level with requireRole
  // Here we just perform the deletion
  await db.delete(course).where(eq(course.id, courseId));
}

export async function getCourse(courseId: string) {
  return getCourseOrThrow(courseId);
}

export async function listCourses(filters: CourseFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Default: only show published courses for public listing
  if (filters.status) {
    conditions.push(eq(course.status, filters.status as any));
  } else {
    conditions.push(eq(course.status, "published"));
  }

  // Category filter
  if (filters.categoryId) {
    conditions.push(
      sql`${course.id} IN (SELECT course_id FROM course_category WHERE category_id = ${filters.categoryId})`
    );
  }

  // Search filter
  if (filters.search) {
    conditions.push(
      sql`(${course.title} ILIKE ${`%${filters.search}%`} OR ${course.description} ILIKE ${`%${filters.search}%`})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(course)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  // Get courses
  const courses = await db
    .select()
    .from(course)
    .where(whereClause)
    .orderBy(desc(course.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    courses,
    meta: {
      page,
      limit,
      total,
    },
  };
}

// ============================================================================
// Status Management
// ============================================================================

export async function publishCourse(userId: string, courseId: string) {
  const courseRecord = await getCourseOrThrow(courseId);

  // Check ownership
  const isOwner = await isCourseOwner(userId, courseId);
  if (!isOwner) {
    throw new CourseError("FORBIDDEN", "Only course owners can publish", 403);
  }

  // Validate transition
  if (courseRecord.status !== "draft") {
    throw new CourseError(
      "INVALID_STATUS_TRANSITION",
      `Cannot publish a course with status: ${courseRecord.status}`,
      400
    );
  }

  const [updated] = await db
    .update(course)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(course.id, courseId))
    .returning();

  return updated;
}

export async function archiveCourse(userId: string, courseId: string) {
  const courseRecord = await getCourseOrThrow(courseId);

  const isOwner = await isCourseOwner(userId, courseId);
  if (!isOwner) {
    throw new CourseError("FORBIDDEN", "Only course owners can archive", 403);
  }

  if (courseRecord.status !== "published") {
    throw new CourseError(
      "INVALID_STATUS_TRANSITION",
      `Cannot archive a course with status: ${courseRecord.status}`,
      400
    );
  }

  const [updated] = await db
    .update(course)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(course.id, courseId))
    .returning();

  return updated;
}

export async function unpublishCourse(userId: string, courseId: string) {
  const courseRecord = await getCourseOrThrow(courseId);

  const isOwner = await isCourseOwner(userId, courseId);
  if (!isOwner) {
    throw new CourseError("FORBIDDEN", "Only course owners can unpublish", 403);
  }

  if (courseRecord.status !== "published") {
    throw new CourseError(
      "INVALID_STATUS_TRANSITION",
      `Cannot unpublish a course with status: ${courseRecord.status}`,
      400
    );
  }

  const [updated] = await db
    .update(course)
    .set({
      status: "draft",
      publishedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(course.id, courseId))
    .returning();

  return updated;
}

// ============================================================================
// Categories
// ============================================================================

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
}

function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = input.slug || generateCategorySlug(input.name);

  const existingSlug = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);

  if (existingSlug[0]) {
    throw new CourseError("SLUG_TAKEN", "A category with this slug already exists", 409);
  }

  const [created] = await db
    .insert(category)
    .values({
      name: input.name,
      slug,
      description: input.description,
    })
    .returning();

  return created;
}

export async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
  const existingCategory = await db
    .select()
    .from(category)
    .where(eq(category.id, categoryId))
    .limit(1);

  if (!existingCategory[0]) {
    throw new CourseError("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.description !== undefined) updateData.description = input.description;

  const [updated] = await db
    .update(category)
    .set(updateData)
    .where(eq(category.id, categoryId))
    .returning();

  return updated;
}

export async function deleteCategory(categoryId: string) {
  const existingCategory = await db
    .select()
    .from(category)
    .where(eq(category.id, categoryId))
    .limit(1);

  if (!existingCategory[0]) {
    throw new CourseError("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  await db.delete(category).where(eq(category.id, categoryId));
}

export async function listCategories() {
  return db
    .select()
    .from(category)
    .orderBy(asc(category.name));
}

export async function addCategoryToCourse(courseId: string, categoryId: string) {
  await getCourseOrThrow(courseId);

  const existingCategory = await db
    .select()
    .from(category)
    .where(eq(category.id, categoryId))
    .limit(1);

  if (!existingCategory[0]) {
    throw new CourseError("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  // Check if already assigned
  const existingAssignment = await db
    .select()
    .from(courseCategory)
    .where(
      and(
        eq(courseCategory.courseId, courseId),
        eq(courseCategory.categoryId, categoryId)
      )
    )
    .limit(1);

  if (existingAssignment[0]) {
    throw new CourseError("ALREADY_ASSIGNED", "Category already assigned to this course", 409);
  }

  await db.insert(courseCategory).values({
    courseId,
    categoryId,
  });
}

export async function removeCategoryFromCourse(courseId: string, categoryId: string) {
  await db
    .delete(courseCategory)
    .where(
      and(
        eq(courseCategory.courseId, courseId),
        eq(courseCategory.categoryId, categoryId)
      )
    );
}

// ============================================================================
// Search
// ============================================================================

export async function searchCourses(
  query: string,
  filters: { categoryId?: string; status?: string; page?: number; limit?: number }
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Keyword search on title + description
  if (query) {
    conditions.push(
      sql`(${course.title} ILIKE ${`%${query}%`} OR ${course.description} ILIKE ${`%${query}%`})`
    );
  }

  // Category filter
  if (filters.categoryId) {
    conditions.push(
      sql`${course.id} IN (SELECT course_id FROM course_category WHERE category_id = ${filters.categoryId})`
    );
  }

  // Status filter (default: published for public)
  if (filters.status) {
    conditions.push(eq(course.status, filters.status as any));
  } else {
    conditions.push(eq(course.status, "published"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(course)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  // Get courses
  const courses = await db
    .select()
    .from(course)
    .where(whereClause)
    .orderBy(desc(course.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    courses,
    meta: {
      page,
      limit,
      total,
    },
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class CourseError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "CourseError";
  }
}
