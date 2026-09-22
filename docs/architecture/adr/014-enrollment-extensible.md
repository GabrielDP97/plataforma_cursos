# ADR-014: Enrollment — Extensible Model

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

MVP supports free courses only. NO Stripe, payments, subscriptions, or coupons. BUT: the Enrollment entity must NOT structurally assume all enrollments are free. Future payment integration must be possible without schema migration.

## Decision

**Enrollment as independent entity** with `source` field for extensibility. Free enrollment is one source among many.

## Schema

```sql
enrollments (
  id UUID PRIMARY KEY,
  student_id UUID FK → users NOT NULL,
  course_id UUID FK → courses NOT NULL,
  status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
  source ENUM('free', 'purchase', 'admin', 'invitation', 'subscription') NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  dropped_at TIMESTAMP,
  UNIQUE(student_id, course_id)
)
```

## Source Field

| Source | Description | MVP |
|--------|-------------|-----|
| `free` | Student self-enrolled in a free course | ✅ |
| `purchase` | Enrolled via one-time payment | ❌ (future) |
| `admin` | Admin enrolled the student | ❌ (future) |
| `invitation` | Instructor invited the student | ❌ (future) |
| `subscription` | Enrolled via active subscription | ❌ (future) |

**Extensibility**: New sources can be added as enum values without changing the Enrollment entity structure.

## Enrollment Lifecycle

### Creation

An enrollment is created by a **trigger** (not a side effect of payment):

| Trigger | Source | Who Creates |
|---------|--------|-------------|
| Student clicks "Enroll" on free course | `free` | Application (enrollment service) |
| Admin enrolls student | `admin` | Application (admin service) |
| Instructor invites student | `invitation` | Application (instructor service) |
| Student completes purchase | `purchase` | Application (payment service, future) |
| Student has active subscription | `subscription` | Application (subscription service, future) |

**Key principle**: Enrollment is the authoritative record. It exists independently of payment, invitation, or admin action.

### Status Transitions

```
active → completed: Student finishes all lessons (or instructor marks complete)
active → dropped: Student voluntarily drops (or admin removes)
completed → active: Re-enrollment (rare, but possible)
dropped → active: Re-enrollment
```

### Enrollment Checks

Every content access request verifies:
1. User is authenticated.
2. User has an `active` enrollment for the course.
3. Enrollment `source` does not affect access (all active enrollments are equal).

**Future**: Paid courses may add payment verification alongside enrollment check. But the enrollment entity itself does not change.

## Idempotency

The `UNIQUE(student_id, course_id)` constraint prevents duplicate enrollments.

- If a student tries to enroll in an already-enrolled course: return existing enrollment (not an error).
- If a student re-enrolls after dropping: create new enrollment (status: `active`).

## GDPR Export

Enrollment data is included in user data export:
```json
{
  "enrollments": [
    {
      "courseId": "...",
      "courseTitle": "...",
      "status": "active",
      "source": "free",
      "enrolledAt": "2026-01-15T08:00:00Z"
    }
  ]
}
```

## Consequences

- **Positive**: Extensible without schema migration. Free enrollment is just one source. Future payment integration is clean.
- **Negative**: Slightly more complex than a simple `enrolled: boolean` field. Mitigated by clear documentation.
- **Neutral**: Enrollment is an independent entity, not a side effect. This is intentional — it enables multiple enrollment triggers.

## Future Integration

When adding payments:
1. Add `purchase` source to enum.
2. Create `PaymentService` that creates enrollment after successful payment.
3. Enrollment entity unchanged. No migration needed.

When adding subscriptions:
1. Add `subscription` source to enum.
2. Create `SubscriptionService` that manages enrollment lifecycle based on subscription status.
3. Enrollment entity unchanged. No migration needed.
