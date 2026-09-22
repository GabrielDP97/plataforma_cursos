# Conceptual Domain Model

Entities, relationships, and responsibilities. Conceptual, not database.

---

## Entity Overview

```
User
├── Student
├── Instructor
└── Admin

Course
├── Module
│   └── Lesson
│       ├── ContentBlock
│       ├── Resource
│       └── Video
├── Enrollment
└── Category

Progress
├── LessonProgress
├── ModuleProgress
└── CourseProgress

Assessment (POST-MVP)
├── Exercise
│   └── Submission
└── Quiz
    ├── Question
    │   └── Answer
    └── Attempt

LiveClass (POST-MVP)
├── Session
├── Attendance
└── Recording

Notification
Certificate
```

---

## Entity Definitions

### User

**Responsibility:** Identity and authentication. Base for all roles.

**Fields:**
- Unique identifier
- Email (unique)
- Password (hashed)
- Name
- Avatar
- Role (student/instructor/admin)
- Status (active/disabled)
- Created at, updated at

**Relationships:**
- Has one profile (student/instructor/admin specific data)
- Has many enrollments (as student)
- Has many courses (as instructor)
- Has many notifications

**MVP:** YES

---

### Student (extends User)

**Responsibility:** Learning-specific data.

**Fields:**
- Bio (optional)
- Learning interests (POST-MVP)
- Notification preferences (POST-MVP)

**Relationships:**
- Belongs to User
- Has many Enrollments
- Has many LessonProgress records
- Has many Certificates (POST-MVP)

**MVP:** YES

---

### Instructor (extends User)

**Responsibility:** Teaching-specific data.

**Fields:**
- Bio
- Expertise areas
- Website (optional)
- Social links (optional)

**Relationships:**
- Belongs to User
- Has many Courses (as author)
- Has many LiveClasses (POST-MVP)

**MVP:** YES

---

### Admin (extends User)

**Responsibility:** Platform management. Minimal additional data.

**Fields:**
- (Minimal — just role indicator)

**Relationships:**
- Belongs to User
- Can manage all entities

**MVP:** YES

---

### Course

**Responsibility:** Top-level container for learning content.

**Fields:**
- Title
- Description
- Short description
- Thumbnail
- Difficulty level
- Language
- Estimated duration (hours)
- Status (draft/published/archived)
- Is free (boolean)
- Price (POST-MVP)
- Created at, updated at

**Relationships:**
- Belongs to one Instructor (author)
- Belongs to one Category
- Has many Modules
- Has many Enrollments
- Has many LiveClasses (POST-MVP)

**MVP:** YES

---

### Module

**Responsibility:** Logical grouping of lessons within a course.

**Fields:**
- Title
- Description (optional)
- Order position

**Relationships:**
- Belongs to one Course
- Has many Lessons

**MVP:** YES

---

### Lesson

**Responsibility:** Atomic unit of content. Where learning happens.

**Fields:**
- Title
- Content type (text/video/mixed)
- Order position (within module)
- Estimated duration (minutes)
- Is preview available (free preview)
- Created at, updated at

**Relationships:**
- Belongs to one Module
- Has many ContentBlocks
- Has many Resources (files)
- Has one Video (optional)
- Has many LessonProgress records

**MVP:** YES

---

### ContentBlock

**Responsibility:** Individual piece of content within a lesson.

**Fields:**
- Block type (text/code/video/image/file/link/embed)
- Content (varies by type)
- Order position

**Relationships:**
- Belongs to one Lesson

**MVP:** YES

---

### Video

**Responsibility:** Video content associated with a lesson.

**Fields:**
- Storage reference
- Duration
- Thumbnail
- Title
- Status (processing/ready/failed)
- Created at

**Relationships:**
- Belongs to one Lesson
- Has many VideoProgress records

**MVP:** YES

---

### Resource

**Responsibility:** Downloadable file attached to a lesson.

**Fields:**
- File reference
- Display name
- File size
- File type
- Is downloadable (yes/no)
- Created at

**Relationships:**
- Belongs to one Lesson

**MVP:** YES

---

### Category

**Responsibility:** Organize courses by topic.

**Fields:**
- Name
- Description (optional)
- Order position
- Parent category (optional, for hierarchy)

**Relationships:**
- Has many Courses
- May have parent Category

**MVP:** YES

---

### Enrollment

**Responsibility:** Records that a student is taking a course.

**Fields:**
- Enrolled at
- Status (active/completed/dropped)
- Completed at (if completed)

**Relationships:**
- Belongs to one Student (User)
- Belongs to one Course

**MVP:** YES

---

### LessonProgress

**Responsibility:** Tracks student's completion of a specific lesson.

**Fields:**
- Is completed (boolean)
- Completed at (timestamp)
- Video progress (seconds watched, percentage)

**Relationships:**
- Belongs to one Student (User)
- Belongs to one Lesson

**MVP:** YES

---

### ModuleProgress

**Responsibility:** Calculated from LessonProgress. Not stored, computed on demand.

**How calculated:**
- Count completed lessons in module
- Divide by total lessons in module
- Result is percentage

**Relationships:**
- Derived from LessonProgress records

**MVP:** YES (computed)

---

### CourseProgress

**Responsibility:** Calculated from all LessonProgress in a course.

