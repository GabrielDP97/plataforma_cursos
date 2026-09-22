import { Context, Next } from "hono";
import { isEnrolled } from "../../domains/enrollment/service";
import { isCourseMember } from "../../domains/auth/ownership";
import { Role } from "../../domains/auth/roles";

/**
 * Middleware that verifies the authenticated user is enrolled in the course.
 *
 * Used by content access, file download, video streaming endpoints.
 * Admin and course owners/instructors bypass the enrollment check.
 *
 * Must be used AFTER requireAuth middleware.
 *
 * Expects the route parameter to be named `courseId`.
 *
 * @returns 401 if unauthenticated, 403 if not enrolled
 */
export function requireEnrollment() {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as { id?: string; role?: string } | undefined;
    const courseId = c.req.param("courseId");

    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        401
      );
    }

    if (!courseId) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Course ID is required",
          },
        },
        400
      );
    }

    // Admin bypass — admin can access any course content
    if (user.role === Role.ADMIN) {
      await next();
      return;
    }

    // Course owner/instructor bypass — they manage content, not enroll
    const isOwner = await isCourseMember(user.id, courseId);
    if (isOwner) {
      await next();
      return;
    }

    // Check enrollment
    const enrolled = await isEnrolled(user.id, courseId);
    if (!enrolled) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_ENROLLED",
            message: "You are not enrolled in this course",
          },
        },
        403
      );
    }

    await next();
  };
}
