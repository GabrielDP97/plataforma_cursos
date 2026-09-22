import { Hono } from "hono";
import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { enrollment } from "../../infra/schema/enrollment";
import { module as moduleTable, lesson as lessonTable, contentBlock } from "../../infra/schema/content";
import { lessonProgress } from "../../infra/schema/progress";
import { courseInstructors } from "../../infra/schema/ownership";
import { user } from "../../infra/schema/user";
import { eq, and, count, sql, asc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { isEnrolled } from "../../domains/enrollment/service";
import { ApiResponse } from "../../shared/types";

type Env = {
  Variables: {
    user: { id: string; role?: string };
  };
};

const studentRoutes = new Hono<Env>();

// ============================================================================
// Student Dashboard — GET /api/student/dashboard
// Returns enrolled courses + progress
// ============================================================================
studentRoutes.get("/student/dashboard", requireAuth, async (c) => {
  try {
    const currentUser = c.get("user") as { id: string };

    // Get all active enrollments for the user
    const enrollments = await db
      .select({
        id: enrollment.id,
        courseId: enrollment.courseId,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        courseTitle: course.title,
        courseDescription: course.description,
        courseThumbnailUrl: course.thumbnailUrl,
        courseSlug: course.slug,
      })
      .from(enrollment)
      .innerJoin(course, eq(enrollment.courseId, course.id))
      .where(eq(enrollment.userId, currentUser.id))
      .orderBy(sql`${enrollment.enrolledAt} DESC`);

    // Batch-fetch instructors for all enrolled courses (single query, no N+1)
    const courseIds = enrollments.map((e) => e.courseId);
    const instructorsByCourseId = new Map<
      string,
      Array<{ name: string; email: string; image: string | null }>
    >();

    if (courseIds.length > 0) {
      const instructorRows = await db
        .select({
          courseId: courseInstructors.courseId,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(courseInstructors)
        .innerJoin(user, eq(courseInstructors.userId, user.id))
        .where(inArray(courseInstructors.courseId, courseIds));

      for (const row of instructorRows) {
        const list = instructorsByCourseId.get(row.courseId) ?? [];
        list.push({ name: row.name, email: row.email, image: row.image });
        instructorsByCourseId.set(row.courseId, list);
      }
    }

    // Get progress for each enrolled course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollmentRecord) => {
        // Get total lessons in course
        const totalLessonsResult = await db
          .select({ total: count() })
          .from(lessonTable)
          .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
          .where(
            and(
              eq(moduleTable.courseId, enrollmentRecord.courseId),
              eq(lessonTable.visible, true),
              eq(moduleTable.visible, true)
            )
          );

        const totalLessons = totalLessonsResult[0]?.total ?? 0;

        // Get completed lessons
        const lessonIds = await db
          .select({ lessonId: lessonTable.id })
          .from(lessonTable)
          .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
          .where(
            and(
              eq(moduleTable.courseId, enrollmentRecord.courseId),
              eq(lessonTable.visible, true),
              eq(moduleTable.visible, true)
            )
          );

        const completedResult = await db
          .select({ total: count() })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.userId, currentUser.id),
              sql`${lessonProgress.lessonId} IN ${lessonIds.map((l) => l.lessonId)}`,
              eq(lessonProgress.status, "completed")
            )
          );

        const completedLessons = completedResult[0]?.total ?? 0;
        const percentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          id: enrollmentRecord.id,
          courseId: enrollmentRecord.courseId,
          status: enrollmentRecord.status,
          enrolledAt: enrollmentRecord.enrolledAt,
          course: {
            title: enrollmentRecord.courseTitle,
            description: enrollmentRecord.courseDescription,
            thumbnailUrl: enrollmentRecord.courseThumbnailUrl,
            slug: enrollmentRecord.courseSlug,
          },
          instructors: instructorsByCourseId.get(enrollmentRecord.courseId) ?? [],
          progress: {
            totalLessons,
            completedLessons,
            percentage,
          },
        };
      })
    );

    const response: ApiResponse<typeof coursesWithProgress> = {
      success: true,
      data: coursesWithProgress,
    };

    return c.json(response);
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load dashboard",
        },
      },
      500
    );
  }
});

