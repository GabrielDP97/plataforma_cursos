import { Hono } from "hono";
import { z } from "zod";
import {
  startLesson,
  completeLesson,
  getLessonProgress,
  updateVideoProgress,
  getVideoProgress,
  getCourseProgress,
  getModuleProgress,
  ProgressError,
} from "../../domains/progress/service";
import { requireAuth } from "../middleware/auth";
import { ApiResponse } from "../../shared/types";
import { resolveLessonId } from "../../lib/resolve-lesson-id";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const progressRoutes = new Hono<Env>();

// Validation schemas
const videoProgressSchema = z.object({
  positionSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0).optional(),
});

// POST /api/lessons/:lessonId/start — start lesson
progressRoutes.post("/lessons/:lessonId/start", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const lessonRef = c.req.param("lessonId")!;

    // Resolve source ID (e.g. "lesson-18-5") to database UUID
    const lessonId = await resolveLessonId(lessonRef);
    if (!lessonId) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lesson not found" } },
        404
      );
    }

    const progress = await startLesson(user.id, lessonId);

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
    };

    return c.json(response, 200);
  } catch (error: any) {
    if (error instanceof ProgressError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Start lesson error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to start lesson" },
      },
      500
    );
  }
});

// POST /api/lessons/:lessonId/complete — complete lesson
progressRoutes.post("/lessons/:lessonId/complete", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const lessonRef = c.req.param("lessonId")!;

    // Resolve source ID to database UUID
    const lessonId = await resolveLessonId(lessonRef);
    if (!lessonId) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lesson not found" } },
        404
      );
    }

    const progress = await completeLesson(user.id, lessonId);

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
    };

    return c.json(response, 200);
  } catch (error: any) {
    if (error instanceof ProgressError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Complete lesson error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to complete lesson" },
      },
      500
    );
  }
});

// GET /api/lessons/:lessonId/progress — get lesson progress
progressRoutes.get("/lessons/:lessonId/progress", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const lessonRef = c.req.param("lessonId")!;

    // Resolve source ID to database UUID
    const lessonId = await resolveLessonId(lessonRef);
    if (!lessonId) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lesson not found" } },
        404
      );
    }

    const progress = await getLessonProgress(user.id, lessonId);

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get lesson progress error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get lesson progress" },
      },
      500
    );
  }
});

// POST /api/video/:videoId/progress — update video position
progressRoutes.post("/video/:videoId/progress", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const videoId = c.req.param("videoId")!;
    const body = await c.req.json();
    const validated = videoProgressSchema.parse(body);

    // videoId maps to lessonId in video_progress table
    const progress = await updateVideoProgress(
      user.id,
      videoId,
      validated.positionSeconds,
      validated.durationSeconds
    );

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
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

    if (error instanceof ProgressError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Update video progress error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update video progress" },
      },
      500
    );
  }
});

// GET /api/video/:videoId/progress — get video position
progressRoutes.get("/video/:videoId/progress", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const videoId = c.req.param("videoId")!;

    const progress = await getVideoProgress(user.id, videoId);

    const response: ApiResponse<{ progress: typeof progress }> = {
      success: true,
      data: { progress },
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get video progress error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get video progress" },
      },
      500
    );
  }
});

// GET /api/courses/:courseId/progress — get course progress
progressRoutes.get("/courses/:courseId/progress", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const courseId = c.req.param("courseId")!;

    const progress = await getCourseProgress(user.id, courseId);

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get course progress error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get course progress" },
      },
      500
    );
  }
});

// GET /api/modules/:moduleId/progress — get module progress
progressRoutes.get("/modules/:moduleId/progress", requireAuth, async (c) => {
  try {
    const user = c.get("user") as { id: string };
    const moduleId = c.req.param("moduleId")!;

    const progress = await getModuleProgress(user.id, moduleId);

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Get module progress error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get module progress" },
      },
      500
    );
  }
});

export default progressRoutes;
