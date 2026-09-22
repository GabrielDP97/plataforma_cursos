# Calendar System

Time-based organization for students and instructors.

---

## What the Calendar Shows

The calendar is a unified view of all time-based events for a user.

### Student Calendar Shows

- Enrolled course deadlines (assignments, quizzes)
- Upcoming live classes (if implemented)
- Course start/end dates
- Personal reminders (POST-MVP)

### Instructor Calendar Shows

- Scheduled live classes (if implemented)
- Assignment review deadlines
- Course publishing dates
- Personal reminders (POST-MVP)

---

## Calendar Data Model

### Event Types

| Type | Description | MVP |
|------|-------------|-----|
| **Live Class** | Scheduled live session | POST-MVP (no live classes in MVP) |
| **Assignment Due** | Deadline for exercise submission | POST-MVP (no assignments in MVP) |
| **Quiz Due** | Deadline for quiz completion | POST-MVP (no quizzes in MVP) |
| **Course Event** | Custom event added by instructor | POST-MVP |
| **Reminder** | Personal reminder set by user | POST-MVP |

### MVP Calendar: Empty

**MVP has no events to show.** Without live classes, assignments, and quizzes, there's nothing time-based to put on a calendar.

**MVP alternative:** Instead of a calendar, show a "Continue Learning" dashboard with last accessed courses and next lesson.

---

## Calendar Views

### Month View
- Full month grid
- Events shown as dots or bars on dates
- Click date to see details

### Week View
- 7-day grid with time slots
- Events shown as blocks
- Useful for scheduling live classes

### Agenda View
- List of upcoming events sorted by date
- Most useful for students
- Shows event details inline

---

## Calendar Interactions

### Student

- View upcoming events
- Click event for details
- Navigate to related content (e.g., click assignment → go to exercise)
- Set personal reminders — POST-MVP
- Subscribe to calendar feed (iCal) — POST-MVP

### Instructor

- View scheduled classes
- Create new events (POST-MVP: custom course events)
- Edit/delete events
- View who's attending (for live classes) — POST-MVP

---

## Calendar Notifications

### MVP Notifications

Since there are no calendar events in MVP, there are no calendar notifications.

### POST-MVP Notifications

- Email reminder before event (24h, 1h)
- In-app notification
- Push notification (if mobile)
- Configurable per event type

---

## Calendar Integration (POST-MVP)

### External Calendar Sync

- Export to Google Calendar
- Export to Apple Calendar
- Export to Outlook
- iCal feed URL

### Why This Matters

Students and instructors already use external calendars. Integration means:
- Events appear alongside other commitments
- Notifications work through existing calendar apps
- No need to check platform calendar separately

---

## MVP Alternative: Simple Dashboard

Instead of a full calendar, MVP shows:

**Student Dashboard:**
- Last accessed course
- Continue button (goes to last lesson)
- Course progress cards
- "Next up" suggestion

**Instructor Dashboard:**
- Total students enrolled
- Recent activity
- Courses overview

This provides the "what should I do next" value without calendar complexity.

---

## Calendar in Course Context

### Per Course

Instructors can add course-specific events:

- "Assignment due: Week 1 Exercise"
- "Live class: Q&A Session"
- "Quiz available: Module 2 Assessment"

### Per Student

Students see events from all their enrolled courses merged into one view.

---

## Future: Smart Calendar

POST-MVP and FUTURE possibilities:

- **AI-suggested study times** — Based on student's schedule and progress
- **Deadline risk detection** — "You have 3 assignments due this week"
- **Progress-based scheduling** — "Complete Module 2 by Friday to stay on track"
- **Group study sessions** — Coordinate with other students
- **Instructor office hours** — Available time slots for 1:1 help

---

## MVP Recommendation: NO CALENDAR

**Calendar should not be in MVP. Here's why:**

### Reason 1: No Events to Show

Without live classes, assignments, and quizzes, there are no time-based events. An empty calendar is worse than no calendar.

### Reason 2: Dashboard is Simpler

A "Continue Learning" dashboard provides the same "what's next" value with less complexity.

### Reason 3: Calendar Adds No Value Without Events

A calendar is a container. If there's nothing to put in it, it's just empty UI.

### When to Add Calendar

Add calendar when:
1. Assignments with deadlines exist (POST-MVP)
2. Live classes are implemented (POST-MVP)
3. Quizzes have due dates (POST-MVP)
4. There's actually something to show

---

## Calendar Technical Considerations

When calendar is eventually built:

- **Time zones** — Events must respect user's time zone
- **Recurring events** — Weekly classes, daily reminders
- **Conflict detection** — Don't schedule overlapping classes
- **Bulk operations** — Create events for entire course at once
- **API access** — External calendar integration requires API
