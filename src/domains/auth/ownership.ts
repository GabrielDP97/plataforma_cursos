import { db } from "../../infra/db";
import { courseInstructors } from "../../infra/schema/ownership";
import { and, eq } from "drizzle-orm";
import { Role } from "./roles";

/**
 * Check if a user is associated with a course (owner or collaborator).
 *
 * @returns The course instructor entry, or undefined if no association
 */
export async function getCourseMembership(
  userId: string,
  courseId: string
) {
  const result = await db
    .select()
    .from(courseInstructors)
    .where(
      and(
        eq(courseInstructors.userId, userId),
        eq(courseInstructors.courseId, courseId)
      )
    );

  return result[0];
}

/**
 * Check if a user has course-level access (owner or collaborator).
 */
export async function isCourseMember(
  userId: string,
  courseId: string
): Promise<boolean> {
  const membership = await getCourseMembership(userId, courseId);
  return membership !== undefined;
}

/**
 * Check if a user is the owner of a specific course.
 */
export async function isCourseOwner(
  userId: string,
  courseId: string
): Promise<boolean> {
  const membership = await getCourseMembership(userId, courseId);
  return membership?.role === 1; // COURSE_INSTRUCTOR_OWNER
}

/**
 * Check if a user can perform an action on a course.
 * Admin users bypass course-level ownership checks.
 *
 * @returns true if the user is an admin OR has a course-level membership
 */
export async function isCourseOwnerOrAdmin(
  userId: string,
  courseId: string,
  userRole: string
): Promise<boolean> {
  if (userRole === Role.ADMIN) return true;
  return isCourseMember(userId, courseId);
}
