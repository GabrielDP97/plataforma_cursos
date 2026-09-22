# Proposal: Technical Architecture & Stack Selection

## Intent

Greenfield LMS platform needs a complete technology stack decision before Phase 1 development. No code or infrastructure exists yet. Wrong choice here creates years of friction; right choice enables fast iteration for a small AI-assisted team.

## Scope

### In Scope
- Architecture pattern (monolith vs modular monolith vs microservices)
- Frontend framework and UI library
- Backend runtime, framework, and language
- Database and ORM
- Authentication strategy
- File storage and video hosting
- Deployment platform and CI/CD
- Testing framework
- 3 complete stack proposals with weighted decision matrix
- Architecture Decision Records (ADRs)
- Cost estimation (infrastructure, development, maintenance)
- Vendor lock-in and exit strategy analysis

### Out of Scope
- No code writing or project initialization
- No database schema design (that's sdd-design)
- No API endpoint definitions (that's sdd-spec)
- No UI/UX design decisions

## Capabilities

### New Capabilities
None — this is a decision/design phase, not a feature implementation.

### Modified Capabilities
None — no existing capabilities to modify.

## Approach

### Stack Proposal A: **Next.js Full-Stack (Recommended)**

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Architecture | Modular Monolith | Boundaries without operational overhead |
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind CSS | SSR/SSG, file-based routing, server components |
| Backend | Next.js API Routes + tRPC | Type-safe APIs, co-located with frontend |
| Database | PostgreSQL | Proven, free, excellent for relational LMS data |
| ORM | Drizzle ORM | Type-safe, SQL-like, lightweight |
| Auth | NextAuth.js (Auth.js) | battle-tested, multiple providers, session mgmt |
| File Storage | Cloudflare R2 (S3-compatible) | Free egress, 10GB free tier, GDPR-friendly |
| Video Hosting | Mux or Cloudflare Stream | Pay-per-use, no egress fees, signed URLs |
| Email | Resend + React Email | Free tier, modern DX |
| Search | PostgreSQL full-text search → Meilisearch | Start simple, upgrade later |
| Deployment | Vercel (frontend) + Railway or Render (backend) | Free tiers, fast deploys |
| CI/CD | GitHub Actions | Free for public repos |
| Testing | Vitest + Playwright | Fast unit tests, E2E coverage |

**Cost Estimate (MVP):**
- Infrastructure: $0-20/mo (free tiers)
- Development: Team time only
- Maintenance: Minimal (managed services)
- Exit Strategy: LOW lock-in — all standard tech, PostgreSQL portable, Next.js deployable anywhere

### Stack Proposal B: **Laravel + Inertia.js**

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Architecture | Modular Monolith | Laravel modules/package structure |
| Frontend | Laravel + Inertia.js + Vue 3 + Tailwind | Server-rendered with SPA feel |
| Backend | Laravel (PHP 8.3+) | Mature ecosystem, built-in auth, queues, jobs |
| Database | PostgreSQL | Same recommendation |
| ORM | Eloquent (built-in) | Feature-rich, mature |
| Auth | Laravel Breeze/Jetstream | Production-ready auth scaffolding |
| File Storage | S3-compatible (R2 or DigitalOcean Spaces) | Same as A |
| Video Hosting | Mux or similar | Same as A |
| Email | Mailgun or Resend | Laravel has built-in mail abstraction |
| Search | Laravel Scout + Meilisearch | First-party search package |
| Deployment | Laravel Forge + DigitalOcean | PHP hosting is cheap |
| CI/CD | GitHub Actions | Same |
| Testing | Pest (PHPUnit) + Cypress | PHP-native testing |

**Cost Estimate (MVP):**
- Infrastructure: $0-25/mo
- Development: PHP talent pool is large, fast prototyping
- Maintenance: Laravel ecosystem is stable
- Exit Strategy: MEDIUM — Laravel-specific patterns, but PHP is universal

### Stack Proposal C: **Django + React**

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Architecture | Modular Monolith | Django apps as boundaries |
| Frontend | React 19 + Vite + Tailwind | SPA with Django REST backend |
| Backend | Django (Python 5) + DRF | batteries-included, admin panel, ORM |
| Database | PostgreSQL | Same |
| ORM | Django ORM (built-in) | Mature, migrations built-in |
| Auth | Django auth + dj-rest-auth | Built-in, well-tested |
| File Storage | S3-compatible (django-storages) | Same |
| Video Hosting | Mux or similar | Same |
| Email | Django email + Resend/SendGrid | Same |
| Search | PostgreSQL → Django + Haystack | Start with DB, upgrade later |
| Deployment | Railway or Render | Free tiers, Python-friendly |
| CI/CD | GitHub Actions | Same |
| Testing | pytest-django + Playwright | Python testing ecosystem |

**Cost Estimate (MVP):**
- Infrastructure: $0-25/mo
- Development: Python talent available, slower frontend iteration
- Maintenance: Django is stable, fewer breaking changes
- Exit Strategy: LOW — Django admin is a feature, Python is universal

## Decision Matrix (Weighted)

| Criterion | Weight | Next.js (A) | Laravel (B) | Django (C) |
|-----------|--------|-------------|-------------|------------|
| Team iteration speed | 25% | 9 | 7 | 6 |
| Full-stack type safety | 20% | 9 | 7 | 6 |
| MVP build time | 20% | 8 | 8 | 7 |
| Future scalability | 15% | 9 | 7 | 8 |
| Cost (free tier friendly) | 10% | 8 | 8 | 8 |
| Community & ecosystem | 10% | 9 | 8 | 8 |
| **Weighted Total** | **100%** | **8.75** | **7.45** | **7.05** |

## ADR: Architecture Pattern

**Decision:** Modular Monolith

**Context:** Small team, AI-assisted, needs fast iteration. Microservices add operational complexity. Pure monolith loses domain boundaries.

**Consequences:**
- Domain boundaries enforced at code level (not deployment)
- Single deployment unit (simple operations)
- Can extract services later if needed (payments, live classes)
- Trade-off: less isolation than microservices, but appropriate for team size

## ADR: Frontend Architecture

**Decision:** Next.js 15 App Router with React Server Components

**Context:** LMS needs good SEO (course pages), fast initial loads, and complex interactive editors.

**Consequences:**
- Server components reduce client JS bundle
- File-based routing maps cleanly to LMS screens (~35 MVP screens)
- tRPC gives end-to-end type safety without code generation
- Trade-off: App Router has learning curve, but pays off for content-heavy sites

## ADR: Database

**Decision:** PostgreSQL with Drizzle ORM

**Context:** LMS has 20+ entities with complex relationships. Needs full-text search, JSON support for content blocks.

**Consequences:**
- Drizzle gives SQL-like DX with type safety
- PostgreSQL full-text search handles MVP search needs
- JSONB for flexible content block storage
- Trade-off: Drizzle is newer than Prisma, smaller ecosystem

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Technology choice lock-in | Medium | All choices are standard, portable tech |
| Team unfamiliarity with chosen stack | Low | AI-assisted development compensates |
| Free tier limits exceeded | Low | Usage-based scaling, start small |
| PostgreSQL full-text search insufficient | Low | Meilisearch drop-in replacement ready |
| Vercel vendor lock-in | Low | Next.js deploys to any Node.js host |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/architecture/` | New | ADRs, stack comparison, cost analysis |
| `docs/project-context.md` | Modified | Update pending decisions to resolved |
| `package.json` | New | Dependencies when code starts |

## Rollback Plan

- All technology choices are reversible at this stage (no code written)
- If stack choice proves wrong after Phase 1, pivot cost is low (2-4 weeks)
- PostgreSQL data is portable via SQL dumps
- Next.js app can be redeployed to alternative hosts

## Dependencies

- External: PostgreSQL hosting, file storage provider, video hosting provider
- Prerequisites: None (greenfield)

## Success Criteria

- [ ] 3 complete stack proposals evaluated
- [ ] Weighted decision matrix produced
- [ ] Architecture pattern decided with rationale
- [ ] ADRs created for key decisions
- [ ] Cost estimates for MVP and post-MVP
- [ ] Vendor lock-in analysis completed
- [ ] Human approval gate passed

## Proposal Question Round

Before finalizing, these questions need human input:

1. **Team expertise**: Does the team have experience with any specific stack (React, Vue, Laravel, Django)?
2. **Deployment preference**: Vercel (serverless) vs Railway/Render (containers) — any preference?
3. **Video hosting**: Mux (premium, great UX) vs Cloudflare Stream (cheaper) vs self-hosted (complex)?
4. **Budget ceiling**: What's the monthly infrastructure budget ceiling for post-MVP?
5. **GDPR specifics**: Any particular hosting region requirements beyond "Europe-friendly"?
