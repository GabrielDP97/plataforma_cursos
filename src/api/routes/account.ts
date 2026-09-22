/**
 * Account management routes.
 * Custom endpoints that extend Better Auth for our specific needs.
 */

import { Hono } from "hono";
import { auth } from "../../infra/auth";

const accountRoutes = new Hono();

// POST /api/account/change-initial-password
// Used during first login when mustChangePassword = true
// Calls Better Auth's native changePassword API + clears mustChangePassword flag
accountRoutes.post("/change-initial-password", async (c) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "currentPassword and newPassword are required",
          },
        },
        400
      );
    }

    if (newPassword.length < 8) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New password must be at least 8 characters",
          },
        },
        400
      );
    }

    if (currentPassword === newPassword) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New password must be different from current password",
          },
        },
        400
      );
    }

    // Get current session to verify authentication
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        401
      );
    }

    // Call Better Auth's native changePassword API
    // This handles: currentPassword verification, hashing, and storage
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: c.req.raw.headers,
    });

    // Only clear mustChangePassword AFTER successful password change
    const { db } = await import("../../infra/db");
    const { user: userTable } = await import("../../infra/schema/user");
    const { eq } = await import("drizzle-orm");

    await db
      .update(userTable)
      .set({ mustChangePassword: false, updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id));

    return c.json({
      success: true,
      data: { message: "Password changed successfully" },
    });
  } catch (error: any) {
    // Better Auth throws specific errors for wrong password
    if (
      error.message?.toLowerCase().includes("invalid") ||
      error.message?.toLowerCase().includes("incorrect") ||
      error.name === "INVALID_CREDENTIALS"
    ) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "The current password is incorrect",
          },
        },
        401
      );
    }

    console.error("Change initial password error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to change password",
        },
      },
      500
    );
  }
});

export default accountRoutes;
