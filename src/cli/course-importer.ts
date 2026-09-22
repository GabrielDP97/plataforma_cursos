import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const DRY_RUN = process.argv.includes("--dry-run");
function log(m: string) { console.log(`  ? ${m}`); }
function info(m: string) { console.log(`  ? ${m}`); }
function warn(m: string) { console.log(`  ? ${m}`); }
function fatal(m: string): never { console.error(`\n? ${m}\n`); process.exit(1); }

function blockContent(b: any): string { return b.content || b.description || b.title || ""; }
function blockMeta(b: any): Record<string,unknown> | null {
  const m: Record<string,unknown> = {};
  if (b.title) m.title = b.title; if (b.language) m.language = b.language;
  if (b.duration) m.duration = b.duration; if (b.url) m.url = b.url;
  const skip = new Set(["type","title","content","description","url","language","duration"]);
  for (const [k,v] of Object.entries(b)) { if (!skip.has(k) && v !== undefined) m[k] = v; }
  return Object.keys(m).length > 0 ? m : null;
}

async function main() {
  console.log("\n?? Course Importer\n");
  if (DRY_RUN) console.log("  ? DRY RUN\n");

  const dir = resolve("courses/programming");
  const course = JSON.parse(readFileSync(join(dir,"course.json"),"utf-8"));
  if (!course.id) fatal("course.json missing id");
  const mods: any[] = [];
  for (let i=1;i<=18;i++) { const f=join(dir,"modules",`mod-${String(i).padStart(2,"0")}.json`); if(!existsSync(f)) fatal(`Missing ${f}`); mods.push(JSON.parse(readFileSync(f,"utf-8"))); }

  if (!DRY_RUN) {
    const url = process.env.NEON_DATABASE_URL; if (!url) fatal("Missing NEON_DATABASE_URL");
    const {drizzle} = await import("drizzle-orm/neon-http"); const {eq} = await import("drizzle-orm");
    const schema = await import("../infra/schema"); const sql = neon(url); const db = drizzle(sql,{schema});
    const ex = await db.select({id:schema.course.id}).from(schema.course).where(eq(schema.course.slug,course.id)).limit(1);
    if (ex.length>0) { warn(`Course "${course.id}" exists. Aborting.`); process.exit(0); }
  }

  const cid = randomUUID(), slug = course.id;
  const mmap = new Map<string,string>(), lmap = new Map<string,string>();
  const q: any[] = []; let lc=0, bc=0;

  // Count first (works for dry-run too)
  for (const m of mods) { for (const l of m.lessons) { lc++; for (const b of l.contentBlocks) bc++; } }

  if (!DRY_RUN) {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    q.push(sql`INSERT INTO course (id,title,description,slug,status,created_at,updated_at) VALUES (${cid},${course.title},${course.description||null},${slug},'draft',NOW(),NOW())`);
    for (const m of mods) { const mid=randomUUID(); mmap.set(m.id,mid); q.push(sql`INSERT INTO module (id,course_id,title,description,position,visible,created_at,updated_at) VALUES (${mid},${cid},${m.title},${m.description||null},${m.position},true,NOW(),NOW())`); }
    for (const m of mods) { const mid=mmap.get(m.id)!; let li=0; for (const l of m.lessons) { li++; const lid=randomUUID(); lmap.set(l.id,lid); q.push(sql`INSERT INTO lesson (id,module_id,source_id,title,description,position,visible,created_at,updated_at) VALUES (${lid},${mid},${l.id},${l.title},${l.description||null},${li},true,NOW(),NOW())`); } }
    for (const m of mods) { for (const l of m.lessons) { const lid=lmap.get(l.id)!; let bi=0; for (const b of l.contentBlocks) { bi++; const meta=blockMeta(b); q.push(sql`INSERT INTO content_block (id,lesson_id,type,content,metadata,position,created_at,updated_at) VALUES (${randomUUID()},${lid},${b.type},${blockContent(b)},${meta?JSON.stringify(meta):null}::jsonb,${bi},NOW(),NOW())`); } } }
  }

  console.log(`?? ${mods.length} modules, ${lc} lessons, ${bc} blocks`);
  if (DRY_RUN) { console.log("\n?? DRY RUN\n"); return; }

  const sql = neon(process.env.NEON_DATABASE_URL!);
  console.log(`?? Transaction (${q.length} queries)...`);
  try { const r = await sql.transaction(q); log(`Committed — ${r.length} statements`); }
  catch (e) { console.error(`? ROLLED BACK: ${(e as Error).message}`); process.exit(1); }
  console.log("\n? DONE\n");
}
main().catch(e => { console.error(e); process.exit(1); });
