-- Add source_id column to lesson table for stable lesson identification
-- This allows the frontend to use source IDs (e.g. "lesson-18-5") while
-- the backend resolves them to UUIDs for progress tracking.

ALTER TABLE "lesson" ADD COLUMN "source_id" varchar(255);

-- Create unique index for source_id (nullable — existing rows may not have it yet)
CREATE UNIQUE INDEX "lesson_source_id_unique" ON "lesson" ("source_id") WHERE "source_id" IS NOT NULL;
