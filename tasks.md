# Tasks: Tech Stack Selection — Zero-Cost MVP LMS

## Executive Summary

**21 milestones, 113 tasks** across the full MVP lifecycle. Estimated **8,000–12,000 changed lines**. The plan follows a real dependency graph with parallelizable tracks after foundation milestones complete. Early milestones (M0→M6) produce a **functional flow**: register → login → create course → publish → see in catalog.

**Key design changes reflected**:
- Course status lifecycle (draft → published → archived), not boolean
- Ownership via `course_instructors` table (RBAC ≠ ownership)
- Lesson-level progress with derived course %
- VideoStorageProvider / EmailService abstractions (no direct SDK dependency)
- Explicit migration workflow (never auto on startup)
- 3 environments (development, preview, production)
- Structured logging, correlation IDs, error catalog from MVP
- Upload security (MAX_SIZE, MIME, UUID keys, orphan cleanup)
- GDPR: deletion, rectification, consent, retention
- Cost model: R2 can generate costs — monitoring required

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 8,000–12,000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 21 work-unit PRs (one per milestone) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Repository & Tooling | PR 1 | Base infrastructure, zero dependencies |
| 2 | Database Foundation | PR 2 | Schemas, migrations, environment config |
| 3 | Authentication | PR 3 | Better Auth + session middleware |
| 4 | Authorization & Ownership | PR 4 | RBAC + course_instructors + permission checks |
| 5 | Content Model | PR 5 | Course → Module → Lesson → ContentBlock CRUD |
| 6 | File Storage | PR 6 | R2 + StorageProvider + upload security |
| 7 | Video MVP | PR 7 | VideoStorageProvider + Range streaming |
| 8 | Enrollment & Progress | PR 8 | Enrollment entity + lesson progress |
| 9 | Frontend (Student) | PR 9 | Catalog, player, dashboard |
| 10 | Frontend (Instructor) | PR 10 | Course editor, content management |
| 11 | Admin & Notifications | PR 11 | Admin panel + email service |
| 12 | GDPR & Security | PR 12 | Privacy, rate limiting, audit |
| 13 | Testing & Deployment | PR 13 | E2E, CI/CD, verification |

---

## Dependency Graph

```
M0 (Tooling) ──→ M1 (Database) ──→ M2 (Auth) ──→ M3 (RBAC/Ownership)
                    │                              │
                    ├──→ M4 (Content Model) ───────┤
                    │                              │
                    └──→ M6 (File Storage) ──→ M7 (Video MVP)
                              │
                              └──→ M5 (Course Domain) ──→ M8 (Enrollment) ──→ M9 (Progress)
                                                            │                    │
                                                            └──→ M10 (Profile) ──┤
                                                                                    │
M16 (Observability) ← can run after M0   M11 (Student) ← M8 + M9 + M5
M14 (Email) ← M2                          M12 (Instructor) ← M4 + M5 + M3
                                           M13 (Admin) ← M2 + M3
                                           M15 (GDPR) ← M2 + M8
                                           M17 (Security) ← M2 + M3
                                           M18 (Testing) ← all features
                                           M19 (Deploy) ← M18
                                           M20 (Verify) ← M19
```

**Parallel tracks after M4 completes**:
- Track A: M5 (Courses) → M8 (Enrollment) → M9 (Progress)
- Track B: M6 (Storage) → M7 (Video)
- Track C: M14 (Email), M16 (Observability) — independent

**Critical path**: M0 → M1 → M2 → M3 → M4 → M5 → M8 → M9 → M11 → M18 → M19 → M20

---

## MVP Scope Check

All MUST HAVE features from `docs/product/mvp.md` are covered:

| MVP Feature | Covered By |
|-------------|------------|
| User registration/login | M2 (Authentication) |
| Password reset | M2 (Authentication) |
| Student/Instructor/Admin roles | M3 (Authorization) |
| RBAC | M3 (Authorization) |
| Course CRUD | M5 (Course Domain) |
| Module/lesson management | M4 (Content Model) |
| Content blocks (text, code, video, file) | M4 (Content Model) |
| Video upload/playback | M7 (Video MVP) |
| File upload/download | M6 (File Storage) |
| Free enrollment | M8 (Enrollment) |
| Progress tracking | M9 (Progress) |
| Course player | M11 (Student Experience) |
| Notifications (in-app + email) | M14 (Email & Notifications) |
| Announcements | M14 (Email & Notifications) |
| Basic search | M5 (Course Domain) |

---

## Test Coverage Plan

Every milestone includes unit + integration tests. E2E tests in M20:

| Flow | Steps | Covered By |
|------|-------|------------|
| FLOW 1 (Student) | register → login → catalog → enroll → course → lesson → progress | M20-T107 |
| FLOW 2 (Instructor) | login → create course → module → lesson → publish | M20-T108 |
| FLOW 3 (Admin) | login → manage users → manage courses → verify restrictions | M20-T109 |

