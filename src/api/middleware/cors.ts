import { Context, Next } from "hono";

/**
 * CORS configuration middleware.
 * Configures Cross-Origin Resource Sharing for the frontend domain.
 */

// Allowed origins per environment
const ALLOWED_ORIGINS: Record<string, string[]> = {
  development: ["http://localhost:8787", "http://localhost:5173"],
  preview: [], // Set via env var
  production: [], // Set via env var
};

export function corsMiddleware(env: string = "development", customOrigins: string[] = []) {
  const origins = [...(ALLOWED_ORIGINS[env] || []), ...customOrigins];

  return async (c: Context, next: Next) => {
    // Handle preflight requests
    if (c.req.method === "OPTIONS") {
      const origin = c.req.header("Origin");

      if (origin && origins.includes(origin)) {
        c.header("Access-Control-Allow-Origin", origin);
        c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Id");
        c.header("Access-Control-Allow-Credentials", "true");
        c.header("Access-Control-Max-Age", "86400");

        return c.body(null, 204 as any);
      }

      return c.text("Forbidden", 403);
    }

    // Set CORS headers for actual requests
    const origin = c.req.header("Origin");
    if (origin && origins.includes(origin)) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Credentials", "true");
    }

    await next();
  };
}
