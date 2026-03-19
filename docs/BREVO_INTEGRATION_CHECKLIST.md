# Brevo Integration Checklist

Track the phased integration of Brevo into registrations, CRM visibility, outbound email delivery, and webhook-driven engagement sync.

This checklist is intentionally architecture-first. The goal is not only to send email through Brevo, but to keep the HBM backend and admin as the durable operational source for registrations, contact history, and audit-friendly CRM views.

This plan now assumes a provider-neutral local contact layer so Brevo can be integrated first without blocking a later EspoCRM integration track.

## Goals

- [ ] Create or update a Brevo contact when a site visitor registers for an event
- [ ] Sync all registration-form fields that are useful for segmentation, automation, and support
- [ ] Keep local DB records as the primary source of truth for registrations and admin CRM
- [ ] Route outbound event and newsletter emails through Brevo instead of direct SMTP-only delivery
- [ ] Ingest Brevo webhook events so admin CRM shows real delivery and engagement state
- [ ] Show Brevo-specific contact insights in admin without forcing admins to leave the HBM backoffice
- [ ] Keep unsubscribe, blocklist, bounce, and complaint state visible and enforceable locally
- [ ] Preserve a safe rollout path: contact sync first, sending second, webhook enrichment third

## Current Baseline

- [x] Site registrations are stored locally in `Registration`
- [x] Newsletter signup is stored locally through the same backend
- [x] Email automations and campaigns are driven by local `EmailFlow`, `EmailSequence`, and `EmailQueue`
- [x] Local admin already shows CRM registrations plus local email activity
- [x] Local suppression/unsubscribe handling already exists
- [x] There is a single outbound email choke point in `email-queue.service.ts`
- [ ] Brevo contact sync does not exist yet
- [ ] Brevo API sending does not exist yet
- [ ] Brevo webhook ingestion does not exist yet
- [ ] Contact profile drawer does not yet show Brevo-native status/history

## Recommended Architecture

### System ownership

- [ ] Keep `Registration` and future local contact projection as the business source of truth
- [ ] Treat Brevo as the messaging platform and marketing-engagement source, not the only CRM database
- [ ] Mirror important Brevo state into local tables so admin can query fast and keep history even if Brevo data changes later
- [ ] Keep local suppression safeguards even if Brevo also tracks unsubscribes or blocklists
- [ ] Keep the Brevo integration compatible with a later EspoCRM downstream sync

### Primary integration flows

- [ ] `Site form -> HBM backend -> local DB -> Brevo contact upsert`
- [ ] `HBM automation/campaign decision -> local queue -> Brevo transactional send`
- [ ] `Brevo webhook -> HBM webhook endpoint -> local engagement/suppression sync -> admin CRM view`

### Why this shape

- [ ] Avoid browser-direct Brevo calls from the site or admin
- [ ] Keep API keys and webhook verification server-side only
- [ ] Allow admin CRM to show both local registration facts and Brevo messaging facts
- [ ] Keep rollback possible if Brevo transport must be disabled temporarily

## Scope Definition

### In scope

- [ ] Contact sync for event registrations
- [ ] Contact sync for newsletter signup
- [ ] Optional contact sync for contact-form leads after product decision
- [ ] Brevo-backed transactional sending for automation flows and campaigns
- [ ] Brevo webhook ingestion for delivery and engagement events
- [ ] Admin CRM enrichment with Brevo stats, status, and recent events
- [ ] Provider-aware environment/config management

### Out of scope for first pass

- [ ] Full bidirectional field sync for every Brevo attribute
- [ ] Replacing the local CRM/admin data model with Brevo-only reads
- [ ] Browser-side Brevo SDK integration
- [ ] Real-time websocket updates in admin
- [ ] Advanced Brevo list-management UI in the first release
- [ ] Full marketing-campaign builder parity with Brevo UI

## Data Ownership Decisions

### Local remains canonical for

- [ ] Registrations
- [ ] Event participation history
- [ ] Local audit trail
- [ ] Internal admin notes/status
- [ ] Flow/sequence definitions
- [ ] Queue lifecycle initiated by the HBM app

### Brevo becomes authoritative for

- [ ] Transactional send acceptance and provider message IDs
- [ ] Delivered/bounced/blocked/deferred provider outcomes
- [ ] Provider unsubscribe and complaint signals
- [ ] Provider email engagement events such as open and click when supplied by webhook

### Reconciliation rules

- [ ] Decide whether local unsubscribe immediately propagates to Brevo
- [ ] Decide whether Brevo unsubscribe immediately creates local suppression
- [ ] Decide whether hard bounce and complaint should auto-suppress locally
- [ ] Decide whether Brevo blocklist state should be stored as a dedicated local flag

## Contact Sync Model

### Trigger points

- [ ] Upsert Brevo contact after successful `/api/register`
- [ ] Upsert Brevo contact after successful `/api/newsletter`
- [ ] Decide whether `/api/contact` should also create a local lead and Brevo contact
- [ ] Run contact sync after local DB write succeeds, never before

### Suggested mapped fields

