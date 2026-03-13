# 📧 Email System – Overview & Bravo Readiness

This document describes the HBM email stack, what is required for it to work, and how it is prepared for **Bravo** (and other ESPs) for events, video, and newsletter.

---

## 1. What Exists Today

| Component | Location | Purpose |
|-----------|----------|---------|
| **Email sending** | `apps/server/src/services/email-support.service.ts` + `apps/server/src/services/email-queue.service.ts` | Single delivery path for SMTP today; structured so a provider adapter can be introduced later. |
| **Email queue** | Prisma `EmailQueue` (MySQL in prod) | Pending/sent/failed/suppressed; processed every minute. |
| **Automation flows** | Prisma `EmailFlow` / `EmailSequence` / `SmtpConfig` / `GlobalStyling` + Admin UI | Trigger-based flows (e.g. registration, onNewsletterSignup, 48h_before_event) with Liquid templates. |
| **Campaigns** | Prisma `EmailCampaign` + Admin UI | One-off blasts; segment = all / physical / video / newsletter. |
| **Suppression list** | Prisma `EmailSuppression` | Opt-outs; applied before sending any email. |
| **Email Architect** | Admin → Email Architect | Edit flows/campaigns, SMTP settings, test send, global styling. |

**Flow:** Registration (physical / video) or Newsletter signup → trigger writes to `EmailQueue` → `processQueue()` runs every minute → **`deliverEmail()`** sends (SMTP today; Bravo-ready) → marks sent/failed.

**Triggers in use:** `registration`, `site_signup`, `on8MinJourney` (physical events), `onNewsletterSignup` (newsletter and footer signup). All use the same queue and same delivery path.

---

## 2. What You Need for Emails to Work

### Option A: SMTP in Admin (stored in Prisma-backed admin settings)

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

The server uses the database-backed admin config first; if no SMTP host is stored there, it falls back to these env vars.

### Other requirements

- **Database:** `EmailQueue` lives in MySQL (production). Set `DATABASE_URL` and run migrations (`npx prisma migrate deploy` or `npx prisma db push`).
- **BASE_URL:** Set to the app’s public URL so tracking/open links in emails work.
- **Object storage:** For uploaded email images, configure `STORAGE_PROVIDER` plus either `SPACES_*` or `GCS_*`; see [RENDER_ENV.md](RENDER_ENV.md).

---

## 3. Bravo Integration (SMTP + API)

The system is built so that **all** emails (physical events, video events, newsletter) go through one queue and one delivery path inside the server services. That keeps a future Bravo integration isolated to the send step.

### Option 1: Bravo as SMTP relay (no code change)

Use Bravo’s SMTP if they provide it:

1. Get from Bravo: **SMTP host**, **port**, **user**, **password**, and the **From** address they allow.
2. Set them in **Admin → Email Architect → Automation Settings** (or in env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
3. All emails (events + newsletter) will be sent **via Bravo** with no code change.

### Option 2: Bravo API (code-ready)

The code is prepared for a Bravo API integration:

- **Single injection point:** `apps/server/src/services/email-queue.service.ts` processes queue items and delegates transport work through the server email support layer. To use Bravo API, introduce a provider-aware send helper there so the same mail payload can be sent through Bravo instead of SMTP.
- **What stays the same:** Queue, flows, campaigns, suppression list, Liquid templates, and retry logic. Only the actual “send” step changes.

**What you need for Bravo API (when implementing):**

| From you | Purpose |
|----------|---------|
| Bravo API docs | Endpoint for sending transactional email (e.g. POST with to, subject, html, from). |
| Auth method | API key, OAuth, or other; where to put it (e.g. `BRAVO_API_KEY` in env). |
| Optional: suppression | If Bravo manages unsubscribes, sync with `EmailSuppression` so we don’t send to opted-out addresses. |

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

## 5. Brevo Readiness Checklist (for dev/CTO)

- [ ] **SMTP path:** Use Brevo SMTP credentials in config or env → works today.
- [ ] **API path:** Add provider-aware sending in `apps/server/src/services/email-support.service.ts` / `apps/server/src/services/email-queue.service.ts` when `USE_EMAIL_PROVIDER=bravo`.
- [ ] Queue, suppression, and flows remain unchanged; only the implementation of the final send step needs to support Brevo.

---

## 6. Files Reference

| File | Role |
|------|------|
| `apps/server/src/services/email-queue.service.ts` | Queue processing, campaign send, automation triggers. |
| `apps/server/src/services/email-support.service.ts` | SMTP normalization and final delivery helper. |
| `apps/server/prisma/schema.prisma` | Queue, flow, campaign, suppression, and content models. |
| `scripts/one-off/migrate-json-to-db.ts` | One-off backfill from legacy JSON into Prisma tables. |
| `scripts/ops/smtp-diagnostics.js` | Standalone SMTP connectivity check. |
| `scripts/dev/test-email-engine.js` | Ad-hoc email send test. |

For env and deploy: [RENDER_ENV.md](RENDER_ENV.md), [`apps/server/.env.example`](../apps/server/.env.example), [`apps/site/.env.example`](../apps/site/.env.example), [`apps/admin/.env.example`](../apps/admin/.env.example).
