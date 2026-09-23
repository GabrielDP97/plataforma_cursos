import { readFileSync } from "fs";
import { join, resolve } from "path";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);
function qstr(s: any) { return "'" + String(s).replace(/'/g, "''") + "'"; }

async function main() {
  const dir = resolve("courses/databases");
  const courseData = JSON.parse(readFileSync(join(dir, "course.json"), "utf-8"));

  // Check if course exists
  const existing = await sql(`SELECT id FROM course WHERE slug = ${qstr(courseData.slug)}`);
  if (existing.length > 0) {
    console.log("Course already exists:", existing[0].id);
    return;
  }

  const courseId = randomUUID();
  const q: any[] = [];

  // Insert course
  q.push(sql(`INSERT INTO course (id, slug, title, description, status, created_at, updated_at) VALUES (${qstr(courseId)}, ${qstr(courseData.slug)}, ${qstr(courseData.title)}, ${qstr(courseData.description)}, 'draft', NOW(), NOW())`));

  console.log(`Creating course: ${courseData.title} (${courseData.slug})`);
  console.log(`Transaction (${q.length} queries)...`);
  try {
    const r = await sql.transaction(q);
    console.log(`Committed - ${r.length} statements`);
  } catch (e: any) {
    console.error("ROLLED BACK:", e.message);
    process.exit(1);
  }
  console.log("DONE - Course created");
}
main().catch(e => { console.error(e); process.exit(1); });
