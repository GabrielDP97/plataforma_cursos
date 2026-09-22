// Audit logging for security events in the LMS platform

/**
 * Audit event types for security tracking.
 */
export enum AuditEvent {
  // Authentication events
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  REGISTER = "REGISTER",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_RESET = "PASSWORD_RESET",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",

  // Authorization events
  ROLE_CHANGE = "ROLE_CHANGE",
  PERMISSION_DENIED = "PERMISSION_DENIED",

  // Course events
  COURSE_CREATE = "COURSE_CREATE",
  COURSE_UPDATE = "COURSE_UPDATE",
  COURSE_DELETE = "COURSE_DELETE",
  COURSE_PUBLISH = "COURSE_PUBLISH",
  COURSE_ARCHIVE = "COURSE_ARCHIVE",

  // Enrollment events
  ENROLLMENT_CREATE = "ENROLLMENT_CREATE",
  ENROLLMENT_CANCEL = "ENROLLMENT_CANCEL",
  ENROLLMENT_COMPLETE = "ENROLLMENT_COMPLETE",

  // Data events
  DATA_EXPORT = "DATA_EXPORT",
  DATA_DELETE = "DATA_DELETE",
  DATA_RECTIFY = "DATA_RECTIFY",

  // File events
  FILE_UPLOAD = "FILE_UPLOAD",
  FILE_DELETE = "FILE_DELETE",
  FILE_DOWNLOAD = "FILE_DOWNLOAD",

  // Admin events
  USER_DISABLE = "USER_DISABLE",
  USER_ENABLE = "USER_ENABLE",
  SETTINGS_CHANGE = "SETTINGS_CHANGE",
}

/**
 * Interface for audit log events.
 */
export interface AuditLogEntry {
  type: AuditEvent;
  userId?: string;
  targetId?: string;
  action: string;
  details?: Record<string, unknown>;
  requestId?: string;
  ipAddress?: string;
}

/**
 * Structured audit logger for security events.
 * All security-relevant actions should be logged through this function.
 */
export function auditLog(entry: AuditLogEntry): void {
  const logEntry = {
    level: "info",
    type: entry.type,
    userId: entry.userId,
    targetId: entry.targetId,
    action: entry.action,
    details: entry.details,
    requestId: entry.requestId,
    ipAddress: entry.ipAddress,
    timestamp: new Date().toISOString(),
  };

  // Log as structured JSON for machine parsing
  console.log(JSON.stringify(logEntry));
}

/**
 * Helper to extract user ID from Hono context.
 * Safe to use even if user is not set.
 */
export function getUserId(c: { get: (key: string) => unknown }): string | undefined {
  const user = c.get("user") as { id?: string } | undefined;
  return user?.id;
}

/**
 * Helper to extract request ID from Hono context.
 */
export function getRequestId(c: { get: (key: string) => unknown }): string | undefined {
  return c.get("requestId") as string | undefined;
}

/**
 * Helper to extract IP address from request headers.
 */
export function getIpAddress(headers: Headers): string | undefined {
  return headers.get("CF-Connecting-IP")
    || headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || undefined;
}
