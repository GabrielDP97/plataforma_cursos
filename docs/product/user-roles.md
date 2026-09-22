# User Roles

Three distinct roles. Each has a clear, non-overlapping purpose. Capabilities classified as MVP, POST-MVP, or FUTURE.

---

## STUDENT

The learner. Primary consumer of content. The entire platform exists to serve this role.

### Account & Identity

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Register with email/password | MVP | Core access |
| Login/logout | MVP | Core access |
| Reset forgotten password | MVP | Essential for account recovery |
| Update profile (name, avatar, bio) | MVP | Basic personalization |
| Delete account | POST-MVP | GDPR compliance, not day-one critical |
| Social login (Google, GitHub) | POST-MVP | Reduces friction, but email/password works |

### Discovery & Enrollment

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Browse course catalog | MVP | How students find courses |
| Search courses by keyword | MVP | Core discovery |
| Filter courses by category/difficulty | POST-MVP | Useful but keyword search works initially |
| View course details (description, syllabus, instructor, preview) | MVP | Informed enrollment decision |
| Enroll in free courses | MVP | Core functionality |
| Enroll in paid courses | POST-MVP | Payments are POST-MVP |
| Unenroll from a course | POST-MVP | Students can just stop, not critical |
| View enrollment confirmation | MVP | Immediate feedback |

### Learning Experience

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Access enrolled course content | MVP | Core learning |
| Navigate modules and lessons | MVP | Core learning |
| Watch lesson videos | MVP | Primary content type |
| Download lesson files/resources | MVP | Essential for programming (starter code, etc.) |
| Read lesson text content | MVP | Multi-modal content |
| View lesson images | MVP | Part of content delivery |
| View code snippets in lessons | MVP | Programming platform must show code |
| Mark lesson as complete (manual) | MVP | Progress tracking |
| Track course progress (% complete) | MVP | Motivation and tracking |
| Track module progress | MVP | Granular progress |
| Resume video from last position | POST-MVP | Convenience feature |
| Track video viewing progress | POST-MVP | Automatic completion detection |

### Assessments

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Submit assignment (text/file) | POST-MVP | Can launch without assignments |
| Take quiz (multiple choice) | POST-MVP | Can launch without quizzes |
| View quiz results and scores | POST-MVP | Follows quiz implementation |
| View assignment feedback from instructor | POST-MVP | Follows assignment implementation |
| See all pending assignments | POST-MVP | Organization feature |

### Live Classes

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View scheduled live classes | POST-MVP | Not in MVP |
| Join live class session | POST-MVP | Not in MVP |
| View class recordings | POST-MVP | Not in MVP |
| View attendance history | FUTURE | Analytics after live classes mature |

### Communication

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Receive course announcements | MVP | Instructor-to-student communication |
| Comment on lessons | POST-MVP | Discussion and clarification |
| Ask questions on assignments | POST-MVP | Follows assignments |
| View notifications | MVP | Awareness of updates |
| Direct message instructor | POST-MVP | Communication channel |
| Participate in course discussion forum | FUTURE | Community feature |

### Progress & Completion

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View course completion progress | MVP | Motivation |
| View certificate upon completion | POST-MVP | Reward for completion |
| View learning history/dashboard | MVP | Personal overview |
| Download certificate | POST-MVP | Follows certificate generation |

### Calendar & Deadlines

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View upcoming classes | POST-MVP | Not in MVP |
| View assignment deadlines | POST-MVP | Not in MVP |
| Receive deadline reminders | POST-MVP | Not in MVP |

---

## INSTRUCTOR

The teacher. Creates and manages content. Guides student learning.

### Account & Access

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Login/logout | MVP | Core access |
| Update profile | MVP | Basic identity |
| Reset password | MVP | Account recovery |

### Course Management

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Create new course | MVP | Core instructor function |
| Edit course details (title, description, thumbnail) | MVP | Course management |
| Delete course | MVP | Course management |
| Publish/unpublish course | MVP | Control visibility |
| Set course as free/paid | POST-MVP | Payments are POST-MVP |
| Duplicate a course | POST-MVP | Efficiency feature |
| Archive a course | POST-MVP | Not day-one critical |

