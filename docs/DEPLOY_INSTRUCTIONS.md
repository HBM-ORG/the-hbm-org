# 🚀 HBM Deployment Guide

Standard steps to run the site and admin dashboard 24/7 with live updates.

---

## 1. Prerequisites

- **Node.js** 18+ (see [config/.nvmrc](../config/.nvmrc); copy `config/.env.example` to `.env`).
- **PM2** (process manager):
```bash
npm install -g pm2
```

---

## 2. Build the Site

Always build the frontend before starting the server:
```bash
npm run build
```
This produces the `dist/` folder that the server serves in production.

---

## 3. Run with PM2 (Always On)

Use the ecosystem file in `config/` so the app restarts on crash or reboot:
```bash
pm2 start config/ecosystem.config.cjs
pm2 save
pm2 startup
```

- **Server port:** default `3001`. Ensure firewall/Nginx allows traffic to this port.
- **Admin access:** Currently open; consider Basic Auth or login middleware for production.

---

## 4. Subdomain (admin.thehbm.org)

1. In your DNS (GoDaddy, Cloudflare, etc.), add an **A record**:
   - **Host:** `admin`
   - **Points to:** your server IP
2. The app detects `admin.` and redirects to the dashboard.

---

## 5. Live Updates

The server serves both the API and static files. Saves in the admin update JSON/data on disk; the site loads this on each request, so changes appear **immediately** without rebuilding.

---

**See also:** [ARCHITECTURE.md](ARCHITECTURE.md) · [RENDER_ENV.md](RENDER_ENV.md) · [HOSTINGER_GUIDE.md](HOSTINGER_GUIDE.md)
