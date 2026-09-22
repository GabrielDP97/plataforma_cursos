import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { course } from "../../infra/schema/course";
import { enrollment } from "../../infra/schema/enrollment";
import { module } from "../../infra/schema/content";
import { lesson } from "../../infra/schema/content";
import { contentBlock } from "../../infra/schema/content";
import { courseInstructors } from "../../infra/schema/ownership";
import { eq, and, sql, desc, count, asc } from "drizzle-orm";
import { auth } from "../../infra/auth";
import { generateUniqueUsername } from "../../lib/username-generator";
import { generateTemporaryPassword } from "../../lib/temp-password";

// ============================================================================
// Admin Dashboard
// ============================================================================

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeUsers: number;
    publishedCourses: number;
  };
  recentActivity: {
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
    }>;
    recentEnrollments: Array<{
      id: string;
      userId: string;
      courseId: string;
      enrolledAt: Date;
    }>;
  };
}

/**
 * Get admin dashboard with platform overview.
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  // Get user count
  const [userCount] = await db
    .select({ total: count() })
    .from(user);

  // Get course count
  const [courseCount] = await db
    .select({ total: count() })
    .from(course);

  // Get enrollment count
  const [enrollmentCount] = await db
    .select({ total: count() })
    .from(enrollment);

  // Get active users (with sessions in last 30 days)
  const [activeUserCount] = await db
    .select({ total: sql<number>`count(distinct ${user.id})::int` })
    .from(user)
    .where(
      sql`${user.id} IN (SELECT user_id FROM session WHERE expires_at > NOW())`
    );

  // Get published courses
  const [publishedCourseCount] = await db
    .select({ total: count() })
    .from(course)
    .where(eq(course.status, "published"));

  // Get recent users
  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(5);

  // Get recent enrollments
  const recentEnrollments = await db
    .select()
    .from(enrollment)
    .orderBy(desc(enrollment.enrolledAt))
    .limit(5);

  return {
    stats: {
      totalUsers: userCount?.total || 0,
      totalCourses: courseCount?.total || 0,
      totalEnrollments: enrollmentCount?.total || 0,
      activeUsers: activeUserCount?.total || 0,
      publishedCourses: publishedCourseCount?.total || 0,
    },
    recentActivity: {
      recentUsers,
      recentEnrollments,
    },
  };
}

// ============================================================================
// User Management
// ============================================================================

export interface ListUsersInput {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  username: string | null;
  displayUsername: string | null;
  role: string;
  mustChangePassword: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * List users with pagination and search.
 */
export async function listUsers(
  options: ListUsersInput = {}
): Promise<{
  users: UserListItem[];
  meta: { page: number; limit: number; total: number };
}> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Search filter (searches name, email, and username)
  if (options.search) {
    conditions.push(
      sql`(${user.name} ILIKE ${`%${options.search}%`} OR ${user.email} ILIKE ${`%${options.search}%`} OR ${user.username} ILIKE ${`%${options.search}%`})`
    );
  }

  // Role filter
  if (options.role) {
    conditions.push(eq(user.role, options.role as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(user)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  // Get users
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      displayUsername: user.displayUsername,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    users: users.map((u) => ({
      ...u,
      role: u.role as string,
      mustChangePassword: u.mustChangePassword ?? false,
    })),
    meta: {
      page,
      limit,
      total,
    },
  };
}

export interface UpdateUserInput {
  role?: string;
  enabled?: boolean;
}

/**
 * Update user (admin only).
 */
export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existingUser) {
    throw new AdminError("USER_NOT_FOUND", "User not found", 404);
  }

  // Validate role change
  if (input.role) {
    const validRoles = ["student", "instructor", "admin"];
    if (!validRoles.includes(input.role)) {
      throw new AdminError("INVALID_ROLE", "Invalid role", 400);
    }

    // Prevent self-demotion
    if (input.role !== existingUser.role) {
      // This check should be done at the route level with the current user ID
      // Here we just validate the role is valid
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.role !== undefined) updateData.role = input.role;
  if (input.enabled !== undefined) updateData.emailVerified = input.enabled;

  await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId));
}

/**
 * Disable user account (admin only).
 */
export async function disableUser(userId: string): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existingUser) {
    throw new AdminError("USER_NOT_FOUND", "User not found", 404);
  }

  // Prevent self-disabling
  // This check should be done at the route level

  await db
    .update(user)
    .set({
      emailVerified: false,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}

// ============================================================================
// User Provisioning (Admin Only)
// ============================================================================

export interface CreateUserInput {
  fullName: string;
  role: string;
  email: string;
  username?: string; // Optional override; auto-generated if omitted
  courseIds?: string[]; // Optional: auto-enroll in courses (students only)
}

export interface CreateUserResult {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    mustChangePassword: boolean;
  };
  temporaryPassword: string;
}

