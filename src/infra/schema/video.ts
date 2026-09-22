import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { lesson } from "./content";
import { user } from "./user";

// Video provider enum
export const videoProviderEnum = pgEnum("video_provider", ["r2", "mux"]);

// Video asset status enum
export const videoStatusEnum = pgEnum("video_status", [
  "uploading",
  "ready",
  "failed",
]);

// VideoAsset table — metadata for uploaded videos
export const videoAsset = pgTable("video_asset", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lesson.id, {
    onDelete: "set null",
  }),
  provider: videoProviderEnum("provider").notNull(),
  providerAssetId: varchar("provider_asset_id", { length: 512 }).notNull(),
  objectKey: varchar("object_key", { length: 512 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 127 }).notNull(),
  size: integer("size").notNull(),
  duration: integer("duration"),
  status: videoStatusEnum("status").notNull().default("uploading"),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
