import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import studentRoutes from "./student";
import catalogRoutes from "./catalog";
import contentAccessRoutes from "./content-access";
import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { enrollment } from "../../infra/schema/enrollment";
import { module as moduleTable, lesson as lessonTable, contentBlock } from "../../infra/schema/content";
import { lessonProgress } from "../../infra/schema/progress";
import { eq } from "drizzle-orm";

// Test data
const TEST_STUDENT_ID = "test-student-experience-001";
const TEST_PUBLISHED_COURSE_ID = "test-course-experience-published-001";
const TEST_MODULE_ID = "test-module-experience-001";
const TEST_LESSON_ID = "test-lesson-experience-001";
const TEST_BLOCK_ID = "test-block-experience-001";

// Mock auth middleware for tests
const mockAuth = async (c: any, next: any) => {
  c.set("user", { id: TEST_STUDENT_ID, role: "student" });
  await next();
};

// Helper to parse JSON response
async function parseJson(res: Response): Promise<any> {
  return res.json();
}

describe("Student Experience (M11)", () => {
  let app: Hono;

  beforeAll(async () => {
    // Create test course
    await db.insert(course).values({
      id: TEST_PUBLISHED_COURSE_ID,
      title: "Test Course",
      slug: "test-course-experience",
      status: "published",
    });

    // Create test module
    await db.insert(moduleTable).values({
      id: TEST_MODULE_ID,
      courseId: TEST_PUBLISHED_COURSE_ID,
      title: "Test Module",
      position: 1,
    });

    // Create test lesson
    await db.insert(lessonTable).values({
      id: TEST_LESSON_ID,
      moduleId: TEST_MODULE_ID,
      title: "Test Lesson",
      position: 1,
    });

    // Create test content block
    await db.insert(contentBlock).values({
      id: TEST_BLOCK_ID,
      lessonId: TEST_LESSON_ID,
      type: "text",
      content: "Test content",
      position: 1,
    });

    // Enroll student
    await db.insert(enrollment).values({
      userId: TEST_STUDENT_ID,
      courseId: TEST_PUBLISHED_COURSE_ID,
      status: "active",
      source: "free",
    });

    // Create Hono app with mocked auth
    app = new Hono();
    app.use("*", mockAuth);
    app.route("/api", studentRoutes);
    app.route("/api", contentAccessRoutes);
    app.route("/api/catalog", catalogRoutes);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(contentBlock).where(eq(contentBlock.id, TEST_BLOCK_ID));
    await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, TEST_LESSON_ID));
    await db.delete(lessonTable).where(eq(lessonTable.id, TEST_LESSON_ID));
    await db.delete(moduleTable).where(eq(moduleTable.id, TEST_MODULE_ID));
    await db.delete(enrollment).where(eq(enrollment.userId, TEST_STUDENT_ID));
    await db.delete(course).where(eq(course.id, TEST_PUBLISHED_COURSE_ID));
  });

  describe("Student Dashboard", () => {
    it("should return enrolled courses with progress", async () => {
      const res = await app.request("/api/student/dashboard");
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);

      // Should have at least one enrolled course
      const enrolledCourse = body.data.find(
        (e: any) => e.courseId === TEST_PUBLISHED_COURSE_ID
      );
      expect(enrolledCourse).toBeDefined();
      expect(enrolledCourse.course.title).toBe("Test Course");
      expect(enrolledCourse.progress).toBeDefined();
      expect(enrolledCourse.progress.totalLessons).toBe(1);
    });
  });

  describe("Course Overview", () => {
    it("should return course overview with modules/lessons", async () => {
      const res = await app.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/overview`
      );
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.course).toBeDefined();
      expect(body.data.modules).toBeDefined();
      expect(body.data.modules.length).toBe(1);
      expect(body.data.modules[0].lessons.length).toBe(1);
    });

    it("should return 403 for unenrolled user", async () => {
      // Create a different app without enrollment
      const unenrolledApp = new Hono();
      unenrolledApp.use("*", async (c: any, next: any) => {
        c.set("user", { id: "unenrolled-user", role: "student" });
        await next();
      });
      unenrolledApp.route("/api", studentRoutes);

      const res = await unenrolledApp.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/overview`
      );
      const body = await parseJson(res);

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_ENROLLED");
    });
  });

  describe("Lesson Content", () => {
    it("should return lesson content with blocks", async () => {
      const res = await app.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/lessons/${TEST_LESSON_ID}`
      );
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.lesson).toBeDefined();
      expect(body.data.blocks).toBeDefined();
      expect(body.data.blocks.length).toBe(1);
      expect(body.data.blocks[0].type).toBe("text");
      expect(body.data.blocks[0].content).toBe("Test content");
    });

    it("should return 403 for unenrolled user", async () => {
      const unenrolledApp = new Hono();
      unenrolledApp.use("*", async (c: any, next: any) => {
        c.set("user", { id: "unenrolled-user", role: "student" });
        await next();
      });
      unenrolledApp.route("/api", studentRoutes);

      const res = await unenrolledApp.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/lessons/${TEST_LESSON_ID}`
      );

      expect(res.status).toBe(403);
    });
  });

  describe("Content Access", () => {
    it("should return full content tree for enrolled user", async () => {
      const res = await app.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/content`
      );
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].lessons.length).toBe(1);
      expect(body.data[0].lessons[0].blocks.length).toBe(1);
    });

    it("should return 403 for unenrolled user", async () => {
      const unenrolledApp = new Hono();
      unenrolledApp.use("*", async (c: any, next: any) => {
        c.set("user", { id: "unenrolled-user", role: "student" });
        await next();
      });
      unenrolledApp.route("/api", contentAccessRoutes);

      const res = await unenrolledApp.request(
        `/api/student/courses/${TEST_PUBLISHED_COURSE_ID}/content`
      );

      expect(res.status).toBe(403);
    });
  });

  describe("Catalog", () => {
    it("should return published courses", async () => {
      const res = await app.request("/api/catalog");
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);

      // Should include our test course
      const testCourse = body.data.find(
        (c: any) => c.id === TEST_PUBLISHED_COURSE_ID
      );
      expect(testCourse).toBeDefined();
      expect(testCourse.categories).toBeDefined();
      expect(testCourse.lessonCount).toBe(1);
    });

    it("should support pagination", async () => {
      const res = await app.request("/api/catalog?page=1&limit=5");
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(5);
    });

    it("should support search", async () => {
      const res = await app.request("/api/catalog?q=Test");
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe("Catalog Course Detail", () => {
    it("should return course detail by slug", async () => {
      const res = await app.request("/api/catalog/test-course-experience");
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.course).toBeDefined();
      expect(body.data.course.slug).toBe("test-course-experience");
      expect(body.data.modules).toBeDefined();
      expect(body.data.lessonCount).toBe(1);
    });

    it("should return 404 for nonexistent slug", async () => {
      const res = await app.request("/api/catalog/nonexistent-course");
      const body = await parseJson(res);

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("COURSE_NOT_FOUND");
    });

    it("should return 404 for draft course", async () => {
      // Create a draft course
      const [draftCourse] = await db
        .insert(course)
        .values({
          title: "Draft Course",
          slug: "draft-course-experience",
          status: "draft",
        })
        .returning();

      const res = await app.request("/api/catalog/draft-course-experience");

      expect(res.status).toBe(404);

      // Cleanup
      await db.delete(course).where(eq(course.id, draftCourse.id));
    });
  });
});
