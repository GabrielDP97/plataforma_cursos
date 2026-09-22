import { Context, Next } from "hono";
import { ZodSchema, ZodError } from "zod";
import { ErrorCode, errorMessages } from "../../shared/errors";

/**
 * Zod validation middleware for request body, query, and params.
 * Returns consistent VALIDATION_ERROR response with field-level details.
 */

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Create a validation middleware that validates the request against Zod schemas.
 *
 * Usage:
 *   app.post("/courses", validate({ body: createCourseSchema }), handler)
 *   app.get("/courses", validate({ query: listSchema }), handler)
 */
export function validate(schemas: ValidateOptions) {
  return async (c: Context, next: Next) => {
    try {
      // Validate body
      if (schemas.body) {
        const body = await c.req.json().catch(() => ({}));
        schemas.body.parse(body);
      }

      // Validate query params
      if (schemas.query) {
        const query = c.req.query();
        schemas.query.parse(query);
      }

      // Validate path params
      if (schemas.params) {
        const params = c.req.param();
        schemas.params.parse(params);
      }

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format field-level errors
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const field = issue.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(issue.message);
        }

        const requestId = c.get("requestId") as string;

        return c.json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: errorMessages[ErrorCode.VALIDATION_ERROR],
            details,
            requestId,
          },
        }, 400);
      }

      // Re-throw non-validation errors
      throw error;
    }
  };
}

/**
 * Convenience validators for common query parameters.
 */
export const paginationSchema = {
  page: {
    coerce: true,
    default: 1,
    min: 1,
    max: 1000,
  },
  limit: {
    coerce: true,
    default: 20,
    min: 1,
    max: 100,
  },
};
