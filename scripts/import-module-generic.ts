import { readFileSync } from "fs";
import { join, resolve } from "path";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);
function blockContent(b: any) { return b.content || b.description || b.title || ""; }
function qstr(s: any) { return "'" + String(s).replace(/'/g, "''") + "'"; }

async function main() {
  const moduleNum = parseInt(process.argv[2] || "0");
  if (!moduleNum) { console.error("Usage: npx tsx scripts/import-module-generic.ts <module-number>"); return; }

  const dir = resolve("courses/databases");
  const courses = await sql("SELECT id FROM course WHERE slug = 'databases-0484'");
  if (courses.length === 0) { console.error("Course not found"); return; }
  const courseId = (courses[0] as any).id;

  // Check if module already exists (by title since module table has no source_id)
  const sourceId = `mod-${String(moduleNum).padStart(2, "0")}`;
  const modData = JSON.parse(readFileSync(join(dir, "modules", `${sourceId}.json`), "utf-8"));
  const existing = await sql(`SELECT id FROM module WHERE title = ${qstr(modData.title)} AND course_id = '${courseId}'`);
  if (existing.length > 0) { console.log(`Module ${moduleNum} already exists:`, existing[0].id); return; }

  const q: any[] = []; let lc = 0, bc = 0;
  const moduleId = randomUUID();
  q.push(sql(`INSERT INTO module (id, course_id, title, description, position, visible, created_at, updated_at) VALUES (${qstr(moduleId)},${qstr(courseId)},${qstr(modData.title)},${qstr(modData.description || "")},${modData.order || moduleNum}, true, NOW(), NOW())`));

  const lessonMap = new Map();
  for (const l of modData.lessons) {
    const lid = randomUUID();
    lessonMap.set(l.id, lid);
    q.push(sql(`INSERT INTO lesson (id, module_id, source_id, title, description, position, visible, created_at, updated_at) VALUES (${qstr(lid)},${qstr(moduleId)},${qstr(l.id)},${qstr(l.title)},${qstr(l.description || "")},${l.order || l.position || ++lc}, true, NOW(), NOW())`));
    lc++;
  }
  for (const l of modData.lessons) {
    const lid = lessonMap.get(l.id);
    let bi = 0;
    for (const b of (l.contentBlocks || [])) {
      bi++;
      q.push(sql(`INSERT INTO content_block (id, lesson_id, type, content, metadata, position, created_at, updated_at) VALUES (${qstr(randomUUID())},${qstr(lid)},'${b.type}',${qstr(blockContent(b))}, null,${bi}, NOW(), NOW())`));
      bc++;
    }
  }
  console.log(`Module ${moduleNum}: ${modData.title}`);
  console.log(`Lessons: ${lc}, Blocks: ${bc}`);
  console.log(`Transaction (${q.length} queries)...`);
  try { const r = await sql.transaction(q); console.log(`Committed - ${r.length} statements`); }
  catch (e: any) { console.error("ROLLED BACK:", e.message); process.exit(1); }
  console.log("DONE");
}
main().catch(e => { console.error(e); process.exit(1); });
