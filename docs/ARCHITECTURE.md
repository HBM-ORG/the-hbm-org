# Project Architecture

Full-stack monorepo: React (Vite) frontend + Express API server, Prisma, and static assets.

## Directory layout

```
├── admin-server.js       # Express API (events, uploads, email, Prisma)
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
│   ├── DEPLOY_*.md, HOSTINGER_GUIDE.md, RENDER_ENV.md, QA_REPORT.md, VISUAL_SITEMAP.md
│   └── notes/
├── generated/            # Prisma client (generated)
├── logs/                 # PM2 / server logs (gitignored)
├── prisma/
│   └── schema.prisma
├── public/               # Static assets and built site (dist served from here in prod)
│   ├── assets/           # Events, emails, CMS images (FTP to Hostinger in prod)
│   └── data/             # events.json etc.
├── scripts/              # One-off and build scripts
│   ├── generate-sitemap.js
│   ├── migrate-data.js
│   ├── smtp-diagnostics.js
│   ├── test-email-engine.js
│   └── output/           # Script outputs (e.g. lint_results.json)
├── src/                  # React app (Vite)
│   ├── components/
│   ├── pages/
│   ├── data/             # JSON configs, content
│   ├── i18n/
│   └── utils/
└── src-backup-v6/        # Legacy backup (optional)
```

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite 7, Tailwind |
| API      | Express (admin-server.js), REST + multipart uploads |
| DB       | Prisma; MySQL (production), SQLite (local optional) |
| Assets   | FTP upload to Hostinger `public_html/assets/` |
| Deploy   | Render (API), Hostinger (static/site), PM2 (self-hosted) |

## Entry points

- **Dev:** `npm run dev:admin` → Vite :4200 + Express :3001
- **Prod:** `node admin-server.js` (serves `dist/` + API)
- **PM2:** `pm2 start config/ecosystem.config.cjs`
