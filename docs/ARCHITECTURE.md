# 🏗 Project Architecture

Full-stack monorepo: **React (Vite)** frontend + **Express** API server, **Prisma**, and static assets.

---

## Directory layout

```text
├── package.json
├── prisma.config.ts
├── apps/
│   ├── site/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── public/
│   │   ├── src/
│   │   └── dist/
│   ├── admin/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── public/
│   │   ├── src/
│   │   └── dist/
│   └── server/
│       ├── prisma/
│       ├── src/
│       │   ├── web.ts          # Express web entrypoint
│       │   ├── worker.ts       # Email worker entrypoint
│       │   └── services/
│       └── package.json
├── config/               # Shared repo/process config
│   └── ecosystem.config.cjs
├── data/                 # Runtime data (gitignored: *.db)
│   ├── site-configs.json
│   └── *.db              # SQLite (local) – production uses MySQL
├── docs/                 # All project documentation
│   ├── ARCHITECTURE.md, DEPLOY_*.md, EMAIL_SYSTEM.md, HOSTINGER_GUIDE.md, …
│   └── notes/
├── logs/                 # PM2 / server logs (gitignored)
├── scripts/
│   ├── build/
│   ├── dev/
│   ├── ops/
│   ├── one-off/
│   └── output/
└── src-backup-v6/        # Legacy backup (optional)
```

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 7, Tailwind |
| API | Express (`apps/server/src/web.ts` via `tsx`), REST + upload signing |
| DB | Prisma; MySQL (production), SQLite (local optional) |
| Assets | DigitalOcean Spaces or Google Cloud Storage |
| Deploy | Workspace-aware Docker/CI, PM2/self-hosted, DO/GCP |

---

## Entry points

| Context | Command |
| --- | --- |
| **Dev** | `npm run dev` → Site Vite :4200 + Admin Vite :4300 + Express :3001 |
| **Prod** | `npm start` (runs `tsx apps/server/src/web.ts`, serves `apps/site/dist/` + API) |
| **Worker** | `npm run start:worker` |
| **PM2** | `pm2 start config/ecosystem.config.cjs` |

---

**See also:** [README](../README.md) · [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) · [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
