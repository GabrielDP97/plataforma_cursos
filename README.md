# LMS Platform

Plataforma de cursos de programación para estudiantes de 1.º de DAM y DAW.

## Tech Stack

- **Runtime**: Cloudflare Workers + Workers Static Assets
- **API**: Hono
- **Database**: PostgreSQL via Neon (Drizzle ORM)
- **Auth**: Better Auth (self-hosted)
- **Storage**: Cloudflare R2
- **Email**: Resend
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Testing**: Vitest (backend) + Playwright (E2E)
- **CI/CD**: GitHub Actions + Wrangler

## Requisitos

- Node.js 18+
- npm 9+
- Neon PostgreSQL (or compatible)

## Instalación

### Backend

```bash
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Variables de Entorno

Backend variables go in `.dev.vars` (loaded by Wrangler). See `.dev.vars.example` for the full list.

**Required** (app won't start without these):
- `NEON_DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Session signing secret

**Optional** (features degrade gracefully without these):
- `ADMIN_BOOTSTRAP_SECRET` — For first admin setup only
- `RESEND_API_KEY` — Emails silently skipped if not set
- `R2_*` — File uploads fail gracefully if not set

```bash
cp .dev.vars.example .dev.vars
# Fill in NEON_DATABASE_URL and BETTER_AUTH_SECRET
```

## Desarrollo

### Quick Start (First Time)

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Configure environment
cp .dev.vars.example .dev.vars
# Edit .dev.vars and fill in:
#   - NEON_DATABASE_URL (required)
#   - BETTER_AUTH_SECRET (required, generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3. Run database migrations
npm run db:migrate

# 4. Start backend (Terminal 1)
npm run dev

# 5. Start frontend (Terminal 2)
cd frontend && npm run dev

# 6. Set up first admin
# Open http://localhost:5173/internal/admin-setup
# Fill in name, email, password, and the bootstrap secret
```

### Daily Development

```bash
# Backend (Terminal 1)
npm run dev
# Runs on http://localhost:8787 (Wrangler)

# Frontend (Terminal 2)
cd frontend && npm run dev
# Runs on http://localhost:5173
```

## Base de Datos

### Generar migraciones

```bash
npm run db:generate
```

### Ejecutar migraciones

```bash
npm run db:migrate
```

### Seed de desarrollo

```bash
npm run db:seed
```

Creates test users:
- `student@test.local` / `Student123!`
- `instructor@test.local` / `Instructor123!`
- `instructor2@test.local` / `Instructor123!`
- `admin@test.local` / `Admin123!`

### Reset and re-seed

```bash
npm run db:seed:reset
```

## First Admin Setup

### 1. Configure the bootstrap secret

Add to your `.env` file:

```
ADMIN_BOOTSTRAP_SECRET=<your-secret-here>
```

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Start the servers

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Open the setup page

Navigate to: http://localhost:5173/internal/admin-setup

This page is NOT linked from any menu.

### 4. Create the admin account

Fill in:
- Name
- Email
- Password (min 8 characters)
- Bootstrap secret (the value from ADMIN_BOOTSTRAP_SECRET)

### 5. Sign in

After creation, you'll be redirected to /login.
Sign in with the credentials you just created.
You'll be redirected to /admin based on your role.

### 6. Bootstrap is now disabled

The setup page will show "Configuration already completed" and cannot be used again.

### Security Notes

- The bootstrap endpoint checks that NO admin exists before allowing creation
- Once an admin is created, the bootstrap is permanently disabled
- The secret is never stored in the frontend bundle
- Public registration always creates "student" role — cannot be escalated
- All admin routes require role = admin (server-side check)

## Tests

### Backend

```bash
npm test
```

### Frontend

```bash
cd frontend
npx tsc --noEmit
npm run build
```

### E2E (Playwright)

```bash
cd frontend
npx playwright install chromium
npx playwright test
```

For authenticated E2E, start backend first and run seed:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run db:seed

# Terminal 3
cd frontend && npx playwright test
```

## Build para Producción

```bash
cd frontend
npm run build
```

Genera `frontend/dist/` que Cloudflare Workers sirve como assets estáticos.

### Wrangler (Cloudflare Workers)

```bash
# Desarrollo local con Wrangler
npm run dev

# Deploy a staging
npx wrangler deploy --env staging

# Deploy a producción
npx wrangler deploy --env production
```

## Estructura del Proyecto

```
plataforma_cursos/
├── src/                    # Backend (Hono + Drizzle)
│   ├── api/routes/         # API endpoints
│   ├── domains/            # Business logic
│   ├── infra/              # Database, auth, providers
│   └── shared/             # Types, constants, validators
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── routes/         # Route definitions
│   └── e2e/                # Playwright tests
├── drizzle/                # Database migrations
└── docs/                   # Architecture docs
```

## Arquitectura

- **Backend**: Modular Monolith on Cloudflare Workers
- **Frontend**: React SPA with Vite
- **Database**: Neon PostgreSQL
- **Auth**: Better Auth
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest (backend) + Playwright (E2E)

See [design.md](./design.md) for technical architecture.
See [docs/architecture/adr/](./docs/architecture/adr/) for Architecture Decision Records.
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

## Licencia

Privado.
