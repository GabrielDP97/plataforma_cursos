# API Functional Boundaries

Domains of responsibility for the platform's internal services. Not endpoints, not implementation — functional boundaries.

---

## What Are API Boundaries?

API boundaries define **what** the system can do, not **how**. Each boundary represents a cohesive domain of functionality.

These boundaries exist to:
- Clarify responsibilities
- Prevent feature coupling
- Guide development phases
- Define integration points
- Establish security contexts

---

## Authentication Boundary

**Responsibility:** Identity, access, session management.

**Functional capabilities:**
- User registration
- Login/logout
- Password management
- Session management
- Token generation/refresh
- Email verification
- Role verification

**Key concepts:**
- User identity
- Credentials
- Sessions
- Tokens
- Permissions

**Security context:** All other boundaries depend on this. Authentication must be solid before anything else works.

---

## Users Boundary

**Responsibility:** User profiles, roles, preferences.

**Functional capabilities:**
- View user profile
- Update user profile
- Upload avatar
- Change user role (admin only)
- Disable/enable user (admin only)
- View user activity
- Manage notification preferences (POST-MVP)

**Key concepts:**
- User profile
- Role (student/instructor/admin)
- Preferences
- Activity history

**Relationships:** Depends on Authentication. Used by all other boundaries.

---

## Courses Boundary

**Responsibility:** Course lifecycle — creation, management, publishing.

**Functional capabilities:**
- Create course
- Edit course details
- Delete course
- Publish/unpublish course
- Archive course
- List courses (catalog)
- Search courses
- Get course details
- Get course syllabus (modules/lessons)

**Key concepts:**
- Course
- Category
- Difficulty level
- Status (draft/published/archived)
- Syllabus

**Relationships:** Uses Users (instructor). Used by Enrollments, Content, Progress.

---

## Content Boundary

**Responsibility:** Course content structure and delivery.

**Functional capabilities:**
- Create/edit/delete modules
- Create/edit/delete lessons
- Reorder modules
- Reorder lessons
- Create/edit/delete content blocks
- Upload videos
- Upload files
- Upload images
- Preview content

**Key concepts:**
- Module
- Lesson
- Content block
- Video
- Resource
- Content type

**Relationships:** Uses Courses. Used by Progress, Assessments.

---

## Enrollments Boundary

**Responsibility:** Student enrollment in courses.

**Functional capabilities:**
- Enroll student in course
- Unenroll student from course
- Check enrollment status
- List enrolled students (instructor)
- List enrolled courses (student)
- Verify enrollment (for content access)

**Key concepts:**
- Enrollment
- Enrollment status
- Free vs paid enrollment

**Relationships:** Uses Users, Courses. Used by Progress, Content access.

---

## Progress Boundary

**Responsibility:** Tracking student learning progress.

**Functional capabilities:**
- Mark lesson as complete
- Track video progress
- Calculate module progress
- Calculate course progress
- Get student's overall progress
- Get lesson completion status
- Get video watching status

**Key concepts:**
- Lesson progress
- Video progress
- Module progress (calculated)
- Course progress (calculated)
- Completion criteria

**Relationships:** Uses Enrollments, Content. Used by Certificates, Analytics.

---

## Assessments Boundary (POST-MVP)

**Responsibility:** Exercises and quizzes.

**Functional capabilities:**
- Create/edit/delete exercises
- Create/edit/delete quizzes
- Submit exercise solution
- Review submission (instructor)
- Take quiz
- Auto-grade quiz
- Get quiz results
- Get exercise feedback

**Key concepts:**
- Exercise
- Submission
- Quiz
- Question
- Answer
- Attempt
- Grade

**Relationships:** Uses Content, Enrollments. Uses Progress (affects completion).

---

## Classes Boundary (POST-MVP)

**Responsibility:** Live class scheduling and management.

