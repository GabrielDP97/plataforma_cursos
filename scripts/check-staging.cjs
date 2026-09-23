const {neon} = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);
(async()=>{
  // Check course
  const courses = await sql("SELECT id, slug, title, status FROM course WHERE slug = 'databases-0484'");
  if (courses.length === 0) { console.log("COURSE EXISTS: NO"); return; }
  console.log("COURSE EXISTS: YES");
  console.log("COURSE STATUS:", courses[0].status);
  console.log("COURSE ID:", courses[0].id);
  const courseId = courses[0].id;

  // Module count
  const modules = await sql(`SELECT id, title, position FROM module WHERE course_id = '${courseId}' ORDER BY position`);
  console.log("MODULE COUNT:", modules.length);

  // Lesson count
  const lessonResult = await sql(`SELECT COUNT(*) as count FROM lesson WHERE module_id IN (SELECT id FROM module WHERE course_id = '${courseId}')`);
  console.log("LESSON COUNT:", lessonResult[0].count);

  // Content block count
  const blockResult = await sql(`SELECT COUNT(*) as count FROM content_block WHERE lesson_id IN (SELECT id FROM lesson WHERE module_id IN (SELECT id FROM module WHERE course_id = '${courseId}'))`);
  console.log("CONTENT BLOCK COUNT:", blockResult[0].count);

  // List modules
  console.log("\nMODULES:");
  for (const m of modules) {
    const lessons = await sql(`SELECT COUNT(*) as count FROM lesson WHERE module_id = '${m.id}'`);
    console.log(`  Mod ${m.position}: ${m.title} (${lessons[0].count} lessons)`);
  }
})()
