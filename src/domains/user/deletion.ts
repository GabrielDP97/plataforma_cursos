import { db } from "../../infra/db";
import { user } from "../../infra/schema/user";
import { enrollment } from "../../infra/schema/enrollment";
import { lessonProgress } from "../../infra/schema/progress";
import { notification } from "../../infra/schema/notification";
import { userConsent } from "../../infra/schema/consent";
import { courseInstructors } from "../../infra/schema/ownership";
import { eq, and, isNotNull, lt } from "drizzle-orm";

// ============================================================================
// Account Deletion Service (M15)
// ============================================================================

const GRACE_PERIOD_DAYS = 30;

export interface DeletionRequest {
  userId: string;
  requestedAt: Date;
  scheduledFor: Date;
}

/**
 * Request account deletion (soft delete).
 * Sets deletedAt on the user. Account is retained for 30 days.
 * User can no longer log in during the grace period.
 */
export async function requestDeletion(
  userId: string
): Promise<DeletionRequest> {
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new DeletionError("USER_NOT_FOUND", "User not found", 404);
  }

  if (userData.deletedAt) {
    throw new DeletionError(
      "ALREADY_DELETED",
      "Account deletion already requested",
      400
    );
  }

  const now = new Date();
  const scheduledFor = new Date(now);
  scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS);

  await db
    .update(user)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(user.id, userId));

  return {
    userId,
    requestedAt: now,
    scheduledFor,
  };
}

/**
 * Cancel account deletion (remove soft delete).
 * Only works during the grace period (before hard delete).
 */
export async function cancelDeletion(userId: string): Promise<void> {
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new DeletionError("USER_NOT_FOUND", "User not found", 404);
  }

  if (!userData.deletedAt) {
    throw new DeletionError(
      "NO_DELETION_PENDING",
      "No pending deletion for this account",
      400
    );
  }

  await db
    .update(user)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

/**
 * Hard delete — permanently remove all user data.
 * Cascade: enrollments, progress, notifications, consents, course_instructors.
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new DeletionError("USER_NOT_FOUND", "User not found", 404);
  }

  // 1. Delete enrollments
  await db.delete(enrollment).where(eq(enrollment.userId, userId));

  // 2. Delete lesson progress
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));

  // 3. Delete notifications
  await db.delete(notification).where(eq(notification.userId, userId));

  // 4. Delete consent history
  await db.delete(userConsent).where(eq(userConsent.userId, userId));

  // 5. Delete course instructor memberships
  await db.delete(courseInstructors).where(
    eq(courseInstructors.userId, userId)
  );

  // 6. Delete the user
  await db.delete(user).where(eq(user.id, userId));
}

/**
 * Process expired soft-deleted accounts (past 30-day grace period).
 * This would be called by a cron job.
 */
export async function processExpiredDeletions(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - GRACE_PERIOD_DAYS);

  // Find users past their grace period
  const expiredUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        // deletedAt is set
        isNotNull(user.deletedAt),
        // and it's older than 30 days
        lt(user.deletedAt, thirtyDaysAgo)
      )
    );

  // Hard delete each expired user
  let deletedCount = 0;
  for (const expiredUser of expiredUsers) {
    await hardDeleteUser(expiredUser.id);
    deletedCount++;
  }

  return deletedCount;
}

/**
 * Check if a user is soft-deleted.
 */
export async function isUserDeleted(userId: string): Promise<boolean> {
  const [userData] = await db
    .select({ deletedAt: user.deletedAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData?.deletedAt !== null && userData?.deletedAt !== undefined;
}

// ============================================================================
// Custom error class
// ============================================================================

export class DeletionError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "DeletionError";
  }
}
