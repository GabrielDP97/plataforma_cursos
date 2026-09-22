/**
 * Seed script — creates test data for development and E2E testing.
 *
 * Usage:
 *   npm run db:seed          — Idempotent: deletes test data, re-inserts
 *   npm run db:seed:reset    — Same as db:seed
 *   npx tsx src/seed.ts      — Direct execution
 *
 * Requirements:
 *   - NEON_DATABASE_URL env var must be set
 *   - ENVIRONMENT must NOT be "production"
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as schema from "./infra/schema";

// ── Fixed UUIDs for test data (stable across runs) ──────────────────────────

const USERS = {
  student: "a0000000-0000-0000-0000-000000000001",
  instructor: "a0000000-0000-0000-0000-000000000002",
  instructor2: "a0000000-0000-0000-0000-000000000003",
  admin: "a0000000-0000-0000-0000-000000000004",
} as const;

const CATEGORIES = {
  programacion: "b0000000-0000-0000-0000-000000000001",
  basesDeDatos: "b0000000-0000-0000-0000-000000000002",
  lenguajesDeMarcas: "b0000000-0000-0000-0000-000000000003",
} as const;

const COURSES = {
  java: "c0000000-0000-0000-0000-000000000001",
  sql: "c0000000-0000-0000-0000-000000000002",
  htmlCss: "c0000000-0000-0000-0000-000000000003",
} as const;

const MODULES = {
  javaVars: "d0000000-0000-0000-0000-000000000001",
  javaControl: "d0000000-0000-0000-0000-000000000002",
} as const;

const LESSONS = {
  tiposPrimitivos: "e0000000-0000-0000-0000-000000000001",
  declaracionVariables: "e0000000-0000-0000-0000-000000000002",
  condicionales: "e0000000-0000-0000-0000-000000000003",
} as const;

const CONTENT_BLOCKS = {
  tiposPrimitivosText: "f0000000-0000-0000-0000-000000000001",
  tiposPrimitivosCode: "f0000000-0000-0000-0000-000000000002",
  declaracionVariablesText: "f0000000-0000-0000-0000-000000000003",
  declaracionVariablesCode: "f0000000-0000-0000-0000-000000000004",
  condicionalesText: "f0000000-0000-0000-0000-000000000005",
  condicionalesCode: "f0000000-0000-0000-0000-000000000006",
} as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function warn(msg: string) {
  console.log(`  ⚠ ${msg}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  // Environment guard
  if (process.env.ENVIRONMENT === "production") {
    console.error("\n❌ SEED BLOCKED: Refusing to run in production.\n");
    process.exit(1);
  }

  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.error(
      "\n❌ NEON_DATABASE_URL is not set. Cannot connect to database.\n"
    );
    process.exit(1);
  }

  console.log("\n🌱 Seed — starting...\n");

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  // ── 1. Clean existing test data (respect FK order) ──────────────────────
  console.log("🗑  Cleaning test data...");

  // Delete in dependency order (children first)
  await sql`DELETE FROM video_progress WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM lesson_progress WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM enrollment WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM user_consent WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM course_instructors WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM content_block WHERE lesson_id IN (${LESSONS.tiposPrimitivos}, ${LESSONS.declaracionVariables}, ${LESSONS.condicionales})`;
  await sql`DELETE FROM resource WHERE lesson_id IN (${LESSONS.tiposPrimitivos}, ${LESSONS.declaracionVariables}, ${LESSONS.condicionales})`;
  await sql`DELETE FROM video_asset WHERE lesson_id IN (${LESSONS.tiposPrimitivos}, ${LESSONS.declaracionVariables}, ${LESSONS.condicionales})`;
  await sql`DELETE FROM lesson WHERE id IN (${LESSONS.tiposPrimitivos}, ${LESSONS.declaracionVariables}, ${LESSONS.condicionales})`;
  await sql`DELETE FROM module WHERE id IN (${MODULES.javaVars}, ${MODULES.javaControl})`;
  await sql`DELETE FROM course_category WHERE course_id IN (${COURSES.java}, ${COURSES.sql}, ${COURSES.htmlCss})`;
  await sql`DELETE FROM course WHERE id IN (${COURSES.java}, ${COURSES.sql}, ${COURSES.htmlCss})`;
  await sql`DELETE FROM category WHERE id IN (${CATEGORIES.programacion}, ${CATEGORIES.basesDeDatos}, ${CATEGORIES.lenguajesDeMarcas})`;
  await sql`DELETE FROM session WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM account WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM notification WHERE user_id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  await sql`DELETE FROM user WHERE id IN (${USERS.student}, ${USERS.instructor}, ${USERS.instructor2}, ${USERS.admin})`;
  log("Test data cleaned");

  // ── 2. Hash passwords ──────────────────────────────────────────────────
  console.log("\n🔐 Hashing passwords...");
  const saltRounds = 10;
  const passwordStudent = await bcrypt.hash("Student123!", saltRounds);
  const passwordInstructor = await bcrypt.hash("Instructor123!", saltRounds);
  const passwordAdmin = await bcrypt.hash("Admin123!", saltRounds);
  log("Passwords hashed");

  // ── 3. Insert users ────────────────────────────────────────────────────
  console.log("\n👤 Creating users...");

  await db.insert(schema.user).values([
    {
      id: USERS.student,
      name: "Test Student",
      email: "student@test.local",
      emailVerified: true,
      role: "student",
    },
    {
      id: USERS.instructor,
      name: "Test Instructor",
      email: "instructor@test.local",
      emailVerified: true,
      role: "instructor",
    },
    {
      id: USERS.instructor2,
      name: "Test Instructor 2",
      email: "instructor2@test.local",
      emailVerified: true,
      role: "instructor",
    },
    {
      id: USERS.admin,
      name: "Test Admin",
      email: "admin@test.local",
      emailVerified: true,
      role: "admin",
    },
  ]);
  log("Users created: student@test.local, instructor@test.local, instructor2@test.local, admin@test.local");

  // ── 4. Insert accounts (password auth) ─────────────────────────────────
  console.log("\n🔑 Creating accounts...");

  await db.insert(schema.account).values([
    {
      userId: USERS.student,
      accountId: USERS.student,
      providerId: "email",
      password: passwordStudent,
    },
    {
      userId: USERS.instructor,
      accountId: USERS.instructor,
      providerId: "email",
      password: passwordInstructor,
    },
    {
      userId: USERS.instructor2,
      accountId: USERS.instructor2,
      providerId: "email",
      password: passwordInstructor,
    },
    {
      userId: USERS.admin,
      accountId: USERS.admin,
      providerId: "email",
      password: passwordAdmin,
    },
  ]);
  log("Accounts created (email/password provider)");

  // ── 5. Insert categories ───────────────────────────────────────────────
  console.log("\n📁 Creating categories...");

  await db.insert(schema.category).values([
    {
      id: CATEGORIES.programacion,
      name: "Programacion",
      slug: "programacion",
      description: "Cursos de programacion y desarrollo de software",
    },
    {
      id: CATEGORIES.basesDeDatos,
      name: "Bases de Datos",
      slug: "bases-de-datos",
      description: "Cursos sobre bases de datos y modelado de datos",
    },
    {
      id: CATEGORIES.lenguajesDeMarcas,
      name: "Lenguajes de Marcas",
      slug: "lenguajes-de-marcas",
      description: "Cursos de HTML, CSS y tecnologias web",
    },
  ]);
  log("Categories created: Programacion, Bases de Datos, Lenguajes de Marcas");

  // ── 6. Insert courses ──────────────────────────────────────────────────
  console.log("\n📚 Creating courses...");

  await db.insert(schema.course).values([
    {
      id: COURSES.java,
      title: "Introduccion a Java",
      description:
        "Aprende los fundamentos de programacion en Java desde cero. Variables, tipos de datos, estructuras de control y mas.",
      slug: "introduccion-a-java",
      status: "published",
      publishedAt: new Date("2026-01-15T00:00:00Z"),
    },
    {
      id: COURSES.sql,
      title: "SQL y Modelado de Datos",
      description:
        "Domina SQL y aprende a modelar bases de datos relacionales de forma profesional.",
      slug: "sql-y-modelado-de-datos",
      status: "published",
      publishedAt: new Date("2026-02-10T00:00:00Z"),
    },
    {
      id: COURSES.htmlCss,
      title: "HTML y CSS desde cero",
      description:
        "Crea tus primeras paginas web con HTML y CSS. Ideal para principiantes.",
      slug: "html-y-css-desde-cero",
      status: "draft",
    },
  ]);
  log("Courses created: Introduccion a Java (published), SQL y Modelado de Datos (published), HTML y CSS desde cero (draft)");

  // ── 7. Insert course ↔ category links ──────────────────────────────────
  console.log("\n🔗 Linking courses to categories...");

  await db.insert(schema.courseCategory).values([
    { courseId: COURSES.java, categoryId: CATEGORIES.programacion },
    { courseId: COURSES.sql, categoryId: CATEGORIES.basesDeDatos },
    { courseId: COURSES.htmlCss, categoryId: CATEGORIES.lenguajesDeMarcas },
  ]);
  log("Course-category links created");

  // ── 8. Insert modules (for Java course) ────────────────────────────────
  console.log("\n📦 Creating modules...");

  await db.insert(schema.module).values([
    {
      id: MODULES.javaVars,
      courseId: COURSES.java,
      title: "Variables y Tipos de Dato",
      description:
        "Aprende sobre los tipos de datos primitivos en Java y como declarar variables.",
      position: 1,
      visible: true,
    },
    {
      id: MODULES.javaControl,
      courseId: COURSES.java,
      title: "Estructuras de Control",
      description:
        "Domina las estructuras de control: condicionales if/else y bucles.",
      position: 2,
      visible: true,
    },
  ]);
  log("Modules created: Variables y Tipos de Dato, Estructuras de Control");

  // ── 9. Insert lessons ──────────────────────────────────────────────────
  console.log("\n📝 Creating lessons...");

  await db.insert(schema.lesson).values([
    {
      id: LESSONS.tiposPrimitivos,
      moduleId: MODULES.javaVars,
      title: "Tipos primitivos en Java",
      description:
        "Conoce los 8 tipos de datos primitivos: int, double, float, boolean, char, byte, short, long.",
      position: 1,
      visible: true,
    },
    {
      id: LESSONS.declaracionVariables,
      moduleId: MODULES.javaVars,
      title: "Declaracion de variables",
      description:
        "Aprende a declarar e inicializar variables en Java.",
      position: 2,
      visible: true,
    },
    {
      id: LESSONS.condicionales,
      moduleId: MODULES.javaControl,
      title: "Condicionales if/else",
      description:
        "Usa if, else if y else para tomar decisiones en tu codigo.",
      position: 1,
      visible: true,
    },
  ]);
  log("Lessons created: Tipos primitivos, Declaracion de variables, Condicionales if/else");

  // ── 10. Insert content blocks ──────────────────────────────────────────
  console.log("\n📄 Creating content blocks...");

  await db.insert(schema.contentBlock).values([
    // Lesson 1: Tipos primitivos — text + code
    {
      id: CONTENT_BLOCKS.tiposPrimitivosText,
      lessonId: LESSONS.tiposPrimitivos,
      type: "text",
      content:
        "Java tiene 8 tipos de datos primitivos:\n\n" +
        "- **byte**: 8 bits, rango de -128 a 127\n" +
        "- **short**: 16 bits, rango de -32,768 a 32,767\n" +
        "- **int**: 32 bits, rango de -2^31 a 2^31-1\n" +
        "- **long**: 64 bits, rango de -2^63 a 2^63-1\n" +
        "- **float**: 32 bits, precision de punto flotante\n" +
        "- **double**: 64 bits, doble precision\n" +
        "- **char**: 16 bits, un caracter Unicode\n" +
        "- **boolean**: true o false",
      position: 1,
    },
    {
      id: CONTENT_BLOCKS.tiposPrimitivosCode,
      lessonId: LESSONS.tiposPrimitivos,
      type: "code",
      content:
        '// Tipos primitivos en Java\n' +
        'public class TiposPrimitivos {\n' +
        '    public static void main(String[] args) {\n' +
        '        byte edad = 25;\n' +
        '        short distancia = 1500;\n' +
        '        int poblacion = 1000000;\n' +
        '        long distanciaLuz = 9_461_000_000_000L;\n' +
        '        float precio = 19.99f;\n' +
        '        double pi = 3.141592653589793;\n' +
        '        char inicial = \'J\';\n' +
        '        boolean activo = true;\n' +
        '\n' +
        '        System.out.println("Edad: " + edad);\n' +
        '        System.out.println("Poblacion: " + poblacion);\n' +
        '        System.out.println("PI: " + pi);\n' +
        '    }\n' +
        '}',
      position: 2,
    },
    // Lesson 2: Declaracion de variables — text + code
    {
      id: CONTENT_BLOCKS.declaracionVariablesText,
      lessonId: LESSONS.declaracionVariables,
      type: "text",
      content:
        "En Java, las variables se declaran con un tipo y un nombre. Puedes inicializarlas al momento de la declaracion o despues.\n\n" +
        "Reglas para nombres de variables:\n" +
        "- Deben empezar con letra, guion bajo o signo $ \n" +
        "- No pueden ser palabras reservadas (class, int, etc.)\n" +
        "- Por convencion, usa camelCase",
      position: 1,
    },
    {
      id: CONTENT_BLOCKS.declaracionVariablesCode,
      lessonId: LESSONS.declaracionVariables,
      type: "code",
      content:
        '// Declaracion e inicializacion de variables\n' +
        'public class Variables {\n' +
        '    public static void main(String[] args) {\n' +
        '        // Declaracion + inicializacion\n' +
        '        String nombre = "Java Developer";\n' +
        '        int aniosExperiencia = 3;\n' +
        '\n' +
        '        // Declaracion primero, inicializacion despues\n' +
        '        double salario;\n' +
        '        salario = 75000.50;\n' +
        '\n' +
        '        // Variables finales (constantes)\n' +
        '        final double IVA = 0.16;\n' +
        '\n' +
        '        System.out.println(nombre + " — " + aniosExperiencia + " anios");\n' +
        '        System.out.println("Salario: $" + salario);\n' +
        '    }\n' +
        '}',
      position: 2,
    },
    // Lesson 3: Condicionales — text + code
    {
      id: CONTENT_BLOCKS.condicionalesText,
      lessonId: LESSONS.condicionales,
      type: "text",
      content:
        "Las estructuras condicionales permiten ejecutar codigo basado en una condicion.\n\n" +
        "- **if**: ejecuta codigo si la condicion es verdadera\n" +
        "- **else if**: prueba otra condicion si la anterior fue falsa\n" +
        "- **else**: ejecuta codigo si ninguna condicion fue verdadera\n\n" +
        "Operadores de comparacion: ==, !=, <, >, <=, >=\n" +
        "Operadores logicos: && (AND), || (OR), ! (NOT)",
      position: 1,
    },
    {
      id: CONTENT_BLOCKS.condicionalesCode,
      lessonId: LESSONS.condicionales,
      type: "code",
      content:
        '// Condicionales if/else if/else\n' +
        'public class Condicionales {\n' +
        '    public static void main(String[] args) {\n' +
        '        int calificacion = 85;\n' +
        '\n' +
        '        if (calificacion >= 90) {\n' +
        '            System.out.println("Excelente — A");\n' +
        '        } else if (calificacion >= 80) {\n' +
        '            System.out.println("Muy bien — B");\n' +
        '        } else if (calificacion >= 70) {\n' +
        '            System.out.println("Bien — C");\n' +
        '        } else if (calificacion >= 60) {\n' +
        '            System.out.println("Suficiente — D");\n' +
        '        } else {\n' +
        '            System.out.println("Reprobado — F");\n' +
        '        }\n' +
        '\n' +
        '        // Operador ternario\n' +
        '        String resultado = (calificacion >= 60) ? "Aprobado" : "Reprobado";\n' +
        '        System.out.println("Resultado: " + resultado);\n' +
        '    }\n' +
        '}',
      position: 2,
    },
  ]);
  log("Content blocks created (text + code for each lesson)");

  // ── 11. Insert enrollments ─────────────────────────────────────────────
  console.log("\n🎓 Creating enrollments...");

  await db.insert(schema.enrollment).values([
    {
      userId: USERS.student,
      courseId: COURSES.java,
      status: "active",
      source: "free",
      enrolledAt: new Date("2026-09-01T00:00:00Z"),
    },
  ]);
  log("Enrollment: student@test.local → Introduccion a Java (active, free)");

  // ── 12. Insert progress ────────────────────────────────────────────────
  console.log("\n📊 Creating progress...");

  await db.insert(schema.lessonProgress).values([
    {
      userId: USERS.student,
      lessonId: LESSONS.tiposPrimitivos,
      status: "completed",
      startedAt: new Date("2026-09-01T10:00:00Z"),
      completedAt: new Date("2026-09-01T10:30:00Z"),
    },
    {
      userId: USERS.student,
      lessonId: LESSONS.declaracionVariables,
      status: "in_progress",
      startedAt: new Date("2026-09-02T14:00:00Z"),
    },
  ]);
  log("Progress: Tipos primitivos (completed), Declaracion de variables (in_progress)");

  // ── 13. Insert consent ─────────────────────────────────────────────────
  console.log("\n📋 Creating consent records...");

  await db.insert(schema.userConsent).values([
    {
      userId: USERS.student,
      termsVersion: "1.0",
      acceptedAt: new Date("2026-09-01T00:00:00Z"),
      ipAddress: "127.0.0.1",
    },
  ]);
  log("Consent: student@test.local accepted v1.0");

  // ── 14. Insert course_instructors (ownership) ──────────────────────────
  console.log("\n👨‍🏫 Creating course instructors...");

  await db.insert(schema.courseInstructors).values([
    { courseId: COURSES.java, userId: USERS.instructor, role: 1 }, // owner
    { courseId: COURSES.sql, userId: USERS.instructor2, role: 1 }, // owner
    { courseId: COURSES.htmlCss, userId: USERS.instructor, role: 1 }, // owner
  ]);
  log("Instructor ownership: instructor@test.local → Java + HTML/CSS, instructor2@test.local → SQL");

  // ── Done ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!\n");
  console.log("Test users:");
  console.log("  student@test.local    / Student123!      (student)");
  console.log("  instructor@test.local / Instructor123!   (instructor)");
  console.log("  instructor2@test.local / Instructor123!  (instructor)");
  console.log("  admin@test.local      / Admin123!        (admin)");
  console.log("");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
