import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../infra/db";
import { course, category, courseCategory } from "../../infra/schema/course";
import { module as moduleTable, lesson as lessonTable } from "../../infra/schema/content";
import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { ApiResponse } from "../../shared/types";

const catalogRoutes = new Hono();

// Validation schemas
const catalogSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// courseSlugSchema removed — slug validated inline in route params

// ============================================================================
// GET /api/catalog — published courses with pagination, search, categories
// ============================================================================
catalogRoutes.get("/", async (c) => {
  try {
    const query = c.req.query();
    const validatedParams = catalogSchema.parse(query);

    const page = validatedParams.page;
    const limit = validatedParams.limit;
    const offset = (page - 1) * limit;

    const conditions = [];

    // Only show published courses in catalog
    conditions.push(eq(course.status, "published"));

    // Search filter
    if (validatedParams.q) {
      conditions.push(
        sql`(${course.title} ILIKE ${`%${validatedParams.q}%`} OR ${course.description} ILIKE ${`%${validatedParams.q}%`})`
      );
    }

    // Category filter
    if (validatedParams.categoryId) {
      conditions.push(
        sql`${course.id} IN (SELECT course_id FROM course_category WHERE category_id = ${validatedParams.categoryId})`
      );
    }

    const whereClause = and(...conditions);

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

    // Enrich courses with category names and lesson count
    const enrichedCourses = await Promise.all(
      courses.map(async (courseRecord) => {
        // Get categories for this course
        const courseCategories = await db
          .select({
            id: category.id,
            name: category.name,
            slug: category.slug,
          })
          .from(category)
          .innerJoin(
            courseCategory,
            eq(category.id, courseCategory.categoryId)
          )
          .where(eq(courseCategory.courseId, courseRecord.id));

        // Get total lessons count
        const lessonCountResult = await db
          .select({ total: count() })
          .from(lessonTable)
          .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
          .where(
            and(
              eq(moduleTable.courseId, courseRecord.id),
              eq(lessonTable.visible, true),
              eq(moduleTable.visible, true)
            )
          );

        return {
          ...courseRecord,
          categories: courseCategories,
          lessonCount: lessonCountResult[0]?.total ?? 0,
        };
      })
    );

    const response: ApiResponse<typeof enrichedCourses> = {
      success: true,
      data: enrichedCourses,
      meta: { page, limit, total },
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
          },
        },
        400
      );
    }

    console.error("Catalog error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to load catalog" },
      },
      500
    );
  }
});

// ============================================================================
// GET /api/catalog/:slug — course detail page (public view)
// ============================================================================
catalogRoutes.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug")!;

    // Get course by slug
    const courseResult = await db
      .select()
      .from(course)
      .where(and(eq(course.slug, slug), eq(course.status, "published")))
      .limit(1);

    if (!courseResult[0]) {
      return c.json(
        {
          success: false,
          error: { code: "COURSE_NOT_FOUND", message: "Course not found" },
        },
        404
      );
    }

    const courseRecord = courseResult[0];

    // Get categories for this course
    const courseCategories = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      })
      .from(category)
      .innerJoin(courseCategory, eq(category.id, courseCategory.categoryId))
      .where(eq(courseCategory.courseId, courseRecord.id));

    // Get modules with lessons
    const modules = await db
      .select()
      .from(moduleTable)
      .where(eq(moduleTable.courseId, courseRecord.id))
      .orderBy(asc(moduleTable.position));

    const modulesWithLessons = await Promise.all(
      modules.map(async (moduleRecord) => {
        const lessons = await db
          .select({
            id: lessonTable.id,
            title: lessonTable.title,
            description: lessonTable.description,
            position: lessonTable.position,
          })
          .from(lessonTable)
          .where(eq(lessonTable.moduleId, moduleRecord.id))
          .orderBy(asc(lessonTable.position));

        return {
          id: moduleRecord.id,
          title: moduleRecord.title,
          description: moduleRecord.description,
          position: moduleRecord.position,
          lessons,
        };
      })
    );

    // Get total lesson count
    const lessonCountResult = await db
      .select({ total: count() })
      .from(lessonTable)
      .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
      .where(
        and(
          eq(moduleTable.courseId, courseRecord.id),
          eq(lessonTable.visible, true),
          eq(moduleTable.visible, true)
        )
      );

    const response: ApiResponse<{
      course: typeof courseRecord;
      categories: typeof courseCategories;
      modules: typeof modulesWithLessons;
      lessonCount: number;
    }> = {
      success: true,
      data: {
        course: courseRecord,
        categories: courseCategories,
        modules: modulesWithLessons,
        lessonCount: lessonCountResult[0]?.total ?? 0,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Catalog course detail error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load course details",
        },
      },
      500
    );
  }
});

export default catalogRoutes;
