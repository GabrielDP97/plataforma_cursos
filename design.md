# Design: Tech Stack Selection — Zero-Cost MVP LMS (Revised)

## Technical Approach

Build a modular monolith on **Cloudflare Workers Static Assets** (single deployment), React SPA + Hono API in one Worker. Database on **Neon PostgreSQL Free Tier** with **Drizzle ORM** as single migration owner (auth + application schemas). Video via **Cloudflare R2 + MP4 + HTTP Range Requests** as MVP, with VideoStorageProvider abstraction for future Mux migration. Files on **Cloudflare R2** (shared bucket). Email via **Resend Free Tier** (3 verified domains) behind EmailService abstraction. Auth via **Better Auth** self-hosted with Drizzle adapter. Rate limiting via **Cloudflare edge rules**. All infrastructure is designed to operate within provider free tiers during the MVP stage. Usage must be monitored because some services, especially Cloudflare R2, may generate costs when free-tier limits are exceeded.

Architecture: **Hexagonal Architecture** within a single Worker. Domain logic pure, infrastructure concerns swappable via provider abstractions. NOT microservices.

---

## Architecture Decisions

### A1: Frontend + Backend — Workers Static Assets (Single Deployment)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Workers Static Assets (React SPA + Hono) | Single Worker, unified deploy, free static serving | **CHOSEN** |
| Cloudflare Pages + Workers (separate) | Two deployments, Pages becoming legacy | REJECTED |
| Next.js on Vercel | Hobby tier = non-commercial only, $20/mo min | REJECTED |
| Next.js via @opennextjs/cloudflare | Beta adapter, immature | REJECTED |

**Rationale**: Cloudflare now recommends Workers as primary platform. Static assets are FREE (not counted against 100K/day dynamic limit). `run_worker_first: ["/api/*"]` routes API to Hono, everything else to React SPA. Single deployment unit simplifies CI/CD. Pages is becoming legacy.

### A2: Backend Framework — Hono on Workers

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Hono | 14kB, ultrafast, Cloudflare-native | **CHOSEN** |
| Express.js | Heavy, not edge-native | REJECTED |
| tRPC + Hono | Adds type-safety, good for monorepos | DEFERRED (add later if team grows) |

**Rationale**: Purpose-built for edge runtimes. Zero dependencies. 14 API domains handled cleanly.

### A3: Database — Neon PostgreSQL Free Tier

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Neon PostgreSQL | Full SQL, 0.5GB free, 100 CU-hours/mo, scale-to-zero | **CHOSEN** |
| Cloudflare D1 | SQLite, single-threaded, limited JOINs | REJECTED |
| Supabase Free | Projects PAUSE after inactivity | REJECTED |
| Turso (libSQL) | SQLite edge, limited SQL features | REJECTED |

**Rationale**: 20+ entities with complex relationships need PostgreSQL JOINs, CTEs, JSON support. Neon scale-to-zero = no cost when idle.

### A4: ORM / Data Access — Drizzle ORM + @neondatabase/serverless

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Drizzle ORM + @neondatabase/serverless | Native Neon support, single migration system, Better Auth adapter | **CHOSEN** |
| Prisma | Heavier runtime, no native Neon adapter for Workers | REJECTED |
| Kysely | More manual query building, no Better Auth integration | REJECTED |

**Rationale**: Drizzle has NATIVE Neon support (drizzle-orm/neon-http, neon-serverless). Better Auth has official Drizzle adapter (@better-auth/drizzle-adapter). Drizzle Kit handles ALL migrations (auth + application schemas merged in single system). Cloudflare officially documents Drizzle + Hyperdrive.

### A5: File Storage — Cloudflare R2

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Cloudflare R2 | 10GB free, ZERO egress, S3-compatible | **CHOSEN** |
| AWS S3 | 5GB free, egress fees apply | REJECTED |

**Rationale**: Zero egress is critical for LMS file downloads. 10GB + 1M Class A + 10M Class B ops/month free.

### A6: Video — Cloudflare R2 + MP4 + HTTP Range (MVP) with VideoStorageProvider Abstraction

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Cloudflare R2 + MP4 | Free, >10 assets, private, simple, portable, S3-compatible | **CHOSEN (MVP)** |
| Mux Free | Great API, adaptive streaming | 10 videos only, no spend cap | REJECTED (too restrictive) |
| Cloudflare Stream | Cloudflare-native | $5/mo minimum | REJECTED (not free) |
| YouTube unembedded | Free, unlimited | No access control | REJECTED |

