import { Hono } from "hono";
import { z } from "zod";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  listCourses,
  publishCourse,
  archiveCourse,
  unpublishCourse,
  searchCourses,
  addCategoryToCourse,
  removeCategoryFromCourse,
  CourseError,
} from "../../domains/course/service";
import { requireRole } from "../middleware/requireRole";
import { requireOwnership } from "../middleware/requireOwnership";
import { Role } from "../../domains/auth/roles";
import { ApiResponse } from "../../shared/types";

// Define the environment type for Hono context
type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const courseRoutes = new Hono<Env>();

// Validation schemas
const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  slug: z.string().min(1).max(255).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  slug: z.string().min(1).max(255).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const categorySchema = z.object({
  categoryId: z.string().uuid(),
});

const searchSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// POST /api/courses — create course (instructor+)
courseRoutes.post("/", requireRole(Role.INSTRUCTOR, Role.ADMIN), async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = createCourseSchema.parse(body);

    const course = await createCourse({
      instructorId: user.id,
      ...validatedData,
    });

    const response: ApiResponse<typeof course> = {
      success: true,
      data: course,
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

    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Create course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create course" },
      },
      500
    );
  }
});

// GET /api/courses — list courses (public, with pagination)
courseRoutes.get("/", async (c) => {
  try {
    const query = c.req.query();
    const validatedParams = listSchema.parse(query);

    const result = await listCourses({
      status: validatedParams.status,
      categoryId: validatedParams.categoryId,
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

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
          error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
        },
        400
      );
    }

    console.error("List courses error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list courses" },
      },
      500
    );
  }
});

// GET /api/courses/search — search courses
courseRoutes.get("/search", async (c) => {
  try {
    const query = c.req.query();
    const validatedParams = searchSchema.parse(query);

    const result = await searchCourses(validatedParams.q || "", {
      categoryId: validatedParams.categoryId,
      status: validatedParams.status,
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

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
          error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
        },
        400
      );
    }

    console.error("Search courses error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to search courses" },
      },
      500
    );
  }
});

// GET /api/courses/:courseId — get course details
courseRoutes.get("/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const courseData = await getCourse(courseId);

    const response: ApiResponse<typeof courseData> = {
      success: true,
      data: courseData,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Get course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get course" },
      },
      500
    );
  }
});

// GET /api/courses/:courseId/modules — list modules for a course
courseRoutes.get("/:courseId/modules", async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const { db } = await import("../../infra/db");
    const { module: moduleTable } = await import("../../infra/schema");
    const { eq, asc } = await import("drizzle-orm");

    const modules = await db
      .select()
      .from(moduleTable)
      .where(eq(moduleTable.courseId, courseId))
      .orderBy(asc(moduleTable.position));

    return c.json({ success: true, data: modules });
  } catch (error: any) {
    console.error("List modules error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list modules" },
      },
      500
    );
  }
});

// PATCH /api/courses/:courseId — update course (owner/admin)
courseRoutes.patch("/:courseId", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = updateCourseSchema.parse(body);

    const updated = await updateCourse(user.id, courseId, validatedData);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
    };

    return c.json(response);
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

    if (error instanceof CourseError) {
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

// DELETE /api/courses/:courseId — delete course (admin only)
courseRoutes.delete("/:courseId", requireRole(Role.ADMIN), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };

    await deleteCourse(user.id, courseId);

    return c.json({
      success: true,
      data: { message: "Course deleted successfully" },
    });
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Delete course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete course" },
      },
      500
    );
  }
});

// POST /api/courses/:courseId/publish — publish (owner/admin)
courseRoutes.post("/:courseId/publish", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };

    const updated = await publishCourse(user.id, courseId);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Publish course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to publish course" },
      },
      500
    );
  }
});

// POST /api/courses/:courseId/archive — archive (owner/admin)
courseRoutes.post("/:courseId/archive", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };

    const updated = await archiveCourse(user.id, courseId);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Archive course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to archive course" },
      },
      500
    );
  }
});

// POST /api/courses/:courseId/unpublish — unpublish (owner/admin)
courseRoutes.post("/:courseId/unpublish", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };

    const updated = await unpublishCourse(user.id, courseId);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Unpublish course error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to unpublish course" },
      },
      500
    );
  }
});

// POST /api/courses/:courseId/categories — add category
courseRoutes.post("/:courseId/categories", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const body = await c.req.json();
    const validatedData = categorySchema.parse(body);

    await addCategoryToCourse(courseId, validatedData.categoryId);

    return c.json({
      success: true,
      data: { message: "Category added to course" },
    }, 201);
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

    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Add category error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to add category" },
      },
      500
    );
  }
});

// DELETE /api/courses/:courseId/categories/:categoryId — remove category
courseRoutes.delete("/:courseId/categories/:categoryId", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const categoryId = c.req.param("categoryId")!;

    await removeCategoryFromCourse(courseId, categoryId);

    return c.json({
      success: true,
      data: { message: "Category removed from course" },
    });
  } catch (error: any) {
    if (error instanceof CourseError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Remove category error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to remove category" },
      },
      500
    );
  }
});

export default courseRoutes;
