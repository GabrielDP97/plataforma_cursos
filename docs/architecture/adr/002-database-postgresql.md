# ADR-002: PostgreSQL via Neon Free Tier

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need a database that:
- Supports 20+ entities with complex relationships (Course → Module → Lesson → ContentBlock)
- Handles enrollment verification, progress calculation, role-based access
- Fits within 0€/month budget
- Supports future growth (payments, live classes, analytics)
- Works with Cloudflare Workers (serverless/edge runtime)

## Decision

**PostgreSQL via Neon Free Tier** (0.5GB storage, 100 CU-hours/month, scale-to-zero).

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Neon PostgreSQL** | Full SQL, scale-to-zero, 0.5GB free, branches | 0.5GB limit, cold start latency | **CHOSEN** |
| **Cloudflare D1** | 5GB free, Cloudflare-native, zero egress | SQLite (not PostgreSQL), single-threaded, limited SQL | REJECTED |
| **Supabase Free** | Full PostgreSQL, real-time, auth built-in | Projects PAUSE after inactivity, 500MB limit | REJECTED |
| **Turso (libSQL)** | Edge SQLite, distributed | Limited SQL features, not full PostgreSQL | REJECTED |
| **PlanetScale** | Serverless MySQL, branching | No free tier for new projects | REJECTED |
| **AWS RDS** | Enterprise-grade | No free tier, complex setup | REJECTED |

## Rationale

1. **LMS domain requires PostgreSQL**: Complex queries for progress calculation (SUM across modules, window functions for analytics), enrollment verification (JOINs between users, enrollments, courses), and content management (JSONB for flexible content blocks).
2. **D1 limitations**: SQLite is single-threaded, lacks full JOIN support in some cases, and doesn't support window functions well. The LMS domain model (20+ entities) needs relational power.
3. **Supabase pause**: Projects pause after inactivity — a non-starter for a production service that must be always available.
4. **Neon scale-to-zero**: Compute suspends after 5 minutes of inactivity. An idle MVP uses zero CU-hours. This is critical for the 0€ constraint.
5. **0.5GB is sufficient**: MVP data (users, courses, progress, enrollments) is text-heavy, not media-heavy. Media goes to R2/Mux.

## Consequences

- **Positive**: Full PostgreSQL power, scale-to-zero cost, branch-based development, modern DX.
- **Negative**: 0.5GB storage limit may need upgrade earlier than expected. Cold start latency (~1-2s) on first query after idle.
- **Neutral**: Two providers (Cloudflare + Neon) adds slight complexity vs all-Cloudflare.

## Migration Path

- **Free tier → Launch plan**: When storage exceeds 0.5GB or compute exceeds 100 CU-hours
- **Launch → Scale**: When autoscaling to larger compute needed
- **Exit strategy**: Standard PostgreSQL — dump/restore to any PostgreSQL host
