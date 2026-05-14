# Brevo CTA direct lists and Email Architect bypass — implementation plan

Track **public CTA flows** (event registration, video-event popup, “Be Part” newsletter) so contacts land on the **correct Brevo lists** with **server-resolved list IDs**, while **Brevo-owned automations and templates** handle email. Email Architect (`EmailFlow` / `EmailQueue`) can be **skipped for those CTAs** and **re-enabled later** for other providers or hybrid delivery.

**How to use this doc**

- Use Markdown task list items: `- [ ]` not done, `- [x]` done.
- For work that spans multiple PRs, add a short note under the section (e.g. “Pass 1: server only”) or link PRs.
- Related broader Brevo work: [BREVO_INTEGRATION_CHECKLIST.md](./BREVO_INTEGRATION_CHECKLIST.md). Email stack overview: [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md).

---

## Overall status (optional summary)

| Area | Status | Notes |
|------|--------|--------|
| Server: list resolution + Brevo upsert | Done | `brevo-list-catalog`, `cta-brevo-lists`, `upsertBrevoContact` options |
| Server: bypass Email Architect for CTAs | Done | `brevo.ctaBypassEmailArchitect` in site settings (default off) |
| Admin: Site Settings → Brevo tab | Done | `SettingsManager.jsx` |
| Admin: per-event + video event fields | Done | Event SETTINGS + Video Event panel in `AdminDashboard.jsx` |
| Staging QA + Brevo automation verify | Pending | Manual |
| Production rollout | Pending | Enable bypass + verify env catalog |

*(Replace bracket text with Done / In progress / Blocked as you go.)*

---

## Goals

- [x] Each **CTA** can be configured in admin to target one (or more) **logical list keys** that map to numeric Brevo list IDs via environment (e.g. `BREVO_LIST_IDS=general:3,event:3,video:9,newsletter:10,test:11`).
- [x] **Server-side only** resolution: the browser sends the same payloads as today (`eventId`, form fields, `regSource` / `source`); **never** trust client-supplied list IDs.
- [x] **`upsertBrevoContact`** receives the correct `listIds` for that submission so **Brevo list-entry automations** (templates configured in Brevo) run without HBM sending duplicate “welcome” mail via Email Architect (when bypass is on).
- [x] **Email Architect remains available** for future use: manual campaigns, alternate providers, or re-wiring triggers when product needs hybrid or fallback delivery.
- [x] Local **Registration** / **ContactProfile** remain the operational source of truth; Brevo is the messaging and marketing-engagement layer.

## Non-goals (for this track)

- [ ] Building a full marketing campaign UI inside HBM admin (keep using Brevo for that).
- [ ] Browser-direct Brevo API calls from the public site.
- [ ] Replacing the entire Email Architect data model (only **gating triggers** for CTA paths).

---

## Current baseline (repo)

- [x] **POST `/api/register`** persists `Registration`, calls `syncContactToProviders` (Brevo upsert among others), then **`triggerAutomationByEvent`** for multiple triggers (physical/video, `registration`, `site_signup`, optional `on8MinJourney`).
- [x] **POST `/api/newsletter`** (“Be Part”) persists newsletter data and calls **`triggerAutomationByEvent("onNewsletterSignup", ...)`** and provider sync.
- [x] **Brevo** `upsertBrevoContact` uses **`deriveBrevoListIds`** from **`runtimeConfig.brevoListIds`** with **heuristics** (newsletter / video / event / general) over the **aggregated `ContactSyncPayload`**, not per-experience admin settings.
- [x] **Video modal** sends `eventId: "video-event"`; **event pages** send the concrete **`event.id`**.

## Target architecture

### Config layers

1. **Environment catalog** — `BREVO_LIST_IDS`: maps **string key → numeric list id** (allowed set for production).
2. **Admin selections** — store **keys only** (e.g. `"event"`, `"newsletter"`), optionally multiple keys per CTA later.
3. **Runtime resolution** — load `Event` / `VideoEventConfig` / `SiteSettings` → map keys through the catalog → compute `number[]` for Brevo.

### List merge policy (choose explicitly in implementation)

- [x] **Policy A — Replace:** When an admin **list key** is set for that CTA, the server uses **only** the resolved list id(s) for the Brevo upsert (plus optional `general` — see below).
- [x] **Policy B — Additive (optional):** Site setting **`appendGeneralListToCta`** adds the **`general`** env key to explicit CTA lists when enabled.

Documented in admin copy and `cta-brevo-lists.service.ts` / `content.service` defaults.

### Email Architect bypass

- [x] Site-level flag **`brevo.ctaBypassEmailArchitect`** in **Site Settings**; CTAs **skip** `triggerAutomationByEvent` when true.
- [x] When bypass is on: still validate, persist locally, **`syncContactToProviders`** with resolved lists.
- [x] When bypass is off: Email Architect triggers run as before; explicit Brevo lists still apply when keys are configured.

