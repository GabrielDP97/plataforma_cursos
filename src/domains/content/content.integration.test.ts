import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  ContentError,
} from "./service";
import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { courseInstructors, COURSE_INSTRUCTOR_OWNER } from "../../infra/schema/ownership";
import { module as moduleTable } from "../../infra/schema/content";
import { lesson as lessonTable } from "../../infra/schema/content";
import { contentBlock } from "../../infra/schema/content";
import { eq } from "drizzle-orm";

// Test data
const TEST_USER_ID = "test-user-id-001";
const TEST_COURSE_ID = "test-course-id-001";
const TEST_MODULE_ID = "test-module-id-001";
const TEST_LESSON_ID = "test-lesson-id-001";

describe("Content Service (M4)", () => {
  beforeAll(async () => {
    // Create test course
    await db.insert(course).values({
      id: TEST_COURSE_ID,
      title: "Test Course",
      description: "A test course",
      slug: "test-course",
      status: "draft",
    });

    // Add user as course owner
    await db.insert(courseInstructors).values({
      courseId: TEST_COURSE_ID,
      userId: TEST_USER_ID,
      role: COURSE_INSTRUCTOR_OWNER,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(contentBlock).where(eq(contentBlock.lessonId, TEST_LESSON_ID));
    await db.delete(lessonTable).where(eq(lessonTable.moduleId, TEST_MODULE_ID));
    await db.delete(moduleTable).where(eq(moduleTable.courseId, TEST_COURSE_ID));
    await db.delete(courseInstructors).where(eq(courseInstructors.courseId, TEST_COURSE_ID));
    await db.delete(course).where(eq(course.id, TEST_COURSE_ID));
  });

  describe("Module CRUD", () => {
    it("should create a module with auto-position", async () => {
      const module = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Module 1",
        description: "First module",
      });

      expect(module).toBeDefined();
      expect(module.id).toBeDefined();
      expect(module.title).toBe("Module 1");
      expect(module.position).toBe(0);
    });

    it("should create a module with explicit position", async () => {
      const module = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Module 2",
        position: 5,
      });

      expect(module.position).toBe(5);
    });

    it("should reject module creation for non-owner", async () => {
      await expect(
        createModule("unauthorized-user-id", {
          courseId: TEST_COURSE_ID,
          title: "Unauthorized Module",
        })
      ).rejects.toThrow(ContentError);
    });

    it("should update a module", async () => {
      const modules = await db
        .select()
        .from(moduleTable)
        .where(eq(moduleTable.courseId, TEST_COURSE_ID))
        .limit(1);

      const updated = await updateModule(TEST_USER_ID, modules[0].id, {
        title: "Updated Module",
      });

      expect(updated.title).toBe("Updated Module");
    });

    it("should delete a module", async () => {
      // Create a module to delete
      const toDelete = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Module to Delete",
      });

      await deleteModule(TEST_USER_ID, toDelete.id);

      const deleted = await db
        .select()
        .from(moduleTable)
        .where(eq(moduleTable.id, toDelete.id))
        .limit(1);

      expect(deleted.length).toBe(0);
    });
  });

  describe("Lesson CRUD", () => {
    let testModuleId: string;

    beforeAll(async () => {
      const module = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Module for Lessons",
      });
      testModuleId = module.id;
    });

    it("should create a lesson", async () => {
      const lesson = await createLesson(TEST_USER_ID, {
        moduleId: testModuleId,
        title: "Lesson 1",
      });

      expect(lesson).toBeDefined();
      expect(lesson.title).toBe("Lesson 1");
      expect(lesson.position).toBe(0);
    });

    it("should update a lesson", async () => {
      const lessons = await db
        .select()
        .from(lessonTable)
        .where(eq(lessonTable.moduleId, testModuleId))
        .limit(1);

      const updated = await updateLesson(TEST_USER_ID, lessons[0].id, {
        title: "Updated Lesson",
      });

      expect(updated.title).toBe("Updated Lesson");
    });

    it("should delete a lesson", async () => {
      const toDelete = await createLesson(TEST_USER_ID, {
        moduleId: testModuleId,
        title: "Lesson to Delete",
      });

      await deleteLesson(TEST_USER_ID, toDelete.id);

      const deleted = await db
        .select()
        .from(lessonTable)
        .where(eq(lessonTable.id, toDelete.id))
        .limit(1);

      expect(deleted.length).toBe(0);
    });
  });

  describe("ContentBlock CRUD", () => {
    let testLessonId: string;

    beforeAll(async () => {
      const module = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Module for Blocks",
      });
      const lesson = await createLesson(TEST_USER_ID, {
        moduleId: module.id,
        title: "Lesson for Blocks",
      });
      testLessonId = lesson.id;
    });

    it("should create a text block", async () => {
      const block = await createContentBlock(TEST_USER_ID, {
        lessonId: testLessonId,
        type: "text",
        content: "Hello World",
      });

      expect(block).toBeDefined();
      expect(block.type).toBe("text");
      expect(block.content).toBe("Hello World");
    });

    it("should create a code block", async () => {
      const block = await createContentBlock(TEST_USER_ID, {
        lessonId: testLessonId,
        type: "code",
        content: "console.log('test')",
        metadata: { language: "javascript" },
      });

      expect(block.type).toBe("code");
      expect(block.metadata).toEqual({ language: "javascript" });
    });

    it("should create a link block", async () => {
      const block = await createContentBlock(TEST_USER_ID, {
        lessonId: testLessonId,
        type: "link",
        content: "https://example.com",
        metadata: { title: "Example" },
      });

      expect(block.type).toBe("link");
    });

    it("should update a content block", async () => {
      const blocks = await db
        .select()
        .from(contentBlock)
        .where(eq(contentBlock.lessonId, testLessonId))
        .limit(1);

      const updated = await updateContentBlock(TEST_USER_ID, blocks[0].id, {
        content: "Updated content",
      });

      expect(updated.content).toBe("Updated content");
    });

    it("should delete a content block", async () => {
      const toDelete = await createContentBlock(TEST_USER_ID, {
        lessonId: testLessonId,
        type: "text",
        content: "To delete",
      });

      await deleteContentBlock(TEST_USER_ID, toDelete.id);

      const deleted = await db
        .select()
        .from(contentBlock)
        .where(eq(contentBlock.id, toDelete.id))
        .limit(1);

      expect(deleted.length).toBe(0);
    });
  });

  describe("Reorder", () => {
    it("should reorder modules", async () => {
      const module1 = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Reorder Module 1",
      });
      const module2 = await createModule(TEST_USER_ID, {
        courseId: TEST_COURSE_ID,
        title: "Reorder Module 2",
      });

      await reorderModules(TEST_USER_ID, TEST_COURSE_ID, [module2.id, module1.id]);

      const modules = await db
        .select()
        .from(moduleTable)
        .where(eq(moduleTable.courseId, TEST_COURSE_ID));

      const reordered = modules.filter(
        (m) => m.id === module1.id || m.id === module2.id
      );

      expect(reordered[0].id).toBe(module2.id);
      expect(reordered[0].position).toBe(0);
      expect(reordered[1].id).toBe(module1.id);
      expect(reordered[1].position).toBe(1);
    });
  });
});
