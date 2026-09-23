const {neon} = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);
(async()=>{
  const moduleId = '96699de6-905d-4fdf-a993-18ccc0246e7d';
  
  // Get lesson IDs
  const lessons = await sql(`SELECT id, title FROM lesson WHERE module_id = '${moduleId}'`);
  console.log("Lessons to delete:", lessons.length);
  
  // Delete content_blocks for these lessons
  for (const l of lessons) {
    await sql(`DELETE FROM content_block WHERE lesson_id = '${l.id}'`);
    console.log(`  Deleted blocks for: ${l.title}`);
  }
  
  // Delete lessons
  await sql(`DELETE FROM lesson WHERE module_id = '${moduleId}'`);
  console.log("Deleted", lessons.length, "lessons");
  
  // Verify
  const check = await sql(`SELECT COUNT(*) as count FROM lesson WHERE module_id = '${moduleId}'`);
  console.log("Remaining lessons:", check[0].count);
  console.log("DONE — M12 cleared, ready for import");
})()
