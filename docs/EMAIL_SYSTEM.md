# 📧 Email System – Overview & Handoff (CTO)

This document describes the HBM email stack: what exists, what is required for it to work, and options for external ESPs (Mailchimp, Bravo, etc.).

---

## 1. What Exists Today

| Component | Location | Purpose |
|-----------|----------|---------|
| **SMTP sending** | `server/admin-server.js` (nodemailer) | Sends all transactional and campaign emails |
| **Email queue** | Prisma `EmailQueue` (MySQL in prod) | Pending/sent/failed/suppressed items; processed every minute |
| **Automation flows** | `src/data/automationConfig.json` + Admin UI | Trigger-based flows (e.g. on_registration, 48h_before_event) with Liquid templates |
| **Campaigns** | `src/data/campaigns.json` + Admin UI | One-off blasts; segment = all / event / newsletter |
| **Suppression list** | `src/data/suppression.json` | Opt-outs; applied before sending any email |
| **Email Architect** | Admin → Email Architect | Edit flows/campaigns, SMTP settings, test send, global styling |

Flow: **Registration / Newsletter** → trigger writes to `EmailQueue` → cron `processQueue()` reads pending → sends via SMTP (respecting suppression) → marks sent/failed.

---

## 2. What You Need for Emails to Work

### Option A: SMTP in Admin (stored in `automationConfig.json`)

1. In **Admin → Email Architect → Automation Settings**, set:
   - **Host:** e.g. `smtp.office365.com` or `smtp.gmail.com`
   - **Port:** `587` (TLS) or `465` (SSL)
   - **User / Pass:** mailbox or app password (Gmail/Office 365 require app password)
   - **From:** e.g. `The HBM <office@thehbm.org>`
2. Click **Synchronize** / Save so the server persists the config.

### Option B: SMTP via environment (recommended for production)

Set in Render / Hostinger (or `.env` locally):

- `SMTP_HOST` — e.g. `smtp.office365.com`
- `SMTP_PORT` — `587` or `465`
- `SMTP_USER` — e.g. `office@thehbm.org`
- `SMTP_PASS` — app password or mailbox password
- `SMTP_FROM` — e.g. `The HBM <office@thehbm.org>`

The server uses **config file first**; if `automationConfig.json` has no SMTP host, it **falls back to these env vars**. So you can leave the JSON SMTP pass empty and rely on env in production.

### Other requirements

- **Database:** `EmailQueue` lives in MySQL (production). Ensure `DATABASE_URL` is set and migrations have run (`npx prisma migrate deploy` or `npx prisma db push`).
- **BASE_URL:** Set to the public URL of the app (e.g. `https://admin.thehbm.org`) so tracking/open links in emails point to the correct origin.
- **FTP (optional):** For images in emails to persist across deploys, set `FTP_HOST`, `FTP_USER`, `FTP_PASS` so uploads go to Hostinger; see [RENDER_ENV.md](RENDER_ENV.md).

Without valid SMTP (either in Automation Settings or in env), test send and automations will not deliver mail (e.g. GETADDRINFO or auth errors in logs).

---

## 3. External ESPs (Mailchimp, Bravo, etc.)

**Current design:** All sending is **direct SMTP** (nodemailer). There is **no** built-in integration with Mailchimp, Bravo, SendGrid, or other ESPs.

To use an ESP you have two paths:

### A. Use ESP as SMTP relay

Most ESPs provide an SMTP endpoint. Configure that in Automation Settings (or env):

- **Mailchimp:** Transactional (Mandrill) or SMTP relay if offered; use their SMTP host/user/pass.
- **Bravo / others:** Use the SMTP credentials they provide and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_FROM` to match their verified domain).

No code change required; only config.

### B. Integrate via API (future work)

To fully switch to an ESP (e.g. Mailchimp API for campaigns, Bravo for transactional):

- Replace or wrap the `transporter.sendMail()` path in `server/admin-server.js` with calls to the ESP’s API.
- Keep the existing **queue + flows + suppression** logic; only the “send” step would call the ESP instead of nodemailer.
- Sync suppression list (and optionally segments) with the ESP if they support it.

This is a targeted backend change and does not affect the rest of the app.

---

## 4. Quick Checklist for “Emails Working”

- [ ] SMTP set (Admin Automation Settings **or** env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
- [ ] `DATABASE_URL` set; Prisma migrations applied
- [ ] `BASE_URL` set to the app’s public URL
- [ ] Admin → Email Architect → Test send succeeds
- [ ] After a test registration, a queue item appears and is sent (check Email Queue / logs)

---

## 5. Files Reference

| File | Role |
|------|------|
| `server/admin-server.js` | `processQueue()`, campaign send, test send, SMTP from config + env fallback |
| `src/data/automationConfig.json` | Flows + SMTP (optional if using env) |
| `src/data/campaigns.json` | Campaign definitions |
| `src/data/suppression.json` | Opt-out emails |
| `scripts/smtp-diagnostics.js` | Standalone SMTP connectivity check |
| `scripts/test-email-engine.js` | Ad-hoc email send test |

For env and deploy: [RENDER_ENV.md](RENDER_ENV.md), [config/.env.example](../config/.env.example).