**Coverage targets**:
- Unit tests: >80% domain logic coverage
- Integration tests: all API endpoints
- Security tests: all 20 threat scenarios from `security-model.md`

---

## Security Coverage Plan

Security is distributed across milestones, NOT centralized:

| Milestone | Security Concern |
|-----------|-----------------|
| M2 | Session management, password hashing |
| M3 | RBAC, ownership checks, privilege escalation prevention |
| M6 | Upload validation, path traversal, MIME types |
| M7 | Video access authorization, enrollment gate |
| M8 | Enrollment idempotency, duplicate prevention |
| M15 | GDPR deletion, data rectification, consent |
| M17 | Rate limiting, audit logging, input validation |
| M20 | Full security audit (all 20 threats) |

---

## Cost-Risk Review

| Component | Free Tier | Risk | Monitoring |
|-----------|-----------|------|------------|
| Workers | 100K req/day | LOW — hard limit | Dashboard |
| Neon | 0.5GB, 100 CU-hr/mo | LOW — auto-suspend | Dashboard |
| **R2** | 10GB, 1M Class A, 10M Class B | **MEDIUM — can generate costs** | **Active monitoring + alerts at 80%** |
| Resend | 3K/mo, 100/day | LOW — sending pauses | Dashboard |
| Better Auth | Self-hosted | NONE | N/A |

**⚠️ R2 is the exception**: Exceeding free tier quotas can incur charges. MAX_VIDEO_SIZE, MAX_FILE_SIZE, and orphan cleanup are mandatory cost controls.

**Corrected claim**: Architecture is designed for free tiers through MVP/alpha/beta, NOT "€0 absolute forever". Monitoring and configurable limits are required.

---

## M0 — Repository & Tooling

- [ ] **T1**: Init git repo, `package.json` (name: plataforma-cursos, type: module), TypeScript strict config, ESLint, Prettier, `.gitignore`, `.env.example` with all required vars (NEON_DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)
- [ ] **T2**: Create `wrangler.toml` with `run_worker_first: ["/api/*"]`, `compat_date`, assets directory config, `[vars]` for environment separation
- [ ] **T3**: Create `drizzle.config.ts` merging auth + app schemas from `src/infra/schema/`
- [ ] **T4**: Set up Vitest config with `@cloudflare/vitest-pool-workers`, test utilities, Neon test branch script
- [ ] **T5**: Create directory structure: `src/{api/routes,api/middleware,domains/*/service,infra/schema,infra/providers,shared/types,shared/constants,shared/validators}`, `drizzle/`, `public/`
- [ ] **T6**: Install core dependencies: hono, drizzle-orm, @neondatabase/serverless, better-auth, @better-auth/drizzle-adapter, better-auth-cloudflare, zod, nanoid

**Acceptance Criteria**:
- [ ] `npm run dev` starts Worker locally at localhost:8787
- [ ] `npx drizzle-kit generate` runs without errors
- [ ] `npm test` passes with empty suite
- [ ] TypeScript compiles with strict mode

**Dependencies**: None
**Primary Agent**: infrastructure
**Supporting Agents**: deployment-release
**Security Review**: no
**Estimated Lines**: ~250
**Risk**: LOW

---

## M1 — Database Foundation

- [x] **T7**: Create `src/infra/db.ts` — Drizzle + @neondatabase/serverless connection with env-based DATABASE_URL
- [x] **T8**: Create `src/infra/schema/auth.ts` — Better Auth compatible tables (user, session, account, verification) using Better Auth's expected column names
- [x] **T9**: Create `src/infra/schema/course.ts` — courses table (id, title, description, thumbnailUrl, status ENUM draft/published/archived, createdBy FK, categoryId FK, createdAt, updatedAt), categories table (id, name, slug, description, position)
- [x] **T10**: Create `src/infra/schema/content.ts` — modules (id, courseId FK CASCADE, title, description, position), lessons (id, moduleId FK CASCADE, title, description, position, estimatedDurationSeconds), content_blocks (id, lessonId FK CASCADE, type ENUM text/video/file/code/link, position, content JSONB)
- [x] **T11**: Create `src/infra/schema/enrollment.ts` — enrollments (id, studentId FK, courseId FK, status ENUM active/completed/dropped, source ENUM free/purchase/admin/invitation/subscription, enrolledAt, completedAt, droppedAt, UNIQUE(student_id, course_id))
- [x] **T12**: Create `src/infra/schema/progress.ts` — lesson_progress (id, studentId FK, lessonId FK, status ENUM not_started/in_progress/completed, startedAt, completedAt, lastPositionSeconds, updatedAt, UNIQUE(student_id, lesson_id))
- [x] **T13**: Create `src/infra/schema/ownership.ts` — course_instructors (id, courseId FK CASCADE, userId FK CASCADE, role ENUM owner/collaborator, createdAt, UNIQUE(course_id, user_id))
- [x] **T14**: Create `src/infra/schema/video.ts` — video_assets (id, provider ENUM r2/mux, providerAssetId, objectKey, filename, mimeType, size, duration, status ENUM uploading/ready/failed, createdAt)
- [x] **T15**: Create `src/infra/schema/notification.ts` — notifications (id, userId FK, title, body, type ENUM announcement/enrollment/system, isRead, courseId FK nullable, link, createdAt)
- [x] **T16**: Create `src/infra/schema/consent.ts` — user_consents (id, userId FK, termsVersion, acceptedAt, ipAddress)
- [x] **T17**: Generate initial migration via `drizzle-kit generate`, review SQL, apply to dev database
- [x] **T18**: Write integration test: connect to Neon, run migration, insert/select user, insert/select course

