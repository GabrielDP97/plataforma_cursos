# MVP Definition

THE MOST IMPORTANT DOCUMENT.

Classify EVERY feature. Be CRITICAL. The MVP must be genuinely buildable.

---

## Classification Guide

| Category | Definition |
|----------|------------|
| **MUST HAVE** | Without this, the platform doesn't work. Non-negotiable. |
| **SHOULD HAVE** | Important but not blocking. MVP if time permits, or early POST-MVP. |
| **LATER** | Valuable but not essential for first launch. |
| **NOT RECOMMENDED** | Too complex, risky, or premature. Don't build initially. |

---

## Features

### Authentication & Users

| Feature | Classification | Justification |
|---------|---------------|---------------|
| User registration (email/password) | MUST HAVE | Users can't use platform without accounts |
| Login/logout | MUST HAVE | Core access |
| Password reset | MUST HAVE | Account recovery essential |
| Email verification | SHOULD HAVE | Prevents fake accounts, but platform works without |
| User profiles (name, avatar) | SHOULD HAVE | Basic identity, but not blocking |
| Social login (Google, GitHub) | LATER | Reduces friction, but email/password works |
| Profile editing | LATER | Can update later |
| Account deletion | LATER | Not day-one critical |
| Two-factor authentication | LATER | Security enhancement, not MVP |

### User Roles

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Student role | MUST HAVE | Core user type |
| Instructor role | MUST HAVE | Content creation requires this |
| Admin role | MUST HAVE | Platform management requires this |
| Role-based access control | MUST HAVE | Security foundation |
| Role management (admin) | MUST HAVE | Admin must be able to assign roles |

### Course Management

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Create course | MUST HAVE | Core instructor function |
| Edit course details | MUST HAVE | Course management |
| Delete course | MUST HAVE | Course management |
| Publish/unpublish course | MUST HAVE | Control visibility |
| Course categories | SHOULD HAVE | Organization helps discovery |
| Course thumbnail | SHOULD HAVE | Visual identification |
| Course description | MUST HAVE | Students need to know what course is about |
| Course difficulty level | LATER | Nice for filtering, not essential |
| Course duration estimate | LATER | Nice to have, not essential |
| Duplicate course | LATER | Efficiency feature |
| Archive course | LATER | Can just delete |
| Featured courses (admin) | LATER | Curation, not essential |

### Content Structure

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Create/edit/delete modules | MUST HAVE | Course structure requires this |
| Create/edit/delete lessons | MUST HAVE | Course structure requires this |
| Reorder modules | MUST HAVE | Structure matters |
| Reorder lessons | MUST HAVE | Structure matters |
| Lesson types (text, video, mixed) | MUST HAVE | Content variety |
| Module description | LATER | Nice but not essential |
| Lesson estimated duration | LATER | Nice but not essential |
| Section/Chapter/Unit (extra hierarchy) | NOT RECOMMENDED | Adds complexity, not value |

### Content Blocks

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Rich text blocks | MUST HAVE | Primary content delivery |
| Code snippet blocks | MUST HAVE | Programming platform must show code |
| Video blocks | MUST HAVE | Primary content type |
| Image blocks | MUST HAVE | Visual content essential |
| File download blocks | MUST HAVE | Supporting materials essential |
| External link blocks | SHOULD HAVE | Reference materials helpful |
| Embedded content blocks | LATER | Rich content, not essential |
| Block reordering | MUST HAVE | Content composition requires this |
| Block deletion | MUST HAVE | Content editing requires this |

### Video

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Video upload | MUST HAVE | Primary content type |
| Video playback | MUST HAVE | Core viewing experience |
| Video progress tracking | SHOULD HAVE | Motivation and resume |
| Resume from last position | SHOULD HAVE | Essential for long videos |
| Video completion detection | SHOULD HAVE | Progress tracking depends on this |
| Playback speed control | LATER | Nice to have |
| Subtitles | LATER | Accessibility, not MVP |
| Quality selection | LATER | Adaptive streaming sufficient |
| Picture-in-picture | LATER | Convenience feature |
| Video thumbnails (auto-generated) | SHOULD HAVE | Visual identification |

### Files & Resources

| Feature | Classification | Justification |
|---------|---------------|---------------|
| File upload (instructor) | MUST HAVE | Course materials require this |
| File download (student) | MUST HAVE | Students need materials |
| File metadata (name, size, type) | MUST HAVE | Identification |
| File access control | MUST HAVE | Security: enrolled only |
| Folder organization | LATER | Logical organization, not essential |
| File versioning | LATER | Not day-one critical |
| Download tracking | LATER | Analytics, not essential |
| Bulk download (ZIP) | LATER | Convenience feature |