/**
 * Create a new user via Better Auth (admin only).
 *
 * Flow:
 * 1. Validate role
 * 2. Generate or validate username
 * 3. Generate temporary password
 * 4. Create user via Better Auth signUpEmail
 * 5. Update user record with username, role, mustChangePassword
 * 6. Auto-enroll in courses if student
 */
export async function createUser(
  input: CreateUserInput
): Promise<CreateUserResult> {
  const validRoles = ["student", "instructor", "admin"];
  if (!validRoles.includes(input.role)) {
    throw new AdminError("INVALID_ROLE", "Invalid role", 400);
  }

  // Check for duplicate email
  const [existingByEmail] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (existingByEmail) {
    throw new AdminError("EMAIL_EXISTS", "A user with this email already exists", 409);
  }

  // Generate or validate username
  let username: string;
  if (input.username) {
    // Validate custom username: lowercase alphanumeric + dots + hyphens
    if (!/^[a-z0-9][a-z0-9._-]{0,254}$/.test(input.username)) {
      throw new AdminError(
        "INVALID_USERNAME",
        "Username must be lowercase alphanumeric with dots, hyphens, or underscores",
        400
      );
    }
    // Check uniqueness
    const [existingByUsername] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, input.username))
      .limit(1);
    if (existingByUsername) {
      throw new AdminError("USERNAME_EXISTS", "Username already taken", 409);
    }
    username = input.username;
  } else {
    username = await generateUniqueUsername(input.fullName, async (candidate) => {
      const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, candidate))
        .limit(1);
      return !!existing;
    });
  }

  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Create user via Better Auth
  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: temporaryPassword,
      name: input.fullName,
    },
  });

  if (!result?.user?.id) {
    throw new AdminError("CREATION_FAILED", "Failed to create user", 500);
  }

  // Update user record with username, role, mustChangePassword
  await db
    .update(user)
    .set({
      username,
      displayUsername: input.fullName.split(/\s+/)[0], // Use first name as display
      role: input.role as any,
      mustChangePassword: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, result.user.id));

  // Auto-enroll in courses (students only)
  if (input.role === "student" && input.courseIds && input.courseIds.length > 0) {
    for (const courseId of input.courseIds) {
      // Verify course exists
      const [existingCourse] = await db
        .select({ id: course.id })
        .from(course)
        .where(eq(course.id, courseId))
        .limit(1);

      if (existingCourse) {
        await db.insert(enrollment).values({
          userId: result.user.id,
          courseId,
          source: "admin",
        });
      }
    }
  }

  return {
    user: {
      id: result.user.id,
      name: input.fullName,
      email: input.email,
      username,
      role: input.role,
      mustChangePassword: true,
    },
    temporaryPassword,
  };
}

// ============================================================================
// Admin Password Reset
// ============================================================================

export interface ResetPasswordResult {
  userId: string;
  temporaryPassword: string;
}

/**
 * Reset a user's password (admin only).
 *
 * Generates a new temporary password and flags mustChangePassword = true.
 */
export async function resetUserPassword(
  userId: string
): Promise<ResetPasswordResult> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existingUser) {
    throw new AdminError("USER_NOT_FOUND", "User not found", 404);
  }

  // Generate new temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Update password via Better Auth
  // Better Auth doesn't have a direct "admin reset password" API,
  // so we use the DB directly. The hashed password is stored in the account table.
  // We'll use bcrypt to hash the new password and update it.
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  // Update the password in the account table (where email+password credentials live)
  const { account } = await import("../../infra/schema/user");
  const [existingAccount] = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, "credential")
      )
    )
    .limit(1);

  if (existingAccount) {
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, existingAccount.id));
  }

  // Flag mustChangePassword
  await db
    .update(user)
    .set({
      mustChangePassword: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  return {
    userId,
    temporaryPassword,
  };
}

// ============================================================================
// Course Management
// ============================================================================

export interface ListCoursesInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * List all courses with pagination and search.
 */
export async function listAllCourses(
  options: ListCoursesInput = {}
): Promise<{
  courses: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    enrollmentCount: number;
  }>;
  meta: { page: number; limit: number; total: number };
}> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Search filter
  if (options.search) {
    conditions.push(
      sql`(${course.title} ILIKE ${`%${options.search}%`} OR ${course.description} ILIKE ${`%${options.search}%`})`
    );
  }

  // Status filter
  if (options.status) {
    conditions.push(eq(course.status, options.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(course)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  // Get courses with enrollment counts
  const courses = await db
    .select({
      id: course.id,
      title: course.title,
      description: course.description,
      status: course.status,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      enrollmentCount: sql<number>`count(distinct ${enrollment.userId})::int`,
    })
    .from(course)
    .leftJoin(
      enrollment,
      and(
        eq(enrollment.courseId, course.id),
        eq(enrollment.status, "active")
      )
    )
    .where(whereClause)
    .groupBy(
      course.id,
      course.title,
      course.description,
      course.status,
      course.thumbnailUrl,
      course.createdAt,
      course.updatedAt
    )
    .orderBy(desc(course.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    courses,
    meta: {
      page,
      limit,
      total,
    },
  };
}

// ============================================================================
// Course Detail (Admin Preview)
// ============================================================================

export interface AdminCourseDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  instructor: {
    id: string;
    name: string;
    email: string;
  } | null;
  modules: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    visible: boolean;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
      visible: boolean;
      contentBlocks: Array<{
        id: string;
        type: string;
        content: string;
        metadata: Record<string, unknown> | null;
        position: number;
      }>;
    }>;
  }>;
  moduleCount: number;
  lessonCount: number;
}

