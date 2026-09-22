import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../../infra/auth";
import { ApiResponse, AuthResponse } from "../../shared/types";

const authRoutes = new Hono();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
}).refine(
  (data) => data.email || data.username,
  { message: "Either email or username is required" }
);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// POST /api/auth/register — DISABLED (admin-only provisioning)
authRoutes.post("/register", async (c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "REGISTRATION_DISABLED",
        message: "Public registration is disabled. Contact an administrator to create an account.",
      },
    },
    403
  );
});

// POST /api/auth/login — DEPRECATED: Frontend now uses Better Auth's native
// /sign-in/username and /sign-in/email endpoints directly via the catch-all handler.
// This route is kept as a fallback for backward compatibility only.
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    // Determine login method: email or username
    if (validatedData.email) {
      // Email-based login via Better Auth
      const result = await auth.api.signInEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
        },
      });

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          session: {
            id: result.token,
            token: result.token,
            expiresAt: new Date(),
          },
        },
      };

      return c.json(response);
    }

    if (validatedData.username) {
      // Username-based login via Better Auth username plugin
      const result = await auth.api.signInUsername({
        body: {
          username: validatedData.username,
          password: validatedData.password,
        },
      });

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          session: {
            id: result.token,
            token: result.token,
            expiresAt: new Date(),
          },
        },
      };

      return c.json(response);
    }

    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Either email or username is required",
        },
      },
      400
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
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

    if (error.message?.includes("invalid") || error.message?.includes("Invalid")) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          },
        },
        401
      );
    }

    console.error("Login error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Login failed",
        },
      },
      500
    );
  }
});

// POST /api/auth/logout
authRoutes.post("/logout", async (c) => {
  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Logout failed",
        },
      },
      500
    );
  }
});

// POST /api/auth/forgot-password
authRoutes.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    await auth.api.requestPasswordReset({
      body: {
        email: validatedData.email,
        redirectTo: "/reset-password",
      },
    });

    return c.json({
      success: true,
      data: { message: "Password reset email sent" },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email address",
          },
        },
        400
      );
    }

    // Don't reveal if email exists or not
    return c.json({
      success: true,
      data: { message: "If the email exists, a reset link has been sent" },
    });
  }
});

// POST /api/auth/reset-password
authRoutes.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = resetPasswordSchema.parse(body);

    await auth.api.resetPassword({
      body: {
        token: validatedData.token,
        newPassword: validatedData.password,
      },
    });

    return c.json({
      success: true,
      data: { message: "Password reset successfully" },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
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

    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired reset token",
        },
      },
      400
    );
  }
});

// POST /api/auth/change-password — DEPRECATED: Use /api/account/change-initial-password instead
// Better Auth has its own /change-password endpoint. Our custom route was colliding with it.
// The new endpoint is at /api/account/change-initial-password

// GET /api/auth/verify-email
authRoutes.get("/verify-email", async (c) => {
  try {
    const token = c.req.query("token");

    if (!token) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Verification token is required",
          },
        },
        400
      );
    }

    await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    return c.json({
      success: true,
      data: { message: "Email verified successfully" },
    });
  } catch {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired verification token",
        },
      },
      400
    );
  }
});

export default authRoutes;