- [ ] `email`
- [ ] `name`
- [ ] `phone`
- [ ] `language`
- [ ] `eventId`
- [ ] `eventName`
- [ ] `registrationSource`
- [ ] `acquisitionSource`
- [ ] `category`
- [ ] `status`
- [ ] `lastRegisteredAt`
- [ ] `registrationCount`
- [ ] `lastSeenSource`

### Suggested Brevo grouping

- [ ] Decide whether contacts should be placed into Brevo lists for `event`, `video`, `newsletter`, and `general-contact`
- [ ] Decide whether event-specific targeting belongs in attributes, lists, or both
- [ ] Decide whether a per-event tag/list naming convention is worth the operational cost

## Persistence Additions

### Suggested new local models or fields

- [ ] Add a local table or JSON-backed projection for Brevo contact sync state
- [ ] Store Brevo contact identifier locally
- [ ] Store last sync status and last sync time
- [ ] Store last sync error for support/debugging
- [ ] Store a webhook event dedup key or processed-event log
- [ ] Store provider message ID on sent emails when available
- [ ] Extend local engagement metadata to include provider event details

### Suggested entities

- [ ] `BrevoContactSync` or equivalent
- [ ] `BrevoWebhookEvent` or equivalent dedup/audit table
- [ ] Optional `BrevoMessageEvent` if provider event volume becomes large

### Suggested contact sync fields

- [ ] `email`
- [ ] `brevoContactId`
- [ ] `listMembershipJson`
- [ ] `isBrevoBlacklisted`
- [ ] `isBrevoUnsubscribed`
- [ ] `lastBrevoSyncedAt`
- [ ] `lastBrevoSyncStatus`
- [ ] `lastBrevoSyncError`

## Backend Services

### New service modules

- [ ] Add `brevo.client` or provider adapter module for authenticated API calls
- [ ] Add `brevo-contact.service` for upsert/find/list-membership sync
- [ ] Add `brevo-email.service` for transactional send requests
- [ ] Add `brevo-webhook.service` for parsing, verification, deduplication, and mapping
- [ ] Add `brevo-mapper.service` for translating local models to Brevo payloads and back

### Existing services to extend

- [ ] Extend `registration.service.ts` to emit a post-write Brevo sync job or async action
- [ ] Extend `email-queue.service.ts` to support provider-aware sending
- [ ] Extend `crm.service.ts` to merge Brevo contact state into admin-facing contact responses
- [ ] Extend `suppression.service.ts` to reconcile local suppression with Brevo suppression events
- [ ] Extend `email-tracking.service.ts` to record webhook-derived events with provider metadata

## Server Routes And Webhooks

### New endpoints

- [ ] Add admin-safe endpoint for testing Brevo connectivity
- [ ] Add webhook endpoint for Brevo outbound event callbacks
- [ ] Add optional admin endpoint to resync one contact to Brevo
- [ ] Add optional admin endpoint to resync recent webhook failures

### Webhook event handling

- [ ] Verify webhook authenticity according to Brevo docs
- [ ] Deduplicate repeated webhook deliveries
- [ ] Map delivered/open/click events into local engagement rows
- [ ] Map bounce/blocked/deferred/spam/unsubscribe events into local metadata/state
- [ ] Persist raw provider payload for audit/debugging within safe retention limits
- [ ] Avoid updating admin-visible metrics until webhook payload passes verification

## Email Sending Strategy

### Provider rollout

- [ ] Phase 1: keep current queue and templates, add Brevo as a provider option
- [ ] Phase 2: send selected flows through Brevo in dev/staging first
- [ ] Phase 3: move campaigns and all automation sends to Brevo
- [ ] Keep SMTP fallback strategy documented in case Brevo API must be bypassed temporarily

### Provider-aware send path

- [ ] Add env/config switch such as `EMAIL_PROVIDER=brevo|smtp`
- [ ] Keep Liquid rendering and queue scheduling local
- [ ] Change only the final delivery implementation in the first pass
- [ ] Store Brevo send response data on the queue item or linked provider table
- [ ] Decide whether Brevo template IDs are needed later or if local HTML rendering remains the standard

### Recommended first-pass choice

- [ ] Use Brevo transactional API for sends instead of replacing flow logic with Brevo automations immediately
- [ ] Keep HBM flow timing/trigger logic local for predictable parity with the current admin experience
- [ ] Use Brevo automations later only where they add clear value beyond current local flows

## Admin UX

### CRM Database tab

- [ ] Add a Brevo section inside the contact profile drawer
- [ ] Show Brevo sync status, last sync time, and last sync error
- [ ] Show blocklisted/unsubscribed status
- [ ] Show last delivery/open/click/bounce events
- [ ] Show list memberships or segment labels if useful
- [ ] Show provider identifiers only when helpful for support, not as primary UI

### Additional contact view

- [ ] Decide whether Brevo details live inside the existing drawer or a new tab such as `Brevo Activity`
- [ ] Prefer extending the current contact drawer first to avoid fragmenting the CRM UX
- [ ] Add provider event timeline grouped by event type and timestamp
- [ ] Add summary cards for sent, delivered, opened, clicked, bounced, unsubscribed, complained