**Rationale**: R2 provides cost-effective storage within free-tier limits (10GB, 1M Class A, 10M Class B ops), private access via application authorization. Trade-off: basic playback (MP4 + Range) vs professional streaming. Accepted for MVP. Monitoring required — R2 can generate costs if quotas are exceeded.

**FREE-TIER CAPACITY**: R2 Free = 10GB storage, 1M Class A ops/mo, 10M Class B ops/mo, zero egress. 15 courses × 3-5 lessons = 45-75 video files. Average 50MB per video = 2.25-3.75GB — well within 10GB limit. No bottleneck.

**VideoStorageProvider abstraction** enables future migration:

```
VideoStorageProvider (interface)
├── R2VideoStorageProvider   ← MVP (Cloudflare R2 + MP4 + Range)
└── MuxVideoStorageProvider  ← FUTURE (adaptive streaming, analytics)
```

**Video security**:
- Private bucket, never public
- Auth → Enrollment check → R2 stream via API
- HTTP Range for seeking (no full-video loads)
- Stream, never buffer full video in Worker memory
- Internal IDs (UUIDs), not user filenames

**Video upload**:
- Direct-to-R2 streaming (not via Worker memory)
- Verify: size, MIME type, ownership, authorization
- Generate internal object key (UUID-based, never user filenames)
- Store metadata in VideoAsset table

**Data model**:

```typescript
VideoAsset {
  id: UUID
  provider: 'r2' | 'mux'
  providerAssetId: string
  objectKey: string
  filename: string
  mimeType: string
  size: number
  duration?: number
  status: 'uploading' | 'ready' | 'failed'
  createdAt: Date
}
```

### A7: Authentication — Better Auth + Drizzle Adapter

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Better Auth | Self-hosted, session-based, Drizzle adapter, MIT | **CHOSEN** |
| Lucia Auth | More DIY | REJECTED |
| Clerk | Third-party, vendor lock-in | REJECTED |

**Rationale**: Framework-agnostic, works on Workers, full control. better-auth-cloudflare package integrates Better Auth + Drizzle + Cloudflare Workers natively. Sessions stored in Neon via Drizzle.

### A8: Email — Resend with Service Abstraction

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Resend | 3,000 emails/mo, 100/day, 3 verified domains (Free) | **CHOSEN** |
| SendGrid | Free tier reduced | REJECTED |

**Rationale**: 3,000/month covers transactional needs. Free plan = 3 verified domains. Domain must NOT import Resend SDK directly — email is wrapped behind `EmailService` abstraction with `ResendEmailProvider` implementation.

---

## Content Model

### Course → Module → Lesson → ContentBlock Hierarchy

The LMS content model follows a strict hierarchy:

```
Course
├── Module (ordered by position)
│   ├── Lesson (ordered by position within module)
│   │   ├── ContentBlock (ordered by position within lesson)
│   │   └── ContentBlock
│   └── Lesson
└── Module
```

**Course status**: `draft` → `published` → `archived`
- `draft`: Not visible to students. Instructors can edit freely.
- `published`: Visible in catalog. Enrollment enabled. Changes require care.
- `archived`: Hidden from catalog. Enrolled students retain access. No new enrollments.

**Module/Lesson visibility**: Inherit from Course. A lesson in a published course is visible only if the student is enrolled. Modules and Lessons do NOT have independent publish status — the Course status is the single visibility gate. Modules and Lessons DO have their own `position` for ordering.

**ContentBlock types**:
- `text` — Rich text / markdown content
- `video` — Video reference (links to a VideoAsset via video_asset_id)
- `file` — File attachment (links to a file in R2)
- `code` — Code snippet with language tag
- `link` — External URL reference

A lesson is NOT designed solely around video. It supports multiple block types. A lesson is considered **completed** when all content blocks are either viewed (text/link/code) or completed (video watched to completion or past threshold).

**Stable ordering**: Every entity (Module, Lesson, ContentBlock) has a `position` integer field. Position is managed server-side, not client-assigned. Gaps in numbering are allowed (reordering reassigns positions).

See ADR-011 for full specification.

---

## Ownership and Authorization Model

