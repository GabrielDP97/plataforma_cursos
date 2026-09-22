import { Hono } from "hono";
import { requestId } from "./api/middleware/request-id";
import { logger } from "./api/middleware/logger";
import { errorHandler } from "./api/middleware/error-handler";
import { securityHeaders } from "./api/middleware/security-headers";
import { corsMiddleware } from "./api/middleware/cors";

import courseRoutes from "./api/routes/courses";
import categoryRoutes from "./api/routes/categories";
import moduleRoutes from "./api/routes/modules";
import lessonRoutes from "./api/routes/lessons";
import contentBlockRoutes from "./api/routes/content-blocks";
import fileRoutes from "./api/routes/files";
import videoRoutes from "./api/routes/video";
import { courseEnrollmentRoutes, meEnrollmentRoutes } from "./api/routes/enrollments";
import progressRoutes from "./api/routes/progress";
import userRoutes from "./api/routes/users";
import notificationRoutes from "./api/routes/notifications";
import gdprRoutes from "./api/routes/gdpr";
import studentRoutes from "./api/routes/student";
import catalogRoutes from "./api/routes/catalog";
import contentAccessRoutes from "./api/routes/content-access";
import bootstrapAdminRoutes from "./api/routes/bootstrap-admin";
import adminRoutes from "./api/routes/admin";
import instructorRoutes from "./api/routes/instructor";
import authRoutes from "./api/routes/auth";
import accountRoutes from "./api/routes/account";
import contactRoutes from "./api/routes/contact";

type Env = {
  // Workers env binding — contains vars from wrangler.toml [vars] and .dev.vars
  ENVIRONMENT?: string;
  NEON_DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  ADMIN_BOOTSTRAP_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CONTACT_FROM?: string;
  CORS_ORIGIN?: string;
  Variables: {
    requestId: string;
    user: { id: string; role?: string };
    session: unknown;
    errorCode: string;
  };
};

const app = new Hono<Env>();

// ============================================================================
// Middleware: Copy Workers env binding → process.env
// In Cloudflare Workers, env vars from wrangler.toml [vars] and .dev.vars
// are available in the env binding, NOT in process.env.
// This middleware copies them so all code can use process.env.* as usual.
// ============================================================================
app.use("*", async (c, next) => {
  const env = c.env as Record<string, string>;
  if (env) {
    const keys = [
      "ENVIRONMENT", "NEON_DATABASE_URL", "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL", "ADMIN_BOOTSTRAP_SECRET", "RESEND_API_KEY",
      "CONTACT_EMAIL", "CONTACT_FROM",
      "CORS_ORIGIN", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "APP_URL",
    ];
    for (const key of keys) {
      if (env[key] && !process.env[key]) {
        process.env[key] = env[key];
      }
    }
  }
  await next();
});

// ============================================================================
// Global middleware (applied to all routes)
// ============================================================================

// 1. Request ID — must be first to correlate all subsequent logs
app.use("*", requestId);

// 2. Structured logging — wraps request lifecycle
app.use("*", logger);

// 3. Security headers — added to all responses
app.use("*", securityHeaders);

// 4. CORS — handle preflight and origin validation
app.use("*", corsMiddleware("development"));

// ============================================================================
// Health endpoint (public, no auth required)
// ============================================================================

