// Shared constants for the LMS platform

/**
 * User role integer mappings (for database storage).
 * Used when the role column stores integers instead of enum strings.
 */
export const ROLE_STUDENT = 0;
export const ROLE_INSTRUCTOR = 1;
export const ROLE_ADMIN = 2;

export const ROLE_MAP: Record<number, string> = {
  [ROLE_STUDENT]: "student",
  [ROLE_INSTRUCTOR]: "instructor",
  [ROLE_ADMIN]: "admin",
};

/**
 * Course status values
 */
export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

/**
 * Enrollment status values
 */
export const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DROPPED: "dropped",
} as const;

/**
 * Enrollment source values (extensible for future payment/invitation flows)
 */
export const ENROLLMENT_SOURCE = {
  FREE: "free",
  PURCHASE: "purchase",
  ADMIN: "admin",
  INVITATION: "invitation",
  SUBSCRIPTION: "subscription",
} as const;

/**
 * Content block types
 */
export const BLOCK_TYPE = {
  TEXT: "text",
  VIDEO: "video",
  FILE: "file",
  CODE: "code",
  LINK: "link",
} as const;

/**
 * Lesson progress status values
 */
export const LESSON_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

/**
 * Video asset status values
 */
export const VIDEO_STATUS = {
  UPLOADING: "uploading",
  READY: "ready",
  FAILED: "failed",
} as const;

/**
 * Video provider values
 */
export const VIDEO_PROVIDER = {
  R2: "r2",
  MUX: "mux",
} as const;

/**
 * Notification type values
 */
export const NOTIFICATION_TYPE = {
  ANNOUNCEMENT: "announcement",
  ENROLLMENT: "enrollment",
  SYSTEM: "system",
} as const;

/**
 * Upload limits (configurable per environment via env vars)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Video completion threshold (90% of duration)
 */
export const VIDEO_COMPLETION_THRESHOLD = 0.9;

/**
 * Authentication constants
 */
export const PASSWORD_MIN_LENGTH = 8;
export const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
export const SESSION_UPDATE_AGE = 60 * 60 * 24; // 1 day in seconds

/**
 * Rate limit configuration
 */
export const RATE_LIMIT = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
  },
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 uploads per hour
  },
} as const;

/**
 * GDPR constants
 */
export const GDPR = {
  DELETION_GRACE_PERIOD_DAYS: 30,
  CURRENT_TERMS_VERSION: "1.0",
} as const;
