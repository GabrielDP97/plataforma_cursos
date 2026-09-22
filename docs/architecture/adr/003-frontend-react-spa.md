# ADR-003: React SPA with Vite on Workers Static Assets

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need a frontend that:
- Handles ~35 MVP screens (auth, catalog, course player, instructor tools, admin)
- Works within 0€/month budget
- Supports future growth (payments, live classes, AI features)
- Has good SEO for public course pages
- Integrates with Hono API backend
- Deploys as part of a single Worker unit (not separate Pages deployment)

## Decision

**React SPA with Vite** deployed as Workers Static Assets within a single Cloudflare Worker.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Workers Static Assets (React SPA + Vite)** | Single deployment, free static serving, unified CI/CD | No SSR | **CHOSEN** |
| **Cloudflare Pages + Workers (separate)** | SSR support, mature platform | Two deployments, Pages becoming legacy | REJECTED |
| **Next.js on Vercel** | SSR, great DX, large ecosystem | Hobby tier = non-commercial only, $20/mo minimum | REJECTED |
| **Next.js via @opennextjs/cloudflare** | Next.js on Cloudflare | Beta adapter, immature, adds risk | REJECTED |
| **Remix on Cloudflare** | Full-stack, good UX | Smaller ecosystem, less React community | REJECTED |

## Rationale

1. **Cloudflare recommends Workers as primary platform.** Pages is becoming legacy infrastructure. Investing in Pages means migrating later.
2. **Single deployment simplifies everything.** One `wrangler deploy` command. No separate Pages project, no cross-project config. Static assets served from the same Worker as the API.
3. **Static assets are FREE.** React SPA files are not counted against the 100K/day dynamic request limit. Unlimited static serving.
4. **`run_worker_first: ["/api/*"]`** routes API requests to Hono, everything else to React SPA. Clean separation without separate deployments.
5. **SEO handled differently.** Public course pages use meta tags, Open Graph, and prerendering services if needed. Course content is behind auth — SSR provides minimal value for authenticated pages.

## Consequences

- **Positive**: Simple deployment, fast development, unified CI/CD, zero cost.
- **Negative**: No SSR for public pages (mitigated by meta tags + prerendering if needed).
- **Neutral**: Can add SSR later via Astro or Remix if SEO becomes critical.

## Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (lightweight, simple)
- **Forms**: React Hook Form + Zod (validation)
- **Routing**: React Router v7
- **Component Library**: shadcn/ui (copy-paste, no vendor lock-in)
