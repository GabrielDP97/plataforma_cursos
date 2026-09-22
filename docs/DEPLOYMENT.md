# Deployment Guide

## Architecture

```
LOCAL (wrangler dev)  →  STAGING (Cloudflare Workers)  →  PRODUCTION (Cloudflare Workers)
        ↓                        ↓                              ↓
   .dev.vars              Dashboard Secrets              Dashboard Secrets
   localhost:8787         staging.lms-platform.workers.dev  lms-platform.workers.dev
```

**Stack:** Hono (Workers) · Neon PostgreSQL · Better Auth · Cloudflare R2 · Resend

---

## 1. Local Development

### Prerequisites
- Node.js 20+
- Copy `.dev.vars.example` → `.dev.vars` and fill in your values

### Start Backend
```bash
npm run dev
# → http://localhost:8787
```

### Start Frontend
```bash
cd frontend && npm run dev
# → http://localhost:5173
```

### Run Tests
```bash
# Backend unit tests (no DB required)
npm test

# Backend integration tests (requires DB)
npm run test:integration

# Frontend tests
cd frontend && npm test

# Full build check (backend + frontend)
npm run check
```

### Database Migrations
```bash
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply to your Neon database
npm run db:seed       # Seed sample data
```

### First Admin Setup
1. Start backend: `npm run dev`
2. Open: http://localhost:5173/internal/admin-setup
3. Create your admin account

---

## 2. Staging Deployment

### Prerequisites
- Cloudflare account with Workers enabled
- Neon database (can be same as dev or separate staging DB)

### Set Secrets (first time only)
```bash
npx wrangler secret put NEON_DATABASE_URL --env staging
npx wrangler secret put BETTER_AUTH_SECRET --env staging
npx wrangler secret put ADMIN_BOOTSTRAP_SECRET --env staging
npx wrangler secret put RESEND_API_KEY --env staging        # optional
npx wrangler secret put CONTACT_EMAIL --env staging          # optional
npx wrangler secret put CONTACT_FROM --env staging           # optional
```

### Deploy
```bash
# Build and deploy
npm run deploy:staging
# or manually:
npx wrangler deploy --env staging
```

### Verify
```bash
curl https://staging.lms-platform.workers.dev/api/health
```

---

## 3. Production Deployment

> ⚠️ **PRODUCTION DEPLOY REQUIRES EXPLICIT USER AUTHORIZATION**

### Prerequisites
- Staging validated and working
- All secrets set for production environment

### Set Secrets (first time only)
```bash
npx wrangler secret put NEON_DATABASE_URL --env production
npx wrangler secret put BETTER_AUTH_SECRET --env production
npx wrangler secret put ADMIN_BOOTSTRAP_SECRET --env production
npx wrangler secret put RESEND_API_KEY --env production        # optional
npx wrangler secret put CONTACT_EMAIL --env production          # optional
npx wrangler secret put CONTACT_FROM --env production           # optional
```

### Deploy (after approval)
```bash
npm run deploy:production
# or manually:
npx wrangler deploy --env production
```

### Verify
```bash
curl https://lms-platform.workers.dev/api/health
```

### Rollback
```bash
npx wrangler rollback --env production
# or via Cloudflare Dashboard: Workers → Version History → Rollback
```

---

## 4. Environment Variables

### Non-Secrets (in `wrangler.toml [vars]`)

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `ENVIRONMENT` | `development` | `staging` | `production` |
| `BETTER_AUTH_URL` | `http://localhost:8787` | `https://staging.lms-platform.workers.dev` | `https://lms-platform.workers.dev` |
| `CORS_ORIGIN` | `http://localhost:5173` | `https://staging.lms-platform.workers.dev` | `https://lms-platform.workers.dev` |

### Secrets (dashboard secrets / `.dev.vars`)

| Variable | Where | Required |
|----------|-------|----------|
| `NEON_DATABASE_URL` | `.dev.vars` / dashboard | Yes |
| `BETTER_AUTH_SECRET` | `.dev.vars` / dashboard | Yes |
| `ADMIN_BOOTSTRAP_SECRET` | `.dev.vars` / dashboard | Optional (first admin only) |
| `RESEND_API_KEY` | `.dev.vars` / dashboard | Optional (emails) |
| `CONTACT_EMAIL` | `.dev.vars` / dashboard | Optional (contact form) |
| `CONTACT_FROM` | `.dev.vars` / dashboard | Optional (contact form) |
| `R2_ACCOUNT_ID` | `.dev.vars` / dashboard | Optional (file uploads) |
| `R2_ACCESS_KEY_ID` | `.dev.vars` / dashboard | Optional (file uploads) |
| `R2_SECRET_ACCESS_KEY` | `.dev.vars` / dashboard | Optional (file uploads) |
| `R2_BUCKET_NAME` | `.dev.vars` / dashboard | Optional (file uploads) |

---

## 5. Pre-Deploy Checklist

Before deploying to staging or production:

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Frontend builds without errors (`cd frontend && npm run build`)
- [ ] Unit tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Login / registration tested locally
- [ ] Course catalog loads correctly
- [ ] Course detail pages work
- [ ] Contact form sends email (or fails gracefully)
- [ ] Light / Dark mode toggles correctly
- [ ] Staging environment validated (`curl .../api/health`)
- [ ] No secrets in `wrangler.toml` or `.gitignore`
- [ ] Changelog / release notes written

---

## 6. Health Check

All environments expose a health endpoint:

```bash
curl https://{environment}.lms-platform.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-22T...",
  "version": "1.0.0"
}
```

---

## 7. Troubleshooting

### "Better Auth: Drizzle schema mismatch"
Run `npx auth generate` to refresh the Drizzle schema, then apply migrations.

### "Base URL is not set"
Set `BETTER_AUTH_URL` environment variable to your deployment URL.

### Cold start latency
Workers have minimal cold starts. Verify `compatibility_flags = ["nodejs_compat"]` in `wrangler.toml`.
