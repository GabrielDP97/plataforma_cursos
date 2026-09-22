# Progress Tracking Model

How student progress is measured, calculated, and displayed.

---

## What Is Progress?

Progress answers one question: **How far has this student gotten in this course?**

Progress is not just a percentage. It's a collection of data points that, together, tell the story of a student's journey.

---

## Lesson Completion

The atomic unit of progress. Everything else builds on this.

### What Does "Completing" a Lesson Mean?

A lesson is complete when **ALL** of the following are true:

1. **Content viewed** — Student has scrolled through or played all content blocks. For videos, this means watching sufficient percentage (default 90%). For text, this means reaching the bottom of the page.

2. **Interaction completed** — If the lesson has exercises or quizzes, the student must submit (POST-MVP). Not relevant for MVP lessons.

3. **Manual confirmation** — Student clicks "Mark as Complete" button.

### Why All Three?

| Criteria | Purpose |
|----------|---------|
| Content viewed | Prevents fake completion (just clicking the button) |
| Interaction completed | Ensures practice happens (POST-MVP) |
| Manual confirmation | Student consciously acknowledges learning |

### Auto vs Manual Completion

**Option A: Auto only** — Lesson marked complete when content is consumed. Simpler but less intentional.

**Option B: Manual only** — Student must click "Complete." Simple but allows skipping content.

**Option C: Combined (RECOMMENDED)** — Both conditions required. Content consumption enables the "Complete" button. Best of both worlds.

---

## Module Progress

How is module progress calculated?

### Formula

```
Module Progress = (Completed Lessons in Module / Total Lessons in Module) × 100%
```

**Example:**
- Module has 5 lessons
- Student completed 3
- Module progress = 60%

### Display

- Progress bar showing percentage
- "3 of 5 lessons completed"
- Visual indicators on each lesson (checkmark for complete, empty for incomplete)

---

## Course Progress

How is course progress calculated?

### Formula

```
Course Progress = (Total Completed Lessons across all Modules / Total Lessons in Course) × 100%
```

**Example:**
- Course has 3 modules: 5 + 4 + 6 = 15 lessons total
- Student completed: 5 in Module 1, 2 in Module 2, 0 in Module 3
- Course progress = (5 + 2 + 0) / 15 = 46.7%

### Display

- Progress bar in dashboard
- Percentage in course card
- Detailed breakdown per module

---

## How Exercises Affect Progress (POST-MVP)

Exercises are programming assignments. They affect progress differently than lessons.

### Exercise Completion

An exercise is "completed" when:
1. Student has submitted a solution
2. Instructor has reviewed and approved it (or auto-graded passing)

### Effect on Progress

- Exercise completion counts toward module progress
- Each exercise is worth the same as a lesson (1 unit)
- Module progress includes both lessons and exercises

**Example:**
- Module has 3 lessons + 2 exercises = 5 units
- Student completed 3 lessons + 1 exercise = 4 units
- Module progress = 80%

---

## How Quizzes Affect Progress (POST-MVP)

Quizzes are assessments. They have different completion criteria.

### Quiz Completion

A quiz is "completed" when:
1. Student has submitted answers
2. Quiz has been graded (auto or manual)
3. Student has achieved passing score (if required)

### Effect on Progress

- Quiz completion counts toward module progress
- Quiz counts as one unit (same as a lesson)
- Passing score required for "completion" (configurable threshold)

**Exception:** Practice quizzes (no grade required) count as complete upon submission.

---

## Progress Data Model (Functional)

For each student-course pair, we track:

- **Lesson completions** — Which lessons are marked complete, with timestamps
- **Video progress** — Per-video: current position, percentage watched
- **Exercise status** — Per exercise: submitted, reviewed, grade (POST-MVP)
- **Quiz scores** — Per quiz: attempt history, best score, pass/fail (POST-MVP)
- **Overall course progress** — Calculated percentage
- **Last activity timestamp** — When student last engaged with course

---

## Can Progress Go Backwards?

### Normal Case: No

Once a lesson is marked complete, it stays complete. Students don't "uncomplete" lessons.

### Exceptions

1. **Instructor removes a lesson** — If instructor deletes a lesson that was marked complete, that unit disappears from the student's progress. Overall percentage may change.

2. **Instructor modifies course structure** — Adding/removing lessons changes the denominator. Progress percentage recalculates.

3. **Admin intervention** — Admin can reset student progress (rare, for特殊情况).

**Principle:** Progress is additive for students, but the denominator can change when instructors modify the course.

---

## Progress Display Locations

### Student Dashboard
- Overall progress per enrolled course
- Last activity date
- Quick access to continue where they left off

### Course Player
- Current module progress
- Current lesson status
- Visual breadcrumb (which lessons complete)

### Course Detail Page (before enrollment)
- No individual progress shown
- General completion stats (average time to complete) — POST-MVP

### Instructor View
- Per-student progress in their courses
- Class-wide completion statistics
- Identify students who haven't engaged recently

---

## Progress Reset

When can progress be reset?

| Scenario | Who Can Reset | When |
|----------|--------------|------|
| Student wants to restart | Self | POST-MVP |
| Instructor wants student to redo | Instructor | POST-MVP |
| Admin needs to clear progress | Admin | POST-MVP |
| Course content changed significantly | System | Automatic recalculation |

**MVP:** No reset capability. Progress is permanent. This simplifies the model significantly.

---

## Streak and Motivation (POST-MVP)

Not in MVP, but the data model should support it.

- Daily learning streak
- Weekly goals
- Learning calendar heatmap
- Achievement badges

**Why mention it?** The progress data model must capture timestamps to support these features later. Design for it now, build it later.
