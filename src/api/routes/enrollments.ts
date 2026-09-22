import { Hono } from "hono";
import { z } from "zod";
import {
  enrollStudent,
  unenrollStudent,
  listUserEnrollments,
  listCourseStudents,
  completeEnrollment,
  getEnrollment,
  EnrollmentError,
} from "../../domains/enrollment/service";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { requireOwnership } from "../middleware/requireOwnership";
import { getProfile } from "../../domains/user/service";
import { course } from "../../infra/schema/course";
import { db } from "../../infra/db";
import { eq } from "drizzle-orm";
import { ApiResponse } from "../../shared/types";
import { Role } from "../../domains/auth/roles";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

// ============================================================================
// Course-scoped enrollment routes (mounted under /api/courses/:courseId/...)
// ============================================================================

const courseEnrollmentRoutes = new Hono<Env>();

const enrollSchema = z.object({
  source: z.enum(["free", "purchase", "admin", "invitation", "subscription"]).optional(),
});

// POST /enroll — enroll in course (admin only — self-enrollment removed)
courseEnrollmentRoutes.post("/enroll", requireAuth, requireRole(Role.ADMIN), async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const courseId = c.req.param("courseId")!;
    const body = await c.req.json().catch(() => ({}));
    const validated = enrollSchema.parse(body);

    const enrollment = await enrollStudent({
      userId: user.id,
      courseId,
      source: validated.source as any,
    });

    // Send enrollment confirmation email (M14, non-blocking)
    try {
      const { getConfig } = await import("../../config/env");
      const config = getConfig();
      if (config.resendApiKey) {
        const [courseData] = await db
          .select({ title: course.title })
          .from(course)
          .where(eq(course.id, courseId))
          .limit(1);

        if (courseData) {
          const userProfile = await getProfile(user.id);
          const { ResendEmailProvider } = await import("../../infra/providers/resend-email");
          const { EmailService } = await import("../../infra/email/service");
          const emailProvider = new ResendEmailProvider(config.resendApiKey);
          const emailService = new EmailService(emailProvider);
          await emailService.sendEnrollmentConfirmation(
            userProfile.email,
            courseData.title
          );
        }
      }
    } catch (emailError) {
      // Don't fail enrollment if email fails
      console.error("Failed to send enrollment confirmation email:", emailError);
    }

    const response: ApiResponse<typeof enrollment> = {
      success: true,
      data: enrollment,
    };

    return c.json(response, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid input data" },
        },
        400
      );
    }

    if (error instanceof EnrollmentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Enroll error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to enroll" },
      },
      500
    );
  }
});

// DELETE /enroll — unenroll
courseEnrollmentRoutes.delete("/enroll", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const courseId = c.req.param("courseId")!;

    await unenrollStudent(user.id, courseId);

    return c.json({
      success: true,
      data: { message: "Unenrolled successfully" },
    });
  } catch (error: any) {
    if (error instanceof EnrollmentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Unenroll error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to unenroll" },
      },
      500
    );
  }
});

// GET /enrollments — list students for course (instructor/admin)
courseEnrollmentRoutes.get("/enrollments", requireAuth, requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const query = c.req.query();
    const page = z.coerce.number().int().min(1).default(1).parse(query.page);
    const limit = z.coerce.number().int().min(1).max(100).default(20).parse(query.limit);

    const result = await listCourseStudents(courseId, { page, limit });

    const response: ApiResponse<typeof result.enrollments> = {
      success: true,
      data: result.enrollments,
      meta: result.meta,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
        },
        400
      );
    }

    console.error("List course students error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list students" },
      },
      500
    );
  }
});

// POST /complete — mark enrollment complete
courseEnrollmentRoutes.post("/complete", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const courseId = c.req.param("courseId")!;

    await completeEnrollment(user.id, courseId);

    return c.json({
      success: true,
      data: { message: "Enrollment completed" },
    });
  } catch (error: any) {
    if (error instanceof EnrollmentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Complete enrollment error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to complete enrollment" },
      },
      500
    );
  }
});

// GET /enrollment — check own enrollment status
courseEnrollmentRoutes.get("/enrollment", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const courseId = c.req.param("courseId")!;

    const enrollment = await getEnrollment(user.id, courseId);

    const response: ApiResponse<{ enrolled: boolean; enrollment: typeof enrollment }> = {
      success: true,
      data: {
        enrolled: enrollment?.status === "active",
        enrollment,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Check enrollment error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to check enrollment" },
      },
      500
    );
  }
});

// ============================================================================
// User-scoped enrollment routes (mounted under /api/me/...)
// ============================================================================

const meEnrollmentRoutes = new Hono<Env>();

meEnrollmentRoutes.get("/enrollments", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const query = c.req.query();
    const page = z.coerce.number().int().min(1).default(1).parse(query.page);
    const limit = z.coerce.number().int().min(1).max(100).default(20).parse(query.limit);

    const result = await listUserEnrollments(user.id, { page, limit });

    const response: ApiResponse<typeof result.enrollments> = {
      success: true,
      data: result.enrollments,
      meta: result.meta,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
        },
        400
      );
    }

    console.error("List enrollments error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list enrollments" },
      },
      500
    );
  }
});

export { courseEnrollmentRoutes, meEnrollmentRoutes };
