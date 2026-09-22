import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user";
import { lesson } from "./content";

// Lesson progress status enum
export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);

// LessonProgress table — source of truth for course completion
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    status: lessonProgressStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    lastPositionSeconds: integer("last_position_seconds"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("lesson_progress_user_lesson_idx").on(t.userId, t.lessonId)]
);

// VideoProgress table — tracks video playback position for resume
export const videoProgress = pgTable(
  "video_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    lastPositionSeconds: integer("last_position_seconds").notNull().default(0),
    durationSeconds: integer("duration_seconds"),
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("video_progress_user_lesson_idx").on(t.userId, t.lessonId)]
);