**Acceptance Criteria**:
- [ ] All 10 tables created with correct columns, types, and constraints
- [ ] Migration applies cleanly to fresh database
- [ ] Foreign keys cascade correctly (course delete → module/lesson/block delete)
- [ ] UNIQUE constraints enforce (student_id, course_id) on enrollments
- [ ] Drizzle queries work against Neon (insert + select)
- [ ] Integration test passes

**Dependencies**: T1–T6
**Primary Agent**: database
**Supporting Agents**: api-design
**Security Review**: no
**Estimated Lines**: ~500
**Risk**: MEDIUM

---

## M2 — Authentication

- [ ] **T19**: Configure Better Auth with Drizzle adapter, session config (cookie-based, secure, httpOnly), password hashing
- [ ] **T20**: Create `src/api/routes/auth.ts` — POST /api/auth/register (email, password, name, role), POST /api/auth/login, POST /api/auth/logout, POST /api/auth/forgot-password, POST /api/auth/reset-password
- [ ] **T21**: Create `src/api/middleware/auth.ts` — session verification middleware that extracts user from session cookie, attaches to context
- [ ] **T22**: Create `src/shared/constants.ts` — PASSWORD_MIN_LENGTH, SESSION_EXPIRY, rate limit config
- [ ] **T23**: Write test: POST /api/auth/register creates user with hashed password + session; POST /api/auth/login returns session cookie; POST /api/auth/logout invalidates; protected route without session returns 401

**Acceptance Criteria**:
- [ ] Register creates user in Neon with bcrypt-hashed password
- [ ] Login returns HttpOnly session cookie
- [ ] Logout invalidates session
- [ ] Password reset flow works end-to-end
- [ ] Session middleware extracts user on protected routes
- [ ] Registration rejects duplicate email (409 ALREADY_EXISTS)
- [ ] Password requirements enforced (min 8 chars)

**Dependencies**: T7–T18
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~350
**Risk**: HIGH

---

## M3 — Authorization & Ownership

- [x] **T24**: Create `src/domains/auth/roles.ts` — role enum (student/instructor/admin), Permission type, permissionMatrix mapping (course-level roles → permissions), authorizeCourseAction function
- [x] **T25**: Create `src/api/middleware/requireRole.ts` — global role verification middleware (checks user.role against required role)
- [x] **T26**: Create `src/api/middleware/requireOwnership.ts` — course-level authorization (queries course_instructors for user+course, checks role grants permission + admin bypass)
- [x] **T27**: Create `src/domains/auth/ownership.ts` — ownership check functions (getCourseMembership, isCourseMember, isCourseOwner, isCourseOwnerOrAdmin)
- [x] **T28**: Create `src/infra/schema/ownership.ts` — course_instructors table with composite PK (course_id, user_id), role integer, FK cascade
- [x] **T29**: Write authorization tests: student cannot edit any course; instructor cannot edit unowned courses; collaborator can edit but not publish; owner can do everything; admin can do everything; privilege escalation blocked; cross-instructor access blocked

**Acceptance Criteria**:
- [x] Role middleware blocks unauthorized access (403 FORBIDDEN)
- [x] course_instructors check prevents cross-instructor access (threat T4)
- [x] Privilege escalation blocked — instructor cannot self-promote (threat T5)
- [x] Collaborator permissions limited (no publish/archive/manage collaborators)
- [x] Admin override works for all course actions
- [x] All 8 test cases from ADR-015 pass

**Dependencies**: T19–T23
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~300
**Risk**: HIGH

---

## M4 — Content Model

