import {
  pgTable,
  uuid,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user";
import { course } from "./course";

// Enrollment status enum
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);

// Enrollment source enum — extensible for future payment/invitation flows
export const enrollmentSourceEnum = pgEnum("enrollment_source", [
  "free",
  "purchase",
  "admin",
  "invitation",
  "subscription",
]);

// Enrollment table — independent entity with lifecycle
export const enrollment = pgTable(
  "enrollment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull().default("active"),
    source: enrollmentSourceEnum("source").notNull(),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("enrollment_user_course_idx").on(t.userId, t.courseId)]
);
