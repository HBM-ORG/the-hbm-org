# ⚙️ Environment Variables (Render / Production)

Set these in **Render Dashboard → Your Service → Environment** so the HBM admin, email queue, and automations work end-to-end.

## Minimum for email sending to work (fix GETADDRINFO / test email)

For the **Test** button and automations to send mail from Render you **must**:

1. **In Admin → Email Architect → Automation Settings → SMTP** (saved in `automationConfig.json`):
   - **Host:** `smtp.office365.com` (lowercase; the server normalizes Office 365 to this)
   - **Port:** `587`
   - **User:** your Office 365 email (e.g. `office@thehbm.org`)
   - **Pass:** an **App Password** (Microsoft 365 → Security → App passwords), not your normal account password
   - **From:** e.g. `The HBM <office@thehbm.org>`
   - Click **Synchronize** / Save so the server has the config.

2. **In Render Environment:**
   - `DATABASE_URL` = your Hostinger MySQL URL (queue and registrations live here)
   - `BASE_URL` = your app’s public URL (e.g. `https://your-service.onrender.com` or `https://admin.thehbm.org`) so tracking links in emails work.

Without these, test send and automations will fail (e.g. GETADDRINFO ENOTFOUND or auth errors).

## Required (Render + Hostinger MySQL)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Hostinger MySQL connection string | `mysql://u123_abc:YOUR_PASSWORD@srv123.hostinger.com:3306/u123_hbm` |
| `PORT` | Server port (Render sets automatically) | `3001` |
| `NODE_ENV` | Environment | `production` |
| `BASE_URL` | Public URL of this app (for tracking links in emails) | `https://admin.thehbm.org` or your Render URL |

## SMTP (Email sending – from Automation Config or here)

SMTP can be configured in the **Admin → Email Architect → Automation Settings**. If you prefer env vars (recommended for production), you can add:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.office365.com` or `smtp.hostinger.com` |
| `SMTP_PORT` | Port (587 or 465) | `587` |
| `SMTP_USER` | Email / login | `office@thehbm.org` |
| `SMTP_PASS` | App password (Office 365) or mailbox password | (secret) |
| `SMTP_FROM` | From header | `The HBM <office@thehbm.org>` |

*Note: The server uses SMTP from Admin (automationConfig) first; if none is set there, it falls back to these env vars.*

## FTP – Hostinger (email images & assets)

So images uploaded in the Email Architect are stored on Hostinger and don’t disappear on Render restarts:

| Variable | Description | Example |
|----------|-------------|---------|
| `FTP_HOST` | Hostinger FTP hostname | `ftp.hostinger.com` or your server host |
| `FTP_USER` | FTP username (from Hostinger) | Your FTP user |
| `FTP_PASS` | FTP password | (secret) |
| `FTP_SECURE` | Use implicit TLS (e.g. port 990) | `0` or `1` |
| `ASSETS_BASE_URL` | Base URL for image links in emails | `https://thehbm.org` |

Uploaded email images are stored under `public_html/assets/emails/` on Hostinger and served at `https://thehbm.org/assets/emails/...`.

## Optional

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Used if you add admin auth later |
| `GEMINI_API_KEY` | For Email Architect “Improve copy” AI |
| `GOOGLE_BOOKS_API_KEY` | For Magic Fetch book covers |
| `VITE_GA_ID` | GA4 (set at build time) |
| `VITE_CLARITY_ID` | Microsoft Clarity (set at build time) |

---

## Flow summary (Email Architect end-to-end)

1. User registers on the main site → `POST /api/register` → row in **MySQL `Registration`**.
2. Server triggers automations → items added to **MySQL `EmailQueue`** (by `triggerAutomationByEvent`).
3. Every minute `processQueue()` runs → reads pending rows from `EmailQueue`, sends email via SMTP, updates row to `sent`/`failed`.
4. Images in emails: uploaded via Admin → saved to disk then **uploaded to Hostinger via FTP** when `FTP_*` are set → URL in emails is `ASSETS_BASE_URL/assets/emails/...` (Hostinger), so it survives Render restarts.

Ensure **Hostinger MySQL** is created. On first deploy, run migrations from Render **Build** command or a one-off:

- If you have a migration folder: `npx prisma migrate deploy`
- To sync schema without migration history: `npx prisma db push`

Then start the app with `node server/admin-server.js` or `npm start` (or your start command).

---

**See also:** [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) · [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) · [config/.env.example](../config/.env.example)
