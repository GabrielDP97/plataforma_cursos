# Quiz System

Assessment through structured questions. Complementary to programming exercises.

---

## Question Types

### MVP Question Types

| Type | Description | Auto-gradable |
|------|-------------|---------------|
| **Multiple Choice** | Select one correct answer from options | YES |
| **True/False** | Select true or false | YES |
| **Multiple Response** | Select multiple correct answers from options | YES |
| **Short Text** | Type a short answer (keyword match) | YES (basic) |

### POST-MVP Question Types

| Type | Description | Auto-gradable |
|------|-------------|---------------|
| **Code Question** | Write code to solve a problem | YES (with sandbox) |
| **Fill in the Blank** | Complete a sentence or code snippet | YES |
| **Matching** | Match items from two columns | YES |
| **Ordering** | Put items in correct order | YES |
| **Essay** | Long-form written answer | NO (manual review) |

### Why Start with Auto-gradable Types?

- Scalable (no manual grading)
- Instant feedback for students
- Instructors can focus on content, not grading
- Reduces instructor workload

---

## Quiz Structure

### Quiz Entity

A quiz belongs to a lesson or module. It's a container for questions.

**Fields:**
- Title
- Description/instructions
- Time limit (optional) — POST-MVP
- Maximum attempts (default: unlimited)
- Passing score (percentage)
- Shuffle questions (yes/no)
- Show answers after submission (yes/no)
- Show correct answers (yes/no) — POST-MVP
- Due date (optional) — POST-MVP

### Question Entity

A question belongs to a quiz.

**Fields:**
- Question text (rich text)
- Question type (multiple choice, true/false, etc.)
- Order position
- Points value (default: 1)
- Explanation (shown after submission) — POST-MVP

### Answer Entity

An answer belongs to a question. For multiple choice/response, each option is an answer.

**Fields:**
- Answer text
- Is correct (yes/no)
- Order position
- Feedback (per-answer feedback) — POST-MVP

---

## Quiz Flow

### Student Experience

1. **Open quiz** — See title, instructions, question count
2. **Answer questions** — Navigate through questions
3. **Submit quiz** — Confirm submission
4. **See results** — Score, pass/fail, which questions correct/incorrect
5. **Review answers** — See correct answers (if enabled)

### Instructor Experience

1. **Create quiz** — Add title, instructions, settings
2. **Add questions** — Choose type, write question, add answers
3. **Set correct answers** — Mark which answers are correct
4. **Preview quiz** — See it as student would
5. **View results** — See class performance per quiz
6. **View individual attempts** — See specific student's answers

---

## Quiz Attempts

### Attempt Rules

- **Maximum attempts** — Configurable per quiz (1, 3, 5, unlimited)
- **Best score counts** — If multiple attempts allowed, best score is recorded
- **Attempt history** — Student can see all their attempts
- **Time between attempts** — POST-MVP: Optional cooldown period

### Attempt Data

Each attempt records:
- Start time
- End time
- Questions answered
- Answers given
- Score
- Pass/fail

---

## Scoring

### Score Calculation

```
Score = (Points earned / Total points possible) × 100%
```

**Example:**
- Quiz has 10 questions, each worth 1 point
- Student answered 7 correctly
- Score = 70%

### Weighted Questions

POST-MVP: Questions can have different point values.

**Example:**
- 5 easy questions × 1 point = 5 points
- 3 medium questions × 2 points = 6 points
- 2 hard questions × 3 points = 6 points
- Total: 17 points

### Passing Score

- Configurable per quiz (default: 70%)
- Student sees pass threshold before starting
- Pass/fail clearly indicated in results

---

## Feedback

### Immediate Feedback (MVP)

After submission:
- Overall score
- Pass/fail status
- Which questions correct/incorrect
- Correct answers (if enabled)

### Detailed Feedback (POST-MVP)

- Per-question explanation
- Why correct answer is correct
- Links to relevant lesson content
- Suggested review topics

### Instructor Feedback (POST-MVP)

- Instructor can add custom feedback per attempt
- For essay/code questions requiring manual review

---

## Quiz Security

### MVP Security

- Questions shuffled (optional)
- One attempt at a time (no opening quiz in multiple tabs)
- Submit button requires confirmation

### POST-MVP Security

- Time limits
- Browser lockdown (POST-MVP)
- IP logging
- Plagiarism detection for text answers (FUTURE)

---

## Quiz in Course Context

### Where Quizzes Appear

- **Within a lesson** — End-of-lesson quiz to check understanding
- **Within a module** — Module assessment after all lessons
- **Standalone** — Practice quiz not tied to specific lesson

### How Quizzes Affect Progress

- Quiz completion counts toward module/course progress
- Passing score required for "completion" (configurable)
- Failed attempt still counts as an attempt (instructor can see effort)

---

## Quiz Analytics (POST-MVP)

### Per Quiz

- Average score
- Score distribution (histogram)
- Most missed questions
- Average time to complete
- Attempt count

### Per Student

- Quiz history across courses
- Improvement over time
- Strengths/weaknesses by topic

---

## MVP Quiz Scope

### What's in MVP

- Multiple choice questions
- True/false questions
- Multiple response questions
- Basic short text questions (exact match)
- Create/edit/delete quizzes
- Add/remove/reorder questions
- Set correct answers
- Student takes quiz
- Auto-grading
- Score display
- Pass/fail indicator
- Attempt tracking

### What's NOT in MVP

- Time limits
- Code questions
- Essay questions
- Detailed feedback/explanations
- Quiz analytics
- Question banks (reusable across quizzes)
- Random question selection from pool
- Question difficulty tagging
- Adaptive quizzes

---

## Question Banks (POST-MVP)

Not in MVP, but design for it.

**Concept:** A pool of questions that can be reused across quizzes. When creating a quiz, instructor selects questions from a bank or creates new ones.

**Why it matters:** Instructors teaching multiple courses or sections can reuse questions. Saves time, ensures consistency.

**Design consideration:** Questions should be entities that can exist independently of quizzes. This allows bank functionality later without restructuring.
