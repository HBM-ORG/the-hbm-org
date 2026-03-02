# 🌐 HBM Production Deployment (Hostinger)

How to deploy the HBM platform (site + admin + API) on Hostinger.

---

## 1. Preparation

Build the frontend before uploading:
```bash
npm run build
```
This generates the `dist/` folder.

---

## 2. What to Upload

| Folder / File | Description | Destination |
|----------------|-------------|-------------|
| `dist/` | Static frontend | `public_html/` or app root |
| `server/` (admin-server.js) | Backend Node server | Application root |
| `package.json` | Dependencies | Application root |
| `public/logos/`, `public/assets/` | Brand and media | Same structure under `public/` |
| `src/data/` | JSON data (CMS, regs) | Same structure under `src/data/` |

**Do not upload `.env`.** Set all secrets in the Hostinger panel (see below).

---

## 3. Hostinger Configuration

1. **Node.js:** Panel → Advanced → Node.js; select the app folder.
2. **Startup file:** `server/admin-server.js` (or set start command to `node server/admin-server.js`).
3. **Environment variables** (in panel):
   - `PORT=3001`
   - `NODE_ENV=production`
   - `DATABASE_URL` (if using MySQL)
   - `GEMINI_API_KEY`, `GOOGLE_BOOKS_API_KEY` (optional)
   - For email: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (see [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md))
   - For assets: `FTP_HOST`, `FTP_USER`, `FTP_PASS` (see [RENDER_ENV.md](RENDER_ENV.md))

---

## 4. Persistence

The app writes to `src/data/*.json`. Ensure the Node process has **write permissions** to `src/data/`.

---

## 5. Troubleshooting

- **Design looks different:** Purge Hostinger/LiteSpeed cache after deploy.
- **API/base URL:** In production, the frontend uses same-origin requests (`base` empty). Correct if the server (server/admin-server.js) serves `dist/`.

---

**See also:** [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) · [RENDER_ENV.md](RENDER_ENV.md) · [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
