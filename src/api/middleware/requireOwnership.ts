import { Context, Next } from "hono";
import { isCourseMember } from "../../domains/auth/ownership";
import { Role } from "../../domains/auth/roles";

/**
 * Middleware that verifies the authenticated user has course-level access.
 *
 * Checks the `course_instructors` table for a (courseId, userId) entry.
 * Admin users bypass this check.
 *
 * Must be used AFTER requireAuth middleware.
 *
 * Expects the route parameter to be named `courseId`.
 *
 * @returns 401 if unauthenticated, 403 if user has no access to the course
 */
export function requireOwnership() {
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

    // Admin bypass — admin can access any course
    if (user.role === Role.ADMIN) {
      await next();
      return;
    }

    const hasAccess = await isCourseMember(user.id, courseId);
    if (!hasAccess) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have access to this course",
          },
        },
        403
      );
    }

    await next();
  };
}