RBAC is NOT ownership. Being `instructor` does NOT grant edit access to all courses.

### Global Roles (from Better Auth)

| Role | Description |
|------|-------------|
| `student` | Default. Can enroll, view content, track progress. |
| `instructor` | Can CREATE courses. Does NOT auto-own all courses. |
| `admin` | Platform administration. Can manage users, courses, settings. |

### Course-Level Ownership

```sql
course_instructors (
  course_id UUID FK → courses,
  user_id UUID FK → users,
  role ENUM('owner', 'collaborator'),
  created_at TIMESTAMP
)
```

- **owner**: Full control over the course (edit, publish, archive, manage modules/lessons, upload files, view enrollments, manage collaborators).
- **collaborator**: Can edit content, upload files, modify modules/lessons. Cannot publish, archive, or manage collaborators.

### Permission Matrix

| Action | student | instructor (global) | collaborator (course) | owner (course) | admin (global) |
|--------|---------|--------------------|-----------------------|----------------|----------------|
| View published courses | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create course | ❌ | ✅ | ❌ | ❌ | ✅ |
| Edit course content | ❌ | ❌ | ✅ | ✅ | ✅ |
| Publish/Archive course | ❌ | ❌ | ❌ | ✅ | ✅ |
| Upload files/assets | ❌ | ❌ | ✅ | ✅ | ✅ |
| Modify modules/lessons | ❌ | ❌ | ✅ | ✅ | ✅ |
| View enrollments | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage collaborators | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage users (global) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Admin settings | ❌ | ❌ | ❌ | ❌ | ✅ |

### Authorization Checks

Every API endpoint that modifies course content must verify:
1. User is authenticated (session valid).
2. User has a `course_instructors` entry for the target course.
3. User's role grants the required permission.

**Privilege escalation prevention**:
- `instructor` role does NOT imply ownership of any course.
- A new instructor creates a course and becomes its `owner` automatically.
- Adding collaborators requires `owner` or `admin` role.
- Cross-instructor access blocked by `course_instructors` join check.

See ADR-015 for full specification.

---

## Enrollment Model

### MVP: Free Courses Only — But Structurally Extensible

MVP supports free courses only. NO Stripe, payments, subscriptions, or coupons. BUT: the Enrollment entity must NOT structurally assume all enrollments are free.

```typescript
Enrollment {
  id: UUID
  studentId: UUID FK → users
  courseId: UUID FK → courses
  status: 'active' | 'completed' | 'dropped'
  source: 'free' | 'purchase' | 'admin' | 'invitation' | 'subscription'
  enrolledAt: TIMESTAMP
  completedAt?: TIMESTAMP
}
```

The `source` field enables future extensibility without schema migration:
- `free` — Student self-enrolled in a free course (MVP)
- `purchase` — Enrolled via payment (future)
- `admin` — Admin enrolled the student (future)
- `invitation` — Instructor invited the student (future)
- `subscription` — Enrolled via subscription (future)

An enrollment is an **independent entity** with its own lifecycle. It is NOT a side effect of payment. It CAN be created by multiple triggers (self-enrollment, admin action, purchase, invitation).

See ADR-014 for full specification.

---

## Progress Model

### Lesson-Level Progress as Source of Truth

Course progress is NOT stored as a single `progress: number` field. It is **derived** from lesson-level progress.

```typescript
LessonProgress {
  id: UUID
  studentId: UUID FK → users
  lessonId: UUID FK → lessons
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: TIMESTAMP
  completedAt?: TIMESTAMP
  lastPositionSeconds?: number  // For video resume
  updatedAt: TIMESTAMP
}
```

**Course percentage** = (completed lessons / total lessons) × 100. This is calculated or cached, NEVER the sole source of truth.

**Lesson completion criteria**:
- A lesson is `completed` when the student has engaged with all content blocks.
- For `text`/`code`/`link` blocks: marked as viewed.
- For `video` blocks: watched past a completion threshold (e.g., 90% of duration) or marked complete.
- For `file` blocks: downloaded or viewed.

**Video resume**: `lastPositionSeconds` tracks the last playback position. On re-entry, the video player seeks to this position.

**Status transitions**: `not_started` → `in_progress` (when student opens lesson) → `completed` (when all blocks are done). Once `completed`, the status does NOT revert.

See ADR-011 for full specification.

---

## Data Flow

