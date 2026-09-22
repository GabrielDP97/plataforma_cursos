import { Hono } from "hono";
import { z } from "zod";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  CourseError,
} from "../../domains/course/service";
import { requireRole } from "../middleware/requireRole";
import { Role } from "../../domains/auth/roles";
import { ApiResponse } from "../../shared/types";

const categoryRoutes = new Hono();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

// GET /api/categories — list categories
categoryRoutes.get("/", async (c) => {
  try {
    const categories = await listCategories();

    const response: ApiResponse<typeof categories> = {
      success: true,
      data: categories,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("List categories error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list categories" },
      },
      500
    );
  }
});

// POST /api/categories — create category (admin only)
categoryRoutes.post("/", requireRole(Role.ADMIN), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createCategorySchema.parse(body);

    const category = await createCategory(validatedData);

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
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

    console.error("Create category error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create category" },
      },
      500
    );
  }
});

// PATCH /api/categories/:categoryId — update category (admin only)
categoryRoutes.patch("/:categoryId", requireRole(Role.ADMIN), async (c) => {
  try {
    const categoryId = c.req.param("categoryId")!;
    const body = await c.req.json();
    const validatedData = updateCategorySchema.parse(body);

    const updated = await updateCategory(categoryId, validatedData);

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

    console.error("Update category error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update category" },
      },
      500
    );
  }
});

// DELETE /api/categories/:categoryId — delete category (admin only)
categoryRoutes.delete("/:categoryId", requireRole(Role.ADMIN), async (c) => {
  try {
    const categoryId = c.req.param("categoryId")!;

    await deleteCategory(categoryId);

    return c.json({
      success: true,
      data: { message: "Category deleted successfully" },
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

    console.error("Delete category error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete category" },
      },
      500
    );
  }
});

export default categoryRoutes;
