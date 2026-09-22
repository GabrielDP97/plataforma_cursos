# Import Plan — Curriculum Blueprints → Platform Database

## Overview

This document describes the strategy for converting curriculum blueprints into platform database records. **NO imports have been executed yet.** This is a plan for future implementation.

## Current Platform Data Model

```
Course
  └── Module (curriculum module within a course)
       └── Lesson (learning sequence)
            └── ContentBlock (text, video, code, file, link)
```

## Blueprint → Database Mapping

### Curriculum Module → Course + Module

| Blueprint Field | Platform Field | Notes |
|-----------------|----------------|-------|
| `moduleCode` | `course.customData.curriculumCode` | Official code (e.g., "0485") |
| `officialName` | `course.title` | Spanish official name |
| `totalHours` | `course.customData.officialHours` | For reference, not course duration |
| `ects` | `course.customData.ects` | For reference |
| `degree` | `course.customData.degrees` | ["DAM", "DAW"] |
| RAs, CEs, contents | `course.customData.curriculum` | Full curriculum data as JSON |

### Proposed Units → Modules (within Course)

| Blueprint Field | Platform Field | Notes |
|-----------------|----------------|-------|
| Unit `id` | `module.position` | Sequential order |
| Unit `title` | `module.title` | Pedagogical unit name |
| Unit `description` | `module.description` | What this unit covers |
| RAs covered | `module.customData.learningOutcomes` | Array of RA IDs |
| CEs covered | `module.customData.assessmentCriteria` | Array of CE IDs |
| Contents covered | `module.customData.officialContents` | Array of content references |

### Proposed Lessons → Lessons (within Module)

| Blueprint Field | Platform Field | Notes |
|-----------------|----------------|-------|
| Lesson `id` | `lesson.position` | Sequential order |
| Lesson `title` | `lesson.title` | Lesson name |
| Lesson `objectives` | `lesson.customData.objectives` | Learning objectives |
| Content blocks | `contentBlock` records | Each block type maps to platform type |
| Exercises | `lesson.customData.exercises` | Exercise definitions |

### Content Blocks → ContentBlock Records

| Blueprint Type | Platform Type | Notes |
|----------------|---------------|-------|
| `text` | `text` | Explanations, theory |
| `code` | `code` | Java code examples |
| `video` | `video` | Placeholder — no video yet |
| `file` | `file` | Exercise files, resources |
| `link` | `link` | Official documentation links |

## Import Strategy

### Step 1: Create Course Records

```typescript
// For each module in the blueprint
const course = await db.insert(course).values({
  title: blueprint.officialName,  // "Programación"
  description: `Módulo oficial de ${blueprint.officialName} (${blueprint.ects} ECTS)`,
  status: "draft",  // NEVER publish automatically
  instructorId: adminUserId,
  customData: {
    curriculumCode: blueprint.moduleCode,
    degrees: blueprint.degree,
    ects: blueprint.ects,
    officialHours: blueprint.totalHours,
    academicYear: "2026-2027",
    jurisdiction: "andalucia",
    curriculum: {
      learningOutcomes: blueprint.learningOutcomes,
      assessmentCriteria: blueprint.assessmentCriteria,
      officialContents: blueprint.officialContents,
    },
  },
});
```

### Step 2: Create Module Records (Pedagogical Units)

```typescript
for (const unit of blueprint.proposedUnits) {
  await db.insert(module).values({
    courseId: course.id,
    title: unit.title,
    description: unit.description,
    position: unitIndex,
    visible: true,
    customData: {
      learningOutcomesCovered: unit.learningOutcomesCovered,
      assessmentCriteriaCovered: unit.assessmentCriteriaCovered,
      officialContentsCovered: unit.officialContentsCovered,
    },
  });
}
```

### Step 3: Create Lesson Records

```typescript
for (const lesson of unit.proposedLessons) {
  await db.insert(lesson).values({
    moduleId: module.id,
    title: lesson.title,
    position: lessonIndex,
    visible: true,
    customData: {
      objectives: lesson.objectives,
    },
  });
}
```

### Step 4: Create ContentBlock Records

```typescript
for (const block of lesson.contentBlocks) {
  await db.insert(contentBlock).values({
    lessonId: lesson.id,
    type: block.type,
    content: block.content || "",  // Will be filled during content production
    position: blockIndex,
    metadata: {
      description: block.description,
      status: "placeholder",  // Needs content production
    },
  });
}
```

## Import Order

1. **Programming** (0485) — Priority 1, pilot module
2. **Databases** (0484) — Priority 2
3. **Systems** (0483) — Priority 3
4. **Markup Languages** (0373) — Priority 4
5. **Development Environments** (0487) — Priority 5

## Validation Checklist

Before each import:

- [ ] Blueprint reviewed and approved by human
- [ ] All RAs have coverage
- [ ] All CEs have coverage
- [ ] No duplicate IDs
- [ ] Course status is "draft"
- [ ] No content is published
- [ ] Custom data structure matches schema

## Rollback Strategy

If an import goes wrong:

1. Delete all records created in the failed import
2. Course records can be soft-deleted (status → "archived")
3. Module/Lesson/ContentBlock records can be hard-deleted (no enrollments yet)
4. Keep blueprint files as source of truth

## Future: Content Production Pipeline

After import, each lesson needs:

1. **Text content** — Write explanations
2. **Code examples** — Write and test Java code
3. **Exercises** — Design and write exercises
4. **Practice projects** — Design practice assignments
5. **Assessment** — Create quizzes/assignments (when implemented)

This is a separate phase from curriculum import.
