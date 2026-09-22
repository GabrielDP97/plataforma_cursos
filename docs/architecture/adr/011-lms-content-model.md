# ADR-011: LMS Content Model

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

The LMS needs a content hierarchy that supports courses with multiple modules, lessons with multiple content types, and stable ordering for all entities. The model must support course status lifecycle, lesson completion tracking, and video resume.

## Decision

**Course → Module → Lesson → ContentBlock** hierarchy with stable ordering (position field) at every level. Course has a status lifecycle. Lesson progress is the source of truth for course completion.

## Hierarchy

```
Course
├── Module (ordered by position)
│   ├── Lesson (ordered by position within module)
│   │   ├── ContentBlock (ordered by position within lesson)
│   │   └── ContentBlock
│   └── Lesson
└── Module
```

## Course Status

```sql
courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_by UUID FK → users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Valid transitions**:
- `draft` → `published`: Course content is complete, instructor publishes.
- `published` → `archived`: Course is hidden from catalog. Enrolled students retain access.
- `archived` → `draft`: Re-open for editing (rare, but supported).

**Invalid transitions**: `draft` → `archived` (must publish first). `archived` → `published` (must re-draft).

**Visibility rules**:
- `draft`: Only visible to course owner, collaborators, and admins.
- `published`: Visible in catalog. Enrollment enabled.
- `archived`: Hidden from catalog. No new enrollments. Enrolled students retain access.

## Module

```sql
modules (
  id UUID PRIMARY KEY,
  course_id UUID FK → courses ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

Modules do NOT have independent publish status. A module is visible if and only if:
1. The course is published (or the user is an instructor/admin for the course).
2. The student is enrolled in the course.

Modules have ordering via `position`. Reordering reassigns positions (gaps allowed).

## Lesson

```sql
lessons (
  id UUID PRIMARY KEY,
  module_id UUID FK → modules ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  estimated_duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

Lessons do NOT have independent publish status. Visibility follows module/course rules.

A lesson supports **multiple content block types** — it is NOT designed solely around video.

## ContentBlock

```sql
content_blocks (
  id UUID PRIMARY KEY,
  lesson_id UUID FK → lessons ON DELETE CASCADE,
  type ENUM('text', 'video', 'file', 'code', 'link') NOT NULL,
  position INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Block types and content structure**:

| Type | Content JSONB Structure |
|------|------------------------|
| `text` | `{ "html": "...", "markdown": "..." }` |
| `video` | `{ "videoAssetId": "uuid", "caption": "..." }` |
| `file` | `{ "storageKey": "...", "filename": "...", "mimeType": "...", "size": number }` |
| `code` | `{ "language": "javascript", "code": "...", "filename": "..." }` |
| `link` | `{ "url": "https://...", "title": "...", "description": "..." }` |

**Position ordering**: Each block has a `position` integer. Blocks are ordered by position ascending. Gaps in numbering are allowed. Reordering reassigns positions atomically.

## Lesson Progress

```sql
lesson_progress (
  id UUID PRIMARY KEY,
  student_id UUID FK → users,
  lesson_id UUID FK → lessons,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_position_seconds INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
)
```

**Status transitions**:
- `not_started` → `in_progress`: When student opens the lesson.
- `in_progress` → `completed`: When all content blocks are engaged.
- `completed` → `completed`: No revert. Once completed, stays completed.

**Lesson completion criteria**:
- `text` blocks: Marked as viewed.
- `video` blocks: Watched past completion threshold (90% of duration) or manually marked complete.
- `file` blocks: Downloaded or viewed.
- `code` blocks: Viewed (or interacted with, if editor is present).
- `link` blocks: Opened/clicked.

**Video resume**: `lastPositionSeconds` is updated periodically (every 10-30 seconds) during playback. On re-entry, the video player seeks to this position.

## Course Completion

Course completion percentage = (completed lessons / total lessons) × 100.

This is **derived** from lesson_progress. It is calculated on read or cached with invalidation. It is NEVER the sole source of truth.

**Edge cases**:
- If a lesson has no content blocks, it is NOT automatically completed.
- If content blocks are added to a completed lesson, the lesson remains completed (blocks are additive).
- If content blocks are deleted from a lesson, re-evaluate completion.

## Ordering Reordering

When reordering (e.g., drag-drop in instructor UI):
1. Client sends new positions as an ordered array: `[{ lessonId, position }, ...]`
2. Server validates all items belong to the same module.
3. Server updates positions in a single transaction.
4. Gaps are allowed (positions do not need to be contiguous).

## Consequences

- **Positive**: Clean hierarchy, stable ordering, extensible content types, lesson-level progress as source of truth.
- **Negative**: Position management adds complexity vs implicit ordering (e.g., created_at). Mitigated by simple reordering API.
- **Neutral**: JSONB content blocks allow flexible structure without schema changes for new block types.
