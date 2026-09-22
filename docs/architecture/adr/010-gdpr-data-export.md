# ADR-010: GDPR — Data Export, Deletion, and Privacy

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

GDPR requires data portability, right to erasure, data rectification, and consent tracking. MVP scope: JSON export, cascade deletion, editable profile fields, consent/terms tracking. Future: CSV, ZIP, anonymization.

## Decision

**UserDataExportService** for data export (JSON MVP). **AccountDeletionService** for cascade deletion. **ConsentService** for terms acceptance tracking.

## Data Export

### Architecture

```
UserDataExportService
├── generateExport(userId) → ExportDocument
├── ExportDocument { version, generatedAt, user, profile, enrollments, progress, submissions, notifications, events }
└── Future: CSVExporter, ZIPExporter
```

### Endpoint

```
GET /api/me/export
Authorization: Bearer <session-token>
```

Authenticated, user-only. Returns JSON document with all user data.

### Exported Data

| Data Type | Description |
|-----------|-------------|
| User profile | Email, name, role, created_at |
| Enrollments | Course enrollments with timestamps, status, source |
| Lesson progress | Individual lesson progress, completion, video position |
| Notifications | In-app notifications |
| Account events | Login history, password changes, role changes, data export requests |

### Excluded Data

| Data Type | Reason |
|-----------|--------|
| Passwords / password hashes | Security — never export credentials |
| Session tokens / secrets | Security — active sessions must remain server-side |
| Internal security metadata | Implementation detail, not user data |
| Other users' data | Privacy — only own data |

### Document Format

```json
{
  "exportVersion": "1.0",
  "generatedAt": "2026-09-15T10:30:00Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2026-01-15T08:00:00Z"
  },
  "consent": {
    "termsVersion": "1.0",
    "acceptedAt": "2026-01-15T08:01:00Z"
  },
  "enrollments": [...],
  "progress": [...],
  "notifications": [...],
  "events": [...]
}
```

### Constraints

- **Auth required**: Must be authenticated to export.
- **User-only data**: Can only export own data. No admin bulk export in MVP.
- **JSON only**: MVP scope. CSV and ZIP deferred.
- **Versioned format**: `exportVersion` field enables future format changes without breaking existing exports.
- **Machine-readable**: Standard JSON. Portable, documented, parseable by any tool.

### Future Formats

Via same abstraction:
- `CSVExporter` — Tabular data (enrollments, progress)
- `ZIPExporter` — JSON + file attachments (course resources)

## Account Deletion

### Process

1. User requests deletion via `POST /api/me/delete`.
2. **Soft delete**: Account marked as `deleted`. User can no longer log in. Data retained for 30-day grace period.
3. **Grace period**: User can contact support to cancel deletion within 30 days.
4. **Hard delete**: After 30 days (or immediate if no grace period policy), cascade delete all user data:
   - Delete from `users` table.
   - Cascade delete enrollments, lesson progress, notifications.
   - Delete R2 objects owned by the user (uploads, videos).
   - Anonymize references if other users' data depends on deleted user (e.g., instructor-owned courses — reassign or delete).

### Cascading Deletions

| Entity | Action on User Deletion |
|--------|------------------------|
| enrollments | DELETE WHERE student_id = user_id |
| lesson_progress | DELETE WHERE student_id = user_id |
| notifications | DELETE WHERE user_id = user_id |
| course_instructors | DELETE WHERE user_id = user_id (or reassign ownership) |
| uploaded files | DELETE from R2 WHERE owner_id = user_id |
| videos | DELETE from R2 WHERE owner_id = user_id |

### Anonymization Scenarios

- If a deleted user was the sole `owner` of a course: course is soft-deleted or ownership transferred to admin.
- If a deleted user had `collaborator` access: remove from `course_instructors`.

## Data Rectification

Users can edit their own profile fields via `PATCH /api/me`:
- `name` — Editable
- `email` — Editable (requires re-verification)
- `role` — NOT editable by user (admin only)

All changes are logged in `account_events` for audit trail.

## Consent and Terms Tracking

### Schema

```sql
user_consents (
  id UUID PRIMARY KEY,
  user_id UUID FK → users,
  terms_version VARCHAR(50) NOT NULL,
  accepted_at TIMESTAMP NOT NULL,
  ip_address INET
)
```

- **Terms version**: Semver string (e.g., "1.0", "1.1").
- **Required before account activation**: User must accept current terms version during registration.
- **New terms**: When terms are updated, existing users must re-accept on next login.
- **Record**: Each acceptance is a new row (historical record).

## Data Retention

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Active accounts | Indefinite | Service availability |
| Soft-deleted accounts | 30 days | Grace period for cancellation |
| Hard-deleted accounts | Immediately removed | GDPR compliance |
| Account events | 1 year | Audit trail |
| Logs (personal data) | 30 days | Debugging, then purged |

## Export Endpoint Behavior

- Rate limited: 1 request per hour per user.
- Response: `200 OK` with JSON body (Content-Type: application/json).
- Large exports: If data exceeds 10MB, return `202 Accepted` with job ID, poll for completion.

## Consequences

- **Positive**: Full GDPR compliance (portability, deletion, rectification, consent). Simple implementation. Versioned format.
- **Negative**: JSON only — not human-readable for non-technical users. Mitigated by future CSV format.
- **Neutral**: Export endpoint adds minimal load (one-time generation, not streaming). Deletion is async (30-day grace).

## Future Enhancements

- **CSVExporter**: Tabular format for non-technical users.
- **ZIPExporter**: Includes file attachments (course resources, certificates).
- **Automated deletion**: Cron job processes soft-deleted accounts past grace period.
- **Admin bulk export**: Admin role can export all users (for compliance audits).
