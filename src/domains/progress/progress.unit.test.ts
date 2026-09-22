import { describe, it, expect } from "vitest";
import { VIDEO_COMPLETION_THRESHOLD } from "../../shared/constants";

// ============================================================================
// Progress Domain Unit Tests — Pure calculation/validation logic
// ============================================================================

describe("Progress Domain Unit Tests", () => {
  describe("Video completion threshold", () => {
    it("should use 90% threshold constant", () => {
      expect(VIDEO_COMPLETION_THRESHOLD).toBe(0.9);
    });

    it("should mark video complete at exactly 90% of duration", () => {
      const positionSeconds = 90;
      const durationSeconds = 100;
      expect(positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD).toBe(true);
    });

    it("should not mark video complete below 90% of duration", () => {
      const positionSeconds = 89;
      const durationSeconds = 100;
      expect(positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD).toBe(false);
    });

    it("should handle zero duration gracefully", () => {
      const positionSeconds = 10;
      const durationSeconds = 0;
      // Zero duration should never trigger completion
      const completed =
        durationSeconds > 0
          ? positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD
          : false;
      expect(completed).toBe(false);
    });

    it("should handle negative duration gracefully", () => {
      const positionSeconds = 10;
      const durationSeconds = -5;
      const completed =
        durationSeconds > 0
          ? positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD
          : false;
      expect(completed).toBe(false);
    });

    it("should handle position > duration (scrubbed past end)", () => {
      const positionSeconds = 150;
      const durationSeconds = 100;
      expect(positionSeconds >= durationSeconds * VIDEO_COMPLETION_THRESHOLD).toBe(true);
    });
  });

  describe("Course progress calculation", () => {
    function calculateCourseProgress(
      totalLessons: number,
      completedLessons: number
    ) {
      if (totalLessons === 0) {
        return { totalLessons: 0, completedLessons: 0, percentage: 0 };
      }
      const percentage = Math.round((completedLessons / totalLessons) * 100);
      return { totalLessons, completedLessons, percentage };
    }

    it("should return 0% for empty course", () => {
      const result = calculateCourseProgress(0, 0);
      expect(result.percentage).toBe(0);
    });

    it("should return 0% when no lessons completed", () => {
      const result = calculateCourseProgress(10, 0);
      expect(result.percentage).toBe(0);
    });

    it("should return 100% when all lessons completed", () => {
      const result = calculateCourseProgress(10, 10);
      expect(result.percentage).toBe(100);
    });

    it("should calculate correct percentage for partial progress", () => {
      const result = calculateCourseProgress(10, 3);
      expect(result.percentage).toBe(30);
    });

    it("should round percentage correctly", () => {
      // 1/3 = 33.33% → rounds to 33%
      const result = calculateCourseProgress(3, 1);
      expect(result.percentage).toBe(33);
    });

    it("should handle single lesson course", () => {
      const result = calculateCourseProgress(1, 1);
      expect(result.percentage).toBe(100);
    });

    it("should handle many lessons", () => {
      const result = calculateCourseProgress(100, 75);
      expect(result.percentage).toBe(75);
    });
  });

  describe("Module progress calculation", () => {
    function calculateModuleProgress(lessons: { visible: boolean; completed: boolean }[]) {
      const visibleLessons = lessons.filter((l) => l.visible);
      const totalVisible = visibleLessons.length;
      if (totalVisible === 0) {
        return { totalLessons: 0, completedLessons: 0, percentage: 0 };
      }
      const completedVisible = visibleLessons.filter((l) => l.completed).length;
      return {
        totalLessons: totalVisible,
        completedLessons: completedVisible,
        percentage: Math.round((completedVisible / totalVisible) * 100),
      };
    }

    it("should count only visible lessons", () => {
      const result = calculateModuleProgress([
        { visible: true, completed: true },
        { visible: true, completed: false },
        { visible: false, completed: true },
      ]);
      expect(result.totalLessons).toBe(2);
      expect(result.completedLessons).toBe(1);
      expect(result.percentage).toBe(50);
    });

    it("should return 0 for no visible lessons", () => {
      const result = calculateModuleProgress([
        { visible: false, completed: true },
        { visible: false, completed: false },
      ]);
      expect(result.totalLessons).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe("Lesson status transitions", () => {
    type LessonStatus = "not_started" | "in_progress" | "completed";
    const VALID_LESSON_TRANSITIONS: Record<LessonStatus, LessonStatus[]> = {
      not_started: ["in_progress", "completed"],
      in_progress: ["completed"],
      completed: [], // completed NEVER reverts
    };

    function isValidLessonTransition(from: LessonStatus, to: LessonStatus): boolean {
      return VALID_LESSON_TRANSITIONS[from]?.includes(to) ?? false;
    }

    it("should allow not_started → in_progress", () => {
      expect(isValidLessonTransition("not_started", "in_progress")).toBe(true);
    });

    it("should allow not_started → completed (skip start)", () => {
      expect(isValidLessonTransition("not_started", "completed")).toBe(true);
    });

    it("should allow in_progress → completed", () => {
      expect(isValidLessonTransition("in_progress", "completed")).toBe(true);
    });

    it("should reject completed → in_progress (never revert)", () => {
      expect(isValidLessonTransition("completed", "in_progress")).toBe(false);
    });

    it("should reject completed → not_started (never revert)", () => {
      expect(isValidLessonTransition("completed", "not_started")).toBe(false);
    });

    it("should reject in_progress → not_started", () => {
      expect(isValidLessonTransition("in_progress", "not_started")).toBe(false);
    });
  });
});
