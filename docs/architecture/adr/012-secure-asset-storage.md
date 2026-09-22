# ADR-012: Secure Asset Storage

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

The LMS stores files (PDFs, images, code files) and videos in Cloudflare R2. Uploads must be validated, secured, and authorized. The application must prevent path traversal, enforce size limits, and handle failures gracefully.

## Decision

**Secure upload pipeline** with server-side validation, UUID-based key generation, and authorization checks at every access point.

## Upload Validation

### Size Limits

```typescript
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;  // 500MB (configurable per environment)
const MAX_FILE_SIZE = 50 * 1024 * 1024;     // 50MB (configurable per environment)
```

### Allowed MIME Types

**Video**:
- `video/mp4`
- `video/webm`

**Files**:
- `application/pdf`
- `image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`
- `text/plain`, `text/html`, `text/css`, `text/javascript`
- `application/zip`
- `application/javascript`

### Allowed Extensions

Server-side whitelist checked alongside MIME type. Both must pass.

```
.pdf, .png, .jpg, .jpeg, .gif, .svg, .txt, .html, .css, .js, .ts, .zip, .mp4, .webm
```

### Validation Order

1. Check Content-Type header against allowed MIME types.
2. Check file extension against allowed extensions.
3. Check Content-Length against max size.
4. If all pass → proceed to upload.

## Object Key Generation

**Rule**: NEVER use user-provided filenames as storage keys.

**Convention**:
```
courses/{courseId}/lessons/{lessonId}/assets/{assetId}/{sanitized-filename}
```

Where:
- `courseId` — UUID of the course
- `lessonId` — UUID of the lesson
- `assetId` — UUID generated server-side (NOT user-provided)
- `sanitized-filename` — Original filename with special characters removed (for display only)

**Example**: `courses/a1b2c3d4/lessons/e5f6g7h8/assets/i9j0k1l1/my-document.pdf`

**Path traversal prevention**: Object keys are constructed server-side. User input is only used in the `sanitized-filename` segment, which is stripped of path separators (`/`, `\`, `..`).

## Authorization Model

### Upload Authorization

| Check | Required |
|-------|----------|
| User is authenticated | YES |
| User has `course_instructors` entry for the target course | YES |
| User's role is `owner` or `collaborator` | YES |
| Course exists and is not soft-deleted | YES |

### Read/Download Authorization

| Check | Required |
|-------|----------|
| User is authenticated | YES |
| User is enrolled in the course (student) OR is instructor/admin | YES |
| Asset exists and is not soft-deleted | YES |

### Delete Authorization

| Check | Required |
|-------|----------|
| User is authenticated | YES |
| User is `owner` of the course OR `admin` | YES |
| Asset exists | YES |

**Collaborators CANNOT delete assets** — only owners and admins.

## Content-Disposition

On download, set:
```
Content-Disposition: attachment; filename="document.pdf"
```

Prevents browser from navigating to the file (e.g., rendering PDF in-browser). Forces download.

## Orphan Cleanup

A periodic job (Worker Cron or manual trigger) scans for orphaned R2 objects:

1. List all objects in R2 bucket (by prefix).
2. For each object, check if a matching DB record exists.
3. If no DB record → delete the R2 object.
4. Log all deletions for audit.

**Frequency**: Daily (configurable).

## Failure Compensation

### DB Failure After R2 Upload

If R2 upload succeeds but the DB insert fails:
1. The R2 object exists without a DB record (orphan).
2. The orphan cleanup job will remove it within 24 hours.
3. The user sees an error. They can retry the upload.

### R2 Failure After DB Write

If the DB record is created but R2 upload fails:
1. DB record has `status: 'failed'`.
2. The orphan cleanup job will remove the failed DB record.
3. The user sees an error. They can retry the upload.

### Retry Strategy

- **Upload**: Client-side retry (up to 3 attempts). Each attempt generates a new `assetId` (idempotent).
- **Download**: Client-side retry. Signed URLs are time-limited (1 hour). Regenerate on retry.

## Consequences

- **Positive**: Secure uploads, no path traversal, size limits, authorization at every access point, orphan cleanup handles failures.
- **Negative**: UUID-based keys are not human-readable in R2 console. Mitigated by DB metadata (original filename, course/lesson context).
- **Neutral**: Orphan cleanup adds operational overhead (daily cron job). Minimal cost (one R2 list + DB query per object).