### Future: re-wire Email Architect

The queue and `EmailFlow` model stay in place. To use them again (same or other SMTP/ESP):

- [ ] Re-enable **specific triggers** (per trigger name) instead of only a global on/off, if you need video in Brevo but physical still via Architect.
- [ ] Point flows at **Brevo transactional** or **SMTP** via existing `email-queue.service.ts` delivery modes.
- [ ] Avoid **double sends**: if Brevo list automation already sends welcome mail, set Architect flow to **inactive** or use **`brevo_automation`** delivery mode that does not duplicate content (see `apps/server/src/services/email-queue.service.ts`).

---

## Implementation checklist

### Phase 1 — Server: catalog and resolution helpers

- [x] `brevo-list-catalog.service.ts`: parse env, **`resolveListIdsFromKeys`**, **`brevoCatalogToPublicEntries`**.
- [x] **GET `/api/brevo-list-catalog`** — returns `{ entries: [{ key, id }] }`.
- [x] **`cta-brevo-lists.service.ts`**: **`resolveBrevoListsForRegister`**, **`resolveBrevoListsForNewsletter`** (video + event DB + site settings).

### Phase 2 — Server: extend persisted config (schema / JSON)

- [x] **Site settings**: `brevo.newsletterListKey`, `brevo.ctaBypassEmailArchitect`, `brevo.appendGeneralListToCta`.
- [x] **Video event**: `brevoListKey` (string, empty = heuristic).
- [x] **Event**: `registration.brevoListKey` via existing **`registration` JSON** (no migration).

### Phase 3 — Server: Brevo upsert with explicit lists

- [x] **`upsertBrevoContact(payload, { explicitListIds })`**; **`syncContactToProviders(email, brevoLists)`** with `{ strategy: 'explicit' | 'heuristic' }`.
- [x] Explicit mode skips **`deriveBrevoListIds`** for that sync when ids are non-empty.
- [ ] Optional follow-up: dedicated **`CTA_SOURCE`** Brevo attribute (uses existing profile / registration fields today).

### Phase 4 — Wire registration and newsletter controllers

- [x] **`register`**: `resolveBrevoListsForRegister` + `syncContactToProviders(..., brevoLists)`; gated triggers when **`ctaBypassEmailArchitect`**.
- [x] **`newsletter`**: `resolveBrevoListsForNewsletter` + gated **`onNewsletterSignup`**.
- [x] **`on8MinJourney`** — same bypass as other registration triggers when flag is on.

### Phase 5 — Admin UI

- [x] **Site Settings → Brevo** tab.
- [x] **Event → SETTINGS → Engine Config**: Brevo list dropdown (`registration.brevoListKey`).
- [x] **Video Event** panel: Brevo list dropdown.
- [x] Options from **`GET /api/brevo-list-catalog`**.

### Phase 6 — Tests and verification

- [ ] Unit tests (no runner wired in `apps/server` yet — add if you introduce Vitest/Jest).
- [ ] Manual QA per checklist above.

### Phase 7 — Documentation and ops

- [ ] Optional: one-line env note in [RENDER_ENV.md](./RENDER_ENV.md) for `BREVO_LIST_IDS` + admin overrides (no new secrets).
- [ ] Optional: cross-link from [BREVO_INTEGRATION_CHECKLIST.md](./BREVO_INTEGRATION_CHECKLIST.md).

---

## Environment reference

Example catalog (keys are arbitrary but must match admin selections):

```bash
BREVO_LIST_IDS=general:3,event:3,video:9,newsletter:10,test:11
```

- [ ] Document that **adding a new list** requires both **env** update and **Brevo automation** on that list.

---

## Security and secrets

- [ ] API keys remain **server-side only** (`BREVO_API_KEY`); never expose in admin APIs or browser bundles.
- [ ] **Rotate keys** if they appear in logs, screenshots, or committed `.env` files.

---

## Open decisions (fill in as you implement)

| Decision | Choice | Date |
|----------|--------|------|
| List merge policy (replace vs additive) | Replace when key set; optional +`general` via **Append general list** | 2026-05 |
| Global vs per-trigger bypass | Global site flag **`ctaBypassEmailArchitect`** | 2026-05 |
| Unknown list key behavior (skip vs fail request) | Log warning, fall back to **heuristic** | 2026-05 |
| Contact form `/api/contact` in scope? | **No** (still heuristic Brevo sync only) | 2026-05 |

---

*Last created: implementation planning doc for Brevo-direct CTAs and optional Email Architect bypass; safe to extend with PR links and status tables as work proceeds.*
