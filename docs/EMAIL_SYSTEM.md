# 📧 Email System – Overview & Bravo Readiness

This document describes the HBM email stack, what is required for it to work, and how it is prepared for **Bravo** (and other ESPs) for events, video, and newsletter.

---

## 1. What Exists Today

| Component | Location | Purpose |
|-----------|----------|---------|
| **Email sending** | `server/admin-server.ts` | Single delivery point: **`deliverEmail()`** → today SMTP (nodemailer); ready to add Bravo API. |
| **Email queue** | Prisma `EmailQueue` (MySQL in prod) | Pending/sent/failed/suppressed; processed every minute. |
| **Automation flows** | `src/data/automationConfig.json` + Admin UI | Trigger-based flows (e.g. registration, onNewsletterSignup, 48h_before_event) with Liquid templates. |
| **Campaigns** | `src/data/campaigns.json` + Admin UI | One-off blasts; segment = all / physical / video / newsletter. |
| **Suppression list** | `src/data/suppression.json` | Opt-outs; applied before sending any email. |
| **Email Architect** | Admin → Email Architect | Edit flows/campaigns, SMTP settings, test send, global styling. |

**Flow:** Registration (physical / video) or Newsletter signup → trigger writes to `EmailQueue` → `processQueue()` runs every minute → **`deliverEmail()`** sends (SMTP today; Bravo-ready) → marks sent/failed.

**Triggers in use:** `registration`, `site_signup`, `on8MinJourney` (physical events), `onNewsletterSignup` (newsletter and footer signup). All use the same queue and same delivery path.

---

## 2. What You Need for Emails to Work

### Option A: SMTP in Admin (stored in `automationConfig.json`)

1. In **Admin → Email Architect → Automation Settings**, set:
   - **Host:** e.g. `smtp.office365.com`, `smtp.gmail.com`, or **Bravo SMTP** (if they provide one).
   - **Port:** `587` (TLS) or `465` (SSL).
   - **User / Pass:** mailbox or app password (Gmail/Office 365 require app password).
   - **From:** e.g. `The HBM <office@thehbm.org>` (must match verified domain).
2. Save / Synchronize so the server persists the config.

### Option B: SMTP via environment (recommended for production)

Set in Render / Hostinger (or `.env` locally):

- `SMTP_HOST` — e.g. `smtp.office365.com` or Bravo’s SMTP host.
- `SMTP_PORT` — `587` or `465`.
- `SMTP_USER` — e.g. `office@thehbm.org` or Bravo user.
- `SMTP_PASS` — app password or Bravo SMTP password.
- `SMTP_FROM` — e.g. `The HBM <office@thehbm.org>`.

The server uses the config file first; if `automationConfig.json` has no SMTP host, it falls back to these env vars.

### Other requirements

- **Database:** `EmailQueue` lives in MySQL (production). Set `DATABASE_URL` and run migrations (`npx prisma migrate deploy` or `npx prisma db push`).
- **BASE_URL:** Set to the app’s public URL so tracking/open links in emails work.
- **FTP (optional):** For images in emails to persist across deploys, set `FTP_HOST`, `FTP_USER`, `FTP_PASS`; see [RENDER_ENV.md](RENDER_ENV.md).

---

## 3. Bravo Integration (SMTP + API)

The system is built so that **all** emails (physical events, video events, newsletter) go through one queue and **one delivery function** (`deliverEmail()` in `server/admin-server.ts`). That makes Bravo integration a single, clear change.

### Option 1: Bravo as SMTP relay (no code change)

Use Bravo’s SMTP if they provide it:

1. Get from Bravo: **SMTP host**, **port**, **user**, **password**, and the **From** address they allow.
2. Set them in **Admin → Email Architect → Automation Settings** (or in env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
3. All emails (events + newsletter) will be sent **via Bravo** with no code change.

### Option 2: Bravo API (code-ready)

The code is prepared for a Bravo API integration:

- **Single injection point:** In `server/admin-server.ts`, `processQueue()` sends each queued email via **`deliverEmail(transporter, mailOptions)`**. Today this calls `transporter.sendMail(mailOptions)`. To use Bravo API, add logic inside `deliverEmail()` so that when Bravo is enabled (e.g. env), the same `mailOptions` (to, subject, html, from, attachments) are sent via Bravo’s API instead of SMTP.
- **What stays the same:** Queue, flows, campaigns, suppression list, Liquid templates, and retry logic. Only the actual “send” step changes.

**What you need for Bravo API (when implementing):**

| From you | Purpose |
|----------|---------|
| Bravo API docs | Endpoint for sending transactional email (e.g. POST with to, subject, html, from). |
| Auth method | API key, OAuth, or other; where to put it (e.g. `BRAVO_API_KEY` in env). |
| Optional: suppression | If Bravo manages unsubscribes, sync with `suppression.json` or DB so we don’t send to opted-out addresses. |

**Suggested env (for when Bravo API is implemented):**

- `USE_EMAIL_PROVIDER=bravo` — switch delivery to Bravo API.
- `BRAVO_API_URL` — e.g. `https://api.bravo.com/v1/send`.
- `BRAVO_API_KEY` — (or other auth) as per Bravo docs.

No need to change flows or segments; physical / video / newsletter are already distinguished by `flowId` and campaign segment in the queue.

---

## 4. Quick Checklist for “Emails Working”

- [ ] SMTP set (Admin Automation Settings **or** env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
- [ ] `DATABASE_URL` set; Prisma migrations applied.
- [ ] `BASE_URL` set to the app’s public URL.
- [ ] Admin → Email Architect → Test send succeeds.
- [ ] After a test registration (event or newsletter), a queue item appears and is sent (check Email Queue / logs).

---

## 5. Bravo Readiness Checklist (for dev/CTO)

- [ ] **SMTP path:** Use Bravo SMTP credentials in config or env → works today.
- [ ] **API path:** Single send point is **`deliverEmail()`** in `server/admin-server.ts`; add Bravo API call when `USE_EMAIL_PROVIDER=bravo` and credentials are set.
- [ ] Queue, suppression, and flows remain unchanged; only the implementation of `deliverEmail()` (or a helper it calls) needs to support Bravo.

---

## 6. Files Reference

| File | Role |
|------|------|
| `server/admin-server.ts` | `processQueue()`, **`deliverEmail()`** (single send point), campaign send, test send, SMTP from config + env fallback. |
| `src/data/automationConfig.json` | Flows + SMTP (optional if using env). |
| `src/data/campaigns.json` | Campaign definitions. |
| `src/data/suppression.json` | Opt-out emails. |
| `scripts/smtp-diagnostics.js` | Standalone SMTP connectivity check. |
| `scripts/test-email-engine.js` | Ad-hoc email send test. |

For env and deploy: [RENDER_ENV.md](RENDER_ENV.md), [config/.env.example](../config/.env.example).
