# The HBM Workspace

Standard procedures for developing, testing, and deploying the platform. **Handoff:** see [docs/](docs/) (especially [ARCHITECTURE](docs/ARCHITECTURE.md), [DEPLOY_INSTRUCTIONS](docs/DEPLOY_INSTRUCTIONS.md), and [EMAIL_SYSTEM](docs/EMAIL_SYSTEM.md)).

## 📁 Project structure

The repo now uses separate app roots with independent installs/builds:

- **`/apps/site`** — Public React/Vite site for `thehbm.org` / `www.thehbm.org`
- **`/apps/admin`** — Admin React/Vite app for `admin.thehbm.org`
- **`/apps/server`** — Express API + worker entrypoints (`src/web.ts`, `src/worker.ts`, `prisma/`)
- **`/config`** — PM2, ESLint, Node version hints (e.g. `ecosystem.config.cjs`, `.nvmrc`)
- **`/docs`** — All documentation (deploy, CI/CD, legacy deployment history, sitemap); see [docs/README.md](docs/README.md)
- **`/data`** — Shared runtime/exported data kept at repo root
- **`/scripts`** — Reclassified helpers under `build/`, `dev/`, `ops/`, `one-off/`

Full layout and stack: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🛠 1. Environment Setup

Node **20.x** (see `config/.nvmrc`). Copy:

- `apps/server/.env.example` to `apps/server/.env`
- `apps/site/.env.example` to `apps/site/.env`
- `apps/admin/.env.example` to `apps/admin/.env`

The repo root `.env` may still be used by some historical one-off scripts, but active app runtime ownership now lives under each app root.

Always ensure your local environment is synchronized with the latest dependencies.

```bash
# Root helper dependencies
npm ci

# App-local installs
npm run install:site
npm run install:admin
npm run install:backend
```

## 🚀 2. Development Execution

Depending on your focus area, use one of the following commands:

### A. Full Stack (Site + Admin + Server) - PREFERRED

This runs both frontends and the Express backend.

```bash
npm run dev
```

- **Public Site**: `http://localhost:4200`
- **Admin UI**: `http://localhost:4300`
- **Admin Server**: `http://localhost:3001` (`apps/server/src/web.ts`)

### B. Public Site Only

```bash
npm run dev:site
```

### C. Admin + Server

```bash
npm run dev:admin
```

## 🏗 3. Production Readiness

Before deploying, always verify the production bundle.

```bash
# 1. Generate optimized assets
npm run build

# 2. Preview the public site build locally
npm run preview
```

## 📊 4. Admin Protocol

- **Admin Dashboard**: Local dev at `http://localhost:4300`, target production host `https://admin.thehbm.org`
- **Access**: Credentials via internal secure channels
- **Intelligence Sync**: Ensure the admin server is running (automatic in `dev:admin`; runs `apps/server/src/web.ts` via `tsx`)

## 📧 5. Email (Handoff)

Transactional and campaign emails use **SMTP** (nodemailer). To enable:

- Set **SMTP** in Admin → Email Architect → Automation Settings, **or** set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in env (server falls back to env if config is empty).
- Full overview, checklist, and Mailchimp/Bravo options: **[docs/EMAIL_SYSTEM.md](docs/EMAIL_SYSTEM.md)**.

## 🚢 6. Deployment Flow

1. **Lint**: `npm run lint` (Ensure code quality)
2. **Build**: `npm run build`
3. **Commit**: `git add . && git commit -m "feat: description"`
4. **Push**: `git push origin main`
