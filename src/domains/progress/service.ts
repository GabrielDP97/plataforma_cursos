import { db } from "../../infra/db";
import { lessonProgress, videoProgress } from "../../infra/schema/progress";
import { lesson as lessonTable, module as moduleTable } from "../../infra/schema/content";
import { eq, and, count, sql } from "drizzle-orm";
import { VIDEO_COMPLETION_THRESHOLD } from "../../shared/constants";

// ============================================================================
// Progress Service (M9)
// ============================================================================

/**
 * Get or create a lesson progress record.
 */
async function getOrCreateLessonProgress(
  userId: string,
  lessonId: string
) {
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  // Verify lesson exists
  const lessonResult = await db
    .select()
    .from(lessonTable)
    .where(eq(lessonTable.id, lessonId))
    .limit(1);

  if (!lessonResult[0]) {
    throw new ProgressError("LESSON_NOT_FOUND", "Lesson not found", 404);
  }

  // Create initial progress record
  const [created] = await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      status: "not_started",
    })
    .returning();

  return created;
}

/**
 * Get or create a video progress record.
 */
async function getOrCreateVideoProgress(
  userId: string,
  lessonId: string
) {
  const existing = await db
    .select()
    .from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), eq(videoProgress.lessonId, lessonId)))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(videoProgress)
    .values({
      userId,
      lessonId,
      lastPositionSeconds: 0,
    })
    .returning();

  return created;
}

// ============================================================================
// Lesson Progress
// ============================================================================

/**
 * Start a lesson — transition from 'not_started' to 'in_progress'.
 * Idempotent: if already in_progress or completed, returns current state.
 */
export async function startLesson(userId: string, lessonId: string) {
  const progress = await getOrCreateLessonProgress(userId, lessonId);

  // Already in_progress or completed — return as-is (idempotent)
  if (progress.status === "in_progress" || progress.status === "completed") {
    return progress;
  }

  // Transition: not_started → in_progress
  const [updated] = await db
    .update(lessonProgress)
    .set({
      status: "in_progress",
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(lessonProgress.id, progress.id))
    .returning();

  return updated;
}

/**
 * Complete a lesson — transition from 'in_progress' to 'completed'.
 * Once completed, status does NOT revert.
 */
export async function completeLesson(userId: string, lessonId: string) {
  const progress = await getOrCreateLessonProgress(userId, lessonId);

  // Already completed — return as-is (never revert)
  if (progress.status === "completed") {
    return progress;
  }

  // If not_started, mark as in_progress first
  const updates: Record<string, unknown> = {
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  if (progress.status === "not_started") {
    updates.startedAt = new Date();
  }

  const [updated] = await db
    .update(lessonProgress)
    .set(updates)
    .where(eq(lessonProgress.id, progress.id))
    .returning();

  return updated;
}

/**
 * Get lesson progress for a user.
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const result = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);

  return result[0] || null;
}

// ============================================================================
// Video Progress
// ============================================================================

/**
 * Update video playback position.
 * Marks video as completed if position >= duration * 0.9.
 */
export async function updateVideoProgress(
  userId: string,
  lessonId: string,
  positionSeconds: number,
  durationSeconds?: number
) {
  const progress = await getOrCreateVideoProgress(userId, lessonId);

  const completed =
    durationSeconds !== undefined && durationSeconds > 0
      ? positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD
      : progress.completed;

  const [updated] = await db
    .update(videoProgress)
    .set({
      lastPositionSeconds: positionSeconds,
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
      completed,
      updatedAt: new Date(),
    })
    .where(eq(videoProgress.id, progress.id))
    .returning();

  return updated;
}

/**
 * Get video progress for a user.
 */
export async function getVideoProgress(userId: string, lessonId: string) {
  const result = await db
    .select()
    .from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), eq(videoProgress.lessonId, lessonId)))
    .limit(1);

  return result[0] || null;
}

// ============================================================================
// Course Progress (DERIVED)
// ============================================================================

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

/**
 * Calculate course progress from lesson-level data.
 * Course progress = completed lessons / total visible lessons * 100.
 * Never stored — always calculated.
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgress> {
  // Get all visible lessons in the course via modules
  const lessonsResult = await db
    .select({ lessonId: lessonTable.id })
    .from(lessonTable)
    .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
    .where(
      and(
        eq(moduleTable.courseId, courseId),
        eq(lessonTable.visible, true),
        eq(moduleTable.visible, true)
      )
    );

  const totalLessons = lessonsResult.length;

  if (totalLessons === 0) {
    return {
      courseId,
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
    };
  }

  // Count completed lessons for this user
  const lessonIds = lessonsResult.map((l) => l.lessonId);

  const completedResult = await db
    .select({ total: count() })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        sql`${lessonProgress.lessonId} IN ${lessonIds}`,
        eq(lessonProgress.status, "completed")
      )
    );

  const completedLessons = completedResult[0]?.total ?? 0;
  const percentage = Math.round((completedLessons / totalLessons) * 100);

  return {
    courseId,
    totalLessons,
    completedLessons,
    percentage,
  };
}

// ============================================================================
// Module Progress (DERIVED)
// ============================================================================

export interface ModuleProgress {
  moduleId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

/**
 * Calculate module progress from lesson-level data.
 * Module progress = completed lessons in module / total visible lessons in module * 100.
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<ModuleProgress> {
  // Get all visible lessons in the module
  const lessonsResult = await db
    .select({ lessonId: lessonTable.id })
    .from(lessonTable)
    .where(and(eq(lessonTable.moduleId, moduleId), eq(lessonTable.visible, true)));

  const totalLessons = lessonsResult.length;

  if (totalLessons === 0) {
    return {
      moduleId,
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
    };
  }

  const lessonIds = lessonsResult.map((l) => l.lessonId);

  const completedResult = await db
    .select({ total: count() })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        sql`${lessonProgress.lessonId} IN ${lessonIds}`,
        eq(lessonProgress.status, "completed")
      )
    );

  const completedLessons = completedResult[0]?.total ?? 0;
  const percentage = Math.round((completedLessons / totalLessons) * 100);

  return {
    moduleId,
    totalLessons,
    completedLessons,
    percentage,
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class ProgressError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "ProgressError";
  }
}
