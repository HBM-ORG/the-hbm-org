# 👑 The HBM – Professional Development Flow

Standard procedures for developing, testing, and deploying the platform. **Handoff:** see [docs/](docs/) (especially [ARCHITECTURE](docs/ARCHITECTURE.md) and [EMAIL_SYSTEM](docs/EMAIL_SYSTEM.md)) for structure and email setup.

## 📁 Project structure

Root is kept to **7 files** (package.json, package-lock.json, .gitignore, README.md, index.html, vite.config.js, prisma.config.ts). All other config and server code live in subfolders.

- **`/config`** — PM2, ESLint, env template (e.g. `ecosystem.config.cjs`, `.env.example`, `.nvmrc`).
- **`/docs`** — All documentation (deploy, Hostinger, Render, QA, sitemap); see [docs/README.md](docs/README.md)
- **`/data`** — Runtime data and local DB files (gitignored)
- **`/scripts`** — Build and utility scripts (sitemap, migrate, email diagnostics)
- **`/server`** — Express API (admin-server.js)
- **`/src`** — React frontend (Vite)
- **`/public`** — Static assets and `dist` output

Full layout and stack: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🛠 1. Environment Setup
Node **18+** (recommended: 20; see `config/.nvmrc`). Copy `config/.env.example` to `.env` and fill in values.

Always ensure your local environment is synchronized with the latest dependencies.
```bash
# Clean install (if you encounter strange bugs)
rm -rf node_modules
npm install

# Standard update
npm install
```

## 🚀 2. Development Execution
Depending on your focus area, use one of the following commands:

### A. Full Stack (Client + Admin Server) - PREFERRED
This runs the React frontend AND the Express backend (for emails, event saving, and image uploads).
```bash
npm run dev:admin
```
- **UI**: `http://localhost:4200`
- **Admin Server**: `http://localhost:3001`

### B. Client Only
If you are only editing styling or UI logic and don't need the database/upload services.
```bash
npm run dev
```

## 🏗 3. Production Readiness
Before deploying, always verify the production bundle.
```bash
# 1. Generate optimized assets
npm run build

# 2. Preview the build locally
npm run preview
```

## 📊 4. Admin Protocol
- **Admin Dashboard**: Accessible via `/admin`
- **Access**: Credentials via internal secure channels
- **Intelligence Sync**: Ensure the admin server is running (automatic in `dev:admin`; runs `server/admin-server.js`)

## 📧 5. Email (Handoff)
Transactional and campaign emails use **SMTP** (nodemailer). To enable:
- Set **SMTP** in Admin → Email Architect → Automation Settings, **or** set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in env (server falls back to env if config is empty).
- Full overview, checklist, and Mailchimp/Bravo options: **[docs/EMAIL_SYSTEM.md](docs/EMAIL_SYSTEM.md)**.

## 🚢 6. Deployment Flow
1. **Lint**: `npm run lint` (Ensure code quality)
2. **Build**: `npm run build`
3. **Commit**: `git add . && git commit -m "feat: description"`
4. **Push**: `git push origin main`
