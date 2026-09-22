import { Hono } from "hono";
import { z } from "zod";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  ContentError,
  getModuleOrThrow,
  getLessonOrThrow,
} from "../../domains/content/service";
import { requireOwnership } from "../middleware/requireOwnership";
import { isCourseMember } from "../../domains/auth/ownership";
import { ApiResponse } from "../../shared/types";

// Define the environment type for Hono context
type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const lessonRoutes = new Hono<Env>();

// Validation schemas
const createLessonSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});

// POST /api/modules/:moduleId/lessons — create lesson
lessonRoutes.post("/", requireOwnership(), async (c) => {
  try {
    const moduleId = c.req.param("moduleId")!;
    const user = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = createLessonSchema.parse(body);

    const lesson = await createLesson(user.id, {
      moduleId,
      ...validatedData,
    });

    const response: ApiResponse<typeof lesson> = {
      success: true,
      data: lesson,
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

    if (error instanceof ContentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Create lesson error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create lesson" },
      },
      500
    );
  }
});

// PATCH /api/lessons/:lessonId — update lesson
lessonRoutes.patch("/:lessonId", async (c) => {
  try {
    const lessonId = c.req.param("lessonId")!;
    const user = c.get("user") as { id: string; role?: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    // Lookup lesson → module → courseId for ownership check
    const lessonRecord = await getLessonOrThrow(lessonId);
    const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);

    if (user.role !== "admin") {
      const hasAccess = await isCourseMember(user.id, moduleRecord.courseId);
      if (!hasAccess) {
        return c.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "You do not have access to this course" },
          },
          403
        );
      }
    }

    const body = await c.req.json();
    const validatedData = updateLessonSchema.parse(body);

    const lesson = await updateLesson(user.id, lessonId, validatedData);

    const response: ApiResponse<typeof lesson> = {
      success: true,
      data: lesson,
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

    if (error instanceof ContentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Update lesson error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update lesson" },
      },
      500
    );
  }
});

// DELETE /api/lessons/:lessonId — delete lesson
lessonRoutes.delete("/:lessonId", async (c) => {
  try {
    const lessonId = c.req.param("lessonId")!;
    const user = c.get("user") as { id: string; role?: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    const lessonRecord = await getLessonOrThrow(lessonId);
    const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);

    if (user.role !== "admin") {
      const hasAccess = await isCourseMember(user.id, moduleRecord.courseId);
      if (!hasAccess) {
        return c.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "You do not have access to this course" },
          },
          403
        );
      }
    }

    await deleteLesson(user.id, lessonId);

    return c.json({
      success: true,
      data: { message: "Lesson deleted successfully" },
    });
  } catch (error: any) {
    if (error instanceof ContentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Delete lesson error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete lesson" },
      },
      500
    );
  }
});

// POST /api/lessons/:lessonId/reorder — reorder lessons
lessonRoutes.post("/:lessonId/reorder", async (c) => {
  try {
    const lessonId = c.req.param("lessonId")!;
    const user = c.get("user") as { id: string; role?: string };

    if (!user?.id) {
      return c.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        401
      );
    }

    const lessonRecord = await getLessonOrThrow(lessonId);
    const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);

    if (user.role !== "admin") {
      const hasAccess = await isCourseMember(user.id, moduleRecord.courseId);
      if (!hasAccess) {
        return c.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "You do not have access to this course" },
          },
          403
        );
      }
    }

    const body = await c.req.json();
    const validatedData = reorderSchema.parse(body);

    await reorderLessons(user.id, lessonRecord.moduleId, validatedData.lessonIds);

    return c.json({
      success: true,
      data: { message: "Lessons reordered successfully" },
    });
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

    if (error instanceof ContentError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Reorder lessons error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reorder lessons" },
      },
      500
    );
  }
});

export default lessonRoutes;
