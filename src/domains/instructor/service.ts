import { db } from "../../infra/db";
import { course } from "../../infra/schema/course";
import { courseInstructors } from "../../infra/schema/ownership";
import { enrollment } from "../../infra/schema/enrollment";
import { user } from "../../infra/schema/user";
import { module, lesson } from "../../infra/schema/content";
import { eq, and, sql, desc, count } from "drizzle-orm";

// ============================================================================
// Instructor Dashboard
// ============================================================================

export interface InstructorDashboard {
  courses: Array<{
    id: string;
    title: string;
    status: string;
    studentCount: number;
    createdAt: Date;
  }>;
  stats: {
    totalCourses: number;
    totalStudents: number;
    publishedCourses: number;
  };
}

/**
 * Get instructor dashboard with courses and student counts.
 */
export async function getInstructorDashboard(
  instructorId: string
): Promise<InstructorDashboard> {
  // Get courses owned by instructor
  const coursesOwned = await db
    .select({
      courseId: courseInstructors.courseId,
    })
    .from(courseInstructors)
    .where(eq(courseInstructors.userId, instructorId));

  const courseIds = coursesOwned.map((c) => c.courseId);

  if (courseIds.length === 0) {
    return {
      courses: [],
      stats: {
        totalCourses: 0,
        totalStudents: 0,
        publishedCourses: 0,
      },
    };
  }

  // Get courses with student counts
  const coursesWithStudents = await db
    .select({
      id: course.id,
      title: course.title,
      status: course.status,
      createdAt: course.createdAt,
      studentCount: sql<number>`count(distinct ${enrollment.userId})::int`,
    })
    .from(course)
    .leftJoin(
      enrollment,
      and(
        eq(enrollment.courseId, course.id),
        eq(enrollment.status, "active")
      )
    )
    .where(sql`${course.id} IN ${courseIds}`)
    .groupBy(course.id, course.title, course.status, course.createdAt)
    .orderBy(desc(course.createdAt));

  // Calculate stats
  const totalStudents = coursesWithStudents.reduce(
    (sum, c) => sum + (c.studentCount || 0),
    0
  );
  const publishedCourses = coursesWithStudents.filter(
    (c) => c.status === "published"
  ).length;

  return {
    courses: coursesWithStudents,
    stats: {
      totalCourses: coursesWithStudents.length,
      totalStudents,
      publishedCourses,
    },
  };
}

// ============================================================================
// Course Management View
// ============================================================================

export interface CourseManagementView {
  course: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  stats: {
    totalModules: number;
    totalLessons: number;
    totalStudents: number;
  };
}

/**
 * Get course management view for instructor.
 */
export async function getCourseManagementView(
  instructorId: string,
  courseId: string
): Promise<CourseManagementView> {
  // Verify instructor owns the course
  const membership = await db
    .select()
    .from(courseInstructors)
    .where(
      and(
        eq(courseInstructors.courseId, courseId),
        eq(courseInstructors.userId, instructorId)
      )
    )
    .limit(1);

  if (!membership[0]) {
    throw new InstructorError(
      "FORBIDDEN",
      "You do not own this course",
      403
    );
  }

  // Get course details
  const [courseData] = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!courseData) {
    throw new InstructorError("COURSE_NOT_FOUND", "Course not found", 404);
  }

  // Get module count
  const [moduleCount] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(module)
    .where(eq(module.courseId, courseId));

  // Get lesson count
  const [lessonCount] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(lesson)
    .innerJoin(module, eq(lesson.moduleId, module.id))
    .where(eq(module.courseId, courseId));

  // Get student count
  const [studentCount] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, courseId),
        eq(enrollment.status, "active")
      )
    );

  return {
    course: courseData,
    stats: {
      totalModules: moduleCount?.total || 0,
      totalLessons: lessonCount?.total || 0,
      totalStudents: studentCount?.total || 0,
    },
  };
}

// ============================================================================
// Enrolled Students
// ============================================================================

export interface EnrolledStudent {
  userId: string;
  name: string;
  email: string;
  enrolledAt: Date;
  status: string;
}

/**
 * Get enrolled students for a course with pagination.
 */
export async function getEnrolledStudents(
  instructorId: string,
  courseId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{
  students: EnrolledStudent[];
  meta: { page: number; limit: number; total: number };
}> {
  // Verify instructor owns the course
  const membership = await db
    .select()
    .from(courseInstructors)
    .where(
      and(
        eq(courseInstructors.courseId, courseId),
        eq(courseInstructors.userId, instructorId)
      )
    )
    .limit(1);

  if (!membership[0]) {
    throw new InstructorError(
      "FORBIDDEN",
      "You do not own this course",
      403
    );
  }

  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const offset = (page - 1) * limit;

  // Get total count
  const [totalResult] = await db
    .select({ total: count() })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, courseId),
        eq(enrollment.status, "active")
      )
    );

  const total = totalResult?.total ?? 0;

  // Get enrolled students with user details
  const students = await db
    .select({
      userId: enrollment.userId,
      name: user.name,
      email: user.email,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    })
    .from(enrollment)
    .innerJoin(user, eq(enrollment.userId, user.id))
    .where(
      and(
        eq(enrollment.courseId, courseId),
        eq(enrollment.status, "active")
      )
    )
    .orderBy(desc(enrollment.enrolledAt))
    .limit(limit)
    .offset(offset);

  return {
    students,
    meta: {
      page,
      limit,
      total,
    },
  };
}

// ============================================================================
// Custom error class
// ============================================================================

export class InstructorError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "InstructorError";
  }
}
