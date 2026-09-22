import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { course } from "./course";

// Content block type enum
export const blockTypeEnum = pgEnum("block_type", [
  "text",
  "video",
  "file",
  "code",
  "link",
]);

// Module table — belongs to a course
export const module = pgTable("module", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Lesson table — belongs to a module
export const lesson = pgTable("lesson", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => module.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id", { length: 255 }), // stable ID from course JSON (e.g. "lesson-18-5")
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ContentBlock table — belongs to a lesson
export const contentBlock = pgTable("content_block", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  type: blockTypeEnum("type").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Resource table — file attachments for lessons
export const resource = pgTable("resource", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  objectKey: varchar("object_key", { length: 512 }).notNull(),
  mimeType: varchar("mime_type", { length: 127 }).notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
