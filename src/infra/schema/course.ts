import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

// Course status lifecycle: draft → published → archived
export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "published",
  "archived",
]);

// Course table
export const course = pgTable("course", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  status: courseStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Category table
export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Course ↔ Category many-to-many junction table
export const courseCategory = pgTable(
  "course_category",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (t) => [unique("course_category_pk").on(t.courseId, t.categoryId)]
);
