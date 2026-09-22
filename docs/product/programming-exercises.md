# Programming Exercises

This is CENTRAL to the platform. A programming LMS without real programming exercises is just a video platform with extra steps.

---

## The 5 Levels of Programming Exercises

### Level 1: Statement + File Submission

**How it works:**
1. Instructor creates exercise with:
   - Problem statement (text)
   - Optional starter file (downloadable)
   - Optional reference file (downloadable)
2. Student downloads the statement and starter file
3. Student works on their own machine
4. Student uploads their solution (file or text)
5. Instructor manually reviews the submission
6. Instructor provides feedback

**Student experience:**
- "Download the problem"
- "Work on it in your IDE"
- "Upload your solution"
- "Wait for teacher to review"

**Instructor experience:**
- Creates exercise with description
- Reviews each submission manually
- Provides text feedback
- Can download student's file

**Pros:** Simple to build. Real-world workflow (developers work locally). No complex infrastructure.
**Cons:** No instant feedback. Manual instructor work. Students don't get immediate validation.

---

### Level 2: Integrated Code Editor

**How it works:**
Everything from Level 1, plus:
- Code editor embedded in the platform
- Student writes code directly in the browser
- Code is saved automatically
- Instructor can see student's code in real-time (optional)

**Student experience:**
- "Open the exercise"
- "Write code in the browser editor"
- "Save and submit"
- "See instructor feedback"

**Instructor experience:**
- Same as Level 1
- Can view student's code in browser
- Can see code history

**Pros:** No local setup required. Code is in the platform. Easier for instructor to review.
**Cons:** Editor integration is complex. Limited language support. Students can't use their preferred tools.

---

### Level 3: Run Code Within Platform

**How it works:**
Everything from Level 2, plus:
- Student can run their code in the browser
- Output displayed in console
- Basic execution in sandboxed environment
- Support for 2-3 popular languages initially

**Student experience:**
- "Write code"
- "Click Run"
- "See output"
- "Iterate until it works"

**Instructor experience:**
- Same as Level 2
- Can see student's code AND output

**Pros:** Immediate feedback. Students can verify their solution works. More engaging.
**Cons:** Execution environment is complex and risky. Security concerns. Resource-intensive.

---

### Level 4: Automatic Grading via Tests

**How it works:**
Everything from Level 3, plus:
- Instructor provides test cases (hidden from student)
- Student submits code
- Platform runs tests against student's code
- Pass/fail feedback per test case
- Score calculated automatically

**Student experience:**
- "Write code"
- "Submit"
- "See which tests passed/failed"
- "Iterate until all tests pass"

**Instructor experience:**
- Creates exercise with test cases
- System grades automatically
- Reviews exceptions and edge cases
- Monitors overall class performance

**Pros:** Instant feedback. Scalable. Objective grading. Students learn through testing.
**Cons:** Tests can be gamed. Limited to algorithmic problems. Complex to implement securely.

---

### Level 5: AI-Assisted Feedback

**How it works:**
Everything from Level 4, plus:
- AI analyzes student's code
- Provides feedback on code quality, style, efficiency
- Suggests improvements
- Explains why tests failed
- Offers alternative approaches

**Student experience:**
- "Write code"
- "Submit"
- "See test results AND AI suggestions"
- "Learn from feedback"

**Instructor experience:**
- Same as Level 4
- AI handles routine feedback
- Instructor focuses on complex cases

**Pros:** Personalized feedback at scale. Teaches code quality, not just correctness. Rich learning experience.
**Cons:** AI is expensive. Can be wrong. Requires careful implementation to avoid over-reliance.

---

## MVP Recommendation: Level 1

**Start with Level 1. Here's why:**

### Why Level 1 for MVP?

1. **Builds fast** — No editor integration, no execution environment, no sandboxing.
2. **Real workflow** — Students work in their own IDE, which is what they'll do in real jobs.
3. **Low risk** — No security concerns from code execution. No resource costs.
4. **Validates the model** — Before building complex infrastructure, verify that exercises add value.
5. **Instructor control** — Manual review ensures quality and catches edge cases.

### What to Build in MVP

**Instructor side:**
- Create exercise with rich text statement
- Upload starter file (optional)
- Upload reference/solution file (instructor only)
- View student submissions
- Download student's file
- Add text feedback
- Mark exercise as reviewed

**Student side:**
- View exercise statement
- Download starter file
- Upload solution (file or text)
- View submission status (pending/reviewed)
- View instructor feedback

### What NOT to Build in MVP

- Code editor (Level 2)
- Code execution (Level 3)
- Auto-grading (Level 4)
- AI feedback (Level 5)

---

## Phase Plan

### Phase 1 (MVP): Level 1
- Basic exercise creation and submission
- Manual instructor review
- File upload/download

### Phase 2 (POST-MVP): Level 2
- Integrated code editor
- Code saving in platform
- Real-time code viewing

### Phase 3 (POST-MVP): Level 3
- Code execution in browser
- Sandboxed environment
- Support for Python, JavaScript, maybe one more

### Phase 4 (POST-MVP): Level 4
- Test case system
- Automatic grading
- Score calculation

### Phase 5 (FUTURE): Level 5
- AI code review
- Style suggestions
- Learning recommendations

---

## Exercise Types

Even at Level 1, we can support different exercise types:

| Type | Description | MVP |
|------|-------------|-----|
| **File submission** | Student uploads a file | YES |
| **Text submission** | Student pastes code text | YES |
| **Multi-file submission** | Student uploads ZIP with multiple files | POST-MVP |
| **Screenshot/image** | Student uploads screenshot of output | POST-MVP |
| **Link submission** | Student submits link to external code (GitHub, etc.) | POST-MVP |

---

## Exercise Metadata

Each exercise has:

- Title
- Description (rich text)
- Difficulty (easy/medium/hard) — POST-MVP
- Estimated time to complete
- Starter file (optional)
- Reference/solution file (instructor only)
- Acceptance criteria (what "done" looks like)
- Due date (optional) — POST-MVP
- Maximum score (optional) — POST-MVP
- Order within module

---

## Exercise vs Quiz

| Aspect | Exercise | Quiz |
|--------|----------|------|
| Format | Open-ended, creative | Closed-ended, structured |
| Submission | File or code | Answers to questions |
| Grading | Manual review | Auto or manual |
| Feedback | Detailed text | Score + explanation |
| Learning | Build something | Demonstrate knowledge |
| When | After learning a skill | After learning a topic |

Both are important. Exercises for practice, quizzes for assessment.
