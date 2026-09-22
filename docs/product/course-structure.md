# Course Structure Model

Minimal viable hierarchy for organizing course content.

---

## The Decision: Course > Module > Lesson

This is enough. Adding Section, Chapter, Unit, or Folder inside the hierarchy creates unnecessary complexity.

### Why NOT More Levels?

- **Section/Chapter/Unit**: Another navigation layer students must click through. Most programming courses don't need this depth. If a course is so large it needs chapters, it should probably be split into multiple courses.
- **Folder**: Useful for file organization, NOT for content hierarchy. Folders belong to the file system, not the course tree.
- **Sub-modules**: Creates nesting complexity without clear benefit. Linear progression through modules is sufficient.

### The Rule

If you can't explain the purpose of a hierarchy level in one sentence, it doesn't exist.

---

## Course

The top-level container. Represents a complete learning experience.

**Responsibilities:**
- Owns all content and structure
- Defines enrollment terms (free/paid)
- Has a single instructor (author)
- Belongs to one category
- Has a difficulty level
- Has metadata for discovery

**Fields:**
- Title (required)
- Description (required)
- Short description / tagline
- Thumbnail image
- Difficulty level (beginner / intermediate / advanced)
- Category
- Instructor (who teaches it)
- Estimated duration (hours)
- Language
- Status (draft / published / archived)
- Created at, updated at

**Ordering:** By creation date (newest first) in catalog. Instructors can feature/pin specific courses.

---

## Module

A logical grouping of related lessons. Think of it as a chapter or topic area.

**Responsibilities:**
- Groups related lessons together
- Provides structure and learning path
- Has a title that indicates the topic covered

**Fields:**
- Title (required)
- Description (optional)
- Order position (required)
- Created at, updated at

**Ordering:** Explicit integer position. Instructors drag to reorder. Positions are sequential (1, 2, 3...) — gaps allowed for future insertions.

**Rules:**
- A course must have at least one module
- Modules cannot be nested
- Empty modules are allowed (for planning)

---

## Lesson

The atomic unit of content. Where learning happens.

**Responsibilities:**
- Delivers one concept, skill, or topic
- Contains the actual learning material
- Tracks whether student completed it
- May include assessments

**Fields:**
- Title (required)
- Content type (text / video / mixed)
- Order position within module (required)
- Estimated duration (minutes)
- Is preview available (free preview for non-enrolled)
- Created at, updated at

**Ordering:** Explicit integer position within parent module. Same sequential rule as modules.

**Rules:**
- A module must have at least one lesson
- Lessons cannot exist without a module
- Lessons are the lowest level of the hierarchy

---

## Why This Hierarchy Works

```
Course
├── Module 1: "Getting Started"
│   ├── Lesson 1: "What is Python?"
│   ├── Lesson 2: "Installing Python"
│   └── Lesson 3: "Your First Program"
├── Module 2: "Variables & Types"
│   ├── Lesson 1: "Variables"
│   ├── Lesson 2: "Data Types"
│   └── Lesson 3: "Type Conversion"
└── Module 3: "Control Flow"
    ├── Lesson 1: "If/Else"
    ├── Lesson 2: "Loops"
    └── Lesson 3: "Practice Exercises"
```

**Benefits:**
- **Simple for students**: Two clicks to any lesson. Course → Module → Lesson.
- **Simple for instructors**: Intuitive structure. No confusion about where things go.
- **Simple for developers**: Three entities to manage. Clear parent-child relationships.
- **Scales reasonably**: 5-10 modules per course, 3-10 lessons per module covers 95% of courses.
- **No feature creep**: If someone needs deeper structure, they should probably restructure their content.

---

## What About Resources?

Resources (files, downloads, links) belong to **lessons**, not to the hierarchy. A lesson can have attached resources. This is covered in the File System Model.

---

## What About Prerequisites?

Course-level prerequisites (e.g., "requires Course X") are a POST-MVP feature. Not part of the structural model initially.

---

## What About Learning Paths?

Grouping multiple courses into a path/curriculum is FUTURE. The hierarchy stops at Course.
