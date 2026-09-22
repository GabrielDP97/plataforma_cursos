import { Context, Next } from "hono";

/**
 * Security headers middleware.
 * Adds standard security headers to all responses.
 */
export async function securityHeaders(c: Context, next: Next) {
  await next();

  // Prevent MIME type sniffing
  c.header("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  c.header("X-Frame-Options", "DENY");

  // XSS protection
  c.header("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (basic)
  c.header("Content-Security-Policy", "default-src 'self'");

  // Strict Transport Security (for HTTPS)
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}