app.get("/api/health", async (c) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Worker alive
  checks.worker = "ok";

  // Database check
  try {
    const { db } = await import("./infra/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    allHealthy = false;
  }

  return c.json(
    {
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    allHealthy ? 200 : 503
  );
});

// ============================================================================
// Debug endpoint — temporary, for diagnosing env issues
// ============================================================================

app.get("/api/debug/env", async (c) => {
  // Only in development
  if (process.env.ENVIRONMENT === "production") {
    return c.json({ error: "Not available in production" }, 404);
  }

  const hasDbUrl = !!process.env.NEON_DATABASE_URL;
  const hasAuthSecret = !!process.env.BETTER_AUTH_SECRET;
  const hasBootstrapSecret = !!process.env.ADMIN_BOOTSTRAP_SECRET;

  // Try a simple DB query
  let dbStatus = "not_attempted";
  let dbError = "";
  try {
    const { db } = await import("./infra/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    dbStatus = "ok";
  } catch (error: any) {
    dbStatus = "error";
    dbError = error?.message || String(error);
  }

  return c.json({
    env: {
      NEON_DATABASE_URL: hasDbUrl,
      BETTER_AUTH_SECRET: hasAuthSecret,
      ADMIN_BOOTSTRAP_SECRET: hasBootstrapSecret,
      ENVIRONMENT: process.env.ENVIRONMENT || "not_set",
    },
    db: {
      status: dbStatus,
      error: dbError,
    },
  });
});

// ============================================================================
// Custom auth routes (login, change-password, etc.)
// Mount BEFORE Better Auth catch-all so they take precedence.
// ============================================================================

app.route("/api/auth", authRoutes);

// ============================================================================
// Better Auth — catch-all handler
// This handles ALL Better Auth routes: sign-in, sign-up, session, sign-out,
// password reset, email verification, CSRF, cookies, etc.
// Mount BEFORE any custom routes that might conflict.
// ============================================================================

import { auth } from "./infra/auth";

app.all("/api/auth/*", async (c) => {
  // Guard: if BETTER_AUTH_SECRET is not set, return a clear error
  if (!process.env.BETTER_AUTH_SECRET) {
    return c.json(
      { success: false, error: { code: "AUTH_NOT_CONFIGURED", message: "Auth not configured" } },
      503
    );
  }
  return auth.handler(c.req.raw);
});

// ============================================================================
// API routes
// ============================================================================

// Course routes
app.route("/api/courses", courseRoutes);

// Enrollment routes — course-scoped (mounted on courses so :courseId param is available)
app.route("/api/courses/:courseId", courseEnrollmentRoutes);

// User profile routes (M10 — User Profile)
app.route("/api", userRoutes);

// Me routes — user-scoped enrollments
app.route("/api/me", meEnrollmentRoutes);

// Notification routes (M14 — Email & Notifications)
app.route("/api/notifications", notificationRoutes);

// GDPR routes (M15 — Privacy & GDPR)
app.route("/api", gdprRoutes);

// Category routes
app.route("/api/categories", categoryRoutes);

// Module routes
app.route("/api/modules", moduleRoutes);

// Lesson routes
app.route("/api/lessons", lessonRoutes);

// Progress routes (mounted on root so /lessons/:lessonId and /courses/:courseId work)
app.route("/api", progressRoutes);

// Content block routes
app.route("/api/blocks", contentBlockRoutes);

// File routes (M6 — File Storage)
app.route("/api/files", fileRoutes);

// Video routes (M7 — Video MVP)
app.route("/api/video", videoRoutes);

// Student experience routes (M11 — Student Experience)
app.route("/api", studentRoutes);

// Content access routes (M11 — Content Access)
app.route("/api", contentAccessRoutes);

// Instructor routes — instructor dashboard, course management
app.route("/api/instructor", instructorRoutes);

// Admin routes — user management, course management, platform settings
app.route("/api/admin", adminRoutes);

// Catalog routes (M11 — Public Catalog)
app.route("/api/catalog", catalogRoutes);

// Account management routes (custom endpoints extending Better Auth)
app.route("/api/account", accountRoutes);

// Contact form routes (public, no auth required)
app.route("/api/contact", contactRoutes);

// ============================================================================
// Internal routes (no auth required, but heavily protected)
// ============================================================================

// Admin bootstrap — creates the first admin account (one-time only)
app.route("/api/internal/bootstrap-admin", bootstrapAdminRoutes);

// ============================================================================
// Global error handler (must be last)
// ============================================================================

app.onError(errorHandler);

export default app;
