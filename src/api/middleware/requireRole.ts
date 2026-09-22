import { Context, Next } from "hono";
import { Role } from "../../domains/auth/roles";

/**
 * Middleware that verifies the authenticated user has one of the required global roles.
 *
 * Must be used AFTER requireAuth middleware (which sets c.get("user")).
 *
 * @param allowedRoles - At least one role the user must have
 * @returns 403 FORBIDDEN if role check fails
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as { role?: string } | undefined;

    if (!user || !user.role) {
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

    if (!allowedRoles.includes(user.role as Role)) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
          },
        },
        403
      );
    }

    await next();
  };
}
