# Project Context — plataforma_cursos

## Objective

Web platform for online programming courses. Future evolution toward a complete LMS with multi-role support, content management, assessments, live classes, payments, and AI-powered tools.

## Current State

**Greenfield** — no code, no infrastructure, no framework chosen yet.

## Decisions Pending

| Area | Status |
|------|--------|
| Frontend | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Backend | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Database | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| ORM | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Authentication | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Storage | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Video hosting | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Live classes | TBD |
| Payments | TBD |
| Deployment | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| Testing framework | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |
| CI/CD | TBD — proposal at `docs/architecture/proposal-tech-stack.md` |

## Future Features (high-level)

- Users (students, instructors, admins)
- Courses, modules, lessons, folders, files
- Video and downloadable material
- Exercises and quizzes
- Progress tracking
- Certificates
- Live classes
- Professor/student communication
- Calendars and notifications
- Marketing and social media
- Analytics and APIs
- External integrations
- Payments and subscriptions
- AI-powered tools

## Constraints

- No technology decisions until explicitly approved
- All AI agents are designed to adapt to whatever stack is chosen
- Infrastructure decisions will be made collaboratively

## Product Blueprint

Phase 0 complete. Full product architecture documented in `docs/product/`:

- **vision.md** — Product vision and philosophy
- **user-roles.md** — Student, Instructor, Admin capabilities
- **course-structure.md** — Course > Module > Lesson hierarchy
- **lesson-content.md** — Content blocks and types
- **file-system.md** — File management model
- **video-model.md** — Video handling
- **progress.md** — Progress tracking system
- **programming-exercises.md** — 5-level exercise analysis
- **quizzes.md** — Quiz system design
- **live-classes.md** — Live class analysis (not MVP)
- **calendar.md** — Calendar system
- **communication.md** — Communication channels
- **certificates.md** — Certificate system
- **payments.md** — Payment models
- **business-model.md** — Academy vs marketplace comparison
- **ai-future.md** — AI possibilities
- **user-journeys.md** — Complete user flows
- **screens.md** — Screen inventory
- **domain-model.md** — Conceptual entities
- **api-boundaries.md** — Functional domains
- **security-model.md** — Threat model
- **multitenancy.md** — Multi-tenancy analysis
- **open-decisions.md** — Decisions needing approval
- **roadmap.md** — Development phases
- **mvp.md** — THE MVP DEFINITION (most important)

**Recommendation:** Model A (Own Academy) → Model B (Internal Instructors)
**MVP:** 15 MUST HAVE features, buildable in 3-6 months
**Next:** Technology decisions, then Phase 1 development