### System Architecture — Single Worker Deployment

```
┌──────────────────────────────────────────────────────┐
│                    USERS (Browser)                     │
└───────────────────────────┬──────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKERS (Single)               │
│           Workers Static Assets + Hono API             │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  run_worker_first: ["/api/*"]                    │  │
│  │                                                   │  │
│  │  /api/*  ──→  Hono API Server (Modular Monolith) │  │
│  │  /*      ──→  React SPA (static assets)           │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────┬──────────┬──────────┬──────────┐          │
│  │  Auth  │ Courses  │Enrollment│ Progress │ ...      │
│  │ Module │ Module   │ Module   │ Module   │          │
│  └───┬────┴────┬─────┴────┬─────┴────┬─────┘          │
│      └─────────┴──────────┴──────────┘                 │
│              Hexagonal Core (Domain Logic)              │
└───────┬─────────┬──────────┬──────────┬───────────────┘
        │         │          │          │
        ▼         ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Neon    │ │Cloudflare│ │Cloudflare│ │ Resend  │
│PostgreSQL│ │   R2     │ │   R2     │ │ Email   │
│ (Free)   │ │ (Free)   │ │ (Free)   │ │ (Free)  │
└──────────┘ └─────────┘ └─────────┘ └─────────┘
  0.5GB       10GB        10GB       3K emails
  100 CU-hr   Zero egress Zero egress 100/day
                            Video+Files
```

### Request Flow — Course Content Access

```
Student ──→ GET /api/courses/:id/lessons/:lessonId
                    │
                    ▼
           ┌─────────────────┐
           │ Request ID Gen   │──→ Assign correlation ID
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Auth Middleware   │──→ Verify session (Better Auth → Neon)
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Enrollment Check │──→ Is student enrolled? (Neon query)
           └────────┬────────┘
                    │
           ┌────────┴────────┐
           │ YES             │ NO
           ▼                 ▼
    ┌──────────────┐  ┌──────────────┐
    │ Return lesson │  │ Return 403   │
    │ content       │  │ Forbidden    │
    └──────┬───────┘  └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Render blocks │──→ Text, Code, Video (R2 range stream via API)
    │ (React SPA)   │    Image (R2 signed URL)
    └──────────────┘    File (R2 signed URL)
```

---

## Environments

### Three-Environment Strategy

| Environment | Purpose | Database | R2 | Secrets |
|-------------|---------|----------|----|---------|
| `development` | Local development | Local PostgreSQL or Neon dev branch | dev bucket (or prefix) | .dev.vars file |
| `preview` | PR previews, staging | Neon preview branch | preview bucket (or prefix) | Cloudflare preview secrets |
| `production` | Live | Neon production database | production bucket | Cloudflare production secrets |

**Separation rules**:
- Development and preview MUST NOT write to production data.
- Each environment has its own database (Neon branches: `dev`, `preview`, `main`).
- R2 uses separate buckets OR prefixed object keys (`dev/`, `preview/`, `prod/`).
- Secrets are NEVER shared between environments.

**Preview deployment**: Every PR gets a preview URL via `wrangler pages deploy` or Workers preview. Preview uses a Neon branch created per-PR (dropped after merge).

See ADR-013 for full specification.

---

## Migration Strategy

### Explicit Migration Workflow

Migrations are NEVER run automatically on Worker startup. Migration is a separate, deliberate process.

**Workflow**: `generate → review → backup → migrate → health check`

1. **Generate**: `drizzle-kit generate` creates migration SQL from schema diff.
2. **Review**: Developer reviews generated SQL. No blind applies.
3. **Backup**: For production: create a Neon snapshot/branch before migrating.
4. **Migrate**: `drizzle-kit migrate` applies to target database.
5. **Health check**: Verify schema matches expectations. Run basic queries.

**Per-environment**:
- `development`: Auto-migrate on `drizzle-kit migrate` (safe, disposable DB).
- `preview`: Migrate on PR creation (Neon branch snapshot).
- `production`: Migrate manually via CI/CD with approval gate.

**Failed migration handling**:
- If migration is backward-compatible: safe to re-run or skip.
- If migration is destructive AND has a clean rollback: rollback.
- If migration is destructive AND no rollback: forward-fix (create a new migration).
- NEVER deploy a migration that cannot be recovered from.

