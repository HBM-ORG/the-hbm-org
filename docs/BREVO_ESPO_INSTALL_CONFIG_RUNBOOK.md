# Brevo + Espo Install Config Runbook

Use this runbook after the codebase is green and the new Prisma migration is ready to apply.

This document focuses on environment setup, webhook/config wiring, and the safest rollout order for:

- Brevo as the first live messaging provider
- EspoCRM as a separate DigitalOcean-installed CRM system

## Preconditions

- [ ] Backend build is green
- [ ] Admin build is green
- [ ] Prisma client generation is green
- [ ] New Prisma migration is committed and ready to deploy
- [ ] Backend runtime can reach its database

## Backend Runtime Variables

These belong only to the backend runtime.

### Minimum for current SMTP fallback mode

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=The HBM <office@thehbm.org>
```

### Minimum to enable Brevo transport

```env
EMAIL_PROVIDER=brevo
BREVO_API_URL=https://api.brevo.com/v3
BREVO_API_KEY=...
BREVO_WEBHOOK_SECRET=...
BREVO_LIST_IDS=general:12,event:13,video:14,newsletter:15
```

Notes:

- `BREVO_LIST_IDS` is optional but recommended.
- The exact numeric IDs come from your Brevo account after the lists are created.
- If `EMAIL_PROVIDER=brevo`, the queue still stays local; only the final transport changes.

### Minimum to enable EspoCRM sync

```env
ESPOCRM_URL=https://your-espo-host.example.com
ESPOCRM_API_KEY=...
ESPOCRM_WEBHOOK_SECRET=...
ESPOCRM_CONTACT_ENTITY=Contact
```

Notes:

- Keep Espo credentials server-side only.
- Start with `Contact` as the entity unless you intentionally customize Espo’s schema first.

## HBM Backend Webhook Endpoints

Configure external systems to call these backend-owned endpoints:

- Brevo webhook: `/api/providers/brevo/webhook`
- EspoCRM webhook: `/api/providers/espocrm/webhook`

Examples by environment:

### Development

- Brevo: `https://testapi.thehbm.org/api/providers/brevo/webhook`
- EspoCRM: `https://testapi.thehbm.org/api/providers/espocrm/webhook`

### Staging

- Brevo: `https://<staging-api-host>/api/providers/brevo/webhook`
- EspoCRM: `https://<staging-api-host>/api/providers/espocrm/webhook`

### Production

- Brevo: `https://<prod-api-host>/api/providers/brevo/webhook`
- EspoCRM: `https://<prod-api-host>/api/providers/espocrm/webhook`

## Recommended Rollout Order

### Step 1: Apply schema changes

- [ ] Deploy backend with the new migration
- [ ] Run Prisma migration in the backend runtime
- [ ] Confirm new tables exist:
  - `ContactProfile`
  - `ContactSubmission`
  - `ContactProviderSync`
  - `ProviderWebhookEvent`
- [ ] Confirm new `EmailQueue` provider columns exist

### Step 2: Keep transport on SMTP first

- [ ] Leave `EMAIL_PROVIDER=smtp`
- [ ] Deploy backend and admin
- [ ] Create a test registration
- [ ] Confirm contact projection rows are created locally
- [ ] Confirm admin contact drawer shows the new provider/system sections

This gives you a safe validation step before Brevo actually becomes the live sender.

### Step 3: Prepare Brevo

- [ ] Create or verify Brevo sender/domain configuration
- [ ] Create the Brevo lists referenced by `BREVO_LIST_IDS`
- [ ] Add `BREVO_API_KEY`
- [ ] Add `BREVO_WEBHOOK_SECRET`
- [ ] Configure Brevo webhook to point to the HBM backend endpoint
- [ ] Re-deploy backend

### Step 4: Validate Brevo contact sync before transport cutover

- [ ] the additional fields to add to contact in Brevo:
  - LANGUAGE
  - STATUS
  - CATEGORY
  - EVENT_ID
  - EVENT_NAME
  - LAST_SOURCE
  - ACQUISITION_SOURCE
  - REGISTRATION_SOURCE
  - REGISTRATION_COUNT
  - CONTACT_SUBMISSION_COUNT
  - FIRST_SEEN_AT
  - LAST_SEEN_AT
  - LAST_REGISTERED_AT

- [ ] Keep `EMAIL_PROVIDER=smtp`
- [ ] Submit a new event registration
- [ ] Confirm the local contact sync row updates for provider `brevo`
- [ ] Confirm the contact exists in Brevo
- [ ] Use `Resync providers` from admin on one contact to verify the operator flow

### Step 5: Cut over email transport to Brevo

- [ ] Change `EMAIL_PROVIDER=brevo`
- [ ] Re-deploy backend
- [ ] Use a test flow send
- [ ] Confirm `EmailQueue` now records:
  - `provider=brevo`
  - `providerMessageId`
  - `providerStatus`
- [ ] Confirm webhook callbacks populate local engagement/provider timeline

### Step 6: Install EspoCRM in DigitalOcean

- [ ] Provision a separate runtime for EspoCRM
- [ ] Provision a separate DB for EspoCRM
- [ ] Set hostname and TLS
- [ ] Finish the Espo installation wizard
- [ ] Create a dedicated API user for HBM
- [ ] Generate/copy API key

### Step 7: Wire EspoCRM into HBM backend

- [ ] Set `ESPOCRM_URL`
- [ ] Set `ESPOCRM_API_KEY`
- [ ] Set `ESPOCRM_WEBHOOK_SECRET`
- [ ] Re-deploy backend
- [ ] Submit a new test registration
- [ ] Confirm `ContactProviderSync` row is created or updated for provider `espocrm`
- [ ] Confirm the contact appears in EspoCRM

### Step 8: Reflect Espo workflow state back into HBM

- [ ] Decide whether the first pass uses webhooks, polling, or manual resync only
- [ ] If using webhooks, point Espo to `/api/providers/espocrm/webhook`
- [ ] Confirm workflow/conversion changes produce local provider timeline entries
- [ ] Confirm admin contact drawer reflects that state

## Quick Verification Commands

Run from the repo:

```bash
npm --prefix apps/server run prisma:generate
npm --prefix apps/server run build
npm --prefix apps/admin run build
```

## Suggested First Live Sequence

If you want the safest path:

1. Deploy schema + admin/backend UI changes with `EMAIL_PROVIDER=smtp`.
2. Validate local contact projection and admin provider sections.
3. Configure Brevo contact sync and webhook.
4. Validate Brevo sync while still sending through SMTP.
5. Switch transport to `EMAIL_PROVIDER=brevo`.
6. Install EspoCRM separately in DO.
7. Add EspoCRM sync after Brevo is stable.

## References

- `docs/BREVO_INTEGRATION_CHECKLIST.md`
- `docs/ESPOCRM_INSTALL_AND_INTEGRATION_CHECKLIST.md`
- `docs/CI_CD_VARIABLES.md`
- `docs/DEPLOY_INSTRUCTIONS.md`
- [Brevo Developer Overview](https://developers.brevo.com/docs/getting-started)
- [EspoCRM Installation](https://docs.espocrm.com/administration/installation/)
- [EspoCRM API Overview](https://docs.espocrm.com/development/api/)
