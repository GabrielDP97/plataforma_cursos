import { Context, Next } from "hono";
import { auth } from "../../infra/auth";

export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
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

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}