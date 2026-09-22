# ADR-004: Cloudflare-Native Infrastructure

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need infrastructure that costs 0/month during MVP, serves static assets, runs API logic, stores files, handles CDN delivery globally, and supports EU data residency for GDPR.

## Decision

**Cloudflare-native** (Workers Static Assets + R2) with Neon PostgreSQL for database.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Workers Static Assets + R2** | Zero egress, global CDN, 0 free tier, single deployment | D1 is SQLite (need Neon) | **CHOSEN** |
| Cloudflare Pages + Workers + R2 | Zero egress, global CDN | Pages becoming legacy, two deployments | REJECTED |
| Vercel + Supabase | Good DX, integrated | Vercel Hobby non-commercial, Supabase pauses | REJECTED |
| AWS (S3 + Lambda + CloudFront) | Enterprise-grade | Complex pricing, egress fees | REJECTED |
| Railway / Render | Simple PaaS | Limited free tier, costs add up | REJECTED |

## Rationale

1. **Workers is now Cloudflare's primary platform.** Pages is becoming legacy. Investing in Workers Static Assets is the forward-compatible choice.
2. **Zero egress:** R2 charges zero egress fees. An LMS serves lots of file downloads and video streaming.
3. **Unified platform:** Workers + R2 = one ecosystem, one dashboard, one deployment.
4. **Global CDN:** 300+ edge locations for fast content delivery.
5. **DDoS protection:** Built-in on all Cloudflare services.
6. **GDPR compatibility:** EU PoPs and data localization support.
7. **Neon exception:** D1 SQLite limitations don't suit the LMS domain model.

## Consequences

- **Positive**: Zero egress fees, global CDN, simple operations, unified billing, single deployment.
- **Negative**: Two providers (Cloudflare + Neon) adds slight complexity.
- **Neutral**: Can consolidate to all-Cloudflare if D1 matures.

## Exit Strategy

- **Cloudflare to Any CDN**: React SPA is standard static files. Deploy anywhere.
- **Workers to Node.js**: Hono runs on Node.js. Migrate to any Node.js host.
- **R2 to S3**: S3-compatible API. Migrate to any S3-compatible storage.
- **Neon to Any PostgreSQL**: Standard PostgreSQL. Dump/restore to any host.
