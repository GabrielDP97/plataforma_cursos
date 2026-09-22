# ADR-007: Authentication — Better Auth Self-Hosted

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need authentication that:
- Works on Cloudflare Workers (edge runtime)
- Integrates with Drizzle ORM + Neon PostgreSQL
- Supports sessions, email verification, password reset
- Costs zero during MVP
- Provides full control (no vendor lock-in)
- Stores sessions in the same database as application data

## Decision

**Better Auth** self-hosted with Drizzle adapter.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Better Auth** | Self-hosted, Drizzle adapter, MIT, framework-agnostic | Newer project | **CHOSEN** |
| **Lucia Auth** | Lightweight, DIY, good docs | More manual work, no official Drizzle adapter | REJECTED |
| **Clerk** | Managed, feature-rich, quick setup | Third-party, vendor lock-in, paid tiers | REJECTED |
| **Auth.js (NextAuth)** | Popular, large ecosystem | Primarily Node.js, Workers support uncertain | REJECTED |

## Rationale

1. **Self-hosted = full control.** No third-party service. No vendor lock-in. Sessions stored in our Neon database.
2. **Official Drizzle adapter.** `@better-auth/drizzle-adapter` integrates Better Auth schema with Drizzle's migration system. One database, one migration tool.
3. **Cloudflare Workers integration.** `better-auth-cloudflare` package provides native Workers support. No Node.js polyfills needed.
4. **Feature-complete.** Email/password auth, email verification, password reset, session management, role-based access — all built in.
5. **MIT license.** Free, open source, no usage restrictions.

## Features Used

- Email/password authentication
- Email verification (via Resend)
- Password reset flow
- Session management (stored in Neon via Drizzle)
- Role-based access control (student, instructor, admin)

## Consequences

- **Positive**: Full control, no vendor lock-in, Drizzle integration, Workers-native, MIT licensed.
- **Negative**: Newer project (less community content than Auth.js). Mitigated by active development and clear documentation.
- **Neutral**: If Better Auth stalls, migration path exists (standard session management with Drizzle).