**How calculated:**
- Count all completed lessons across all modules
- Divide by total lessons in course
- Result is percentage

**Relationships:**
- Derived from LessonProgress records

**MVP:** YES (computed)

---

### Exercise (POST-MVP)

**Responsibility:** Programming assignment for students.

**Fields:**
- Title
- Description (rich text)
- Starter file reference
- Solution file reference (instructor only)
- Estimated time
- Order position

**Relationships:**
- Belongs to one Lesson (or Module)
- Has many Submissions

**MVP:** NO

---

### Submission (POST-MVP)

**Responsibility:** Student's submitted work for an exercise.

**Fields:**
- Submitted file reference
- Submitted text (alternative)
- Submitted at
- Status (pending/reviewed)
- Grade (optional)
- Feedback (optional)
- Reviewed at

**Relationships:**
- Belongs to one Student (User)
- Belongs to one Exercise

**MVP:** NO

---

### Quiz (POST-MVP)

**Responsibility:** Assessment with questions.

**Fields:**
- Title
- Description/instructions
- Time limit (optional)
- Maximum attempts
- Passing score
- Shuffle questions

**Relationships:**
- Belongs to one Lesson (or Module)
- Has many Questions
- Has many Attempts

**MVP:** NO

---

### Question (POST-MVP)

**Responsibility:** Individual question in a quiz.

**Fields:**
- Question text
- Question type (multiple choice, true/false, etc.)
- Order position
- Points value

**Relationships:**
- Belongs to one Quiz
- Has many Answers

**MVP:** NO

---

### Answer (POST-MVP)

**Responsibility:** Possible answer for a question.

**Fields:**
- Answer text
- Is correct (boolean)
- Order position

**Relationships:**
- Belongs to one Question

**MVP:** NO

---

### Attempt (POST-MVP)

**Responsibility:** Student's attempt at a quiz.

**Fields:**
- Started at
- Completed at
- Score
- Pass/fail
- Answers given (per question)

**Relationships:**
- Belongs to one Student (User)
- Belongs to one Quiz

**MVP:** NO

---

### LiveClass (POST-MVP)

**Responsibility:** Scheduled live session.

**Fields:**
- Title
- Description
- Scheduled start time
- Duration (minutes)
- Status (scheduled/live/ended/cancelled)
- Meeting link
- Recording URL (after class)

**Relationships:**
- Belongs to one Course
- Hosted by one Instructor
- Has many Attendance records

**MVP:** NO

---

### Attendance (POST-MVP)

**Responsibility:** Records student presence in a live class.

**Fields:**
- Join time
- Leave time
- Duration attended
- Status (present/absent/late)

**Relationships:**
- Belongs to one Student (User)
- Belongs to one LiveClass

**MVP:** NO

---

### Recording (POST-MVP)

**Responsibility:** Recorded live class for replay.

**Fields:**
- Storage reference
- Duration
- Processing status
- Available to students (boolean)

**Relationships:**
- Belongs to one LiveClass

**MVP:** NO

---

### Certificate (POST-MVP)

**Responsibility:** Proof of course completion.

**Fields:**
- Unique ID
- Completion date
- Student name (at time of completion)
- Course name
- Instructor name
- PDF reference

**Relationships:**
- Belongs to one Student (User)
- Belongs to one Course

**MVP:** NO

---

### Notification

**Responsibility:** Alert user of platform events.

**Fields:**
- Title
- Body
- Type (announcement/enrollment/system)
- Is read (boolean)
- Created at
- Link (optional, deep link to relevant content)

**Relationships:**
- Belongs to one User
- May reference one Course (optional)

**MVP:** YES

---

## Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Student/Instructor/Admin | One-to-One | Role specialization |
| Instructor → Course | One-to-Many | Instructor authors courses |
| Course → Module | One-to-Many | Course contains modules |
| Module → Lesson | One-to-Many | Module contains lessons |
| Lesson → ContentBlock | One-to-Many | Lesson has content blocks |
| Lesson → Video | One-to-One | Lesson has optional video |
| Lesson → Resource | One-to-Many | Lesson has downloadable files |
| Course → Category | Many-to-One | Course belongs to category |
| Student → Enrollment | One-to-Many | Student enrolls in courses |
| Course → Enrollment | One-to-Many | Course has many enrollments |
| Student → LessonProgress | One-to-Many | Student progresses through lessons |
| Lesson → LessonProgress | One-to-Many | Lesson has progress records |
| Lesson → Exercise | One-to-Many | Lesson has exercises (POST-MVP) |
| Exercise → Submission | One-to-Many | Exercise has submissions (POST-MVP) |
| Lesson → Quiz | One-to-Many | Lesson has quizzes (POST-MVP) |
| Quiz → Question | One-to-Many | Quiz has questions (POST-MVP) |
| Question → Answer | One-to-Many | Question has answers (POST-MVP) |
| Quiz → Attempt | One-to-Many | Quiz has attempts (POST-MVP) |
| Course → LiveClass | One-to-Many | Course has live classes (POST-MVP) |
| LiveClass → Attendance | One-to-Many | Live class has attendance (POST-MVP) |
| User → Notification | One-to-Many | User has notifications |
| Course → Certificate | One-to-Many | Course produces certificates (POST-MVP) |
