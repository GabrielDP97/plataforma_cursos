import { db } from "../../infra/db";
import { module as moduleTable, lesson as lessonTable, contentBlock } from "../../infra/schema/content";
import { course } from "../../infra/schema/course";
import { eq, and, sql, max } from "drizzle-orm";
import { isCourseMember } from "../auth/ownership";

// ============================================================================
// Module CRUD
// ============================================================================

export interface CreateModuleInput {
  courseId: string;
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  position?: number;
}

/**
 * Validates that the user has course-level access (owner or collaborator).
 * Throws if not authorized.
 */
async function validateOwnership(userId: string, courseId: string) {
  const hasAccess = await isCourseMember(userId, courseId);
  if (!hasAccess) {
    throw new ContentError("FORBIDDEN", "You do not have access to this course", 403);
  }
}

/**
 * Validates that a course exists and returns it.
 */
async function getCourseOrThrow(courseId: string) {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!result[0]) {
    throw new ContentError("COURSE_NOT_FOUND", "Course not found", 404);
  }
  return result[0];
}

/**
 * Validates that a module exists and belongs to the specified course.
 */
export async function getModuleOrThrow(moduleId: string, courseId?: string) {
  const conditions = [eq(moduleTable.id, moduleId)];
  if (courseId) {
    conditions.push(eq(moduleTable.courseId, courseId));
  }

  const result = await db
    .select()
    .from(moduleTable)
    .where(and(...conditions))
    .limit(1);

  if (!result[0]) {
    throw new ContentError("MODULE_NOT_FOUND", "Module not found", 404);
  }
  return result[0];
}

/**
 * Validates that a lesson exists and belongs to the specified module.
 */
export async function getLessonOrThrow(lessonId: string, moduleId?: string) {
  const conditions = [eq(lessonTable.id, lessonId)];
  if (moduleId) {
    conditions.push(eq(lessonTable.moduleId, moduleId));
  }

  const result = await db
    .select()
    .from(lessonTable)
    .where(and(...conditions))
    .limit(1);

  if (!result[0]) {
    throw new ContentError("LESSON_NOT_FOUND", "Lesson not found", 404);
  }
  return result[0];
}

/**
 * Validates that a content block exists and belongs to the specified lesson.
 */
export async function getContentBlockOrThrow(blockId: string, lessonId?: string) {
  const conditions = [eq(contentBlock.id, blockId)];
  if (lessonId) {
    conditions.push(eq(contentBlock.lessonId, lessonId));
  }

  const result = await db
    .select()
    .from(contentBlock)
    .where(and(...conditions))
    .limit(1);

  if (!result[0]) {
    throw new ContentError("BLOCK_NOT_FOUND", "Content block not found", 404);
  }
  return result[0];
}

/**
 * Get the next position for a new entity (append to end).
 */
async function getNextPosition(
  table: typeof moduleTable | typeof lessonTable | typeof contentBlock,
  foreignKeyField: "courseId" | "moduleId" | "lessonId",
  foreignKeyValue: string
): Promise<number> {
  let conditions;
  if (foreignKeyField === "courseId" && "courseId" in table) {
    conditions = eq(table.courseId, foreignKeyValue);
  } else if (foreignKeyField === "moduleId" && "moduleId" in table) {
    conditions = eq(table.moduleId, foreignKeyValue);
  } else if (foreignKeyField === "lessonId" && "lessonId" in table) {
    conditions = eq(table.lessonId, foreignKeyValue);
  } else {
    conditions = undefined;
  }

  const result = await db
    .select({ maxPos: max(table.position) })
    .from(table)
    .where(conditions);

  const maxPos = result[0]?.maxPos;
  return maxPos !== null && maxPos !== undefined ? maxPos + 1 : 0;
}

export async function createModule(userId: string, input: CreateModuleInput) {
  await validateOwnership(userId, input.courseId);
  await getCourseOrThrow(input.courseId);

  const position = input.position ?? (await getNextPosition(moduleTable, "courseId", input.courseId));

  // If position is provided, shift existing items at or after this position
  if (input.position !== undefined) {
    await db
      .update(moduleTable)
      .set({ position: sql`${moduleTable.position} + 1` })
      .where(
        and(
          eq(moduleTable.courseId, input.courseId),
          sql`${moduleTable.position} >= ${position}`
        )
      );
  }

  const [created] = await db
    .insert(moduleTable)
    .values({
      courseId: input.courseId,
      title: input.title,
      description: input.description,
      position,
    })
    .returning();

  return created;
}

