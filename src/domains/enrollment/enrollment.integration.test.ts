import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  enrollStudent,
  unenrollStudent,
  isEnrolled,
  listUserEnrollments,
  listCourseStudents,
  completeEnrollment,
  getEnrollment,
  EnrollmentError,
} from "./service";
import { db } from "../../infra/db";
import { enrollment } from "../../infra/schema/enrollment";
import { course } from "../../infra/schema/course";
import { eq } from "drizzle-orm";

// Test data
const TEST_STUDENT_ID = "test-student-enrollment-001";
const TEST_STUDENT_ID_2 = "test-student-enrollment-002";
const TEST_PUBLISHED_COURSE_ID = "test-course-enrollment-published-001";
const TEST_DRAFT_COURSE_ID = "test-course-enrollment-draft-001";
const TEST_NONEXISTENT_COURSE_ID = "00000000-0000-0000-0000-000000000000";

describe("Enrollment Service (M8)", () => {
  beforeAll(async () => {
    // Create test courses
    await db.insert(course).values({
      id: TEST_PUBLISHED_COURSE_ID,
      title: "Published Enrollment Course",
      slug: "published-enrollment-course",
      status: "published",
    });

    await db.insert(course).values({
      id: TEST_DRAFT_COURSE_ID,
      title: "Draft Enrollment Course",
      slug: "draft-enrollment-course",
      status: "draft",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(enrollment).where(eq(enrollment.userId, TEST_STUDENT_ID));
    await db.delete(enrollment).where(eq(enrollment.userId, TEST_STUDENT_ID_2));
    await db.delete(course).where(eq(course.id, TEST_PUBLISHED_COURSE_ID));
    await db.delete(course).where(eq(course.id, TEST_DRAFT_COURSE_ID));
  });

  describe("Enroll", () => {
    it("should enroll student in published course", async () => {
      const result = await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: TEST_PUBLISHED_COURSE_ID,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(TEST_STUDENT_ID);
      expect(result.courseId).toBe(TEST_PUBLISHED_COURSE_ID);
      expect(result.status).toBe("active");
      expect(result.source).toBe("free");
    });

    it("should be idempotent — duplicate enrollment returns existing", async () => {
      const first = await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: TEST_PUBLISHED_COURSE_ID,
      });

      const second = await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: TEST_PUBLISHED_COURSE_ID,
      });

      expect(second.id).toBe(first.id);
      expect(second.status).toBe("active");
    });

    it("should reject enrollment in draft course", async () => {
      await expect(
        enrollStudent({
          userId: TEST_STUDENT_ID,
          courseId: TEST_DRAFT_COURSE_ID,
        })
      ).rejects.toThrow(EnrollmentError);
    });

    it("should reject enrollment in nonexistent course", async () => {
      await expect(
        enrollStudent({
          userId: TEST_STUDENT_ID,
          courseId: TEST_NONEXISTENT_COURSE_ID,
        })
      ).rejects.toThrow(EnrollmentError);
    });

    it("should allow different students to enroll in same course", async () => {
      const result = await enrollStudent({
        userId: TEST_STUDENT_ID_2,
        courseId: TEST_PUBLISHED_COURSE_ID,
      });

      expect(result.userId).toBe(TEST_STUDENT_ID_2);
      expect(result.status).toBe("active");
    });
  });

  describe("Check enrollment", () => {
    it("should return true for enrolled student", async () => {
      const enrolled = await isEnrolled(TEST_STUDENT_ID, TEST_PUBLISHED_COURSE_ID);
      expect(enrolled).toBe(true);
    });

    it("should return false for non-enrolled student", async () => {
      const enrolled = await isEnrolled("non-enrolled-user-id", TEST_PUBLISHED_COURSE_ID);
      expect(enrolled).toBe(false);
    });
  });

  describe("Get enrollment", () => {
    it("should return enrollment record", async () => {
      const enrollmentRecord = await getEnrollment(TEST_STUDENT_ID, TEST_PUBLISHED_COURSE_ID);
      expect(enrollmentRecord).toBeDefined();
      expect(enrollmentRecord!.userId).toBe(TEST_STUDENT_ID);
    });

    it("should return undefined for non-enrolled student", async () => {
      const enrollmentRecord = await getEnrollment("non-enrolled-user-id", TEST_PUBLISHED_COURSE_ID);
      expect(enrollmentRecord).toBeUndefined();
    });
  });

  describe("List enrollments", () => {
    it("should list user enrollments", async () => {
      const result = await listUserEnrollments(TEST_STUDENT_ID);

      expect(result.enrollments.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.total).toBeGreaterThanOrEqual(1);
    });

    it("should list course students", async () => {
      const result = await listCourseStudents(TEST_PUBLISHED_COURSE_ID);

      expect(result.enrollments.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Complete enrollment", () => {
    let completeCourseId: string;

    beforeAll(async () => {
      // Create a fresh course for completion test
      const [created] = await db
        .insert(course)
        .values({
          title: "Completion Test Course",
          slug: "completion-test-course",
          status: "published",
        })
        .returning();
      completeCourseId = created.id;

      // Enroll
      await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: completeCourseId,
      });
    });

    afterAll(async () => {
      await db.delete(enrollment).where(eq(enrollment.courseId, completeCourseId));
      await db.delete(course).where(eq(course.id, completeCourseId));
    });

    it("should complete enrollment", async () => {
      await completeEnrollment(TEST_STUDENT_ID, completeCourseId);

      const enrollmentRecord = await getEnrollment(TEST_STUDENT_ID, completeCourseId);
      expect(enrollmentRecord!.status).toBe("completed");
      expect(enrollmentRecord!.completedAt).toBeDefined();
    });

    it("should reject completing already completed enrollment", async () => {
      await expect(
        completeEnrollment(TEST_STUDENT_ID, completeCourseId)
      ).rejects.toThrow(EnrollmentError);
    });
  });

  describe("Unenroll", () => {
    let dropCourseId: string;

    beforeAll(async () => {
      const [created] = await db
        .insert(course)
        .values({
          title: "Drop Test Course",
          slug: "drop-test-course",
          status: "published",
        })
        .returning();
      dropCourseId = created.id;

      await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: dropCourseId,
      });
    });

    afterAll(async () => {
      await db.delete(enrollment).where(eq(enrollment.courseId, dropCourseId));
      await db.delete(course).where(eq(course.id, dropCourseId));
    });

    it("should unenroll student", async () => {
      await unenrollStudent(TEST_STUDENT_ID, dropCourseId);

      const enrolled = await isEnrolled(TEST_STUDENT_ID, dropCourseId);
      expect(enrolled).toBe(false);
    });

    it("should reject unenrolling non-enrolled student", async () => {
      await expect(
        unenrollStudent("non-enrolled-user-id", dropCourseId)
      ).rejects.toThrow(EnrollmentError);
    });

    it("should allow re-enrollment after dropping", async () => {
      const reEnrolled = await enrollStudent({
        userId: TEST_STUDENT_ID,
        courseId: dropCourseId,
      });

      expect(reEnrolled.status).toBe("active");
    });
  });
});
