import { db } from "../../infra/db";
import { notification } from "../../infra/schema/notification";
import { enrollment } from "../../infra/schema/enrollment";
import { courseInstructors } from "../../infra/schema/ownership";
import { eq, and, desc, count } from "drizzle-orm";

// ============================================================================
// Notification CRUD
// ============================================================================

export interface CreateNotificationInput {
  userId: string;
  type: "announcement" | "enrollment" | "system";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ListNotificationsInput {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Create a notification for a single user.
 */
export async function createNotification(input: CreateNotificationInput) {
  const [created] = await db
    .insert(notification)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata,
    })
    .returning();

  return created;
}

/**
 * Create announcements for all students enrolled in a course.
 * Returns the number of notifications created.
 */
export async function createAnnouncement(
  instructorId: string,
  courseId: string,
  title: string,
  message: string
): Promise<{ count: number }> {
  // Verify instructor owns the course
  const membership = await db
    .select()
    .from(courseInstructors)
    .where(
      and(
        eq(courseInstructors.courseId, courseId),
        eq(courseInstructors.userId, instructorId)
      )
    )
    .limit(1);

  if (!membership[0]) {
    throw new NotificationError("FORBIDDEN", "You do not own this course", 403);
  }

  // Get all enrolled students
  const enrolledStudents = await db
    .select({ userId: enrollment.userId })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, courseId),
        eq(enrollment.status, "active")
      )
    );

  if (enrolledStudents.length === 0) {
    return { count: 0 };
  }

  // Create notification for each enrolled student
  const notifications = enrolledStudents.map((student) => ({
    userId: student.userId,
    type: "announcement" as const,
    title,
    message,
    metadata: { courseId, instructorId },
  }));

  await db.insert(notification).values(notifications);

  return { count: enrolledStudents.length };
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const [existing] = await db
    .select()
    .from(notification)
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new NotificationError("NOT_FOUND", "Notification not found", 404);
  }

  await db
    .update(notification)
    .set({ read: true })
    .where(eq(notification.id, notificationId));
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notification)
    .set({ read: true })
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.read, false)
      )
    );
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.read, false)
      )
    );

  return result?.total ?? 0;
}

/**
 * List notifications for a user with pagination.
 */
export async function listNotifications(input: ListNotificationsInput) {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(notification.userId, input.userId)];

  if (input.unreadOnly) {
    conditions.push(eq(notification.read, false));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(notification)
    .where(whereClause);

  const total = totalResult?.total ?? 0;

  // Get notifications
  const notifications = await db
    .select()
    .from(notification)
    .where(whereClause)
    .orderBy(desc(notification.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    notifications,
    meta: {
      page,
      limit,
      total,
    },
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class NotificationError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "NotificationError";
  }
}
