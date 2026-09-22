import { Hono } from "hono";
import { z } from "zod";
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  ContentError,
  getModuleOrThrow,
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

const moduleRoutes = new Hono<Env>();

// Validation schemas
const createModuleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const updateModuleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  moduleIds: z.array(z.string().uuid()).min(1),
});

// POST /api/courses/:courseId/modules — create module
moduleRoutes.post("/", requireOwnership(), async (c) => {
  try {
    const courseId = c.req.param("courseId")!;
    const user = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = createModuleSchema.parse(body);

    const module = await createModule(user.id, {
      courseId,
      ...validatedData,
    });

    const response: ApiResponse<typeof module> = {
      success: true,
      data: module,
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

    if (error instanceof ContentError) {
      return c.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        error.status as any
      );
    }

    console.error("Create module error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create module",
        },
      },
      500
    );
  }
});

// PATCH /api/modules/:moduleId — update module
moduleRoutes.patch("/:moduleId", async (c) => {
  try {
    const moduleId = c.req.param("moduleId")!;
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

    // Lookup module to get courseId for ownership check
    const moduleRecord = await getModuleOrThrow(moduleId);

    // Check ownership (admin bypass handled inside isCourseMember or manually)
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
    const validatedData = updateModuleSchema.parse(body);

    const module = await updateModule(user.id, moduleId, validatedData);

    const response: ApiResponse<typeof module> = {
      success: true,
      data: module,
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

    console.error("Update module error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update module" },
      },
      500
    );
  }
});

// DELETE /api/modules/:moduleId — delete module
moduleRoutes.delete("/:moduleId", async (c) => {
  try {
    const moduleId = c.req.param("moduleId")!;
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

    // Lookup module to get courseId for ownership check
    const moduleRecord = await getModuleOrThrow(moduleId);

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

    await deleteModule(user.id, moduleId);

    return c.json({
      success: true,
      data: { message: "Module deleted successfully" },
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

    console.error("Delete module error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete module" },
      },
      500
    );
  }
});

// POST /api/modules/:moduleId/reorder — reorder modules
moduleRoutes.post("/:moduleId/reorder", async (c) => {
  try {
    const moduleId = c.req.param("moduleId")!;
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

    // Lookup module to get courseId
    const moduleRecord = await getModuleOrThrow(moduleId);

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

    await reorderModules(user.id, moduleRecord.courseId, validatedData.moduleIds);

    return c.json({
      success: true,
      data: { message: "Modules reordered successfully" },
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

    console.error("Reorder modules error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reorder modules" },
      },
      500
    );
  }
});

export default moduleRoutes;
