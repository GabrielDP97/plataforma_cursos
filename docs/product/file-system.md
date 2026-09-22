# File System Model

Functional file management for course resources.

---

## Core Principle

Files are attached to specific entities. They are not a separate "file system" that exists independently. Every file has an owner and a purpose.

---

## Where Files Live

### Level 1: Course Level
Files that belong to the entire course, not a specific lesson.

- Course thumbnail / cover image
- Course promotional materials (POST-MVP)
- Course-level resources (e.g., course syllabus PDF)

### Level 2: Lesson Level
Files that belong to a specific lesson.

- Lesson video
- Lesson images
- Downloadable resources (starter code, PDFs, slides)
- Exercise files (POST-MVP)

### Level 3: Exercise Level
Files specific to a programming exercise (POST-MVP).

- Starter code file
- Solution file (instructor only)
- Reference materials

---

## File Ownership Rules

1. **Files belong to one entity** — A file is uploaded for a specific course, lesson, or exercise. It cannot float freely.
2. **Files can be referenced multiple times** — The same file can appear in multiple lessons if the instructor wants. The file has one owner, many references.
3. **Deleting an entity deletes its files** — If a lesson is deleted, its files are deleted (with confirmation).
4. **Files have metadata** — Name, size, type, upload date, uploader.

---

## Folder Structure (Logical, Not Physical)

Instructors organize files logically, not in a file system hierarchy.

### Within a Course
```
Course: "Python Fundamentals"
├── Course Resources/
│   └── course-syllabus.pdf
├── Module 1: Getting Started/
│   ├── Lesson 1: Introduction/
│   │   └── hello-world.py
│   └── Lesson 2: Setup/
│       └── installation-guide.pdf
└── Module 2: Variables/
    └── Lesson 1: Types/
        └── type-examples.py
```

**Important:** This is a logical view, not a real folder system. Files are stored flat with metadata that indicates their association. The folder structure is a UI presentation.

---

## File Upload

**MVP upload flow:**
1. Instructor clicks "Add file" in lesson editor
2. Selects file from computer
3. File uploads to storage
4. File appears in lesson with name and size
5. Instructor can add a display name (optional)

**Upload constraints:**
- Maximum file size: configurable (default 100MB for video, 50MB for other files)
- Allowed types: configurable, sensible defaults for each context
- Video: MP4, WebM
- Documents: PDF, DOCX, TXT, ZIP
- Images: JPG, PNG, GIF, SVG
- Code: any text file

---

## File Access

### Who Can Access What?

| File Location | Student Access | Instructor Access | Admin Access |
|---------------|---------------|-------------------|--------------|
| Course thumbnail | Public (catalog) | Owner: full | Full |
| Lesson content (in lesson) | Enrolled only | Owner: full | Full |
| Downloadable resources | Enrolled only | Owner: full | Full |
| Exercise files | Enrolled only | Owner: full | Full |
| Course-level files | Enrolled only | Owner: full | Full |

### Access Control Rules

1. **Unenrolled students cannot access any course files** — Files are behind enrollment check.
2. **Preview files are accessible without enrollment** — Marked as "preview" by instructor.
3. **File URLs are signed/expiring** — Direct file URLs require authentication.
4. **No hotlinking** — File access goes through the platform, not direct storage URLs.

---

## File Reusability

**Can the same file appear in multiple lessons?**

Yes. The instructor uploads a file once, then references it in multiple lessons. The file exists once in storage but has multiple references.

**Use case:** A "Python Cheat Sheet" PDF uploaded once, referenced in 5 different lessons across a course.

**Implementation:** File has a unique ID. Lessons reference file IDs, not copies.

---

## File Lifecycle

1. **Upload** — File is uploaded and stored
2. **Reference** — File is attached to one or more lessons/courses
3. **Active** — File is accessible to students
4. **Orphaned** — File is no longer referenced by any entity
5. **Deleted** — File is permanently removed

**Orphan cleanup:** Files not referenced for 30 days can be flagged for admin review. Prevents storage waste from abandoned uploads.

---

## Downloadable Resources

Students can download files attached to lessons.

**MVP download behavior:**
- Click download button
- File downloads to student's computer
- No tracking of downloads (POST-MVP: download count per file)

**POST-MVP:**
- Download tracking (who downloaded what, when)
- Bulk download (download all course resources as ZIP)
- Version history for files

---

## Video Files

Video is special. See the Video Model for video-specific handling.

Key distinction: Video files go through video processing (transcoding, thumbnails, streaming). Non-video files are stored as-is.

---

## Storage Considerations (Functional, Not Technical)

- Files need to persist reliably
- Files need to be accessible quickly
- Video files need streaming capability
- Large files need chunked upload support
- Storage costs should be predictable

These are technical concerns addressed in infrastructure planning, not in this functional model.
