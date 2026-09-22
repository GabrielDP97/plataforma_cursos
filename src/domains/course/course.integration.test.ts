import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  listCourses,
  publishCourse,
  archiveCourse,
  unpublishCourse,
  searchCourses,
  createCategory,
  deleteCategory,
  listCategories,
  addCategoryToCourse,
  removeCategoryFromCourse,
  CourseError,
} from "./service";
import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { category, courseCategory } from "../../infra/schema/course";
import { courseInstructors } from "../../infra/schema/ownership";
import { eq } from "drizzle-orm";

// Test data
const TEST_INSTRUCTOR_ID = "test-instructor-id-001";
const TEST_ADMIN_ID = "test-admin-id-001";
const TEST_COURSE_ID = "test-course-id-002";
const TEST_CATEGORY_ID = "test-category-id-001";

describe("Course Service (M5)", () => {
  beforeAll(async () => {
    // Create test category
    await db.insert(category).values({
      id: TEST_CATEGORY_ID,
      name: "Test Category",
      slug: "test-category",
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(courseCategory).where(eq(courseCategory.courseId, TEST_COURSE_ID));
    await db.delete(courseInstructors).where(eq(courseInstructors.courseId, TEST_COURSE_ID));
    await db.delete(course).where(eq(course.id, TEST_COURSE_ID));
    await db.delete(category).where(eq(category.id, TEST_CATEGORY_ID));
  });

  describe("Course CRUD", () => {
    it("should create a course", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Test Course",
        description: "A test course",
      });

      expect(courseData).toBeDefined();
      expect(courseData.id).toBeDefined();
      expect(courseData.title).toBe("Test Course");
      expect(courseData.status).toBe("draft");
    });

    it("should get a course by ID", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Get Course Test",
        slug: "get-course-test",
      });

      const found = await getCourse(courseData.id);
      expect(found.title).toBe("Get Course Test");

      // Cleanup
      await deleteCourse(TEST_ADMIN_ID, courseData.id);
    });

    it("should update a course", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Update Course Test",
      });

      const updated = await updateCourse(TEST_INSTRUCTOR_ID, courseData.id, {
        title: "Updated Course Title",
      });

      expect(updated.title).toBe("Updated Course Title");

      // Cleanup
      await deleteCourse(TEST_ADMIN_ID, courseData.id);
    });

    it("should list courses with pagination", async () => {
      // Create a few courses
      const course1 = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "List Course 1",
      });
      const course2 = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "List Course 2",
      });

      // Publish them so they show up in listing
      await publishCourse(TEST_INSTRUCTOR_ID, course1.id);
      await publishCourse(TEST_INSTRUCTOR_ID, course2.id);

      const result = await listCourses({ page: 1, limit: 10 });

      expect(result.courses.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);

      // Cleanup
      await deleteCourse(TEST_ADMIN_ID, course1.id);
      await deleteCourse(TEST_ADMIN_ID, course2.id);
    });
  });

  describe("Status Lifecycle", () => {
    let statusCourseId: string;

    beforeAll(async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Status Lifecycle Course",
      });
      statusCourseId = courseData.id;
    });

    afterAll(async () => {
      await deleteCourse(TEST_ADMIN_ID, statusCourseId);
    });

    it("should publish a draft course", async () => {
      const published = await publishCourse(TEST_INSTRUCTOR_ID, statusCourseId);
      expect(published.status).toBe("published");
      expect(published.publishedAt).toBeDefined();
    });

    it("should archive a published course", async () => {
      const archived = await archiveCourse(TEST_INSTRUCTOR_ID, statusCourseId);
      expect(archived.status).toBe("archived");
    });

    it("should unpublish (re-draft) an archived course", async () => {
      const draft = await unpublishCourse(TEST_INSTRUCTOR_ID, statusCourseId);
      expect(draft.status).toBe("draft");
      expect(draft.publishedAt).toBeNull();
    });

    it("should reject publishing a published course", async () => {
      await publishCourse(TEST_INSTRUCTOR_ID, statusCourseId); // draft -> published

      await expect(
        publishCourse(TEST_INSTRUCTOR_ID, statusCourseId)
      ).rejects.toThrow(CourseError);
    });

    it("should reject archiving a draft course", async () => {
      // Reset to draft
      await unpublishCourse(TEST_INSTRUCTOR_ID, statusCourseId);

      await expect(
        archiveCourse(TEST_INSTRUCTOR_ID, statusCourseId)
      ).rejects.toThrow(CourseError);
    });
  });

  describe("Categories", () => {
    it("should create a category", async () => {
      const cat = await createCategory({
        name: "Programming",
        slug: "programming",
      });

      expect(cat).toBeDefined();
      expect(cat.name).toBe("Programming");

      // Cleanup
      await deleteCategory(cat.id);
    });

    it("should list all categories", async () => {
      const categories = await listCategories();
      expect(categories.length).toBeGreaterThanOrEqual(1);
    });

    it("should add category to course", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Course with Category",
      });

      await addCategoryToCourse(courseData.id, TEST_CATEGORY_ID);

      // Verify
      const assigned = await db
        .select()
        .from(courseCategory)
        .where(eq(courseCategory.courseId, courseData.id))
        .limit(1);

      expect(assigned.length).toBe(1);

      // Cleanup
      await removeCategoryFromCourse(courseData.id, TEST_CATEGORY_ID);
      await deleteCourse(TEST_ADMIN_ID, courseData.id);
    });
  });

  describe("Search", () => {
    it("should search courses by keyword", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Searchable TypeScript Course",
        description: "Learn TypeScript from scratch",
      });

      await publishCourse(TEST_INSTRUCTOR_ID, courseData.id);

      const result = await searchCourses("TypeScript", {});

      expect(result.courses.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.total).toBeGreaterThanOrEqual(1);

      // Cleanup
      await deleteCourse(TEST_ADMIN_ID, courseData.id);
    });

    it("should filter by category", async () => {
      const courseData = await createCourse({
        instructorId: TEST_INSTRUCTOR_ID,
        title: "Category Filter Course",
      });

      await publishCourse(TEST_INSTRUCTOR_ID, courseData.id);
      await addCategoryToCourse(courseData.id, TEST_CATEGORY_ID);

      const result = await searchCourses("", { categoryId: TEST_CATEGORY_ID });

      expect(result.courses.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await removeCategoryFromCourse(courseData.id, TEST_CATEGORY_ID);
      await deleteCourse(TEST_ADMIN_ID, courseData.id);
    });
  });
});
