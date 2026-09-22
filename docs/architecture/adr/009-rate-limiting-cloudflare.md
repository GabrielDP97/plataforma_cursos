# ADR-009: Rate Limiting — Cloudflare Edge

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need application-level rate limiting from MVP:
- Protect against brute force attacks (login, password reset)
- Prevent abuse of file/video uploads
- Risk-based, endpoint-specific limits (not global arbitrary limits)
- Zero additional infrastructure cost
- Must work at edge level (before reaching Worker)

## Decision

**Cloudflare-native rate limiting** (WAF Rate Limiting Rules or Rate Limiting API) as primary. Application-level rate limiting as secondary for complex rules.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Cloudflare WAF Rate Limiting** | Edge-level, no application code, free tier support | Limited customization | **CHOSEN (primary)** |
| **Cloudflare Rate Limiting API** | Programmatic, per-rule configuration | More complex setup | **CHOSEN (complex rules)** |
| **Application-level (PostgreSQL counters)** | Full control | Adds DB load, latency, code complexity | REJECTED (initially) |
| **Redis / Durable Objects** | Fast counters | Adds complexity, potential cost | REJECTED (initially) |
| **IP-only limiting** | Simple | NAT/shared IP groups legitimate users | REJECTED (sole method) |

## Rationale

1. **Edge-level protection.** Cloudflare handles rate limiting BEFORE requests reach the Worker. No application code needed for basic rules.
2. **Free tier support.** Cloudflare's free plan includes basic WAF rules. No additional cost.
3. **Risk-based approach.** Different endpoints get different limits based on sensitivity. Login attempts get strict limits. Course browsing gets generous limits.
4. **Multiple key types.** Rate limits keyed by IP (unauthenticated), userId (authenticated), IP+route (sensitive endpoints), userId+route (high-risk operations).
5. **Secondary layer available.** If Cloudflare limits prove insufficient, application-level rate limiting can be added later. NOT PostgreSQL counters — consider Durable Objects only if demonstrated need.

## Rate Limit Configuration

**Priority endpoints (stricter limits)**:
- `POST /auth/login` — Brute force protection
- `POST /auth/register` — Spam prevention
- `POST /auth/forgot-password` — Abuse prevention
- `POST /auth/reset-password` — Token brute force
- `GET /auth/verify-email` — Email enumeration prevention

**Moderate limits**:
- `POST /api/files` — Upload abuse
- `POST /api/video` — Upload abuse
- `GET /api/me/export` — Data exfiltration

**Normal / no special limits**:
- `GET /api/courses` — Public browsing
- `GET /api/courses/:id` — Course details
- Normal navigation

## HTTP Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

## Consequences

- **Positive**: Edge-level protection, zero application code for basic rules, free tier support, risk-based approach.
- **Negative**: Limited customization compared to application-level solutions. Mitigated by Cloudflare Rate Limiting API for complex rules.
- **Neutral**: If Cloudflare limits insufficient, application-level rate limiting can be added as secondary layer without replacing Cloudflare rules.
