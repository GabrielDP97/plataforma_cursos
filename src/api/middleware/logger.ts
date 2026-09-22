import { Context, Next } from "hono";

/**
 * Structured JSON logger middleware.
 * Logs request lifecycle with correlation ID, method, route, status, and duration.
 */
export async function logger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const route = c.req.path;

  // Log request start
  console.log(JSON.stringify({
    level: "info",
    message: "Request started",
    requestId: c.get("requestId"),
    method,
    route,
    timestamp: new Date().toISOString(),
  }));

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  const user = c.get("user") as { id?: string } | undefined;
  const errorCode = c.get("errorCode") as string | undefined;

  // Log request end
  console.log(JSON.stringify({
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    message: "Request completed",
    requestId: c.get("requestId"),
    userId: user?.id,
    method,
    route,
    status,
    duration,
    errorCode,
    timestamp: new Date().toISOString(),
  }));
}