### Admin tools

- [ ] Add a `Resync to Brevo` action for a single contact
- [ ] Add a `View raw webhook events` debug view only if operationally needed
- [ ] Add provider health indicator in `Email Architect` or `Settings`
- [ ] Add test-send and contact-upsert diagnostics for admin operators

## Security And Operations

### Secrets

- [ ] Keep Brevo API keys in backend env only
- [ ] Keep webhook secrets in backend env only
- [ ] Do not expose Brevo credentials in admin bundles or browser network responses
- [ ] Add env documentation for dev, staging, and production

### Idempotency and resilience

- [ ] Ensure repeated registration retries do not create duplicate Brevo contacts
- [ ] Ensure repeated webhooks do not create duplicate engagement rows
- [ ] Define retry behavior for Brevo API failures
- [ ] Decide whether failed contact sync should block registration success or only log for retry
- [ ] Prefer non-blocking sync with durable retry over failing the user-facing registration flow

### Logging and audit

- [ ] Log provider errors without leaking secrets
- [ ] Record contact-sync failures for support follow-up
- [ ] Record webhook verification failures
- [ ] Record provider outage/degradation events if they affect sends

## Rollout Plan

### Phase 1: foundation and contact sync

- [ ] Add Brevo env/config plumbing
- [ ] Add provider client and contact-upsert service
- [ ] Add local Brevo contact sync persistence
- [ ] Sync event registration contacts to Brevo
- [ ] Sync newsletter contacts to Brevo
- [ ] Add one-contact manual resync endpoint
- [ ] Validate field mapping and dedup behavior in dev

### Phase 2: admin visibility

- [ ] Extend CRM contact response with Brevo sync state
- [ ] Add Brevo summary block to the contact profile drawer
- [ ] Show sync failures and retry action in admin
- [ ] Add minimal provider diagnostics view for operators

### Phase 3: outbound sending through Brevo

- [ ] Add provider-aware delivery path
- [ ] Send transactional/automation emails through Brevo in dev
- [ ] Send one-off campaigns through Brevo in staging
- [ ] Persist provider message IDs and response metadata
- [ ] Confirm unsubscribe/footer/tracking links still point to HBM-owned endpoints where intended

### Phase 4: webhook ingestion and reconciliation

- [ ] Add verified webhook endpoint
- [ ] Map send lifecycle events into local engagement data
- [ ] Map unsubscribe/blocklist/bounce/complaint into local suppression state
- [ ] Add dedup/audit persistence for webhook payloads
- [ ] Update admin CRM with provider event timeline

### Phase 5: hardening and optional expansion

- [ ] Decide whether Brevo automations should complement or replace selected local flows
- [ ] Decide whether contact-form submissions should sync as full contacts
- [ ] Add backfill job for existing contacts to Brevo
- [ ] Add monitoring, alerting, and retry dashboard if volume justifies it
- [ ] Add reporting exports if operators need provider-state snapshots

## Validation

- [ ] Register for a physical event in local dev and confirm local DB row plus Brevo contact upsert
- [ ] Register for a video event and confirm correct attributes/lists are updated
- [ ] Submit newsletter signup and confirm contact update rather than duplicate creation
- [ ] Trigger a transactional email flow and confirm send is accepted by Brevo
- [ ] Confirm webhook delivery updates local engagement rows
- [ ] Confirm unsubscribe in Brevo updates local suppression
- [ ] Confirm local unsubscribe prevents future queued sends
- [ ] Confirm admin CRM shows both local registration history and Brevo messaging state
- [ ] Confirm provider outages do not break the site registration UX

## Definition Of Done

- [ ] New event and newsletter registrations create or update Brevo contacts
- [ ] HBM continues to own registrations and admin CRM data locally
- [ ] Outbound email transport can run through Brevo safely
- [ ] Verified webhook events update local engagement and suppression state
- [ ] Admin contact profiles show actionable Brevo delivery and status information
- [ ] Operators can diagnose sync/send failures without reading raw provider logs

## Related Files

- `apps/server/src/services/registration.service.ts`
- `apps/server/src/controllers/registration.controller.ts`
- `apps/server/src/services/email-queue.service.ts`
- `apps/server/src/services/email-support.service.ts`
- `apps/server/src/services/email-tracking.service.ts`
- `apps/server/src/services/suppression.service.ts`
- `apps/server/src/services/crm.service.ts`
- `apps/server/src/controllers/crm.controller.ts`
- `apps/server/src/routes/crm.routes.ts`
- `apps/server/src/routes/email.routes.ts`
- `apps/server/prisma/schema.prisma`
- `apps/admin/src/components/Admin/EmailEngine.jsx`
- `apps/admin/src/pages/AdminDashboard.jsx`

## Related Docs

- `docs/EMAIL_SYSTEM.md`
- `docs/ARCHITECTURE.md`
- `docs/CI_CD_VARIABLES.md`
- `docs/DEPLOY_STATUS.md`
- `docs/ESPOCRM_INSTALL_AND_INTEGRATION_CHECKLIST.md`

## Reference

- Brevo developer overview: https://developers.brevo.com/docs/getting-started

