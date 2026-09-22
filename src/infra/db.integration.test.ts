import { describe, it, expect, beforeAll } from "vitest";
import { neon } from "@neondatabase/serverless";

const TEST_DATABASE_URL = process.env.NEON_DATABASE_URL;

describe("Database Foundation (M1)", () => {
  if (!TEST_DATABASE_URL) {
    it.skip("NEON_DATABASE_URL not set — skipping connection test", () => {});
    return;
  }

  let sql: ReturnType<typeof neon>;

  beforeAll(() => {
    sql = neon(TEST_DATABASE_URL);
  });

  it("should connect to Neon and execute SELECT 1", async () => {
    const result = (await sql`SELECT 1 AS result`) as Record<string, any>[];
    expect(result[0].result).toBe(1);
  });

  it("should verify all expected tables exist", async () => {
    const expectedTables = [
      "user",
      "session",
      "account",
      "verification",
      "course",
      "category",
      "course_category",
      "module",
      "lesson",
      "content_block",
      "resource",
      "enrollment",
      "lesson_progress",
      "video_progress",
      "notification",
      "video_asset",
      "user_consent",
    ];

    const result = (await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `) as Record<string, any>[];

    const tableNames = result.map(
      (row: any) => row.table_name
    );

    for (const expected of expectedTables) {
      expect(tableNames).toContain(expected);
    }
  });

  it("should verify all enum types exist", async () => {
    const expectedEnums = [
      "role",
      "course_status",
      "enrollment_status",
      "enrollment_source",
      "block_type",
      "lesson_progress_status",
      "notification_type",
      "video_provider",
      "video_status",
    ];

    const result = (await sql`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typtype = 'e'
      ORDER BY t.typname
    `) as Record<string, any>[];

    const enumNames = result.map(
      (row: any) => row.typname
    );

    for (const expected of expectedEnums) {
      expect(enumNames).toContain(expected);
    }
  });
});