// ============================================================================
// Course Overview — GET /api/student/courses/:courseId/overview
// Returns course overview with modules/lessons
// ============================================================================
studentRoutes.get(
  "/student/courses/:courseId/overview",
  requireAuth,
  async (c) => {
    try {
      const currentUser = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;

      // Check enrollment
      const enrolled = await isEnrolled(currentUser.id, courseId);
      if (!enrolled) {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_ENROLLED",
              message: "You are not enrolled in this course",
            },
          },
          403
        );
      }

      // Get course details
      const courseResult = await db
        .select()
        .from(course)
        .where(eq(course.id, courseId))
        .limit(1);

      if (!courseResult[0]) {
        return c.json(
          {
            success: false,
            error: { code: "COURSE_NOT_FOUND", message: "Course not found" },
          },
          404
        );
      }

      // Get modules with lessons
      const modules = await db
        .select()
        .from(moduleTable)
        .where(eq(moduleTable.courseId, courseId))
        .orderBy(asc(moduleTable.position));

      const modulesWithLessons = await Promise.all(
        modules.map(async (moduleRecord) => {
          const lessons = await db
            .select()
            .from(lessonTable)
            .where(eq(lessonTable.moduleId, moduleRecord.id))
            .orderBy(asc(lessonTable.position));

          // Get progress for each lesson
          const lessonsWithProgress = await Promise.all(
            lessons.map(async (lessonRecord) => {
              const progress = await db
                .select()
                .from(lessonProgress)
                .where(
                  and(
                    eq(lessonProgress.userId, currentUser.id),
                    eq(lessonProgress.lessonId, lessonRecord.id)
                  )
                )
                .limit(1);

              return {
                ...lessonRecord,
                progress: progress[0] || null,
              };
            })
          );

          return {
            ...moduleRecord,
            lessons: lessonsWithProgress,
          };
        })
      );

      const response: ApiResponse<{
        course: typeof courseResult[0];
        modules: typeof modulesWithLessons;
      }> = {
        success: true,
        data: {
          course: courseResult[0],
          modules: modulesWithLessons,
        },
      };

      return c.json(response);
    } catch (error: any) {
      console.error("Course overview error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to load course overview",
          },
        },
        500
      );
    }
  }
);

// ============================================================================
// Lesson Content — GET /api/student/courses/:courseId/lessons/:lessonId
// Returns lesson content (requires enrollment)
// ============================================================================
studentRoutes.get(
  "/student/courses/:courseId/lessons/:lessonId",
  requireAuth,
  async (c) => {
    try {
      const currentUser = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;
      const lessonId = c.req.param("lessonId")!;

      // Check enrollment
      const enrolled = await isEnrolled(currentUser.id, courseId);
      if (!enrolled) {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_ENROLLED",
              message: "You are not enrolled in this course",
            },
          },
          403
        );
      }

      // Verify lesson belongs to course (via module)
      const lessonResult = await db
        .select({
          lesson: lessonTable,
          moduleCourseId: moduleTable.courseId,
        })
        .from(lessonTable)
        .innerJoin(moduleTable, eq(lessonTable.moduleId, moduleTable.id))
        .where(eq(lessonTable.id, lessonId))
        .limit(1);

      if (!lessonResult[0]) {
        return c.json(
          {
            success: false,
            error: { code: "LESSON_NOT_FOUND", message: "Lesson not found" },
          },
          404
        );
      }

      if (lessonResult[0].moduleCourseId !== courseId) {
        return c.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Lesson does not belong to this course",
            },
          },
          400
        );
      }

      // Get lesson content blocks
      const blocks = await db
        .select()
        .from(contentBlock)
        .where(eq(contentBlock.lessonId, lessonId))
        .orderBy(asc(contentBlock.position));

      // Get lesson progress
      const progress = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, currentUser.id),
            eq(lessonProgress.lessonId, lessonId)
          )
        )
        .limit(1);

      const response = {
        success: true,
        data: {
          lesson: lessonResult[0].lesson,
          blocks,
          progress: progress[0] || null,
        },
      };

      return c.json(response);
    } catch (error: any) {
      console.error("Lesson content error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to load lesson content",
          },
        },
        500
      );
    }
  }
);

// ============================================================================
// Student Enroll — POST /api/student/courses/:courseId/enroll
// Wrapper around enrollment endpoint
// ============================================================================
studentRoutes.post(
  "/student/courses/:courseId/enroll",
  requireAuth,
  async (c) => {
    try {
      const currentUser = c.get("user") as { id: string };
      const courseId = c.req.param("courseId")!;

      // Import and use enrollment service
      const { enrollStudent } = await import(
        "../../domains/enrollment/service"
      );

      const enrollmentResult = await enrollStudent({
        userId: currentUser.id,
        courseId,
        source: "free",
      });

      const response: ApiResponse<typeof enrollmentResult> = {
        success: true,
        data: enrollmentResult,
      };

      return c.json(response, 201);
    } catch (error: any) {
      if (error.code && error.status) {
        return c.json(
          {
            success: false,
            error: { code: error.code, message: error.message },
          },
          error.status as any
        );
      }

      console.error("Student enroll error:", error);
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to enroll in course",
          },
        },
        500
      );
    }
  }
);

export default studentRoutes;
