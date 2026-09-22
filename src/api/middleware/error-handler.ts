import { Context } from "hono";
import { ErrorCode, errorMessages, isAppError } from "../../shared/errors";

/**
 * Centralized error handler for unhandled errors.
 * Logs the error with full context and returns a consistent error response.
 * Never exposes internal details (stack traces, DB errors) to the client.
 */
export function errorHandler(err: Error, c: Context): Response {
  const requestId = c.get("requestId") as string;
  const method = c.req.method;
  const route = c.req.path;

  // Check if it's an AppError (expected application error)
  if (isAppError(err)) {
    // Log expected errors at warn level
    console.log(JSON.stringify({
      level: "warn",
      message: "API error",
      requestId,
      errorCode: err.code,
      status: err.status,
      method,
      route,
      timestamp: new Date().toISOString(),
    }));

    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        ...(err.details && { details: err.details }),
      },
    }, err.status as any);
  }

  // Unexpected error — log with full context at error level
  console.log(JSON.stringify({
    level: "error",
    message: "Unhandled error",
    requestId,
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
    method,
    route,
    timestamp: new Date().toISOString(),
  }));

  // Return generic error to client — never expose internals
  return c.json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: errorMessages[ErrorCode.INTERNAL_ERROR],
      requestId,
    },
  }, 500);
}
