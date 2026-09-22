import {
  pgTable,
  uuid,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { course } from "./course";

// Course-level instructor roles
// 0 = collaborator, 1 = owner
export const COURSE_INSTRUCTOR_COLLABORATOR = 0;
export const COURSE_INSTRUCTOR_OWNER = 1;

// Course ↔ Instructor junction table with course-level role
// This separates RBAC (global roles) from ownership (course-level access)
export const courseInstructors = pgTable(
  "course_instructors",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: integer("role").notNull().default(COURSE_INSTRUCTOR_COLLABORATOR),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.courseId, t.userId] }),
  })
);
