# ADR-001: Modular Monolith Architecture

**Status**: ACCEPTED
**Date**: 2026-09-15
**Deciders**: Project Lead + AI Architecture Team

## Context

We need to choose an architecture pattern for a greenfield LMS platform with:
- 14 API domains (auth, courses, modules, lessons, content, enrollment, progress, notifications, search, admin, etc.)
- 15 MVP features
- Small team, AI-assisted development
- Zero-cost MVP constraint
- Must support future: live classes, quizzes, payments, AI features

## Decision

**Modular Monolith** on a single Cloudflare Worker deployment.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Modular Monolith** | Simple ops, clear boundaries, single deployment | Less isolation than microservices | **CHOSEN** |
| **Microservices** | Independent scaling, fault isolation | Operational complexity, overkill for MVP, network latency | REJECTED |
| **Serverless Functions** | Auto-scaling, pay-per-use | Cold starts, harder state management, complex debugging | REJECTED |
| **Edge Functions (per-route)** | Low latency | Cold starts, harder to share state, fragmented codebase | REJECTED |

## Rationale

1. **Team size**: Small team needs simple operations. Microservices require DevOps overhead we can't afford.
2. **Domain complexity**: LMS has interconnected domains (enrollment checks course access, progress tracks lesson completion). A monolith keeps these queries fast and simple.
3. **Deployment simplicity**: One `wrangler deploy` command. No service mesh, no API gateway, no inter-service auth.
4. **Future decomposability**: Hexagonal architecture (ports & adapters) within the monolith allows extracting services later (payments, live classes) without rewrite.
5. **Cloudflare Workers**: A single Worker with Hono's modular router handles this well. Workers scale automatically.

## Consequences

- **Positive**: Simple development, testing, and deployment. Fast iteration. Clear module boundaries enforced at code level.
- **Negative**: Less isolation than microservices. A bug in one module could theoretically affect others (mitigated by module boundaries and testing).
- **Neutral**: Can extract to microservices later if needed (e.g., payments service, live class service).

## Architecture Pattern

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication & authorization
│   │   ├── courses/       # Course CRUD & management
│   │   ├── content/       # Lesson content & blocks
│   │   ├── enrollment/    # Student enrollment
│   │   ├── progress/      # Learning progress tracking
│   │   ├── notifications/ # In-app & email notifications
│   │   ├── search/        # Course discovery
│   │   └── admin/         # Platform administration
│   ├── core/              # Domain entities, value objects
│   ├── ports/             # Interfaces (VideoProvider, StorageProvider, etc.)
│   └── adapters/          # Implementations (Mux, R2, Resend, etc.)
```
