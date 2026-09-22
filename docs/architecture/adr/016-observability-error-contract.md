# ADR-016: Observability and Error Contract

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

The LMS needs structured logging, consistent error responses, and health monitoring from MVP. Without observability, debugging production issues is guesswork.

## Decision

**Structured JSON logging** with correlation IDs. **Consistent API error format** with machine-readable codes. **Health endpoint** for liveness checks.

## Structured Logging

### Log Format

Every log entry is structured JSON:

```json
{
  "requestId": "uuid",
  "timestamp": "2026-09-16T10:30:00.000Z",
  "level": "info",
  "message": "Request completed",
  "service": "courses",
  "duration": 45,
  "status": 200,
  "method": "GET",
  "route": "/api/courses/:id",
  "errorCode": null
}
```

### Log Levels

| Level | When |
|-------|------|
| `error` | Unhandled exceptions, system failures |
| `warn` | Recoverable errors, retryable failures, degraded state |
| `info` | Request lifecycle, business operations, state changes |
| `debug` | Detailed flow information (dev/preview only) |

### Request Lifecycle Logging

1. **`request.start`** — At request entry:
   ```json
   { "level": "info", "message": "Request started", "method": "GET", "route": "/api/courses/:id", "requestId": "uuid" }
   ```

2. **`request.end`** — At request exit:
   ```json
   { "level": "info", "message": "Request completed", "status": 200, "duration": 45, "requestId": "uuid" }
   ```

3. **`error`** — On unhandled errors:
   ```json
   { "level": "error", "message": "Unhandled error", "stack": "...", "requestId": "uuid", "errorCode": "INTERNAL_ERROR" }
   ```

### What NOT to Log

- Passwords, password hashes
- Session tokens, auth headers
- API keys, secrets, credentials
- Full request bodies of sensitive endpoints (auth, payment, data export)
- Unnecessary personal data (only what's needed for debugging)

**Rule**: If it could be used to impersonate or harm a user, do NOT log it.

## API Error Contract

### Response Format

```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Course not found",
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Important**: Clients MUST NOT interpret the `message` field. It is for human debugging only. The `code` field is the machine-readable contract.

### Error Code Catalog

| Domain | Code | HTTP Status | Description |
|--------|------|-------------|-------------|
| Course | `COURSE_NOT_FOUND` | 404 | Course does not exist |
| Course | `COURSE_NOT_PUBLISHED` | 403 | Course is in draft status |
| Course | `COURSE_ARCHIVED` | 403 | Course is archived |
| Course | `COURSE_ALREADY_PUBLISHED` | 409 | Course is already published |
| Enrollment | `NOT_ENROLLED` | 403 | User is not enrolled in the course |
| Enrollment | `ALREADY_ENROLLED` | 409 | User is already enrolled |
| Enrollment | `ENROLLMENT_DROPPED` | 403 | Enrollment is dropped |
| Progress | `LESSON_NOT_FOUND` | 404 | Lesson does not exist |
| Progress | `LESSON_NOT_COMPLETED` | 400 | Prerequisite lesson not completed |
| Upload | `FILE_TOO_LARGE` | 413 | File exceeds max size |
| Upload | `INVALID_MIME_TYPE` | 415 | File type not allowed |
| Upload | `UPLOAD_FAILED` | 500 | Upload to storage failed |
| Auth | `UNAUTHORIZED` | 401 | Not authenticated |
| Auth | `FORBIDDEN` | 403 | Authenticated but not authorized |
| Auth | `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| Auth | `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| Auth | `ACCOUNT_LOCKED` | 423 | Too many failed attempts |
| General | `VALIDATION_ERROR` | 400 | Request validation failed |
| General | `NOT_FOUND` | 404 | Resource not found |
| General | `METHOD_NOT_ALLOWED` | 405 | HTTP method not supported |
| General | `RATE_LIMITED` | 429 | Too many requests |
| General | `INTERNAL_ERROR` | 500 | Unexpected server error |
| General | `SERVICE_UNAVAILABLE` | 503 | Dependent service unavailable |

### Validation Error Details

For `VALIDATION_ERROR`, include field-level details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": ["Title is required"],
      "email": ["Invalid email format"]
    },
    "requestId": "..."
  }
}
```

### Error Logging

Every error response is also logged:
```json
{
  "level": "error",
  "message": "API error",
  "errorCode": "COURSE_NOT_FOUND",
  "status": 404,
  "method": "GET",
  "route": "/api/courses/:id",
  "requestId": "uuid",
  "duration": 12
}
```

## Health Endpoint

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-16T10:30:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "storage": "ok"
  }
}
```

**Checks**:
- `database`: Verify Neon connection (simple SELECT 1).
- `storage`: Verify R2 connectivity (optional, lightweight HEAD request).

**Status codes**:
- `200` — All checks pass.
- `503` — One or more checks fail.

**No authentication required** — health endpoint is public (used by uptime monitors).

## Centralized Error Handling

All unhandled errors are caught by a global error handler:

1. Catch the error.
2. Log it with full context (requestId, stack, route, method).
3. Map to appropriate HTTP status and error code.
4. Return consistent error response.
5. Never expose internal details (stack traces, DB errors) to the client.

```typescript
app.onError((err, c) => {
  const requestId = c.get('requestId');

  // Log the error
  logger.error({
    requestId,
    message: 'Unhandled error',
    stack: err.stack,
    route: c.req.path,
    method: c.req.method,
  });

  // Map to error code
  const { status, code } = mapErrorToResponse(err);

  return c.json({
    success: false,
    error: {
      code,
      message: getPublicMessage(code),
      requestId,
    },
  }, status);
});
```

## Consequences

- **Positive**: Debuggable in production, consistent error handling, health monitoring, no sensitive data leakage.
- **Negative**: Structured logging adds some overhead (minimal on Workers). Error catalog must be maintained.
- **Neutral**: Log aggregation service (e.g., Cloudflare Logpush) can be added later for centralized viewing. MVP logs to console (structured JSON).