- [x] **T30**: Create `src/domains/content/service.ts` — module CRUD (create, update, delete, reorder), lesson CRUD, contentBlock CRUD (create, update, delete, reorder)
- [x] **T31**: Create `src/api/routes/modules.ts` — POST /api/courses/:courseId/modules, PATCH, DELETE, PUT /reorder
- [x] **T32**: Create `src/api/routes/lessons.ts` — POST /api/modules/:moduleId/lessons, PATCH, DELETE, PUT /reorder
- [x] **T33**: Create `src/api/routes/content-blocks.ts` — POST /api/lessons/:lessonId/blocks, PATCH, DELETE, PUT /reorder
- [x] **T34**: Implement position management — server-side position assignment, gap-allowed ordering, atomic reorder (transaction)
- [x] **T35**: Implement course status lifecycle — draft→published→archived transitions with validation (only owner/admin can publish; only owner can archive)
- [x] **T36**: Implement status-based visibility — draft visible only to owner/collaborator/admin; published visible to enrolled students + catalog; archived hidden from catalog
- [x] **T37**: Write test: create module → create lesson → create text/video/code/link/file blocks → reorder blocks → verify positions; course status transitions; visibility rules

**Acceptance Criteria**:
- [ ] Full CRUD for modules, lessons, content blocks
- [ ] Position ordering works (gaps allowed, reassign on reorder)
- [ ] Course status: draft → published → archived with correct guards
- [ ] Draft courses invisible to non-owners
- [ ] Published courses visible in catalog
- [ ] Archived courses hidden from catalog, enrolled students retain access
- [ ] All content belongs to correct course (no cross-course access)

**Dependencies**: T24–T29
**Primary Agent**: api-design
**Supporting Agents**: database
**Security Review**: yes
**Estimated Lines**: ~500
**Risk**: MEDIUM

---

## M5 — Course Domain (Categories, Search)

- [x] **T38**: Create `src/domains/course/service.ts` — course CRUD (create, update, delete, getById, list), category CRUD, search with keyword + category filter
- [x] **T39**: Create `src/api/routes/courses.ts` — GET /api/courses (catalog, published only), GET /api/courses/:id, POST /api/courses (instructor/admin), PATCH /api/courses/:id, DELETE /api/courses/:id
- [x] **T40**: Create `src/api/routes/categories.ts` — GET /api/categories, POST, PATCH, DELETE (admin only)
- [x] **T41**: Implement search — keyword search on title + description (ILIKE), category filter, pagination with meta { page, limit, total }
- [x] **T42**: Implement API response contract — all endpoints return { success, data, error?, meta? } per ADR-016
- [x] **T43**: Write test: instructor creates course (draft); publish → visible in catalog; search returns filtered results; category filter works; pagination works

**Acceptance Criteria**:
- [ ] Course CRUD complete with correct authorization
- [ ] Catalog returns only published courses (paginated)
- [ ] Search works with keyword + category filter
- [ ] Categories managed by admin
- [ ] API response contract consistent across all endpoints
- [ ] Instructor can only edit own courses (enforced by M3 middleware)

**Dependencies**: T30–T37
**Primary Agent**: api-design
**Supporting Agents**: lms-architect
**Security Review**: no
**Estimated Lines**: ~400
**Risk**: MEDIUM

---

## M6 — File Storage (R2 + StorageProvider)

