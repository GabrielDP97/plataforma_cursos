# ADR-006: Data Access / ORM — Drizzle + @neondatabase/serverless

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need an ORM that:
- Works with Cloudflare Workers + Neon PostgreSQL
- Handles migrations for both auth and application schemas in a single system
- Integrates with Better Auth (official adapter available)
- Provides type-safe queries without heavy runtime overhead
- Is officially documented by Cloudflare for use with Hyperdrive

## Decision

**Drizzle ORM + @neondatabase/serverless + Drizzle Kit** for migrations.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Drizzle ORM** | Native Neon support, single migration system, Better Auth adapter | Newer ecosystem | **CHOSEN** |
| **Prisma** | Mature, large ecosystem | Heavier runtime, no native Neon Workers adapter | REJECTED |
| **Kysely** | Type-safe, lightweight | No Better Auth integration, more manual query building | REJECTED |
| **Raw SQL** | Full control, no abstraction overhead | No type safety, no migration system | REJECTED |

## Rationale

1. **Native Neon support.** Drizzle has `drizzle-orm/neon-http` and `drizzle-orm/neon-serverless` packages. No adapter hacks needed.
2. **Official Better Auth integration.** `@better-auth/drizzle-adapter` means Better Auth stores sessions, users, accounts in the same Drizzle-managed schema.
3. **Single migration system.** Drizzle Kit handles ALL migrations — both Better Auth schema and application schemas generate into a single `drizzle/` directory. No competing migration tools.
4. **Cloudflare endorsement.** Cloudflare officially documents Drizzle + Hyperdrive as the recommended pattern for Workers + PostgreSQL.
5. **Lightweight runtime.** Drizzle is query-builder-first, not a heavy ORM. Minimal overhead on Workers.

## Migration Owner

**Drizzle Kit** owns all migrations.

```
drizzle-kit generate → drizzle/0000_*.sql
drizzle-kit migrate  → applies to Neon database
```

Both Better Auth schema and application schemas merge into a single migration directory. One tool, one command, one source of truth.

## Consequences

- **Positive**: Native Neon support, single migration system, Better Auth integration, lightweight runtime, Cloudflare-endorsed.
- **Negative**: Newer ecosystem (less community content than Prisma). Mitigated by strong documentation and active development.
- **Neutral**: If Drizzle ecosystem stalls, migration path exists (standard PostgreSQL, SQL dumps).