/**
 * Get a single course with full structure for admin preview.
 * Works for ANY status (draft, published, archived).
 */
export async function getCourseById(
  courseId: string
): Promise<AdminCourseDetail> {
  const [existingCourse] = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!existingCourse) {
    throw new AdminError("COURSE_NOT_FOUND", "Course not found", 404);
  }

  // Get instructor (course owner)
  const [instructorRow] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(courseInstructors)
    .innerJoin(user, eq(courseInstructors.userId, user.id))
    .where(
      and(
        eq(courseInstructors.courseId, courseId),
        eq(courseInstructors.role, 1) // COURSE_INSTRUCTOR_OWNER
      )
    )
    .limit(1);

  // Get modules ordered by position
  const courseModules = await db
    .select()
    .from(module)
    .where(eq(module.courseId, courseId))
    .orderBy(asc(module.position));

  // Get all lessons for this course's modules
  const moduleIds = courseModules.map((m) => m.id);
  const courseLessons =
    moduleIds.length > 0
      ? await db
          .select()
          .from(lesson)
          .where(sql`${lesson.moduleId} IN ${moduleIds}`)
          .orderBy(asc(lesson.position))
      : [];

  // Get all content blocks for this course's lessons
  const lessonIds = courseLessons.map((l) => l.id);
  const courseContentBlocks =
    lessonIds.length > 0
      ? await db
          .select()
          .from(contentBlock)
          .where(sql`${contentBlock.lessonId} IN ${lessonIds}`)
          .orderBy(asc(contentBlock.position))
      : [];

  // Organize: modules -> lessons -> contentBlocks
  const lessonsByModule = new Map<string, typeof courseLessons>();
  for (const l of courseLessons) {
    const arr = lessonsByModule.get(l.moduleId) || [];
    arr.push(l);
    lessonsByModule.set(l.moduleId, arr);
  }

  const blocksByLesson = new Map<string, typeof courseContentBlocks>();
  for (const b of courseContentBlocks) {
    const arr = blocksByLesson.get(b.lessonId) || [];
    arr.push(b);
    blocksByLesson.set(b.lessonId, arr);
  }

  const modulesWithContent = courseModules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    position: m.position,
    visible: m.visible,
    lessons: (lessonsByModule.get(m.id) || []).map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      position: l.position,
      visible: l.visible,
      contentBlocks: (blocksByLesson.get(l.id) || []).map((b) => ({
        id: b.id,
        type: b.type,
        content: b.content,
        metadata: b.metadata as Record<string, unknown> | null,
        position: b.position,
      })),
    })),
  }));

  return {
    id: existingCourse.id,
    title: existingCourse.title,
    description: existingCourse.description,
    slug: existingCourse.slug,
    status: existingCourse.status,
    thumbnailUrl: existingCourse.thumbnailUrl,
    createdAt: existingCourse.createdAt,
    updatedAt: existingCourse.updatedAt,
    instructor: instructorRow || null,
    modules: modulesWithContent,
    moduleCount: courseModules.length,
    lessonCount: courseLessons.length,
  };
}

export interface UpdateCourseInput {
  status?: string;
}

/**
 * Update course (admin only).
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput
): Promise<void> {
  const [existingCourse] = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!existingCourse) {
    throw new AdminError("COURSE_NOT_FOUND", "Course not found", 404);
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.status !== undefined) {
    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(input.status)) {
      throw new AdminError("INVALID_STATUS", "Invalid course status", 400);
    }
    updateData.status = input.status;
  }

  await db
    .update(course)
    .set(updateData)
    .where(eq(course.id, courseId));
}

// ============================================================================
// Platform Settings
// ============================================================================

export interface PlatformSettings {
  platformName: string;
  platformLogo: string | null;
  termsVersion: string;
}

/**
 * Get platform settings (placeholder — would read from a settings table).
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  // For MVP, return hardcoded settings
  // In production, this would read from a settings table
  return {
    platformName: "LMS Platform",
    platformLogo: null,
    termsVersion: "1.0",
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class AdminError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "AdminError";
  }
}