### Content Creation

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Create/edit/delete modules | MVP | Course structure |
| Create/edit/delete lessons | MVP | Course structure |
| Reorder modules and lessons | MVP | Organization |
| Add rich text content to lessons | MVP | Content creation |
| Upload videos to lessons | MVP | Primary content |
| Upload files to lessons | MVP | Supporting materials |
| Add images to lessons | MVP | Visual content |
| Add code snippets to lessons | MVP | Programming platform |
| Create folders for organization | POST-MVP | File organization |
| Add external links to lessons | MVP | Reference materials |
| Embed external content | POST-MVP | Rich content |

### Assessments

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Create exercises (statement + file) | POST-MVP | Not in MVP |
| Create quizzes (multiple choice) | POST-MVP | Not in MVP |
| Review student submissions | POST-MVP | Follows exercises |
| Provide feedback on submissions | POST-MVP | Follows submissions |
| Set quiz parameters (time, attempts, pass score) | POST-MVP | Follows quizzes |
| View quiz statistics | POST-MVP | Follows quizzes |

### Student Management

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View enrolled students | MVP | Know who's learning |
| Track student progress per course | MVP | Understand student engagement |
| View student list with enrollment date | MVP | Basic student overview |
| View individual student progress details | POST-MVP | Deeper analytics |
| Communicate with enrolled students | POST-MVP | Communication |

### Live Classes

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Schedule live class for course | POST-MVP | Not in MVP |
| Start live class session | POST-MVP | Not in MVP |
| View class attendance | POST-MVP | Not in MVP |
| Manage class recordings | POST-MVP | Not in MVP |

### Analytics

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View course enrollment statistics | POST-MVP | Business intelligence |
| View lesson completion rates | POST-MVP | Content effectiveness |
| View average quiz scores | POST-MVP | Assessment analysis |
| View student engagement metrics | FUTURE | Advanced analytics |

### Communication

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Post course announcements | MVP | Instructor-to-student |
| Respond to student comments | POST-MVP | Follows comments |
| Send direct messages to students | POST-MVP | Communication channel |

---

## ADMIN

The platform operator. Manages everything. Oversees the entire system.

### Account & Access

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Login/logout | MVP | Core access |
| Reset password | MVP | Account recovery |

### User Management

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View all users | MVP | Oversight |
| Search/filter users | MVP | Finding users |
| Change user roles | MVP | Role management |
| Disable/enable user accounts | MVP | Account control |
| View user details | MVP | User investigation |
| Delete user accounts | POST-MVP | Cleanup |
| View user activity log | POST-MVP | Audit trail |

### Course Management

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View all courses | MVP | Oversight |
| Edit any course | POST-MVP | Override capability |
| Delete any course | POST-MVP | Cleanup |
| Approve/reject course publishing | POST-MVP | Quality control |
| Manage course categories | MVP | Organization |
| Feature/highlight courses | POST-MVP | Curation |

### Platform Configuration

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Configure platform name/branding | MVP | Identity |
| Manage notification settings | POST-MVP | System config |
| Configure email templates | POST-MVP | Communication config |
| Manage payment settings | FUTURE | Payments config |
| Manage API keys | FUTURE | Integrations |

### Content Moderation

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Review reported content | POST-MVP | Community safety |
| Moderate comments/discussions | POST-MVP | Community safety |
| Enforce content policies | POST-MVP | Quality control |

### Analytics & Reporting

| Capability | Classification | Justification |
|------------|---------------|---------------|
| View platform overview (total users, courses, enrollments) | MVP | Business intelligence |
| View registration trends | POST-MVP | Growth tracking |
| View revenue reports | FUTURE | Financial reporting |
| Export data | POST-MVP | Reporting |

### Permissions & Security

| Capability | Classification | Justification |
|------------|---------------|---------------|
| Manage role permissions | POST-MVP | Fine-grained access |
| View security audit logs | POST-MVP | Security monitoring |
| Manage IP whitelisting | FUTURE | Enterprise security |
| Configure SSO/SAML | FUTURE | Enterprise feature |
