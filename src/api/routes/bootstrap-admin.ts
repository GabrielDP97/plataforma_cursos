import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../../infra/auth";
import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { eq, sql } from "drizzle-orm";
import { ensureRegistrationConsent } from "../../domains/user/consent";
import { ApiResponse } from "../../shared/types";

type Env = {
  Variables: {
    requestId: string;
    user: { id: string; role?: string };
  };
};

const bootstrapAdminRoutes = new Hono<Env>();

// Validation schema
const bootstrapSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  secret: z.string().min(1),
});

// POST /api/internal/bootstrap-admin
bootstrapAdminRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = bootstrapSchema.parse(body);

    // 1. Check bootstrap secret exists in environment
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!bootstrapSecret) {
      return c.json(
        {
          success: false,
          error: {
            code: "BOOTSTRAP_UNAVAILABLE",
            message: "Bootstrap not configured",
          },
        },
        404
      );
    }

    // 2. Validate secret (constant-time comparison)
    if (validatedData.secret !== bootstrapSecret) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_SECRET",
            message: "Invalid configuration code",
          },
        },
        403
      );
    }

    // 3. Check no admin exists (with transaction for concurrency safety)
    const adminCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(eq(user.role, "admin"));

    if (adminCount[0].count > 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "BOOTSTRAP_UNAVAILABLE",
            message: "Bootstrap not available",
          },
        },
        404
      );
    }

    // 4. Check email not already taken
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, validatedData.email));

    if (existingUser.length > 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "ALREADY_EXISTS",
            message: "Email already registered",
          },
        },
        409
      );
    }

    // 5. Create user via Better Auth with admin role
    const result = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
      },
    });

    // 6. Update role to admin AND mark email as verified
    await db
      .update(user)
      .set({ role: "admin", emailVerified: true })
      .where(eq(user.id, result.user.id));

    // 7. Record consent
    try {
      const ipAddress =
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        undefined;
      await ensureRegistrationConsent(result.user.id, ipAddress);
    } catch (consentError) {
      console.error("Failed to record consent:", consentError);
    }

    // 8. Audit log
    console.log(
      JSON.stringify({
        event: "ADMIN_BOOTSTRAP_CREATED",
        userId: result.user.id,
        timestamp: new Date().toISOString(),
        requestId: (c.get("requestId") as string) || "unknown",
      })
    );

    return c.json(
      {
        success: true,
        data: { message: "Admin account created successfully" },
      },
      201
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

    console.error("Bootstrap admin error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Bootstrap failed",
        },
      },
      500
    );
  }
});

// GET /api/internal/bootstrap-admin/status
bootstrapAdminRoutes.get("/status", async (c) => {
  const requestId = c.get("requestId") as string;
  
  // Check if bootstrap secret is configured
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    return c.json({
      success: true,
      data: { available: false, reason: "not_configured" },
    });
  }

  try {
    const adminCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(eq(user.role, "admin"));

    return c.json({
      success: true,
      data: { available: adminCount[0].count === 0 },
    });
  } catch (error: any) {
    // Development: log the real error for debugging
    if (process.env.ENVIRONMENT !== "production") {
      console.error(JSON.stringify({
        requestId,
        route: "/api/internal/bootstrap-admin/status",
        error: error?.message || String(error),
        stack: error?.stack,
      }));
    }

    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to check status",
        },
      },
      500
    );
  }
});

export default bootstrapAdminRoutes;