- [x] **T44**: Create `src/infra/providers/storage-provider.ts` — StorageProvider interface (upload, getSignedUrl, delete, getMetadata)
- [x] **T45**: Create `src/infra/providers/r2-storage.ts` — R2StorageProvider implementing StorageProvider using Cloudflare R2 S3-compatible API
- [x] **T46**: Create `src/api/routes/files.ts` — POST /api/files (upload), GET /api/files/:id/download, DELETE /api/files/:id
- [x] **T47**: Implement upload validation — MAX_FILE_SIZE (50MB), MIME type whitelist, extension whitelist, UUID-based key generation (`courses/{courseId}/lessons/{lessonId}/assets/{uuid}/{sanitized-filename}`)
- [x] **T48**: Implement path traversal prevention — object keys generated server-side, user input sanitized (strip `/`, `\`, `..`)
- [x] **T49**: Implement Content-Disposition header on downloads (`attachment; filename="..."`)
- [x] **T50**: Implement authorization — upload: authenticated + course_instructors (collaborator/owner); download: authenticated + enrollment OR instructor/admin; delete: owner or admin only
- [x] **T51**: Implement compensation — DB record created (status=pending) → R2 upload → DB status=ready; if R2 fails → delete DB record; if DB fails after R2 → orphan cleanup handles it
- [x] **T52**: Write test: upload file → get signed URL → download; unenrolled student gets 403; file size limit enforced; MIME validation works; path traversal blocked

**Acceptance Criteria**:
- [ ] Files upload to R2 with UUID-based keys
- [ ] Signed URLs work for downloads (1 hour expiry)
- [ ] Enrollment check blocks unauthorized downloads
- [ ] File metadata stored in DB
- [ ] MIME type + extension whitelist enforced
- [ ] Path traversal impossible (server-generated keys)
- [ ] Content-Disposition forces download
- [ ] Compensation handles R2/DB failure split

**Dependencies**: T7–T18
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~450
**Risk**: HIGH

---

## M7 — Video MVP (VideoStorageProvider + R2)

- [x] **T53**: Create `src/infra/providers/video-storage-provider.ts` — VideoStorageProvider interface (upload, getStreamUrl, getMetadata, delete)
- [x] **T54**: Create `src/infra/providers/r2-video.ts` — R2VideoStorageProvider implementing VideoStorageProvider
- [x] **T55**: Create `src/api/routes/video.ts` — POST /api/video (upload), GET /api/video/:id/stream, GET /api/video/:id/metadata
- [x] **T56**: Implement upload validation — MAX_VIDEO_SIZE (500MB), MIME types (video/mp4, video/webm), UUID key generation
- [x] **T57**: Implement HTTP Range request handling for video seeking (206 Partial Content, Content-Range header)
- [x] **T58**: Implement video access authorization — auth + enrollment check → generate time-limited presigned R2 URL (1 hour)
- [x] **T59**: Create video_assets table records on upload (status: uploading → ready/failed)
- [x] **T60**: Implement idempotent upload compensation — DB record (status=uploading) → R2 upload → DB status=ready; failure → DB status=failed; orphan cleanup handles R2 objects without DB records
- [x] **T61**: Write test: upload video → stream with Range header → get 206 Partial Content; unenrolled gets 403; 500MB limit enforced; invalid MIME rejected

**Acceptance Criteria**:
- [ ] Video uploads to R2 with UUID-based keys
- [ ] Streaming supports HTTP Range requests (seeking works)
- [ ] Enrollment required for video access
- [ ] Video metadata tracked in video_assets table
- [ ] Upload compensation handles R2/DB split failures
- [ ] MAX_VIDEO_SIZE configurable per environment
- [ ] Private bucket — no public access

**Dependencies**: T44–T52
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~450
**Risk**: HIGH

---

## M8 — Enrollment

- [ ] **T62**: Create `src/domains/enrollment/service.ts` — enroll (idempotent), unenroll, check enrollment, list enrolled students (instructor), list enrolled courses (student)
- [ ] **T63**: Create `src/api/routes/enrollments.ts` — POST /api/courses/:courseId/enroll, GET /api/me/enrollments, GET /api/courses/:courseId/enrolled-students (owner/admin only)
- [ ] **T64**: Implement idempotency — UNIQUE(student_id, course_id) constraint; duplicate enrollment returns existing enrollment (not error)
- [ ] **T65**: Implement enrollment verification middleware — checks enrollment status is 'active' for content access
- [ ] **T66**: Create enrollment source tracking — source='free' for MVP self-enrollment
- [ ] **T67**: Write test: student enrolls in free course (source='free'); duplicate enrollment returns existing; unenrolled student gets 403 on content; enrollment status transitions work

**Acceptance Criteria**:
- [ ] Free enrollment works end-to-end
- [ ] Idempotent — duplicate enrollment returns existing
- [ ] Enrollment source tracked (free for MVP)
- [ ] Enrollment verification integrated with content access
- [ ] Status transitions: active → completed, active → dropped
- [ ] Instructor can view enrolled students
- [ ] UNIQUE constraint prevents duplicate enrollments

**Dependencies**: T38–T43
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~300
**Risk**: MEDIUM

---

## M9 — Learning Progress

- [ ] **T68**: Create `src/domains/progress/service.ts` — markLessonComplete, updateVideoPosition, getLessonProgress, getCourseProgress, getModuleProgress
- [ ] **T69**: Create `src/api/routes/progress.ts` — POST /api/lessons/:lessonId/progress (start, complete), PATCH /api/video/:id/position (update lastPositionSeconds), GET /api/courses/:courseId/progress
- [ ] **T70**: Implement lesson completion criteria — text/link/code blocks: viewed; video blocks: watched past 90% threshold or marked complete; file blocks: downloaded/viewed
- [ ] **T71**: Implement course progress derivation — (completed lessons / total lessons) × 100, calculated on read or cached with invalidation
- [ ] **T72**: Implement video resume — lastPositionSeconds updated periodically; video player seeks to this position on re-entry
- [ ] **T73**: Implement status transitions — not_started → in_progress (when student opens lesson) → completed (when all blocks done); completed never reverts
- [ ] **T74**: Write test: mark lesson complete → course progress recalculates; video position updates; progress persists across sessions; completed status never reverts

**Acceptance Criteria**:
- [ ] Lesson completion tracked with status transitions
- [ ] Course progress derived from lesson-level data
- [ ] Video position tracked for resume
- [ ] Completion criteria enforced (all blocks must be engaged)
- [ ] Progress persisted server-side (not client-side only)
- [ ] Module progress calculated from lesson data

**Dependencies**: T62–T67
**Primary Agent**: api-design
**Supporting Agents**: lms-architect
**Security Review**: no
**Estimated Lines**: ~350
**Risk**: MEDIUM

---

## M10 — User Profile & Dashboard

- [ ] **T75**: Create `src/domains/user/service.ts` — getProfile, updateProfile, uploadAvatar
- [ ] **T76**: Create `src/api/routes/users.ts` — GET /api/me, PATCH /api/me, POST /api/me/avatar
- [ ] **T77**: Implement avatar upload via R2 (StorageProvider, signed URL generation)
- [ ] **T78**: Create React user profile page (view/edit name, email, avatar)
- [ ] **T79**: Write test: user can view/update own profile; cannot update other user's profile; avatar uploads to R2

**Acceptance Criteria**:
- [ ] Profile CRUD works (get, update, avatar)
- [ ] Avatar uploads to R2 via StorageProvider
- [ ] Profile data persisted in Neon
- [ ] Users can only edit own profile
- [ ] Email change requires re-verification

**Dependencies**: T19–T23, T44–T52
**Primary Agent**: api-design
**Supporting Agents**: ui-ux
**Security Review**: no
**Estimated Lines**: ~300
**Risk**: LOW

---

## M11 — Student Experience (Frontend)

- [ ] **T80**: Create React course catalog page with search + category filter + pagination
- [ ] **T81**: Create course detail page (title, description, modules/lessons list, enroll button)
- [ ] **T82**: Create enrollment flow (course page → enroll → redirect to course player)
- [ ] **T83**: Create course player page with module/lesson sidebar navigation, prev/next lesson
- [ ] **T84**: Create content block renderer (text, code, video, image, file, link components)
- [ ] **T85**: Create video player with Range request support, resume from lastPositionSeconds
- [ ] **T86**: Create student dashboard with enrolled courses + progress bars
- [ ] **T87**: Create lesson completion UI (mark as complete button, progress indicator)

**Acceptance Criteria**:
- [ ] Student can browse catalog, search, filter by category
- [ ] Student can enroll in free course
- [ ] Student can view lessons with all content block types
- [ ] Video player supports seeking and resume
- [ ] Dashboard shows enrolled courses with progress
- [ ] All pages responsive (mobile + desktop)
- [ ] Navigation between lessons works

**Dependencies**: T62–T74
**Primary Agent**: ui-ux
**Supporting Agents**: api-design
**Security Review**: no
**Estimated Lines**: ~800
**Risk**: MEDIUM

---

## M12 — Instructor Experience (Frontend)

- [ ] **T88**: Create instructor dashboard (my courses, student counts, quick actions)
- [ ] **T89**: Create course editor page (title, description, thumbnail, status, categories)
- [ ] **T90**: Create module management (add, edit, delete, reorder via drag-and-drop)
- [ ] **T91**: Create lesson editor with block management (add, edit, delete blocks, reorder)
- [ ] **T92**: Create file/video upload UI within lesson editor
- [ ] **T93**: Create student list view per course with progress summary
- [ ] **T94**: Create announcement creation/management UI

**Acceptance Criteria**:
- [ ] Instructor can manage full course lifecycle (create → edit → publish → archive)
- [ ] Drag-and-drop reordering works for modules, lessons, blocks
- [ ] File/video upload integrated in lesson editor
- [ ] Student list shows enrollment date + progress
- [ ] Announcements posted to enrolled students
- [ ] Instructor can only see/manage own courses

**Dependencies**: T30–T37, T38–T43, T24–T29
**Primary Agent**: ui-ux
**Supporting Agents**: api-design
**Security Review**: no
**Estimated Lines**: ~700
**Risk**: MEDIUM

---

## M13 — Administration (Frontend)

- [ ] **T95**: Create admin dashboard (platform overview: user count, course count, enrollment count)
- [ ] **T96**: Create user management page (list, search, disable/enable, change role)
- [ ] **T97**: Create course management page (list, search, status changes, view enrollments)
- [ ] **T98**: Create platform settings page (name, logo, terms version)
- [ ] **T99**: Write test: admin can disable user → disabled user cannot login; role change requires admin; admin can manage any course

**Acceptance Criteria**:
- [ ] Admin panel functional with platform overview
- [ ] User management (list, search, disable, role change)
- [ ] Course management (list, search, status changes)
- [ ] Platform settings editable
- [ ] Disabled accounts blocked from login
- [ ] Role changes enforced (only admin)

**Dependencies**: T19–T23, T24–T29
**Primary Agent**: ui-ux
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~600
**Risk**: MEDIUM

---

## M14 — Email & Notifications

- [x] **T100**: Create `src/infra/providers/email-provider.ts` — EmailService interface (send, sendTemplate)
- [x] **T101**: Create `src/infra/providers/resend-email.ts` — ResendEmailProvider implementing EmailService using Resend SDK
- [x] **T102**: Create notification service — create, mark read, get unread count, list
- [x] **T103**: Create `src/api/routes/notifications.ts` — GET /api/notifications, PATCH /api/notifications/:id/read, GET /api/notifications/unread-count
- [x] **T104**: Wire transactional emails — welcome (on register), password reset, enrollment confirmation
- [ ] **T105**: Create notification center UI (list, unread badge, mark read)
- [x] **T106**: Implement email failure handling — non-blocking (log + retry, never throw); enrollment is authoritative regardless of email

**Acceptance Criteria**:
- [ ] Emails send via Resend through EmailService abstraction
- [ ] In-app notifications created on events (enrollment, announcements)
- [ ] Notification center shows unread count
- [ ] Emails match templates (welcome, password reset, enrollment)
- [ ] Email failure logged, not thrown (non-blocking)
- [ ] Domain depends on EmailService, NOT ResendEmailProvider

**Dependencies**: T19–T23
**Primary Agent**: api-design
**Supporting Agents**: ui-ux
**Security Review**: no
**Estimated Lines**: ~400
**Risk**: LOW

---

## M15 — Privacy & GDPR

- [x] **T107**: Create `src/domains/user/export.ts` — UserDataExportService (JSON format, versioned document)
- [x] **T108**: Create `GET /api/me/export` endpoint (authenticated, user-only, rate limited 1/hr)
- [x] **T109**: Implement account deletion — POST /api/me/delete → soft delete (30-day grace) → hard delete (cascade all data)
- [x] **T110**: Implement data rectification — PATCH /api/me (name, email editable; role NOT editable)
- [x] **T111**: Implement consent/terms tracking — user_consents table, terms_version + accepted_at, required before account activation
- [x] **T112**: Implement cascade deletion on hard delete — enrollments, lesson_progress, notifications, course_instructors (or reassign), R2 objects
- [x] **T113**: Write test: export returns user data JSON excluding passwords/sessions; deletion soft-deletes then hard-deletes; consent tracked; rectification works

**Acceptance Criteria**:
- [ ] User can export own data as versioned JSON
- [ ] Export excludes passwords, hashes, sessions, tokens
- [ ] Account deletion: soft delete → 30-day grace → hard delete
- [ ] Cascade deletion handles all user data
- [ ] Data rectification (profile editing) with audit log
- [ ] Consent tracked with terms_version
- [ ] Export rate limited (1/hr)

**Dependencies**: T19–T23, T62–T67
**Primary Agent**: api-design
**Supporting Agents**: security-audit
**Security Review**: yes
**Estimated Lines**: ~400
**Risk**: LOW

---

## M16 — Observability & Error Contract

- [ ] **T114**: Create `src/shared/logger.ts` — structured JSON logger with requestId, timestamp, level, message, service, duration, status, method, route, errorCode
- [ ] **T115**: Create request ID middleware — UUID correlation ID assigned at request start, attached to all log entries
- [ ] **T116**: Implement request lifecycle logging — request.start (method, route, requestId) → request.end (status, duration, requestId)
- [ ] **T117**: Create `src/shared/error-catalog.ts` — error code constants with HTTP status mapping (COURSE_NOT_FOUND→404, NOT_ENROLLED→403, etc.)
- [ ] **T118**: Create centralized error handler — app.onError catches all unhandled errors, logs with full context, returns consistent { success, error: { code, message, requestId } }
- [ ] **T119**: Formalize health endpoint — GET /api/health returns { status, timestamp, version, checks: { database, storage } }
- [ ] **T120**: Implement what NOT to log — filter passwords, tokens, API keys, sensitive request bodies

**Acceptance Criteria**:
- [ ] All log entries are structured JSON
- [ ] Request ID propagated across all log entries
- [ ] Error responses consistent: { success: false, error: { code, message, requestId } }
- [ ] Error catalog covers all domains (course, enrollment, progress, upload, auth, general)
- [ ] Health endpoint returns database + storage status
- [ ] Sensitive data never logged
- [ ] Health endpoint is public (no auth required)

**Dependencies**: T1–T6
**Primary Agent**: api-design
**Supporting Agents**: lms-architect
**Security Review**: no
**Estimated Lines**: ~350
**Risk**: LOW

---

## M17 — Security Hardening & Rate Limiting

- [ ] **T121**: Configure Cloudflare WAF rules — strict limits on POST /auth/login, /auth/register, /auth/forgot-password, /auth/reset-password
- [ ] **T122**: Configure moderate rate limits on POST /api/files, /api/video, GET /api/me/export
- [ ] **T123**: Add audit logging middleware — log login, logout, role changes, data export, data deletion, course publish/archive
- [ ] **T124**: Add input validation on all endpoints (Zod schemas for request body, params, query)
- [ ] **T125**: Implement orphan cleanup job — scan R2 for objects without matching DB records, delete orphans, log
- [ ] **T126**: Implement R2 usage monitoring — track storage usage, Class A/B operations, alert at 80% of free tier
- [ ] **T127**: Security review — verify all 20 threat scenarios from security-model.md are addressed

**Acceptance Criteria**:
- [ ] Rate limits active on priority endpoints (429 with Retry-After)
- [ ] Audit log captures all security events
- [ ] All inputs validated (Zod)
- [ ] Orphan cleanup removes R2 objects without DB records
- [ ] R2 usage monitored with alerts
- [ ] All 20 threat mitigations verified
- [ ] Upload security: MAX_SIZE, MIME, UUID keys, path traversal prevented

**Dependencies**: T19–T23, T24–T29
**Primary Agent**: security-audit
**Supporting Agents**: api-design
**Security Review**: yes
**Estimated Lines**: ~350
**Risk**: HIGH

---

## M18 — Testing & Quality

- [ ] **T128**: Write unit tests for all domain services (course, enrollment, progress, user, content, auth)
- [ ] **T129**: Write integration tests for auth flows (register, login, session, password reset, email verification)
- [ ] **T130**: Write integration tests for authorization (role checks, ownership, enrollment verification, privilege escalation)
- [ ] **T131**: Write integration tests for file/video access (R2 operations, enrollment gate, size limits, MIME validation)
- [ ] **T132**: Write integration tests for enrollment (enroll, idempotency, duplicate prevention, status transitions)
- [ ] **T133**: Write integration tests for progress (lesson completion, course derivation, video position, status transitions)
- [ ] **T134**: Write API contract tests for all endpoints (response format, error codes, status codes)
- [ ] **T135**: Achieve >80% code coverage on domain logic

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] >80% domain logic coverage
- [ ] Security-critical paths tested (auth, RBAC, enrollment, file access)
- [ ] No flaky tests
- [ ] All API contracts verified

**Dependencies**: T121–T127
**Primary Agent**: testing
**Supporting Agents**: api-design
**Security Review**: no
**Estimated Lines**: ~600
**Risk**: MEDIUM

---

## M19 — Deployment & CI/CD

- [ ] **T136**: Create `.github/workflows/ci.yml` — lint, type-check, test on push/PR
- [ ] **T137**: Create `.github/workflows/deploy.yml` — wrangler deploy on main push with environment selection
- [ ] **T138**: Configure Neon production database (main branch), run migrations with approval gate
- [ ] **T139**: Configure R2 bucket (private, no public access, env-separated: dev/preview/prod prefixes or separate buckets)
- [ ] **T140**: Configure Resend domain verification (3 domains on free tier)
- [ ] **T141**: Set up Cloudflare DNS for custom domain, SSL
- [ ] **T142**: Configure environment variables in Cloudflare Workers dashboard (per environment)
- [ ] **T143**: Implement migration workflow in CI — generate → review → backup → migrate → health check
- [ ] **T144**: Configure Neon branch-per-PR for preview environments

**Acceptance Criteria**:
- [ ] CI runs on every PR (lint, type-check, test)
- [ ] Deploy pipeline works (wrangler deploy)
- [ ] Production environment configured with all secrets
- [ ] Custom domain resolves with SSL
- [ ] Migration workflow documented and tested
- [ ] Preview environments work per-PR
- [ ] Environment separation enforced (dev ≠ preview ≠ production)

**Dependencies**: T128–T135
**Primary Agent**: deployment-release
**Supporting Agents**: api-design
**Security Review**: yes
**Estimated Lines**: ~350
**Risk**: MEDIUM

---

## M20 — MVP Verification

- [ ] **T145**: E2E test FLOW 1 (Student): register → login → browse catalog → enroll in course → view lesson → complete lesson → see progress update
- [ ] **T146**: E2E test FLOW 2 (Instructor): login → create course → add module → add lesson → add content blocks → publish → verify visible in catalog
- [ ] **T147**: E2E test FLOW 3 (Admin): login → manage users (disable, role change) → manage courses → verify restrictions enforced
- [ ] **T148**: Security audit — verify all 20 threat scenarios from security-model.md, check all mitigations
- [ ] **T149**: Performance check — page load <3s, API response <500ms, video streaming smooth
- [ ] **T150**: Cost verification — all services within free tier limits, R2 monitoring active
- [ ] **T151**: Documentation — README with setup guide, API docs, architecture overview
- [ ] **T152**: Migration smoke test — generate → review → backup → migrate → health check on fresh database

**Acceptance Criteria**:
- [ ] All 3 E2E flows pass
- [ ] Security audit complete (all 20 threats addressed)
- [ ] Performance acceptable
- [ ] Zero-cost infrastructure confirmed (with monitoring)
- [ ] Documentation complete
- [ ] Migration workflow verified

**Dependencies**: T136–T144
**Primary Agent**: testing
**Supporting Agents**: security-audit, deployment-release, documentation
**Security Review**: yes
**Estimated Lines**: ~400
**Risk**: LOW