### Enrollment

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Enroll in free courses | MUST HAVE | Core functionality |
| Enrollment verification | MUST HAVE | Security foundation |
| View enrolled courses | MUST HAVE | Students need to see what they're taking |
| Unenroll from course | LATER | Can just stop, not critical |
| Enrollment confirmation email | SHOULD HAVE | Nice feedback loop |
| Enroll in paid courses | LATER | Payments are POST-MVP |

### Progress Tracking

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Mark lesson as complete | MUST HAVE | Progress tracking foundation |
| View course progress (%) | MUST HAVE | Motivation and tracking |
| View module progress | SHOULD HAVE | Granular progress view |
| Video progress tracking | SHOULD HAVE | Resume and completion |
| Progress persistence | MUST HAVE | Progress must survive logout |
| Progress dashboard | SHOULD HAVE | Overview of all courses |
| Completion percentage calculation | MUST HAVE | Core progress metric |
| Streak tracking | LATER | Motivation, not essential |
| Learning history | LATER | Analytics, not essential |

### Course Player

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Lesson content viewer | MUST HAVE | Core learning experience |
| Module/lesson navigation | MUST HAVE | Course navigation |
| Previous/next lesson | MUST HAVE | Sequential learning |
| Sidebar lesson list | SHOULD HAVE | Overview of course structure |
| Progress indicator in player | SHOULD HAVE | Visual feedback |
| Continue where left off | SHOULD HAVE | Resume experience |
| Fullscreen mode | LATER | Convenience |
| Keyboard shortcuts | LATER | Power user feature |

### Notifications

| Feature | Classification | Justification |
|---------|---------------|---------------|
| In-app notifications | MUST HAVE | User awareness |
| Notification center | MUST HAVE | Centralized view |
| Unread count badge | MUST HAVE | Visual indicator |
| Mark as read | MUST HAVE | Notification management |
| Email notifications (transactional) | MUST HAVE | Account management essential |
| Notification preferences | LATER | User control, not essential |
| Push notifications | LATER | Mobile feature |
| Notification templates | LATER | Admin customization |

### Announcements

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Create announcement (instructor) | MUST HAVE | Core instructor-to-student communication |
| View announcements (student) | MUST HAVE | Student receives communication |
| Announcement list per course | SHOULD HAVE | Historical view |
| Rich text announcements | SHOULD HAVE | Formatting for clarity |
| File attachment in announcements | LATER | Nice to have |

### Instructor Tools

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Instructor dashboard | MUST HAVE | Overview of courses and students |
| View enrolled students | MUST HAVE | Know who's learning |
| View student progress | MUST HAVE | Understand engagement |
| Student list with enrollment date | SHOULD HAVE | Basic student overview |
| Course analytics (enrollment, completion) | LATER | Business intelligence |
| Student communication | LATER | Can use announcements |
| Content preview (as student) | SHOULD HAVE | Quality assurance |

### Admin Tools

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Admin dashboard | MUST HAVE | Platform overview |
| User management (list, search) | MUST HAVE | Oversight |
| User role management | MUST HAVE | Access control |
| Disable/enable users | MUST HAVE | Account control |
| Course management (list, search) | MUST HAVE | Oversight |
| Platform settings (name, logo) | MUST HAVE | Branding |
| Category management | SHOULD HAVE | Organization |
| User activity logs | LATER | Audit trail |
| Content moderation | LATER | Community safety |
| Platform analytics | LATER | Business intelligence |
| Email template management | LATER | Communication config |
| API key management | LATER | Integrations |

### Search & Discovery

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Course search (keyword) | MUST HAVE | Core discovery |
| Search results page | MUST HAVE | Display results |
| Category filtering | SHOULD HAVE | Refine discovery |
| Difficulty filtering | LATER | Nice refinement |
| Sort options | LATER | Nice refinement |
| Featured courses | LATER | Curation |
| Recommendations | LATER | AI-powered, far future |

### Exercises (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Create exercise (instructor) | LATER | Not in MVP |
| Download exercise files (student) | LATER | Not in MVP |
| Submit solution (student) | LATER | Not in MVP |
| Review submission (instructor) | LATER | Not in MVP |
| Provide feedback (instructor) | LATER | Not in MVP |
| Code editor (in-platform) | LATER | POST-MVP Phase 2 |
| Code execution | LATER | POST-MVP Phase 3 |
| Auto-grading | LATER | POST-MVP Phase 4 |

### Quizzes (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Create quiz (instructor) | LATER | Not in MVP |
| Add questions | LATER | Not in MVP |
| Take quiz (student) | LATER | Not in MVP |
| Auto-grading | LATER | Not in MVP |
| View results | LATER | Not in MVP |
| Multiple choice questions | LATER | Not in MVP |
| True/false questions | LATER | Not in MVP |
| Code questions | LATER | POST-MVP Phase 2 |

### Live Classes (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Schedule live class | LATER | Not in MVP |
| Join live class | LATER | Not in MVP |
| Live video | LATER | Not in MVP |
| Live chat | LATER | Not in MVP |
| Screen sharing | LATER | Not in MVP |
| Recordings | LATER | Not in MVP |
| Attendance tracking | LATER | Not in MVP |

