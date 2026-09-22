import { Hono } from "hono";
import { z } from "zod";
import {
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  reorderContentBlocks,
  ContentError,
  getModuleOrThrow,
  getLessonOrThrow,
  getContentBlockOrThrow,
  BlockType,
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

const contentBlockRoutes = new Hono<Env>();

// Validation schemas
const createBlockSchema = z.object({
  type: z.enum(["text", "video", "file", "code", "link"]),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().min(0).optional(),
});

const updateBlockSchema = z.object({
  content: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  blockIds: z.array(z.string().uuid()).min(1),
});

// POST /api/lessons/:lessonId/blocks — create content block
contentBlockRoutes.post("/", requireOwnership(), async (c) => {
  try {
    const lessonId = c.req.param("lessonId")!;
    const user = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = createBlockSchema.parse(body);

    const block = await createContentBlock(user.id, {
      lessonId,
      type: validatedData.type as BlockType,
      content: validatedData.content,
      metadata: validatedData.metadata,
      position: validatedData.position,
    });

    const response: ApiResponse<typeof block> = {
      success: true,
      data: block,
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

    console.error("Create content block error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create content block" },
      },
      500
    );
  }
});

// PATCH /api/blocks/:blockId — update content block
contentBlockRoutes.patch("/:blockId", async (c) => {
  try {
    const blockId = c.req.param("blockId")!;
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

    // Lookup block → lesson → module → courseId for ownership check
    const blockRecord = await getContentBlockOrThrow(blockId);
    const lessonRecord = await getLessonOrThrow(blockRecord.lessonId);
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
    const validatedData = updateBlockSchema.parse(body);

    const block = await updateContentBlock(user.id, blockId, validatedData);

    const response: ApiResponse<typeof block> = {
      success: true,
      data: block,
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

    console.error("Update content block error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update content block" },
      },
      500
    );
  }
});

// DELETE /api/blocks/:blockId — delete content block
contentBlockRoutes.delete("/:blockId", async (c) => {
  try {
    const blockId = c.req.param("blockId")!;
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

    const blockRecord = await getContentBlockOrThrow(blockId);
    const lessonRecord = await getLessonOrThrow(blockRecord.lessonId);
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

    await deleteContentBlock(user.id, blockId);

    return c.json({
      success: true,
      data: { message: "Content block deleted successfully" },
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

    console.error("Delete content block error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete content block" },
      },
      500
    );
  }
});

// POST /api/blocks/:blockId/reorder — reorder content blocks
contentBlockRoutes.post("/:blockId/reorder", async (c) => {
  try {
    const blockId = c.req.param("blockId")!;
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

    const blockRecord = await getContentBlockOrThrow(blockId);
    const lessonRecord = await getLessonOrThrow(blockRecord.lessonId);
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

    await reorderContentBlocks(user.id, blockRecord.lessonId, validatedData.blockIds);

    return c.json({
      success: true,
      data: { message: "Content blocks reordered successfully" },
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

    console.error("Reorder content blocks error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reorder content blocks" },
      },
      500
    );
  }
});

export default contentBlockRoutes;
