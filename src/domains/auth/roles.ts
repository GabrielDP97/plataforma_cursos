/**
 * Global role definitions and permission map.
 *
 * RBAC ≠ ownership. Being `instructor` does NOT grant edit access to all courses.
 * Course-level access is governed by `course_instructors` table (ownership.ts).
 */

// Global user roles (matches Better Auth user.role field — string-based)
export const Role = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// Course-level instructor roles (stored as integer in course_instructors.role)
export const CourseInstructorRole = {
  COLLABORATOR: 0,
  OWNER: 1,
} as const;

export type CourseInstructorRole =
  (typeof CourseInstructorRole)[keyof typeof CourseInstructorRole];

// Permission definitions
export const Permission = {
  // Course permissions
  CREATE_COURSE: "CREATE_COURSE",
  EDIT_COURSE: "EDIT_COURSE",
  PUBLISH_COURSE: "PUBLISH_COURSE",
  ARCHIVE_COURSE: "ARCHIVE_COURSE",
  DELETE_COURSE: "DELETE_COURSE",

  // Content permissions
  CREATE_MODULE: "CREATE_MODULE",
  EDIT_MODULE: "EDIT_MODULE",
  DELETE_MODULE: "DELETE_MODULE",
  CREATE_LESSON: "CREATE_LESSON",
  EDIT_LESSON: "EDIT_LESSON",
  DELETE_LESSON: "DELETE_LESSON",

  // File/Video permissions
  UPLOAD_FILE: "UPLOAD_FILE",
  UPLOAD_VIDEO: "UPLOAD_VIDEO",
  DELETE_FILE: "DELETE_FILE",

  // Enrollment permissions
  VIEW_ENROLLMENTS: "VIEW_ENROLLMENTS",
  MANAGE_ENROLLMENTS: "MANAGE_ENROLLMENTS",

  // Admin permissions
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_COURSES: "MANAGE_COURSES",
  VIEW_PLATFORM_STATS: "VIEW_PLATFORM_STATS",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Maps course-level roles to their allowed permissions.
 *
 * - owner:  Full control (edit, publish, archive, manage collaborators, etc.)
 * - collaborator: Content editing only (edit content, upload, modify modules/lessons)
 *   Cannot publish, archive, manage collaborators, or view enrollments.
 */
export const coursePermissionMap: Record<CourseInstructorRole, Permission[]> = {
  [CourseInstructorRole.OWNER]: [
    Permission.EDIT_COURSE,
    Permission.PUBLISH_COURSE,
    Permission.ARCHIVE_COURSE,
    Permission.CREATE_MODULE,
    Permission.EDIT_MODULE,
    Permission.DELETE_MODULE,
    Permission.CREATE_LESSON,
    Permission.EDIT_LESSON,
    Permission.DELETE_LESSON,
    Permission.UPLOAD_FILE,
    Permission.UPLOAD_VIDEO,
    Permission.DELETE_FILE,
    Permission.VIEW_ENROLLMENTS,
  ],
  [CourseInstructorRole.COLLABORATOR]: [
    Permission.EDIT_COURSE,
    Permission.CREATE_MODULE,
    Permission.EDIT_MODULE,
    Permission.DELETE_MODULE,
    Permission.CREATE_LESSON,
    Permission.EDIT_LESSON,
    Permission.DELETE_LESSON,
    Permission.UPLOAD_FILE,
    Permission.UPLOAD_VIDEO,
  ],
};

/**
 * Maps global roles to their allowed platform-level permissions.
 *
 * - student:  Can only view published courses and enroll.
 * - instructor: Can create courses (but does NOT own existing ones).
 * - admin: Full platform access.
 */
export const globalPermissionMap: Record<Role, Permission[]> = {
  [Role.STUDENT]: [],
  [Role.INSTRUCTOR]: [Permission.CREATE_COURSE],
  [Role.ADMIN]: [
    Permission.CREATE_COURSE,
    Permission.DELETE_COURSE,
    Permission.MANAGE_ENROLLMENTS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_COURSES,
    Permission.VIEW_PLATFORM_STATS,
    Permission.MANAGE_SETTINGS,
    Permission.DELETE_FILE,
  ],
};