### Calendar (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Calendar view | LATER | No events to show in MVP |
| Event creation | LATER | Not in MVP |
| Deadline tracking | LATER | Not in MVP |
| External calendar sync | LATER | Not in MVP |

### Comments & Discussion (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Lesson comments | LATER | Not in MVP |
| Threaded replies | LATER | Not in MVP |
| Course discussion forum | LATER | Not in MVP |
| Comment moderation | LATER | Not in MVP |

### Direct Messages (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Direct messaging | LATER | Not in MVP |
| Message history | LATER | Not in MVP |
| Read receipts | LATER | Not in MVP |

### Payments (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Process payment | LATER | Not in MVP |
| Course pricing | LATER | Not in MVP |
| Subscription model | LATER | Not in MVP |
| Coupons | LATER | Not in MVP |
| Instructor payouts | LATER | Not in MVP |
| Refunds | LATER | Not in MVP |
| Revenue dashboard | LATER | Not in MVP |

### Certificates (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Certificate generation | LATER | Not in MVP |
| PDF download | LATER | Not in MVP |
| Certificate verification | LATER | Not in MVP |
| Shareable link | LATER | Not in MVP |

### Analytics (POST-MVP)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| Course analytics | LATER | Not in MVP |
| Student analytics | LATER | Not in MVP |
| Platform analytics | LATER | Not in MVP |
| Data export | LATER | Not in MVP |

### AI Features (FUTURE)

| Feature | Classification | Justification |
|---------|---------------|---------------|
| AI course assistant | NOT RECOMMENDED | Too early, no data |
| AI code review | NOT RECOMMENDED | Too early, no data |
| Learning recommendations | NOT RECOMMENDED | Too early, no data |
| Semantic search | NOT RECOMMENDED | Too early, no data |
| AI quiz generation | NOT RECOMMENDED | Too early, no data |

---

## MVP Summary

### MUST HAVE (15 features)

1. User registration and login
2. Password reset
3. Student, Instructor, Admin roles
4. Role-based access control
5. Course CRUD
6. Module and lesson management
7. Content blocks (text, code, video, image, file)
8. Video upload and playback
9. File upload and download
10. Free course enrollment
11. Progress tracking (lesson completion, course progress)
12. Course player with navigation
13. Notifications (in-app, email)
14. Announcements
15. Basic search

### SHOULD HAVE (12 features)

1. Email verification
2. User profiles
3. Course categories
4. Course thumbnails
5. Video progress tracking
6. Video completion detection
7. Module progress view
8. Progress dashboard
9. Enrollment confirmation email
10. Instructor dashboard
11. Student list and progress view
12. Content preview

### LATER (40+ features)

Everything else. Exercises, quizzes, live classes, calendar, comments, messages, payments, certificates, analytics, AI — all POST-MVP or later.

### NOT RECOMMENDED INITIALLY (5 features)

1. AI features
2. Code editor (in-platform)
3. Code execution
4. Multi-tenancy
5. Extra content hierarchy (sections, chapters, units)

---

## MVP Buildability Check

### Can We Build This in 3-6 Months?

**YES.** The MUST HAVE list is genuinely minimal:

- Authentication: Standard, well-understood
- Course management: CRUD operations
- Content delivery: Rendering content blocks
- Video: Upload and basic player
- Files: Upload and download
- Enrollment: Simple free enrollment
- Progress: Completion tracking
- Notifications: Basic alerts
- Search: Keyword search

None of these are technically novel. All are well-understood problems with proven solutions.

### What We're NOT Building

- Real-time features (live classes, chat)
- Payment processing
- Assessment system
- Code execution
- AI features
- Complex analytics
- Mobile apps

This is a focused, achievable MVP.

---

## Post-MVP Priority

### Phase 1 POST-MVP: Assignments
- Exercise creation
- Student submission
- Instructor review
- Manual feedback

### Phase 2 POST-MVP: Quizzes
- Quiz creation
- Auto-grading
- Score tracking
- Attempt management

### Phase 3 POST-MVP: Communication
- Comments
- Discussion forum
- Direct messages

### Phase 4 POST-MVP: Live Classes (Basic)
- Scheduling
- External tool integration
- Attendance tracking

### Phase 5 POST-MVP: Payments
- One-time purchase
- Transaction management
- Basic payouts

### Phase 6 POST-MVP: Certificates
- Completion certificates
- PDF generation
- Verification

### Phase 7 POST-MVP: Calendar
- Event management
- Deadline tracking

### Phase 8 POST-MVP: Analytics
- Course analytics
- Student analytics

### Phase 9 POST-MVP: Code Editor
- In-platform editor
- Basic code execution

### Phase 10 FUTURE: AI
- Course assistant
- Code review
- Recommendations
