import { db } from "../../infra/db";
import { enrollment } from "../../infra/schema/enrollment";
import { course } from "../../infra/schema/course";
import { eq, and, count, sql } from "drizzle-orm";
import { ENROLLMENT_SOURCE } from "../../shared/constants";

// ============================================================================
// Enrollment Service (M8)
// ============================================================================

export interface EnrollInput {
  userId: string;
  courseId: string;
  source?: "free" | "purchase" | "admin" | "invitation" | "subscription";
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

/**
 * Validates that a course exists, is published, and returns it.
 */
async function getPublishableCourseOrThrow(courseId: string) {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!result[0]) {
    throw new EnrollmentError("COURSE_NOT_FOUND", "Course not found", 404);
  }

  if (result[0].status !== "published") {
    throw new EnrollmentError(
      "COURSE_NOT_PUBLISHED",
      "Course is not available for enrollment",
      403
    );
  }

  return result[0];
}

/**
 * Check if a student is already enrolled in a course.
 */
async function findExistingEnrollment(userId: string, courseId: string) {
  const result = await db
    .select()
    .from(enrollment)
    .where(and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)))
    .limit(1);

  return result[0];
}

// ============================================================================
// Enroll
// ============================================================================

/**
 * Enroll a student in a free course (idempotent).
 * If already enrolled with active status, returns existing enrollment.
 * If previously dropped, creates a new active enrollment.
 */
export async function enrollStudent(input: EnrollInput) {
  const { userId, courseId, source = ENROLLMENT_SOURCE.FREE } = input;

  // Validate course exists and is published
  await getPublishableCourseOrThrow(courseId);

  // Check for existing enrollment
  const existing = await findExistingEnrollment(userId, courseId);

  if (existing) {
    // If already active or completed, return existing (idempotent)
    if (existing.status === "active" || existing.status === "completed") {
      return existing;
    }

    // If previously dropped, re-enroll (set back to active)
    if (existing.status === "dropped") {
      const [reEnrolled] = await db
        .update(enrollment)
        .set({
          status: "active",
          enrolledAt: new Date(),
          completedAt: null,
        })
        .where(eq(enrollment.id, existing.id))
        .returning();

      return reEnrolled;
    }
  }

  // Create new enrollment
  const [created] = await db
    .insert(enrollment)
    .values({
      userId,
      courseId,
      status: "active",
      source,
    })
    .returning();

  return created;
}

// ============================================================================
// Unenroll
// ============================================================================

/**
 * Drop a student from a course. Sets status to 'dropped'.
 */
export async function unenrollStudent(userId: string, courseId: string) {
  const existing = await findExistingEnrollment(userId, courseId);

  if (!existing) {
    throw new EnrollmentError("NOT_ENROLLED", "Not enrolled in this course", 404);
  }

  if (existing.status === "dropped") {
    throw new EnrollmentError("ALREADY_DROPPED", "Already dropped from this course", 400);
  }

  await db
    .update(enrollment)
    .set({ status: "dropped" })
    .where(eq(enrollment.id, existing.id));
}

// ============================================================================
// Check enrollment
// ============================================================================

/**
 * Check if a student is enrolled (active) in a course.
 */
export async function isEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  const existing = await findExistingEnrollment(userId, courseId);
  return existing !== undefined && existing.status === "active";
}

// ============================================================================
// List enrollments
// ============================================================================

/**
 * List all enrollments for a user (student's enrolled courses).
 */
export async function listUserEnrollments(
  userId: string,
  pagination: PaginationInput = {}
) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  const offset = (page - 1) * limit;

  const whereClause = eq(enrollment.userId, userId);

  const [totalResult] = await db
    .select({ total: count() })
    .from(enrollment)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  const enrollments = await db
    .select()
    .from(enrollment)
    .where(whereClause)
    .orderBy(sql`${enrollment.enrolledAt} DESC`)
    .limit(limit)
    .offset(offset);

  return {
    enrollments,
    meta: { page, limit, total },
  };
}

/**
 * List all students enrolled in a course (instructor/admin view).
 */
export async function listCourseStudents(
  courseId: string,
  pagination: PaginationInput = {}
) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  const offset = (page - 1) * limit;

  const whereClause = eq(enrollment.courseId, courseId);

  const [totalResult] = await db
    .select({ total: count() })
    .from(enrollment)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  const enrollments = await db
    .select()
    .from(enrollment)
    .where(whereClause)
    .orderBy(sql`${enrollment.enrolledAt} DESC`)
    .limit(limit)
    .offset(offset);

  return {
    enrollments,
    meta: { page, limit, total },
  };
}

// ============================================================================
// Complete enrollment
// ============================================================================

/**
 * Mark an enrollment as completed.
 */
export async function completeEnrollment(userId: string, courseId: string) {
  const existing = await findExistingEnrollment(userId, courseId);

  if (!existing) {
    throw new EnrollmentError("NOT_ENROLLED", "Not enrolled in this course", 404);
  }

  if (existing.status !== "active") {
    throw new EnrollmentError(
      "INVALID_STATUS_TRANSITION",
      `Cannot complete enrollment with status: ${existing.status}`,
      400
    );
  }

  await db
    .update(enrollment)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(enrollment.id, existing.id));
}

// ============================================================================
// Get enrollment
// ============================================================================

/**
 * Get a specific enrollment record.
 */
export async function getEnrollment(userId: string, courseId: string) {
  return findExistingEnrollment(userId, courseId);
}

// ============================================================================
// Custom error class
// ============================================================================

export class EnrollmentError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "EnrollmentError";
  }
}
