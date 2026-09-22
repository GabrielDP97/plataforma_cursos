import { Hono } from "hono";
import { z } from "zod";
import {
  getInstructorDashboard,
  getCourseManagementView,
  getEnrolledStudents,
  InstructorError,
} from "../../domains/instructor/service";
import { createAnnouncement } from "../../domains/notification/service";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { Role } from "../../domains/auth/roles";
import { ApiResponse } from "../../shared/types";

// Define the environment type for Hono context
type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const instructorRoutes = new Hono<Env>();

// Validation schemas
const announcementSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
});

// GET /api/instructor/dashboard — instructor dashboard
instructorRoutes.get(
  "/dashboard",
  requireAuth,
  requireRole(Role.INSTRUCTOR, Role.ADMIN),
  async (c) => {
    try {
      const user = c.get("user") as { id: string };
      const dashboard = await getInstructorDashboard(user.id);

      const response: ApiResponse<typeof dashboard> = {
        success: true,
        data: dashboard,
      };

      return c.json(response);
    } catch (error: any) {
      if (error instanceof InstructorError) {
        return c.json(
          {
            success: false,
            error: { code: error.code, message: error.message },
          },
          error.status as any
        );
      }

      console.error("Get instructor dashboard error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get instructor dashboard",
          },
        },
        500
      );
    }
  }
);

// GET /api/instructor/courses/:courseId/manage — course management view
instructorRoutes.get(
  "/courses/:courseId/manage",
  requireAuth,
  requireRole(Role.INSTRUCTOR, Role.ADMIN),
  async (c) => {
    try {
      const user = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;

      const managementView = await getCourseManagementView(user.id, courseId);

      const response: ApiResponse<typeof managementView> = {
        success: true,
        data: managementView,
      };

      return c.json(response);
    } catch (error: any) {
      if (error instanceof InstructorError) {
        return c.json(
          {
            success: false,
            error: { code: error.code, message: error.message },
          },
          error.status as any
        );
      }

      console.error("Get course management view error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get course management view",
          },
        },
        500
      );
    }
  }
);

// GET /api/instructor/courses/:courseId/students — enrolled students with progress
instructorRoutes.get(
  "/courses/:courseId/students",
  requireAuth,
  requireRole(Role.INSTRUCTOR, Role.ADMIN),
  async (c) => {
    try {
      const user = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;
      const query = c.req.query();

      const page = parseInt(query.page || "1");
      const limit = parseInt(query.limit || "20");

      const result = await getEnrolledStudents(user.id, courseId, {
        page,
        limit,
      });

      const response: ApiResponse<typeof result.students> = {
        success: true,
        data: result.students,
        meta: result.meta,
      };

      return c.json(response);
    } catch (error: any) {
      if (error instanceof InstructorError) {
        return c.json(
          {
            success: false,
            error: { code: error.code, message: error.message },
          },
          error.status as any
        );
      }

      console.error("Get enrolled students error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get enrolled students",
          },
        },
        500
      );
    }
  }
);

// POST /api/instructor/courses/:courseId/announcements — create announcement
instructorRoutes.post(
  "/courses/:courseId/announcements",
  requireAuth,
  requireRole(Role.INSTRUCTOR, Role.ADMIN),
  async (c) => {
    try {
      const user = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;
      const body = await c.req.json();
      const validatedData = announcementSchema.parse(body);

      const result = await createAnnouncement(
        user.id,
        courseId,
        validatedData.title,
        validatedData.message
      );

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      return c.json(response, 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid input data",
            },
          },
          400
        );
      }

      if (error instanceof InstructorError) {
        return c.json(
          {
            success: false,
            error: { code: error.code, message: error.message },
          },
          error.status as any
        );
      }

      console.error("Create announcement error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create announcement",
          },
        },
        500
      );
    }
  }
);

export default instructorRoutes;
