import { Context, Next } from "hono";

/**
 * Middleware to generate and propagate correlation IDs for request tracing.
 * If the client provides an X-Request-Id header, it is reused. Otherwise,
 * a new UUID is generated. The ID is stored in context and returned in the
 * response header.
 */
export async function requestId(c: Context, next: Next) {
  const id = c.req.header("X-Request-Id") || crypto.randomUUID();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  await next();
}