**Destructive migrations** (DROP TABLE, DROP COLUMN) require:
- Explicit documentation in the migration file.
- Review by a second person (or AI review).
- Backup confirmation before execution.

See ADR-013 for full specification.

---

## File Changes

| Path | Action | Description |
|------|--------|-------------|
| `src/index.ts` | Create | Worker entry — Hono + ASSETS binding + static config |
| `wrangler.toml` | Create | Workers config: assets directory, run_worker_first, compat date |
| `src/api/` | Create | Hono API routes (auth, courses, content, progress, files, video, notifications) |
| `src/domains/` | Create | Hexagonal domain logic (pure, no infra imports) |
| `src/infra/` | Create | Adapters: Drizzle, R2 Video, R2 Storage, Resend, Better Auth |
| `src/shared/` | Create | Types, validators, constants |
| `drizzle/` | Create | Migration files (auth + application schemas) |
| `drizzle.config.ts` | Create | Drizzle Kit config with merged schemas |
| `package.json` | Create | Dependencies (hono, drizzle-orm, @neondatabase/serverless, better-auth) |
| `tsconfig.json` | Create | TypeScript config for Workers |

---

## Interfaces / Contracts

### VideoStorageProvider

```typescript
interface VideoStorageProvider {
  upload(params: VideoUploadParams): Promise<VideoAsset>;
  getStreamUrl(videoId: string, userId: string): Promise<string>;
  getMetadata(videoId: string): Promise<VideoMetadata>;
  delete(videoId: string): Promise<void>;
}

interface VideoUploadParams {
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

interface VideoAsset {
  id: string;
  provider: 'r2' | 'mux';
  providerAssetId: string;
  objectKey: string;
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'ready' | 'failed';
  createdAt: Date;
}

interface VideoMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'ready' | 'failed';
}
```

### StorageProvider

```typescript
interface StorageProvider {
  upload(key: string, file: ReadableStream): Promise<StorageResult>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  getMetadata(key: string): Promise<StorageMetadata>;
}

interface StorageResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

interface StorageMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
}
```

### EmailService

```typescript
interface EmailService {
  send(params: SendEmailParams): Promise<void>;
  sendTemplate<T>(params: SendTemplateParams<T>): Promise<void>;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendTemplateParams<T> {
  to: string | string[];
  template: EmailTemplate;
  data: T;
}
```

**Important**: Domain services depend on `EmailService`, NOT `ResendEmailProvider` directly. Business operations must NOT fail completely because a non-critical email fails. Email failures are logged and retried, not thrown.

### API Response Contract

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;        // Machine-readable error code (e.g., "COURSE_NOT_FOUND")
    message: string;     // Human-readable message (clients MUST NOT interpret this)
    requestId?: string;  // Correlation ID for debugging
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

**Error catalog** (machine-readable codes, NOT human messages):

| Domain | Code | HTTP Status |
|--------|------|-------------|
| Course | `COURSE_NOT_FOUND` | 404 |
| Course | `COURSE_NOT_PUBLISHED` | 403 |
| Course | `COURSE_ARCHIVED` | 403 |
| Enrollment | `NOT_ENROLLED` | 403 |
| Enrollment | `ALREADY_ENROLLED` | 409 |
| Progress | `LESSON_NOT_FOUND` | 404 |
| Upload | `FILE_TOO_LARGE` | 413 |
| Upload | `INVALID_MIME_TYPE` | 415 |
| Auth | `UNAUTHORIZED` | 401 |
| Auth | `FORBIDDEN` | 403 |
| General | `VALIDATION_ERROR` | 400 |
| General | `NOT_FOUND` | 404 |
| General | `RATE_LIMITED` | 429 |
| General | `INTERNAL_ERROR` | 500 |

### Database Schema Integration (Drizzle + Better Auth)

```typescript
// drizzle.config.ts — single migration system for both auth + app schemas
import * as authSchema from "./src/infra/auth.schema";
import * as appSchema from "./src/infra/app.schema";

export const schema = { ...authSchema, ...appSchema } as const;
```

---

## Idempotency and Consistency

### Operations Involving Multiple Systems

Some operations touch both PostgreSQL and R2 (or PostgreSQL and Resend). There are NO distributed transactions between PostgreSQL and R2.

**Order of operations (safe pattern)**:

