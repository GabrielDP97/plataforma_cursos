# ADR-015: Ownership and Authorization Model

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

RBAC (role-based access control) is NOT ownership. Being `instructor` does NOT grant edit access to all courses. We need a clear separation between global roles and course-level ownership.

## Decision

**Global roles** (student, instructor, admin) via Better Auth + **course-level ownership** via `course_instructors` table.

## Global Roles

| Role | Description | Can Create Courses |
|------|-------------|-------------------|
| `student` | Default role. Can enroll, view content, track progress. | NO |
| `instructor` | Can create new courses. Does NOT auto-own all courses. | YES |
| `admin` | Platform administration. Can manage users, courses, settings. | YES |

**Key rule**: `instructor` role grants the ABILITY to create courses, not OWNERSHIP of existing courses. New instructors start with zero courses.

## Course-Level Ownership

```sql
course_instructors (
  id UUID PRIMARY KEY,
  course_id UUID FK → courses ON DELETE CASCADE,
  user_id UUID FK → users ON DELETE CASCADE,
  role ENUM('owner', 'collaborator') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, user_id)
)
```

### Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `owner` | Full control over the course | Edit, publish, archive, manage modules/lessons, upload files, view enrollments, manage collaborators |
| `collaborator` | Content editor | Edit content, upload files, modify modules/lessons |

### Permission Matrix

| Action | student | instructor (global) | collaborator (course) | owner (course) | admin (global) |
|--------|---------|--------------------|-----------------------|----------------|----------------|
| View published courses | ✅ | ✅ | ✅ | ✅ | ✅ |
| View draft courses (own) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create course | ❌ | ✅ | ❌ | ❌ | ✅ |
| Edit course content | ❌ | ❌ | ✅ | ✅ | ✅ |
| Publish course | ❌ | ❌ | ❌ | ✅ | ✅ |
| Archive course | ❌ | ❌ | ❌ | ✅ | ✅ |
| Upload files/assets | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete files/assets | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modify modules/lessons | ❌ | ❌ | ✅ | ✅ | ✅ |
| View enrollments | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage collaborators | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage users (global) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Admin settings | ❌ | ❌ | ❌ | ❌ | ✅ |

## Authorization Flow

Every API endpoint that modifies course content:

1. **Authenticate**: Verify session (Better Auth → Neon).
2. **Authorize**: Check `course_instructors` table for `(course_id, user_id)`.
3. **Permission check**: Verify the user's course-level role grants the required permission.

```typescript
async function authorizeCourseAction(
  userId: string,
  courseId: string,
  requiredPermission: Permission
): Promise<boolean> {
  // Check global admin first
  if (await isAdmin(userId)) return true;

  // Check course-level ownership
  const membership = await db.query.courseInstructors.findFirst({
    where: and(
      eq(courseInstructors.courseId, courseId),
      eq(courseInstructors.userId, userId)
    )
  });

  if (!membership) return false;
  return permissionMatrix[membership.role].includes(requiredPermission);
}
```

## Privilege Escalation Prevention

1. **Instructor ≠ owner**: Creating a course makes you its `owner`. But being `instructor` does NOT make you owner of ANY course.
2. **Cross-instructor access**: Blocked by `course_instructors` join check. Instructor A cannot edit Instructor B's courses unless explicitly added as collaborator.
3. **Role upgrade**: Only `admin` can promote a `student` to `instructor`. Only `admin` can promote an `instructor` to `admin`.
4. **Collaborator limitation**: Collaborators cannot publish, archive, or manage other collaborators. Only owners and admins.

## Course Creation Flow

1. User with `instructor` or `admin` role calls `POST /api/courses`.
2. Application creates `Course` record with `status: 'draft'`.
3. Application creates `course_instructors` entry: `(course_id, user_id, role: 'owner')`.
4. Creator is automatically the `owner` of the new course.

## Test Cases

### Authorization Tests

1. **Student cannot edit any course**: `authorizeCourseAction(studentId, courseId, 'edit')` → false.
2. **Instructor cannot edit unowned courses**: `authorizeCourseAction(instructorId, otherCourseId, 'edit')` → false.
3. **Instructor can edit own courses**: `authorizeCourseAction(instructorId, ownCourseId, 'edit')` → true.
4. **Collaborator can edit but not publish**: `authorizeCourseAction(collaboratorId, courseId, 'edit')` → true. `authorizeCourseAction(collaboratorId, courseId, 'publish')` → false.
5. **Owner can do everything**: `authorizeCourseAction(ownerId, courseId, anyPermission)` → true.
6. **Admin can do everything**: `authorizeCourseAction(adminId, anyCourseId, anyPermission)` → true.
7. **Privilege escalation blocked**: `instructor` cannot add themselves as `owner` to another course.
8. **Cross-instructor access blocked**: Instructor A cannot access Instructor B's courses without explicit collaborator entry.

## Consequences

- **Positive**: Clear separation of concerns. RBAC handles global capabilities. Ownership handles course-level access. Privilege escalation prevented by design.
- **Negative**: `course_instructors` table adds a join to every course authorization check. Mitigated by indexing on `(course_id, user_id)`.
- **Neutral**: Can add more roles later (e.g., `viewer` for read-only access) without changing the model.
