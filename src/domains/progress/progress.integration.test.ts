import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  startLesson,
  completeLesson,
  getLessonProgress,
  updateVideoProgress,
  getVideoProgress,
  getCourseProgress,
  getModuleProgress,
  ProgressError,
} from "./service";
import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { courseInstructors, COURSE_INSTRUCTOR_OWNER } from "../../infra/schema/ownership";
import { module as moduleTable, lesson as lessonTable, contentBlock } from "../../infra/schema/content";
import { lessonProgress, videoProgress } from "../../infra/schema/progress";
import { eq } from "drizzle-orm";

// Test data
const TEST_USER_ID = "test-user-progress-001";
const TEST_COURSE_ID = "test-course-progress-001";
const TEST_MODULE_ID = "test-module-progress-001";
const TEST_LESSON_ID = "test-lesson-progress-001";
const TEST_LESSON_ID_2 = "test-lesson-progress-002";
const TEST_NONEXISTENT_LESSON_ID = "00000000-0000-0000-0000-000000000000";

describe("Progress Service (M9)", () => {
  beforeAll(async () => {
    // Create test course
    await db.insert(course).values({
      id: TEST_COURSE_ID,
      title: "Progress Test Course",
      slug: "progress-test-course",
      status: "published",
    });

    // Add user as course owner
    await db.insert(courseInstructors).values({
      courseId: TEST_COURSE_ID,
      userId: TEST_USER_ID,
      role: COURSE_INSTRUCTOR_OWNER,
    });

    // Create test module
    await db.insert(moduleTable).values({
      id: TEST_MODULE_ID,
      courseId: TEST_COURSE_ID,
      title: "Test Module",
      position: 0,
    });

    // Create test lessons
    await db.insert(lessonTable).values([
      {
        id: TEST_LESSON_ID,
        moduleId: TEST_MODULE_ID,
        title: "Test Lesson 1",
        position: 0,
      },
      {
        id: TEST_LESSON_ID_2,
        moduleId: TEST_MODULE_ID,
        title: "Test Lesson 2",
        position: 1,
      },
    ]);

    // Create content blocks for lesson 1
    await db.insert(contentBlock).values([
      {
        lessonId: TEST_LESSON_ID,
        type: "text",
        content: "Introduction text",
        position: 0,
      },
      {
        lessonId: TEST_LESSON_ID,
        type: "video",
        content: "Video reference",
        position: 1,
      },
    ]);

    // Create content block for lesson 2
    await db.insert(contentBlock).values({
      lessonId: TEST_LESSON_ID_2,
      type: "text",
      content: "Lesson 2 content",
      position: 0,
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(videoProgress).where(eq(videoProgress.userId, TEST_USER_ID));
    await db.delete(lessonProgress).where(eq(lessonProgress.userId, TEST_USER_ID));
    await db.delete(contentBlock).where(eq(contentBlock.lessonId, TEST_LESSON_ID));
    await db.delete(contentBlock).where(eq(contentBlock.lessonId, TEST_LESSON_ID_2));
    await db.delete(lessonTable).where(eq(lessonTable.moduleId, TEST_MODULE_ID));
    await db.delete(moduleTable).where(eq(moduleTable.courseId, TEST_COURSE_ID));
    await db.delete(courseInstructors).where(eq(courseInstructors.courseId, TEST_COURSE_ID));
    await db.delete(course).where(eq(course.id, TEST_COURSE_ID));
  });

  describe("Lesson Progress", () => {
    it("should start a lesson (not_started → in_progress)", async () => {
      const progress = await startLesson(TEST_USER_ID, TEST_LESSON_ID);

      expect(progress).toBeDefined();
      expect(progress.status).toBe("in_progress");
      expect(progress.startedAt).toBeDefined();
    });

    it("should be idempotent — starting already started lesson returns same state", async () => {
      const progress = await startLesson(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress.status).toBe("in_progress");
    });

    it("should complete a lesson (in_progress → completed)", async () => {
      const progress = await completeLesson(TEST_USER_ID, TEST_LESSON_ID);

      expect(progress.status).toBe("completed");
      expect(progress.completedAt).toBeDefined();
    });

    it("should be idempotent — completing already completed lesson returns same state", async () => {
      const progress = await completeLesson(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress.status).toBe("completed");
    });

    it("should NOT revert completed status", async () => {
      // Start a new lesson
      await startLesson(TEST_USER_ID, TEST_LESSON_ID_2);
      await completeLesson(TEST_USER_ID, TEST_LESSON_ID_2);

      // Try to re-complete — should stay completed
      const progress = await completeLesson(TEST_USER_ID, TEST_LESSON_ID_2);
      expect(progress.status).toBe("completed");
    });

    it("should handle start → complete flow directly (not_started → completed)", async () => {
      // Create a temporary lesson for this test
      const [tempLesson] = await db
        .insert(lessonTable)
        .values({
          moduleId: TEST_MODULE_ID,
          title: "Temp Lesson",
          position: 99,
        })
        .returning();

      // Complete directly without starting first
      const progress = await completeLesson(TEST_USER_ID, tempLesson.id);

      expect(progress.status).toBe("completed");
      expect(progress.startedAt).toBeDefined();
      expect(progress.completedAt).toBeDefined();

      // Cleanup
      await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, tempLesson.id));
      await db.delete(lessonTable).where(eq(lessonTable.id, tempLesson.id));
    });

    it("should get lesson progress", async () => {
      const progress = await getLessonProgress(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress).toBeDefined();
      expect(progress!.status).toBe("completed");
    });

    it("should return null for non-started lesson", async () => {
      const progress = await getLessonProgress("nonexistent-user", TEST_LESSON_ID);
      expect(progress).toBeNull();
    });

    it("should throw for nonexistent lesson", async () => {
      await expect(
        startLesson(TEST_USER_ID, TEST_NONEXISTENT_LESSON_ID)
      ).rejects.toThrow(ProgressError);
    });
  });

  describe("Video Progress", () => {
    it("should update video position", async () => {
      const progress = await updateVideoProgress(
        TEST_USER_ID,
        TEST_LESSON_ID,
        120,
        300
      );

      expect(progress).toBeDefined();
      expect(progress.lastPositionSeconds).toBe(120);
      expect(progress.durationSeconds).toBe(300);
      expect(progress.completed).toBe(false); // 120/300 = 40% < 90%
    });

    it("should mark video as completed when past 90% threshold", async () => {
      const progress = await updateVideoProgress(
        TEST_USER_ID,
        TEST_LESSON_ID,
        280,
        300
      );

      expect(progress.completed).toBe(true); // 280/300 = 93.3% >= 90%
    });

    it("should update position without duration", async () => {
      const progress = await updateVideoProgress(
        TEST_USER_ID,
        TEST_LESSON_ID_2,
        60
      );

      expect(progress.lastPositionSeconds).toBe(60);
      expect(progress.completed).toBe(false); // no duration, stays false
    });

    it("should get video progress", async () => {
      const progress = await getVideoProgress(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress).toBeDefined();
      expect(progress!.lastPositionSeconds).toBe(280);
      expect(progress!.completed).toBe(true);
    });

    it("should return null for non-tracked video", async () => {
      const progress = await getVideoProgress("nonexistent-user", TEST_LESSON_ID);
      expect(progress).toBeNull();
    });
  });

  describe("Course Progress (Derived)", () => {
    it("should calculate course progress from lesson data", async () => {
      const progress = await getCourseProgress(TEST_USER_ID, TEST_COURSE_ID);

      expect(progress.courseId).toBe(TEST_COURSE_ID);
      expect(progress.totalLessons).toBe(2); // TEST_LESSON_ID + TEST_LESSON_ID_2
      expect(progress.completedLessons).toBe(2); // Both completed above
      expect(progress.percentage).toBe(100);
    });

    it("should return 0% for user with no progress", async () => {
      const progress = await getCourseProgress("user-with-no-progress", TEST_COURSE_ID);

      expect(progress.totalLessons).toBe(2);
      expect(progress.completedLessons).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it("should handle course with no lessons", async () => {
      // Create empty course
      const [emptyCourse] = await db
        .insert(course)
        .values({
          title: "Empty Course",
          slug: "empty-course-progress",
          status: "published",
        })
        .returning();

      const progress = await getCourseProgress(TEST_USER_ID, emptyCourse.id);

      expect(progress.totalLessons).toBe(0);
      expect(progress.completedLessons).toBe(0);
      expect(progress.percentage).toBe(0);

      // Cleanup
      await db.delete(course).where(eq(course.id, emptyCourse.id));
    });
  });

  describe("Module Progress (Derived)", () => {
    it("should calculate module progress from lesson data", async () => {
      const progress = await getModuleProgress(TEST_USER_ID, TEST_MODULE_ID);

      expect(progress.moduleId).toBe(TEST_MODULE_ID);
      expect(progress.totalLessons).toBe(2);
      expect(progress.completedLessons).toBe(2);
      expect(progress.percentage).toBe(100);
    });

    it("should return 0% for user with no progress", async () => {
      const progress = await getModuleProgress("user-with-no-progress", TEST_MODULE_ID);

      expect(progress.totalLessons).toBe(2);
      expect(progress.completedLessons).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe("Progress persistence", () => {
    it("should persist progress across reads", async () => {
      // Start a lesson
      await startLesson(TEST_USER_ID, TEST_LESSON_ID);

      // Read it back
      const progress1 = await getLessonProgress(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress1!.status).toBe("completed"); // Already completed above

      // Complete it again (idempotent)
      await completeLesson(TEST_USER_ID, TEST_LESSON_ID);

      // Read again — should still be completed
      const progress2 = await getLessonProgress(TEST_USER_ID, TEST_LESSON_ID);
      expect(progress2!.status).toBe("completed");
    });
  });
});
