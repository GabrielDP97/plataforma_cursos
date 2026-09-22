# Communication

How people talk to each other on the platform.

---

## Communication Types

### 1. Announcements

**Direction:** Instructor → Students (one-way)

**What:** Broadcast messages from instructor to all students in a course.

**Use cases:**
- "New module available"
- "Assignment deadline extended"
- "Live class rescheduled"
- "Important update about the course"

**MVP: YES** — Critical for instructor-student communication.

### 2. Comments

**Direction:** Students ↔ Instructor (many-to-many)

**What:** Discussion on specific lessons. Students ask questions, instructor and other students respond.

**Use cases:**
- "I don't understand step 3"
- "Is this the correct approach?"
- "Thanks, this helped!"
- Instructor clarifying a concept

**MVP: NO** — Can launch without comments. Add in POST-MVP.

### 3. Course Discussion

**Direction:** Students ↔ Students ↔ Instructor (many-to-many)

**What:** General forum for a course. Not tied to specific lessons.

**Use cases:**
- "Anyone else struggling with Module 3?"
- "Study group for final project"
- "Tips for the coding exercise"
- "Sharing resources I found helpful"

**MVP: NO** — Community feature. Add in POST-MVP.

### 4. Direct Messages

**Direction:** User ↔ User (one-to-one)

**What:** Private messages between any two users.

**Use cases:**
- Student asks instructor private question
- Instructor provides personal feedback
- Students collaborate on projects

**MVP: NO** — Can launch without DMs. Add in POST-MVP.

### 5. Class Chat

**Direction:** All participants in a live class (many-to-many)

**What:** Real-time text chat during live classes.

**MVP: NO** — Live classes not in MVP.

### 6. Notifications

**Direction:** Platform → User (one-way)

**What:** System-generated alerts about events.

**MVP: YES** — Critical for user awareness.

### 7. Email

**Direction:** Platform → User (one-way)

**What:** Email messages triggered by platform events.

**MVP: YES** — Account-related emails essential. Marketing emails POST-MVP.

---

## MVP Communication Scope

### What's in MVP

| Type | Description | Why MVP |
|------|-------------|---------|
| **Announcements** | Instructor → Students | Core communication |
| **Notifications** | Platform → User | User awareness |
| **Email (transactional)** | Platform → User | Account management |

### What's NOT in MVP

| Type | Description | Why Not MVP |
|------|-------------|-------------|
| **Comments** | Discussion on lessons | Can launch without |
| **Course Discussion** | General forum | Community feature |
| **Direct Messages** | Private messaging | Can launch without |
| **Class Chat** | Live class chat | No live classes |
| **Email (marketing)** | Promotional emails | Not essential |

---

## Announcements (MVP Detail)

### Instructor Creates Announcement

1. Go to course management
2. Click "New Announcement"
3. Write title and body (rich text)
4. Optional: attach file
5. Publish

### Student Receives Announcement

1. In-app notification badge
2. Announcement appears on course page
3. Email notification (optional, configurable)
4. Announcement persists (students can read later)

### Announcement Data

- Title
- Body (rich text)
- Course reference
- Author (instructor)
- Published at
- Read status per student

---

## Notifications (MVP Detail)

### Notification Types in MVP

| Trigger | Recipient | Content |
|---------|-----------|---------|
| New announcement | Enrolled students | "New announcement in [Course]" |
| Course published | Admin | "New course published: [Course]" |
| Student enrolled | Instructor | "[Student] enrolled in [Course]" |
| Account created | User | "Welcome to [Platform]" |
| Password reset | User | "Reset your password" |

### Notification Delivery

- **In-app** — Notification bell with badge count
- **Email** — For critical notifications (account, enrollment)
- **Push** — POST-MVP (mobile/web push)

### Notification Preferences

**MVP:** All notifications enabled, no user control.

**POST-MVP:** Users can toggle notification types on/off per channel.

---

## Email (MVP Detail)

### Transactional Emails

These are essential for the platform to function.

| Email | Trigger | Content |
|-------|---------|---------|
| Welcome | Registration | "Welcome to [Platform]" |
| Password Reset | Request | "Reset your password" |
| Enrollment Confirmation | Enrollment | "You enrolled in [Course]" |
| New Announcement | Announcement | "New announcement in [Course]" |

### Email Requirements

- Professional template with platform branding
- Mobile-responsive
- Unsubscribe link (required by law)
- Delivery tracking (POST-MVP)

---

## POST-MVP Communication

### Comments on Lessons

**When to add:** After core platform is stable. Comments create engagement but aren't essential.

**Features:**
- Threaded comments (replies to comments)
- Rich text formatting
- Code snippets in comments
- Instructor badge (distinguished from students)
- Comment notifications
- Moderation (instructor can delete)

### Course Discussion Forum

**When to add:** When community matters. Typically after 50+ active courses.

**Features:**
- Threaded discussions
- Categories (General, Help, Show & Tell)
- Upvoting answers
- Instructor marked answers
- Search

### Direct Messages

**When to add:** When students need private communication with instructors.

**Features:**
- One-on-one messaging
- Message history
- Read receipts — POST-MVP
- File attachments — POST-MVP
- Online status — FUTURE

---

## Communication Principles

1. **Announcements are broadcast** — Instructor writes once, all students see. No reply-all.
2. **Comments are contextual** — Tied to specific content. Relevant to that lesson.
3. **Discussion is community** — General, not tied to specific content. Builds community.
4. **DMs are private** — Sensitive or personal. Not for course content.
5. **Notifications are gentle** — Inform, don't annoy. Respect attention.

---

## Moderation

### MVP Moderation

- Instructors can delete announcements they created
- Admin can delete any announcement
- No comment moderation (no comments in MVP)

### POST-MVP Moderation

- Instructors moderate comments in their courses
- Admin moderates discussions
- Report button for inappropriate content
- Automated spam detection — FUTURE
- User blocking — FUTURE

---

## MVP Recommendation: MINIMAL COMMUNICATION

**MVP includes only:**
1. Announcements (instructor → students)
2. In-app notifications (system → user)
3. Transactional emails (system → user)

**Why this minimum?**
- Announcements are essential for course management
- Notifications keep users informed
- Transactional emails are legally required (account management)
- Everything else can wait until the platform has users who want to communicate
