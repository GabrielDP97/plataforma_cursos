import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { enrollment } from "../../infra/schema/enrollment";
import { lessonProgress } from "../../infra/schema/progress";
import { notification } from "../../infra/schema/notification";
import { userConsent } from "../../infra/schema/consent";
import { eq } from "drizzle-orm";

// ============================================================================
// GDPR Data Export Service (M15)
// ============================================================================

export interface ExportDocument {
  exportVersion: string;
  generatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
  enrollments: Array<{
    id: string;
    courseId: string;
    status: string;
    source: string;
    enrolledAt: string;
    completedAt: string | null;
  }>;
  progress: Array<{
    id: string;
    lessonId: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    lastPositionSeconds: number | null;
    updatedAt: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
  consentHistory: Array<{
    id: string;
    termsVersion: string;
    acceptedAt: string;
  }>;
}

/**
 * Export all user data as a versioned JSON document.
 * Excludes: passwords, hashes, sessions, tokens, internal security metadata.
 */
export async function exportUserData(userId: string): Promise<ExportDocument> {
  // 1. Get user profile
  const [userData] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new ExportError("USER_NOT_FOUND", "User not found", 404);
  }

  // 2. Get enrollments
  const enrollments = await db
    .select({
      id: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status,
      source: enrollment.source,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    })
    .from(enrollment)
    .where(eq(enrollment.userId, userId));

  // 3. Get lesson progress
  const progress = await db
    .select({
      id: lessonProgress.id,
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
      startedAt: lessonProgress.startedAt,
      completedAt: lessonProgress.completedAt,
      lastPositionSeconds: lessonProgress.lastPositionSeconds,
      updatedAt: lessonProgress.updatedAt,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));

  // 4. Get notifications
  const notifications = await db
    .select({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })
    .from(notification)
    .where(eq(notification.userId, userId));

  // 5. Get consent history
  const consentHistory = await db
    .select({
      id: userConsent.id,
      termsVersion: userConsent.termsVersion,
      acceptedAt: userConsent.acceptedAt,
    })
    .from(userConsent)
    .where(eq(userConsent.userId, userId));

  return {
    exportVersion: "1.0",
    generatedAt: new Date().toISOString(),
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: userData.createdAt.toISOString(),
    },
    enrollments: enrollments.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      status: e.status,
      source: e.source,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
    })),
    progress: progress.map((p) => ({
      id: p.id,
      lessonId: p.lessonId,
      status: p.status,
      startedAt: p.startedAt?.toISOString() ?? null,
      completedAt: p.completedAt?.toISOString() ?? null,
      lastPositionSeconds: p.lastPositionSeconds,
      updatedAt: p.updatedAt.toISOString(),
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    consentHistory: consentHistory.map((c) => ({
      id: c.id,
      termsVersion: c.termsVersion,
      acceptedAt: c.acceptedAt.toISOString(),
    })),
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class ExportError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "ExportError";
  }
}
