# 🏗 Project Architecture

Full-stack monorepo: **React (Vite)** frontend + **Express** API server, **Prisma**, and static assets.

---

## Directory layout

```
├── server/
│   └── admin-server.ts   # Express API (events, uploads, email, Prisma)
├── index.html            # Vite entry
├── package.json
├── vite.config.js
├── prisma.config.ts
├── config/               # Process/deploy config
│   └── ecosystem.config.cjs   # PM2
├── data/                 # Runtime data (gitignored: *.db)
│   ├── site-configs.json
│   └── *.db              # SQLite (local) – production uses MySQL
├── docs/                 # All project documentation
│   ├── ARCHITECTURE.md, DEPLOY_*.md, EMAIL_SYSTEM.md, HOSTINGER_GUIDE.md, …
│   └── notes/
├── generated/            # Prisma client (generated)
├── logs/                 # PM2 / server logs (gitignored)
├── prisma/
│   └── schema.prisma
├── public/               # Static assets and built site (dist served here in prod)
│   ├── assets/           # Events, emails, CMS images (FTP to Hostinger in prod)
│   └── data/             # events.json etc.
├── scripts/              # One-off and build scripts
│   ├── generate-sitemap.js
│   ├── migrate-data.js
│   ├── smtp-diagnostics.js
│   ├── test-email-engine.js
│   └── output/
├── src/                  # React app (Vite)
│   ├── components/
│   ├── pages/
│   ├── data/             # JSON configs, content
│   ├── i18n/
│   └── utils/
└── src-backup-v6/        # Legacy backup (optional)
```

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite 7, Tailwind |
| API      | Express (`admin-server.ts` via `tsx`), REST + multipart uploads |
| DB       | Prisma; MySQL (production), SQLite (local optional) |
| Assets   | FTP upload to Hostinger `public_html/assets/` |
| Deploy   | Render (API), Hostinger (static/site), PM2 (self-hosted) |

---

## Entry points

| Context | Command |
|---------|---------|
| **Dev** | `npm run dev:admin` → Vite :4200 + Express :3001 |
| **Prod** | `npm start` (runs `tsx server/admin-server.ts`, serves `dist/` + API) |
| **PM2** | `pm2 start config/ecosystem.config.cjs` |

---

**See also:** [README](../README.md) · [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) · [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
