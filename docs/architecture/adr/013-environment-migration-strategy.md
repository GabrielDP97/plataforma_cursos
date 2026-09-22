# ADR-013: Environment and Migration Strategy

**Status**: ACCEPTED
**Date**: 2026-09-16
**Deciders**: Project Lead + AI Architecture Team

## Context

We need clear environment separation (development, preview, production) and a migration strategy that prevents data loss, accidental production changes, and deployment failures.

## Decision

**Three environments** with separate databases and secrets. **Explicit migration workflow** with review and health checks. No auto-migration on Worker startup.

## Environments

| Environment | Purpose | Database | R2 | Secrets | URL |
|-------------|---------|----------|----|---------|-----|
| `development` | Local development | Local PostgreSQL or Neon dev branch | dev bucket (or prefix) | `.dev.vars` file | `localhost:8787` |
| `preview` | PR previews, staging | Neon preview branch | preview bucket (or prefix) | Cloudflare preview secrets | `*.workers.dev` (preview) |
| `production` | Live | Neon production database | production bucket | Cloudflare production secrets | `app.example.com` |

### Separation Rules

1. **Development MUST NOT write to production data.** Use local or dev-branch database.
2. **Preview MUST NOT write to production data.** Use preview-branch database.
3. **Production secrets are NEVER shared** with development or preview.
4. **R2 uses separate buckets** (preferred) OR prefixed object keys (`dev/`, `preview/`, `prod/`).

### Neon Branching

- `main` branch → production database.
- `dev` branch → development (persistent, long-lived).
- `preview/*` branches → per-PR (created on PR open, dropped after merge/close).

**Preview branch lifecycle**:
1. PR opened → Neon branch created via API.
2. Branch URL and credentials stored as preview secrets.
3. Preview Worker deploys with preview database.
4. PR merged/closed → Neon branch dropped.

### Secrets Management

| Secret | Development | Preview | Production |
|--------|-------------|---------|------------|
| `BETTER_AUTH_SECRET` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |
| `RESEND_API_KEY` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |
| `R2_ACCOUNT_ID` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |
| `R2_ACCESS_KEY_ID` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |
| `R2_SECRET_ACCESS_KEY` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |
| `DATABASE_URL` | `.dev.vars` | Cloudflare preview secrets | Cloudflare production secrets |

## Migration Strategy

### Workflow

```
generate → review → backup → migrate → health check
```

1. **Generate**: `drizzle-kit generate` creates migration SQL from schema diff.
2. **Review**: Developer reviews generated SQL. Understand what changes are being made.
3. **Backup**: For production: create a Neon snapshot or branch before migrating.
4. **Migrate**: `drizzle-kit migrate` applies to target database.
5. **Health check**: Verify schema matches expectations. Run basic queries.

### Per-Environment

| Environment | Migration Trigger | Backup | Approval |
|-------------|-------------------|--------|----------|
| `development` | `drizzle-kit migrate` (manual or on save) | Not required (disposable) | None |
| `preview` | On PR creation (via CI) | Neon branch snapshot | None |
| `production` | Manual via CI/CD | Neon snapshot required | Human approval gate |

### Auto-Migration: NEVER

Migrations NEVER run automatically on Worker startup. Migration is a separate, deliberate process. Rationale:
- Accidental schema changes in production.
- No visibility into what changed.
- No backup opportunity.
- No review step.

### Failed Migration Handling

| Scenario | Action |
|----------|--------|
| Migration is backward-compatible | Safe to re-run or skip |
| Migration is destructive AND has clean rollback | Rollback |
| Migration is destructive AND no rollback | Forward-fix (create new migration) |
| Migration partially applied | Check state, complete or rollback manually |

**NEVER deploy a migration that cannot be recovered from.**

### Destructive Migrations

Destructive migrations (DROP TABLE, DROP COLUMN, TRUNCATE) require:
1. Explicit documentation in the migration file comment.
2. Review by a second person (or AI review).
3. Backup confirmation before execution.
4. Rollback script documented.

## CI/CD Integration

### Development → Preview

```
PR opened → Create Neon branch → Deploy preview Worker → Run migrations on preview DB
```

### Preview → Production

```
PR merged → Deploy production Worker → Manual approval → Run migrations on production DB → Health check
```

### Rollback

```
If migration fails → Revert migration (if rollback exists) → Redeploy previous Worker version
```

## Consequences

- **Positive**: Clear environment separation, no accidental production changes, explicit migration workflow, reviewable schema changes.
- **Negative**: Preview branch lifecycle adds operational complexity (Neon API integration). Mitigated by automation in CI/CD.
- **Neutral**: Manual migration approval adds a step to deployment. This is intentional — schema changes are high-risk.
