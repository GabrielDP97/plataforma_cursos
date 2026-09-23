const {neon} = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);
(async()=>{
  const courses = await sql("SELECT id, slug, title, status FROM course WHERE slug = 'databases-0484'");
  if (courses.length === 0) { console.log("COURSE NOT FOUND"); return; }
  console.log("COURSE EXISTS: YES");
  console.log("COURSE STATUS:", courses[0].status);
  const courseId = courses[0].id;

  const modules = await sql("SELECT id, title, position FROM module WHERE course_id = '" + courseId + "' ORDER BY position");
  console.log("MODULE COUNT:", modules.length);

  const lessonResult = await sql("SELECT COUNT(*) as count FROM lesson WHERE module_id IN (SELECT id FROM module WHERE course_id = '" + courseId + "')");
  console.log("LESSON COUNT:", lessonResult[0].count);

  const blockResult = await sql("SELECT COUNT(*) as count FROM content_block WHERE lesson_id IN (SELECT id FROM lesson WHERE module_id IN (SELECT id FROM module WHERE course_id = '" + courseId + "'))");
  console.log("CONTENT BLOCK COUNT:", blockResult[0].count);

  console.log("\nMODULES:");
  for (const m of modules) {
    const lessons = await sql("SELECT COUNT(*) as count FROM lesson WHERE module_id = '" + m.id + "'");
    console.log("  Mod " + m.position + ": " + m.title + " (" + lessons[0].count + " lessons)");
  }

  // M12 detail
  const m12 = modules.find(m => m.title === "Modificación de datos");
  if (m12) {
    console.log("\nM12 DETAIL:");
    const m12Lessons = await sql("SELECT id, title, position FROM lesson WHERE module_id = '" + m12.id + "' ORDER BY position");
    let m12Blocks = 0;
    let m12Exercises = 0;
    for (const l of m12Lessons) {
      const bCount = await sql("SELECT COUNT(*) as count FROM content_block WHERE lesson_id = '" + l.id + "'");
      m12Blocks += parseInt(bCount[0].count);
      console.log("  " + l.position + ". " + l.title + " (" + bCount[0].count + " blocks)");
    }
    console.log("M12 lessons:", m12Lessons.length);
    console.log("M12 blocks:", m12Blocks);
  }
})()
