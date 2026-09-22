import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Role,
  CourseInstructorRole,
  Permission,
  coursePermissionMap,
  globalPermissionMap,
} from "./roles";

// Mock the database module
vi.mock("../../infra/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

import { db } from "../../infra/db";
import {
  getCourseMembership,
  isCourseMember,
  isCourseOwner,
  isCourseOwnerOrAdmin,
} from "./ownership";

// Helper to reset mock chain
function mockDbResult(result: unknown[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(result),
  };
  (db as unknown as { select: ReturnType<typeof vi.fn> }).select =
    chain.select;
  (db as unknown as { from: ReturnType<typeof vi.fn> }).from = chain.from;
  (db as unknown as { where: ReturnType<typeof vi.fn> }).where = chain.where;
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// Role & Permission Definitions
// ============================================================

describe("Role definitions", () => {
  it("defines all three global roles", () => {
    expect(Role.STUDENT).toBe("student");
    expect(Role.INSTRUCTOR).toBe("instructor");
    expect(Role.ADMIN).toBe("admin");
  });

  it("defines course instructor roles as integers", () => {
    expect(CourseInstructorRole.COLLABORATOR).toBe(0);
    expect(CourseInstructorRole.OWNER).toBe(1);
  });
});

describe("Global permission map", () => {
  it("student has no platform-level permissions", () => {
    expect(globalPermissionMap[Role.STUDENT]).toEqual([]);
  });

  it("instructor can create courses", () => {
    expect(globalPermissionMap[Role.INSTRUCTOR]).toContain(
      Permission.CREATE_COURSE
    );
  });

  it("admin has all platform permissions", () => {
    const adminPerms = globalPermissionMap[Role.ADMIN];
    expect(adminPerms).toContain(Permission.CREATE_COURSE);
    expect(adminPerms).toContain(Permission.DELETE_COURSE);
    expect(adminPerms).toContain(Permission.MANAGE_USERS);
    expect(adminPerms).toContain(Permission.MANAGE_COURSES);
    expect(adminPerms).toContain(Permission.VIEW_PLATFORM_STATS);
    expect(adminPerms).toContain(Permission.MANAGE_SETTINGS);
  });
});

describe("Course permission map", () => {
  it("owner has all content and management permissions", () => {
    const ownerPerms = coursePermissionMap[CourseInstructorRole.OWNER];
    expect(ownerPerms).toContain(Permission.EDIT_COURSE);
    expect(ownerPerms).toContain(Permission.PUBLISH_COURSE);
    expect(ownerPerms).toContain(Permission.ARCHIVE_COURSE);
    expect(ownerPerms).toContain(Permission.VIEW_ENROLLMENTS);
    expect(ownerPerms).toContain(Permission.DELETE_FILE);
  });

  it("collaborator can edit but NOT publish/archive", () => {
    const collabPerms = coursePermissionMap[CourseInstructorRole.COLLABORATOR];
    expect(collabPerms).toContain(Permission.EDIT_COURSE);
    expect(collabPerms).toContain(Permission.CREATE_MODULE);
    expect(collabPerms).toContain(Permission.UPLOAD_FILE);
    expect(collabPerms).not.toContain(Permission.PUBLISH_COURSE);
    expect(collabPerms).not.toContain(Permission.ARCHIVE_COURSE);
    expect(collabPerms).not.toContain(Permission.VIEW_ENROLLMENTS);
  });
});

// ============================================================
// Authorization Test Cases (from ADR-015)
// ============================================================

describe("ADR-015 Authorization Tests", () => {
  const studentId = "student-001";
  const instructorId = "instructor-001";
  const otherInstructorId = "instructor-002";
  const adminId = "admin-001";
  const courseId = "course-001";
  const otherCourseId = "course-002";

  // Test 1: Student cannot edit any course
  it("Test 1: Student cannot edit any course", async () => {
    mockDbResult([]); // No course_instructors entry for student

    const membership = await getCourseMembership(studentId, courseId);
    expect(membership).toBeUndefined();

    const isMember = await isCourseMember(studentId, courseId);
    expect(isMember).toBe(false);
  });

  // Test 2: Instructor cannot edit unowned courses
  it("Test 2: Instructor cannot edit other instructor's course", async () => {
    // instructor-001 has no entry in course_instructors for course-002
    mockDbResult([]);

    const membership = await getCourseMembership(
      instructorId,
      otherCourseId
    );
    expect(membership).toBeUndefined();

    const isMember = await isCourseMember(instructorId, otherCourseId);
    expect(isMember).toBe(false);
  });

  // Test 3: Instructor can edit own courses
  it("Test 3: Owner can edit own course", async () => {
    mockDbResult([
      {
        courseId,
        userId: instructorId,
        role: CourseInstructorRole.OWNER,
      },
    ]);

    const membership = await getCourseMembership(instructorId, courseId);
    expect(membership).toBeDefined();
    expect(membership!.role).toBe(CourseInstructorRole.OWNER);

    const isOwner = await isCourseOwner(instructorId, courseId);
    expect(isOwner).toBe(true);
  });

  // Test 4: Collaborator can edit but not publish
  it("Test 4: Collaborator can edit but not publish", async () => {
    mockDbResult([
      {
        courseId,
        userId: instructorId,
        role: CourseInstructorRole.COLLABORATOR,
      },
    ]);

    const membership = await getCourseMembership(instructorId, courseId);
    expect(membership).toBeDefined();
    expect(membership!.role).toBe(CourseInstructorRole.COLLABORATOR);

    // Check permission map
    const collabPerms = coursePermissionMap[CourseInstructorRole.COLLABORATOR];
    expect(collabPerms).toContain(Permission.EDIT_COURSE);
    expect(collabPerms).not.toContain(Permission.PUBLISH_COURSE);
    expect(collabPerms).not.toContain(Permission.ARCHIVE_COURSE);
  });

  // Test 5: Owner can do everything (course-level)
  it("Test 5: Owner can do everything", async () => {
    mockDbResult([
      {
        courseId,
        userId: instructorId,
        role: CourseInstructorRole.OWNER,
      },
    ]);

    const membership = await getCourseMembership(instructorId, courseId);
    const ownerPerms = coursePermissionMap[CourseInstructorRole.OWNER];

    expect(membership!.role).toBe(CourseInstructorRole.OWNER);
    expect(ownerPerms).toContain(Permission.EDIT_COURSE);
    expect(ownerPerms).toContain(Permission.PUBLISH_COURSE);
    expect(ownerPerms).toContain(Permission.ARCHIVE_COURSE);
    expect(ownerPerms).toContain(Permission.CREATE_MODULE);
    expect(ownerPerms).toContain(Permission.DELETE_MODULE);
    expect(ownerPerms).toContain(Permission.UPLOAD_FILE);
    expect(ownerPerms).toContain(Permission.VIEW_ENROLLMENTS);
  });

  // Test 6: Admin can do everything
  it("Test 6: Admin can access all courses", async () => {
    // Admin bypasses course_instructors check
    const hasAccess = await isCourseOwnerOrAdmin(adminId, courseId, Role.ADMIN);
    expect(hasAccess).toBe(true);

    const hasAccessOther = await isCourseOwnerOrAdmin(
      adminId,
      otherCourseId,
      Role.ADMIN
    );
    expect(hasAccessOther).toBe(true);

    // Admin global permissions
    expect(globalPermissionMap[Role.ADMIN]).toContain(Permission.MANAGE_USERS);
    expect(globalPermissionMap[Role.ADMIN]).toContain(Permission.MANAGE_COURSES);
  });

  // Test 7: Privilege escalation blocked — instructor cannot self-promote
  it("Test 7: Privilege escalation blocked", async () => {
    // An instructor tries to add themselves as owner of a course they don't own
    // The ownership check should fail — no entry in course_instructors
    mockDbResult([]);

    const membership = await getCourseMembership(
      otherInstructorId,
      courseId
    );
    expect(membership).toBeUndefined();

    // Even if they try to self-add, the middleware blocks it
    const isMember = await isCourseMember(otherInstructorId, courseId);
    expect(isMember).toBe(false);
  });

  // Test 8: Cross-instructor access blocked
  it("Test 8: Cross-instructor access blocked", async () => {
    // instructor-001 owns course-001
    mockDbResult([
      {
        courseId,
        userId: instructorId,
        role: CourseInstructorRole.OWNER,
      },
    ]);

    // instructor-002 has no entry for course-001
    // (simulating a second call for a different user)
    mockDbResult([]);

    const isMember = await isCourseMember(otherInstructorId, courseId);
    expect(isMember).toBe(false);
  });
});

// ============================================================
// Ownership Middleware Behavior
// ============================================================

describe("isCourseOwnerOrAdmin", () => {
  const userId = "user-001";
  const courseId = "course-001";

  it("returns true for admin regardless of course membership", async () => {
    // Even with no course_instructors entry
    mockDbResult([]);

    const result = await isCourseOwnerOrAdmin(userId, courseId, Role.ADMIN);
    expect(result).toBe(true);
  });

  it("returns false for non-admin without course membership", async () => {
    mockDbResult([]);

    const result = await isCourseOwnerOrAdmin(
      userId,
      courseId,
      Role.INSTRUCTOR
    );
    expect(result).toBe(false);
  });

  it("returns true for course owner", async () => {
    mockDbResult([
      {
        courseId,
        userId,
        role: CourseInstructorRole.OWNER,
      },
    ]);

    const result = await isCourseOwnerOrAdmin(
      userId,
      courseId,
      Role.INSTRUCTOR
    );
    expect(result).toBe(true);
  });

  it("returns true for course collaborator", async () => {
    mockDbResult([
      {
        courseId,
        userId,
        role: CourseInstructorRole.COLLABORATOR,
      },
    ]);

    const result = await isCourseOwnerOrAdmin(
      userId,
      courseId,
      Role.INSTRUCTOR
    );
    expect(result).toBe(true);
  });
});
