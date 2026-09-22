# Deployment Guide

## Overview

This LMS platform runs on **Cloudflare Workers** with:
- **API**: Hono framework on Workers
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Better Auth with Drizzle adapter
- **Email**: Resend

## Environments

| Environment | URL | Branch | Notes |
|---|---|---|---|
| Development | `localhost:5173` | any | Local via `wrangler dev` |
| Staging | `staging.lms-platform.workers.dev` | `main` | Auto-deployed on push |
| Production | `lms-platform.workers.dev` | `main` | Manual deploy trigger |

## Prerequisites

1. **Node.js 20+**
2. **Cloudflare account** with Workers enabled
3. **Neon account** for PostgreSQL
4. **Resend account** for email
5. **Wrangler CLI** (`npm install -g wrangler`)

## Environment Variables

### Required for all environments

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.workers.dev

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Storage (R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=lms-{env}
```

### Set secrets in Cloudflare

```bash
# Staging
wrangler secret put DATABASE_URL --env staging
wrangler secret put BETTER_AUTH_SECRET --env staging
wrangler secret put RESEND_API_KEY --env staging

# Production
wrangler secret put DATABASE_URL --env production
wrangler secret put BETTER_AUTH_SECRET --env production
wrangler secret put RESEND_API_KEY --env production
```

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Start dev server
npm run dev

# Run tests
npm test              # Unit tests (no DB required)
npm run test:integration  # Integration tests (requires DB)
```

## Deployment

### Automatic (CI/CD)

Push to `main` triggers:
1. **CI pipeline**: lint, typecheck, unit tests, build
2. **Staging deploy**: automatic after CI passes

### Manual Production Deploy

```bash
# Via GitHub Actions
# Go to Actions → Deploy → Run workflow → Select "production"

# Via Wrangler directly
npm run build
wrangler deploy --env production
```

### Verify Deployment

```bash
# Health check
curl https://lms-platform.workers.dev/api/health

# Expected response:
# { "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

## Database Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations (run against your Neon database)
npm run db:migrate
```

## Monitoring

- **Cloudflare Dashboard**: Workers analytics, logs, errors
- **Neon Dashboard**: Database metrics, query performance
- **Health endpoint**: `/api/health` returns service status

## Rollback

If a deployment fails:

1. **Via Cloudflare Dashboard**: Workers → Select worker → Version history → Rollback
2. **Via Wrangler**: `wrangler rollback --env production`

## Troubleshooting

### "Better Auth: Drizzle schema mismatch"

Run `npx auth generate` to refresh the Drizzle schema, then apply migrations.

### "Base URL is not set"

Set `BETTER_AUTH_URL` environment variable to your deployment URL.

### Cold start latency

Workers have minimal cold starts. If experiencing issues:
- Check `compatibility_flags = ["nodejs_compat"]` in `wrangler.toml`
- Verify no unnecessary imports at module level
