import { Hono } from "hono";
import { z } from "zod";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  UserError,
} from "../../domains/user/service";
import { requireAuth } from "../middleware/auth";
import { ApiResponse } from "../../shared/types";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const userRoutes = new Hono<Env>();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  image: z.string().url().optional(),
});

// GET /me — get current user profile
userRoutes.get("/me", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    const profile = await getProfile(currentUser.id);

    const response: ApiResponse<typeof profile> = {
      success: true,
      data: profile,
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof UserError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Get profile error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to get profile" },
      },
      500
    );
  }
});

// PATCH /me — update profile (name, image)
userRoutes.patch("/me", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };
    const body = await c.req.json();
    const validatedData = updateProfileSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one field must be provided",
          },
        },
        400
      );
    }

    const profile = await updateProfile(currentUser.id, validatedData);

    const response: ApiResponse<typeof profile> = {
      success: true,
      data: profile,
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

    if (error instanceof UserError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Update profile error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update profile" },
      },
      500
    );
  }
});

// POST /me/avatar — upload avatar
userRoutes.post("/me/avatar", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };

    // Get the uploaded file from form data
    const formData = await c.req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Avatar file is required",
          },
        },
        400
      );
    }

    // Validate file size (5MB max for avatars)
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_AVATAR_SIZE) {
      return c.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Avatar must be less than 5MB",
          },
        },
        413
      );
    }

    // Get the storage provider from env (will be injected via Hono context)
    const storageProvider = (c as any).get("storageProvider");
    if (!storageProvider) {
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Storage provider not configured",
          },
        },
        500
      );
    }

    // Convert File to ReadableStream
    const fileStream = file.stream();

    const avatarUrl = await uploadAvatar(
      currentUser.id,
      fileStream,
      file.type,
      storageProvider
    );

    const response: ApiResponse<{ avatarUrl: string }> = {
      success: true,
      data: { avatarUrl },
    };

    return c.json(response);
  } catch (error: any) {
    if (error instanceof UserError) {
      return c.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        error.status as any
      );
    }

    console.error("Upload avatar error:", error);
    return c.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to upload avatar" },
      },
      500
    );
  }
});

export default userRoutes;