export async function updateModule(
  userId: string,
  moduleId: string,
  input: UpdateModuleInput
) {
  const moduleRecord = await getModuleOrThrow(moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  // Handle position change
  if (input.position !== undefined && input.position !== moduleRecord.position) {
    // Shift items at or after the new position
    await db
      .update(moduleTable)
      .set({ position: sql`${moduleTable.position} + 1` })
      .where(
        and(
          eq(moduleTable.courseId, moduleRecord.courseId),
          sql`${moduleTable.position} >= ${input.position}`
        )
      );
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.position !== undefined) updateData.position = input.position;

  const [updated] = await db
    .update(moduleTable)
    .set(updateData)
    .where(eq(moduleTable.id, moduleId))
    .returning();

  return updated;
}

export async function deleteModule(userId: string, moduleId: string) {
  const moduleRecord = await getModuleOrThrow(moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  await db.delete(moduleTable).where(eq(moduleTable.id, moduleId));
}

export async function reorderModules(userId: string, courseId: string, moduleIds: string[]) {
  await validateOwnership(userId, courseId);

  // Validate all modules belong to this course
  for (const moduleId of moduleIds) {
    await getModuleOrThrow(moduleId, courseId);
  }

  // Assign positions 0, 1, 2, ...
  const updates = moduleIds.map((moduleId, index) =>
    db
      .update(moduleTable)
      .set({ position: index, updatedAt: new Date() })
      .where(eq(moduleTable.id, moduleId))
  );

  await Promise.all(updates);
}

// ============================================================================
// Lesson CRUD
// ============================================================================

export interface CreateLessonInput {
  moduleId: string;
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  position?: number;
}

export async function createLesson(userId: string, input: CreateLessonInput) {
  const moduleRecord = await getModuleOrThrow(input.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  const position = input.position ?? (await getNextPosition(lessonTable, "moduleId", input.moduleId));

  // If position is provided, shift existing items at or after this position
  if (input.position !== undefined) {
    await db
      .update(lessonTable)
      .set({ position: sql`${lessonTable.position} + 1` })
      .where(
        and(
          eq(lessonTable.moduleId, input.moduleId),
          sql`${lessonTable.position} >= ${position}`
        )
      );
  }

  const [created] = await db
    .insert(lessonTable)
    .values({
      moduleId: input.moduleId,
      title: input.title,
      description: input.description,
      position,
    })
    .returning();

  return created;
}

export async function updateLesson(
  userId: string,
  lessonId: string,
  input: UpdateLessonInput
) {
  const lessonRecord = await getLessonOrThrow(lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  // Handle position change
  if (input.position !== undefined && input.position !== lessonRecord.position) {
    await db
      .update(lessonTable)
      .set({ position: sql`${lessonTable.position} + 1` })
      .where(
        and(
          eq(lessonTable.moduleId, lessonRecord.moduleId),
          sql`${lessonTable.position} >= ${input.position}`
        )
      );
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.position !== undefined) updateData.position = input.position;

  const [updated] = await db
    .update(lessonTable)
    .set(updateData)
    .where(eq(lessonTable.id, lessonId))
    .returning();

  return updated;
}

export async function deleteLesson(userId: string, lessonId: string) {
  const lessonRecord = await getLessonOrThrow(lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  await db.delete(lessonTable).where(eq(lessonTable.id, lessonId));
}

export async function reorderLessons(userId: string, moduleId: string, lessonIds: string[]) {
  const moduleRecord = await getModuleOrThrow(moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  // Validate all lessons belong to this module
  for (const lessonId of lessonIds) {
    await getLessonOrThrow(lessonId, moduleId);
  }

  // Assign positions 0, 1, 2, ...
  const updates = lessonIds.map((lessonId, index) =>
    db
      .update(lessonTable)
      .set({ position: index, updatedAt: new Date() })
      .where(eq(lessonTable.id, lessonId))
  );

  await Promise.all(updates);
}

// ============================================================================
// ContentBlock CRUD
// ============================================================================

export type BlockType = "text" | "video" | "file" | "code" | "link";

export interface CreateContentBlockInput {
  lessonId: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
  position?: number;
}

export interface UpdateContentBlockInput {
  content?: string;
  metadata?: Record<string, unknown>;
  position?: number;
}

export async function createContentBlock(userId: string, input: CreateContentBlockInput) {
  const lessonRecord = await getLessonOrThrow(input.lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  const position = input.position ?? (await getNextPosition(contentBlock, "lessonId", input.lessonId));

  // If position is provided, shift existing items at or after this position
  if (input.position !== undefined) {
    await db
      .update(contentBlock)
      .set({ position: sql`${contentBlock.position} + 1` })
      .where(
        and(
          eq(contentBlock.lessonId, input.lessonId),
          sql`${contentBlock.position} >= ${position}`
        )
      );
  }

  const [created] = await db
    .insert(contentBlock)
    .values({
      lessonId: input.lessonId,
      type: input.type,
      content: input.content,
      metadata: input.metadata ?? null,
      position,
    })
    .returning();

  return created;
}

export async function updateContentBlock(
  userId: string,
  blockId: string,
  input: UpdateContentBlockInput
) {
  const blockRecord = await getContentBlockOrThrow(blockId);
  const lessonRecord = await getLessonOrThrow(blockRecord.lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  // Handle position change
  if (input.position !== undefined && input.position !== blockRecord.position) {
    await db
      .update(contentBlock)
      .set({ position: sql`${contentBlock.position} + 1` })
      .where(
        and(
          eq(contentBlock.lessonId, blockRecord.lessonId),
          sql`${contentBlock.position} >= ${input.position}`
        )
      );
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.content !== undefined) updateData.content = input.content;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;
  if (input.position !== undefined) updateData.position = input.position;

  const [updated] = await db
    .update(contentBlock)
    .set(updateData)
    .where(eq(contentBlock.id, blockId))
    .returning();

  return updated;
}

export async function deleteContentBlock(userId: string, blockId: string) {
  const blockRecord = await getContentBlockOrThrow(blockId);
  const lessonRecord = await getLessonOrThrow(blockRecord.lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  await db.delete(contentBlock).where(eq(contentBlock.id, blockId));
}

export async function reorderContentBlocks(userId: string, lessonId: string, blockIds: string[]) {
  const lessonRecord = await getLessonOrThrow(lessonId);
  const moduleRecord = await getModuleOrThrow(lessonRecord.moduleId);
  await validateOwnership(userId, moduleRecord.courseId);

  // Validate all blocks belong to this lesson
  for (const blockId of blockIds) {
    await getContentBlockOrThrow(blockId, lessonId);
  }

  // Assign positions 0, 1, 2, ...
  const updates = blockIds.map((blockId, index) =>
    db
      .update(contentBlock)
      .set({ position: index, updatedAt: new Date() })
      .where(eq(contentBlock.id, blockId))
  );

  await Promise.all(updates);
}

// ============================================================================
// Custom error class
// ============================================================================

export class ContentError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "ContentError";
  }
}