**Functional capabilities:**
- Schedule live class
- Edit/cancel live class
- Start live class
- End live class
- Record live class
- Track attendance
- Get class recordings
- Join live class

**Key concepts:**
- LiveClass
- Session
- Attendance
- Recording
- Meeting link

**Relationships:** Uses Courses, Users. Uses Notifications (reminders).

---

## Notifications Boundary

**Responsibility:** Alerting users to platform events.

**Functional capabilities:**
- Create notification
- Send notification
- Mark notification as read
- Get user notifications
- Get unread count
- Configure notification preferences (POST-MVP)

**Key concepts:**
- Notification
- Notification type
- Read status
- Delivery channel (in-app, email)

**Relationships:** Uses Users. Triggered by all other boundaries.

---

## Files Boundary

**Responsibility:** File storage, retrieval, access control.

**Functional capabilities:**
- Upload file
- Download file
- Delete file
- Get file metadata
- Check file access permissions
- Generate signed URL (temporary access)

**Key concepts:**
- File
- File type
- File size
- Access control
- Signed URL

**Relationships:** Used by Content, Assessments, Courses.

---

## Search Boundary

**Responsibility:** Finding content across the platform.

**Functional capabilities:**
- Search courses
- Search within course content (POST-MVP)
- Search users (admin)
- Filter by category
- Filter by difficulty
- Full-text search (POST-MVP)

**Key concepts:**
- Search query
- Search results
- Relevance ranking
- Filters

**Relationships:** Uses Courses, Content, Users.

---

## Analytics Boundary (POST-MVP)

**Responsibility:** Platform and course analytics.

**Functional capabilities:**
- Get platform overview (admin)
- Get course analytics (instructor)
- Get student analytics
- Get enrollment trends
- Get completion rates
- Export data

**Key concepts:**
- Metrics
- Trends
- Reports
- Dashboards

**Relationships:** Uses all other boundaries for data aggregation.

---

## Payments Boundary (POST-MVP)

**Responsibility:** Financial transactions and revenue.

**Functional capabilities:**
- Process payment
- Handle refund
- Calculate commission
- Generate invoice
- Track transactions
- Process payouts (instructor)

**Key concepts:**
- Transaction
- Payment method
- Commission
- Payout
- Refund

**Relationships:** Uses Enrollments, Users. Used by Courses (paid courses).

---

## Boundary Dependencies

```
Authentication
    ↓
Users
    ↓
Courses ← Categories
    ↓
Content (Modules, Lessons, Blocks)
    ↓
Enrollments
    ↓
Progress ← Assessments (POST-MVP)
    ↓
Notifications
    ↓
Analytics
```

**Key principle:** Boundaries are loosely coupled. Changes in one shouldn't break others. Dependencies flow downward.

---

## MVP Boundaries

| Boundary | MVP | Notes |
|----------|-----|-------|
| Authentication | YES | Must be solid |
| Users | YES | Basic profiles |
| Courses | YES | Core functionality |
| Content | YES | Essential for learning |
| Enrollments | YES | Core functionality |
| Progress | YES | Motivation and tracking |
| Notifications | YES | User awareness |
| Files | YES | Content delivery |
| Search | YES | Discovery |
| Assessments | NO | POST-MVP |
| Classes | NO | POST-MVP |
| Analytics | NO | POST-MVP |
| Payments | NO | POST-MVP |

---

## Integration Points

### External Service Boundaries

| Service | Purpose | MVP |
|---------|---------|-----|
| Email Service | Transactional emails | YES |
| File Storage | Video and file hosting | YES |
| Video Hosting | Video streaming | YES |
| Payment Provider | Financial transactions | NO (POST-MVP) |
| Analytics | External analytics (e.g., GA) | NO (POST-MVP) |
| AI Services | AI-powered features | NO (FUTURE) |
| Live Video | Real-time video | NO (POST-MVP) |
| Calendar | External calendar sync | NO (POST-MVP) |
