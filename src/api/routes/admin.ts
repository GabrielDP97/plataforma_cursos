import { Hono } from "hono";
import { z } from "zod";
import {
  getAdminDashboard,
  listUsers,
  updateUser,
  disableUser,
  listAllCourses,
  getCourseById,
  updateCourse,
  getPlatformSettings,
  createUser,
  resetUserPassword,
  AdminError,
} from "../../domains/admin/service";
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

const adminRoutes = new Hono<Env>();

// All admin routes require authentication + ADMIN role
adminRoutes.use("*", requireAuth, requireRole(Role.ADMIN));

// Validation schemas
const updateUserSchema = z.object({
  role: z.enum(["student", "instructor", "admin"]).optional(),
  enabled: z.boolean().optional(),
});

const updateCourseSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
});

const listCoursesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  email: z.string().email("Invalid email address"),
  role: z.enum(["student", "instructor", "admin"]),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(255)
    .regex(
      /^[a-z0-9][a-z0-9._-]*$/,
      "Username must be lowercase alphanumeric with dots, hyphens, or underscores"
    )
    .optional(),
  courseIds: z.array(z.string().uuid()).optional(),
});

// GET /api/admin/dashboard — platform overview
adminRoutes.get("/dashboard", async (c) => {
  try {
    const dashboard = await getAdminDashboard();

    const response: ApiResponse<typeof dashboard> = {
      success: true,
      data: dashboard,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get admin dashboard error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get admin dashboard",
        },
      },
      500
    );
  }
});

// POST /api/admin/users — Create user (admin only)
adminRoutes.post("/users", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createUserSchema.parse(body);

    const result = await createUser({
      fullName: validatedData.fullName,
      email: validatedData.email,
      role: validatedData.role,
      username: validatedData.username,
      courseIds: validatedData.courseIds,
    });

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
            details: error.issues,
          },
        },
        400
      );
    }

    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Create user error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create user" },
      },
      500
    );
  }
});

// GET /api/admin/users — list users with pagination + search
adminRoutes.get("/users", async (c) => {
  try {
    const query = c.req.query();
    const validatedParams = listUsersSchema.parse(query);

    const result = await listUsers(validatedParams);

    const response: ApiResponse<typeof result.users> = {
      success: true,
      data: result.users,
      meta: result.meta,
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

    console.error("List users error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list users" },
      },
      500
    );
  }
});

// PATCH /api/admin/users/:userId — update user (role, enabled/disabled)
adminRoutes.patch("/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId")!;
    const currentUser = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = updateUserSchema.parse(body);

    // Prevent self-demotion
    if (userId === currentUser.id && validatedData.role) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot change your own role",
          },
        },
        403
      );
    }

    await updateUser(userId, validatedData);

    return c.json({
      success: true,
      data: { message: "User updated successfully" },
    });
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

    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Update user error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update user" },
      },
      500
    );
  }
});

// PATCH /api/admin/users/:userId/disable — disable user
adminRoutes.patch("/users/:userId/disable", async (c) => {
  try {
    const userId = c.req.param("userId")!;
    const currentUser = c.get("user") as { id: string };

    // Prevent self-disabling
    if (userId === currentUser.id) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot disable your own account",
          },
        },
        403
      );
    }

    await disableUser(userId);

    return c.json({
      success: true,
      data: { message: "User disabled successfully" },
    });
  } catch (error: any) {
    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Disable user error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to disable user" },
      },
      500
    );
  }
});

// POST /api/admin/users/:userId/reset-password — reset user password (admin only)
adminRoutes.post("/users/:userId/reset-password", async (c) => {
  try {
    const userId = c.req.param("userId")!;
    const result = await resetUserPassword(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Reset password error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reset password" },
      },
      500
    );
  }
});

// GET /api/admin/courses — list all courses with pagination + search
adminRoutes.get("/courses", async (c) => {
  try {
    const query = c.req.query();
    const validatedParams = listCoursesSchema.parse(query);

    const result = await listAllCourses(validatedParams);

    const response: ApiResponse<typeof result.courses> = {
      success: true,
      data: result.courses,
      meta: result.meta,
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

    console.error("List courses error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to list courses",
        },
      },
      500
    );
  }
});

// GET /api/admin/courses/:courseId — course detail with modules/lessons/content
adminRoutes.get("/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const courseDetail = await getCourseById(courseId);

    const response: ApiResponse<typeof courseDetail> = {
      success: true,
      data: courseDetail,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Get course detail error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get course detail",
        },
      },
      500
    );
  }
});

// PATCH /api/admin/courses/:courseId — admin course actions (status change)
adminRoutes.patch("/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const body = await c.req.json();
    const validatedData = updateCourseSchema.parse(body);

    await updateCourse(courseId, validatedData);

    return c.json({
      success: true,
      data: { message: "Course updated successfully" },
    });
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

    if (error instanceof AdminError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Update course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update course" },
      },
      500
    );
  }
});

// GET /api/admin/settings — platform settings
adminRoutes.get("/settings", async (c) => {
  try {
    const settings = await getPlatformSettings();

    const response: ApiResponse<typeof settings> = {
      success: true,
      data: settings,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get platform settings error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get platform settings",
        },
      },
      500
    );
  }
});

export default adminRoutes;
