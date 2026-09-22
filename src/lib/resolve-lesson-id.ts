/**
 * Resolve a lesson identifier to its database UUID.
 * 
 * Accepts either:
 * - A UUID (passed through)
 * - A source ID like "lesson-18-5" (resolved via source_id column)
 * 
 * Returns the UUID or null if not found.
 */
export async function resolveLessonId(lessonRef: string): Promise<string | null> {
  // If it's already a valid UUID, return it directly
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(lessonRef)) {
    return lessonRef;
  }

  // Otherwise, resolve by source_id
  const { db } = await import("../infra/db");
  const { lesson } = await import("../infra/schema");
  const { eq } = await import("drizzle-orm");

  const result = await db
    .select({ id: lesson.id })
    .from(lesson)
    .where(eq(lesson.sourceId, lessonRef))
    .limit(1);

  return result[0]?.id ?? null;
}
