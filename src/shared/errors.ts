// Centralized error catalog for the LMS platform
// Machine-readable error codes with human-readable messages

export enum ErrorCode {
  // Auth
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",

  // Authorization
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  NOT_COURSE_OWNER = "NOT_COURSE_OWNER",

  // Not found
  NOT_FOUND = "NOT_FOUND",
  COURSE_NOT_FOUND = "COURSE_NOT_FOUND",
  LESSON_NOT_FOUND = "LESSON_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Upload
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_MIME_TYPE = "INVALID_MIME_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",

  // Enrollment
  ALREADY_ENROLLED = "ALREADY_ENROLLED",
  NOT_ENROLLED = "NOT_ENROLLED",
  COURSE_NOT_PUBLISHED = "COURSE_NOT_PUBLISHED",
  COURSE_ARCHIVED = "COURSE_ARCHIVED",
  ENROLLMENT_DROPPED = "ENROLLMENT_DROPPED",

  // Progress
  LESSON_NOT_COMPLETED = "LESSON_NOT_COMPLETED",

  // Rate limit
  RATE_LIMITED = "RATE_LIMITED",

  // Internal
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export const errorMessages: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.UNAUTHORIZED]: "Authentication required",
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.EMAIL_NOT_VERIFIED]: "Email verification required",
  [ErrorCode.ACCOUNT_LOCKED]: "Account locked due to too many failed attempts",

  // Authorization
  [ErrorCode.FORBIDDEN]: "Access denied",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: "Insufficient permissions",
  [ErrorCode.NOT_COURSE_OWNER]: "You are not the owner of this course",

  // Not found
  [ErrorCode.NOT_FOUND]: "Resource not found",
  [ErrorCode.COURSE_NOT_FOUND]: "Course not found",
  [ErrorCode.LESSON_NOT_FOUND]: "Lesson not found",
  [ErrorCode.USER_NOT_FOUND]: "User not found",

  // Validation
  [ErrorCode.VALIDATION_ERROR]: "Validation failed",
  [ErrorCode.INVALID_INPUT]: "Invalid input data",

  // Upload
  [ErrorCode.FILE_TOO_LARGE]: "File exceeds maximum size",
  [ErrorCode.INVALID_MIME_TYPE]: "File type not allowed",
  [ErrorCode.UPLOAD_FAILED]: "Upload to storage failed",

  // Enrollment
  [ErrorCode.ALREADY_ENROLLED]: "Already enrolled in this course",
  [ErrorCode.NOT_ENROLLED]: "Not enrolled in this course",
  [ErrorCode.COURSE_NOT_PUBLISHED]: "Course is not published",
  [ErrorCode.COURSE_ARCHIVED]: "Course is archived",
  [ErrorCode.ENROLLMENT_DROPPED]: "Enrollment has been dropped",

  // Progress
  [ErrorCode.LESSON_NOT_COMPLETED]: "Prerequisite lesson not completed",

  // Rate limit
  [ErrorCode.RATE_LIMITED]: "Too many requests",

  // Internal
  [ErrorCode.INTERNAL_ERROR]: "An unexpected error occurred",
  [ErrorCode.DATABASE_ERROR]: "Database error occurred",
  [ErrorCode.STORAGE_ERROR]: "Storage error occurred",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Service temporarily unavailable",
};

// Map error codes to HTTP status codes
export const errorStatuses: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.EMAIL_NOT_VERIFIED]: 403,
  [ErrorCode.ACCOUNT_LOCKED]: 423,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.NOT_COURSE_OWNER]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.COURSE_NOT_FOUND]: 404,
  [ErrorCode.LESSON_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_MIME_TYPE]: 415,
  [ErrorCode.UPLOAD_FAILED]: 500,
  [ErrorCode.ALREADY_ENROLLED]: 409,
  [ErrorCode.NOT_ENROLLED]: 403,
  [ErrorCode.COURSE_NOT_PUBLISHED]: 403,
  [ErrorCode.COURSE_ARCHIVED]: 403,
  [ErrorCode.ENROLLMENT_DROPPED]: 403,
  [ErrorCode.LESSON_NOT_COMPLETED]: 400,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.STORAGE_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Custom application error class with error code and status.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, string[]>;

  constructor(code: ErrorCode, message?: string, details?: Record<string, string[]>) {
    super(message || errorMessages[code]);
    this.name = "AppError";
    this.code = code;
    this.status = errorStatuses[code];
    this.details = details;
  }
}

/**
 * Check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