| Operation | Order | Compensation |
|-----------|-------|-------------|
| Create asset + upload | 1. DB record (status=pending) → 2. R2 upload → 3. DB status=ready | If R2 fails: delete DB record. If DB fails after R2: delete R2 object. |
| Upload video | 1. DB record (status=uploading) → 2. R2 upload → 3. DB status=ready | If R2 fails: mark DB status=failed. If DB fails: R2 orphan cleaned by periodic job. |
| Delete asset | 1. Delete from DB → 2. Delete from R2 | If R2 fails: orphan cleanup job handles it. |
| Delete course | 1. Soft-delete course → 2. Cascade DB deletes → 3. Delete R2 objects | If R2 fails: orphan cleanup job. Never hard-delete course before R2 cleanup. |
| Enroll student | 1. DB insert enrollment → 2. Send welcome email | If email fails: log, retry. Enrollment is authoritative regardless of email. |
| Send email | 1. Attempt send → 2. Log success/failure | If fails: retry with backoff (max 3). Non-critical. |

**Idempotency**: Enrollments use `(student_id, course_id)` unique constraint. Duplicate enrollment attempts return existing enrollment, not error.

**Orphan cleanup**: A periodic background job (triggered via Worker Cron or manual run) scans for:
- R2 objects with no matching DB record.
- DB records with `status=failed` that were never cleaned up.

**MVP simplicity**: No sagas, no event sourcing, no message queues. Compensation is manual or via simple cron jobs.

---

## Upload Security

### File and Video Upload Validation

**Limits (configurable constants)**:
- `MAX_VIDEO_SIZE`: 500MB (configurable per environment)
- `MAX_FILE_SIZE`: 50MB (configurable per environment)

**Allowed MIME types** (server-side whitelist):
- Video: `video/mp4`, `video/webm`
- Files: `application/pdf`, `image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`, `text/plain`, `application/zip`, `text/javascript`, `text/html`, `text/css`

**Allowed extensions**: Whitelist checked alongside MIME type (both must pass).

**Server-side validation** (before accepting upload):
1. Check Content-Type header against allowed MIME types.
2. Check file extension against allowed extensions.
3. Check Content-Length against max size.
4. Generate internal object key: `courses/{courseId}/lessons/{lessonId}/assets/{assetId}` where `assetId` is a UUID.
5. NEVER use user-provided filenames as storage keys.

**Path traversal prevention**: Object keys are generated server-side. User input is only used in display fields, never in storage paths.

**Authorization model**:
- **Upload**: Authenticated user + course_instructors entry (collaborator or owner) + course exists.
- **Read/Download**: Authenticated user + enrollment in the course (or instructor/admin).
- **Delete**: Authenticated user + owner or admin role.

**Content-Disposition header**: Set on download to ensure browser downloads the file (not navigates to it).

**Orphan cleanup**: Periodic job removes R2 objects with no matching DB record. DB failure after R2 upload triggers R2 cleanup.

See ADR-012 for full specification.

---

## Observability

### Structured Logging from MVP

All logs are structured JSON for machine parsing and centralized aggregation.

**Every log entry includes**:
- `requestId` — Correlation ID (UUID, assigned at request start)
- `timestamp` — ISO 8601
- `level` — `info` | `warn` | `error` | `debug`
- `message` — Human-readable
- `service` — Module name (e.g., `courses`, `enrollment`, `auth`)
- `duration` — Request duration in ms (for request logs)
- `status` — HTTP status code (for request logs)
- `route` — Route pattern (e.g., `/api/courses/:id`)
- `method` — HTTP method
- `errorCode` — Application error code if applicable

**Request lifecycle logging**:
1. `request.start` — At request entry (method, route, requestId)
2. `request.end` — At request exit (status, duration, requestId)
3. `error` — On unhandled errors (stack trace, requestId)

**Health endpoint**: `GET /api/health` returns `200 OK` with basic status (database connectivity, timestamp).

**Centralized error handling**: All unhandled errors are caught by a global error handler that:
1. Logs the error with full context.
2. Returns a consistent error response (see API Error Contract above).
3. Never exposes internal details to the client.

**What NOT to log**:
- Passwords, password hashes
- Session tokens, auth headers
- API keys, secrets, credentials
- Full request bodies of sensitive endpoints (auth, payment)
- Unnecessary personal data (only what's needed for debugging)

See ADR-016 for full specification.

---

## Cost Model — Architecture Designed for Free Tiers

| Component | Provider | Free Limit | Spend Cap | Notes |
|-----------|----------|-----------|-----------|-------|
| Backend | Cloudflare Workers | 100K req/day, 10ms CPU/req | Hard limit | Usage monitoring required |
| Static Assets | Workers Static Assets | Unlimited | None needed | No overage (free, no metering) |
| Database | Neon PostgreSQL | 0.5GB, 100 CU-hr/mo, 10 branches | Auto-suspend | No billing on free tier |
| Storage + Video | Cloudflare R2 | 10GB, 1M Class A, 10M Class B ops | Hard limit | **Can generate costs if quotas exceeded** |
| Email | Resend | 3K/mo, 100/day, 3 domains (Free) | Hard limit | No billing on free tier |
| Auth | Better Auth | Self-hosted, unlimited | N/A | No cost |
| TLS | Cloudflare Universal SSL | Automatic, free | N/A | No cost |

**Important clarifications**:
- Architecture is designed to operate within free tiers initially, NOT unlimited.
- **R2 can generate costs** when free-tier quotas are exceeded (pay-as-you-go pricing kicks in).
- Usage monitoring and configurable limits are REQUIRED to prevent accidental overage.
- Video upload is NOT unlimited just because MVP starts free — size limits and quotas apply.

### R2 Monitoring Requirements

- Monitor storage usage (set alert at 8GB of 10GB).
- Monitor Class A operations (set alert at 800K of 1M).
- Monitor Class B operations (set alert at 8M of 10M).
- Configure per-video size limit (MAX_VIDEO_SIZE) to prevent single uploads consuming disproportionate quota.
- Document quota exhaustion behavior: uploads fail with clear error, existing content remains accessible.

---

## Accidental Payment Prevention

| Provider | Hard Limit? | What Happens at Limit | Monitoring Needed |
|----------|------------|----------------------|-------------------|
| Cloudflare Workers | YES | Requests return errors, no billing | Dashboard check |
| Neon PostgreSQL | YES | Compute auto-suspends, no billing | Dashboard check |
| Cloudflare R2 | YES (soft) | Operations may return errors OR incur charges beyond free tier | **Active monitoring required** |
| Resend | YES | Sending pauses, no billing | Dashboard check |
| Better Auth | N/A | Self-hosted | N/A |

**R2 is the exception**: R2 free tier has hard limits on storage and operations, but exceeding them can incur charges. Active monitoring and configurable quotas are mandatory.

---

## GDPR Considerations

- **Data minimization**: Only collect necessary fields (email, name, role)
- **EU data residency**: Neon supports EU regions; Cloudflare has EU PoPs
- **Data export**: JSON export only for MVP. UserDataExportService abstraction with versioned document format.
- **Export endpoint**: GET /api/me/export (authenticated, user-only)
- **Excluded from export**: passwords, hashes, sessions, tokens, internal security metadata
- **Account deletion**: Cascade delete for user data. Anonymization when other users' data references the deleted user (e.g., enrollment records, progress).
- **Data rectification**: Users can edit their own profile fields (name, email). Changes logged for audit.
- **Consent tracking**: Track terms acceptance (terms_version, accepted_at). Required before account activation.
- **Data retention**: Retain active accounts indefinitely. Retain deleted account records for 30 days (soft delete) before permanent removal.
- **Deletion process**: User requests deletion → soft delete (30-day grace period) → hard delete (cascade all data).
- **Audit logging**: Log security events from day one (login, role changes, data access, data export, data deletion).
- **Future formats**: CSV, ZIP via same abstraction (not MVP)

See ADR-010 for full specification.

---

## Rate Limiting

**Cloudflare-native rate limiting** (WAF rules or Rate Limiting API) — NOT application-level counters in PostgreSQL/Redis.

Risk-based, endpoint-specific:

**Priority endpoints (stricter limits)**:
- POST /auth/login
- POST /auth/register
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/verify-email

**Moderate limits**:
- POST /api/files (uploads)
- POST /api/video (uploads)
- GET /api/me/export

**Normal / no special limits**:
- GET /api/courses
- GET /api/courses/:id
- Normal navigation

**Rate limit keys**: IP, userId, IP+route, userId+route.

**Response**: HTTP 429 with Retry-After header.

---

## Security Alignment

| Threat | Mitigation |
|--------|-----------|
| T1: Student accessing other student's data | Server-side auth on every request, enrollment checks |
| T2: Student accessing unenrolled courses | Enrollment verification middleware, signed URLs |
| T3: Student accessing paid material | Free courses only in MVP |
| T4: Instructor accessing other instructors' courses | course_instructors table check on every content edit |
| T5: Instructor escalating to admin | Role verification on every request |
| T6: Unauthorized file downloads | Signed URLs with expiration, enrollment check |
| T7: Unauthorized video access | R2 private bucket, enrollment verification, API-gated stream |
| T8: Content scraping | Rate limiting, bot detection (POST-MVP) |
| T9: Progress manipulation | Server-side progress validation |
| T10-T11: Quiz/exercise manipulation | N/A (POST-MVP) |
| T12-T14: Account/session attacks | Better Auth session management, password hashing |
| T15-T16: Spam/harassment | Moderation (POST-MVP) |
| T17: Fake enrollments | Email verification, rate limiting |
| T18: DoS | Cloudflare DDoS protection |
| T19: Data breach | Encryption at rest/transit, access controls |
| T20: Supply chain | Minimal dependencies, version pinning |

---

## Post-MVP Extension Points

The current architecture is designed to support future additions without structural rewrites. Below are documented extension points.

### Paid Courses and Payments
- **Stripe integration**: Add `PaymentProvider` abstraction. Enrollment `source` field already supports `'purchase'`. No schema change needed for enrollment.
- **Subscriptions**: Add `Subscription` entity. Enrollment `source: 'subscription'` already exists.
- **Coupons**: Add `Coupon` entity, link to enrollment at creation time.

### Quizzes, Exams, Assignments
- **Quiz/Exam entity**: New domain module. Links to Lesson or Course.
- **Submission entity**: Records student answers. Already referenced in GDPR export.
- **Grading**: Instructor review workflow. Status field on submission.
- **Code editor/execution**: Add `CodeExecutionProvider` abstraction. Separate service.

### Live Classes and Scheduling
- **Calendar entity**: New domain module. Links to Course or Instructor.
- **Scheduled sessions**: Recurring or one-time. WebRTC or external provider.
- **Live attendance**: Track join/leave events.

### Social Features
- **Comments/Questions**: New domain module. Links to Lesson or Course.
- **Instructor replies**: Thread model with author + parent.
- **Moderation**: Admin review queue for reported content.

### Certificates and Analytics
- **Certificate entity**: Generated on course completion. Links to Enrollment.
- **Analytics dashboard**: Instructor view of enrollment, completion, engagement metrics.
- **Progress analytics**: Aggregate completion rates, time spent.

### Gamification and Community
- **Badges/Achievements**: New domain module. Triggers on progress milestones.
- **Leaderboards**: Derived from progress data.
- **Community features**: Forums, discussion boards. Separate module.

### AI Assistants
- **AI tutoring**: Separate service. References course content but does not modify it.
- **Content generation**: Instructor tool. Generates draft content blocks.

**Principle**: MVP decisions do NOT block any of these additions. Provider abstractions, extensible enrollment source, and modular architecture ensure clean integration paths.

---

## Open Questions

All questions from the proposal phase have been resolved.

- **RESOLVED**: Video hosting — Cloudflare R2 + MP4 + HTTP Range for MVP. VideoStorageProvider abstraction for future Mux.
- **RESOLVED**: Neon branch management — use Neon branches for test isolation, drop after test runs.
- **RESOLVED**: GDPR export — JSON only for MVP via UserDataExportService. CSV/ZIP deferred.
- **RESOLVED**: Resend domain verification — 3 verified domains available on Free plan.
- **RESOLVED**: Rate limiting — Cloudflare edge rules, risk-based, endpoint-specific.
- **RESOLVED**: Ownership model — course_instructors table separates RBAC from ownership.
- **RESOLVED**: Enrollment extensibility — source field supports future payment/invitation flows.
- **RESOLVED**: Progress model — lesson-level progress as source of truth, course % derived.
- **RESOLVED**: Migration strategy — explicit generate/review/backup/migrate/health-check workflow.
- **RESOLVED**: Environments — development, preview, production with database separation.
- **RESOLVED**: Observability — structured logging, correlation IDs, health endpoint from MVP.
