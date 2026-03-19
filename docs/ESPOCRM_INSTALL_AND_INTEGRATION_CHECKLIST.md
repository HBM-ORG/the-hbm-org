# EspoCRM Install And Integration Checklist

Track the phased installation of EspoCRM in DigitalOcean and its backend-owned integration with the HBM funnel stack.

This checklist assumes a hybrid architecture: HBM remains the canonical source for public-site registrations and operational admin views, while EspoCRM becomes an external CRM/workflow system fed by backend-owned syncs.

## Goals

- [ ] Install EspoCRM as a separate runtime in DigitalOcean
- [ ] Keep EspoCRM credentials and API access server-side only
- [ ] Sync HBM contact projection updates into EspoCRM
- [ ] Reflect EspoCRM workflow and conversion state back into HBM admin CRM
- [ ] Avoid direct browser-to-EspoCRM calls from `site` or `admin`

## Scope

### In scope

- [ ] EspoCRM installation and environment setup
- [ ] API user creation and backend credential wiring
- [ ] Contact sync from HBM backend to EspoCRM
- [ ] Optional webhook or polling path for workflow reflection back into HBM
- [ ] Admin CRM enrichment through HBM APIs

### Out of scope for first pass

- [ ] Replacing HBM admin with EspoCRM UI
- [ ] Making EspoCRM the canonical public-site ingest API
- [ ] Browser-side direct EspoCRM authentication
- [ ] Full custom entity modeling before basic contact sync works

## DigitalOcean Runtime

- [ ] Create a separate EspoCRM runtime outside the three HBM deployable app roots
- [ ] Create a dedicated database for EspoCRM
- [ ] Configure persistent file storage/backups for EspoCRM
- [ ] Set hostname/TLS for the EspoCRM instance
- [ ] Document the environment-specific URLs for dev, staging, and production

## Application Setup

- [ ] Follow the EspoCRM installation flow
- [ ] Create the initial admin account
- [ ] Create a dedicated API user for HBM backend integration
- [ ] Prefer API key auth for the HBM backend integration
- [ ] Define a minimal first-pass data model for contacts and lifecycle stages

## Backend Integration

- [ ] Keep `ESPOCRM_URL` and `ESPOCRM_API_KEY` in backend runtime only
- [ ] Add an Espo adapter in `apps/server`
- [ ] Sync local contact projection changes into EspoCRM after local DB success
- [ ] Persist Espo sync state locally for audit and troubleshooting
- [ ] Add a manual resync action from HBM admin

## Reflection Back Into HBM

- [ ] Decide whether Espo updates return via webhook, pull sync, or both
- [ ] Normalize Espo workflow/conversion states into HBM CRM analytics
- [ ] Keep reflected state in HBM-owned read models
- [ ] Show Espo sync and workflow state in the existing contact drawer

## Validation

- [ ] EspoCRM instance is reachable over HTTPS
- [ ] Backend can authenticate via API key
- [ ] A new HBM registration creates or updates an EspoCRM contact
- [ ] Failed Espo sync does not break public registration success
- [ ] Admin CRM shows Espo sync state through HBM APIs

## Related Docs

- `docs/BREVO_INTEGRATION_CHECKLIST.md`
- `docs/DEPLOY_INSTRUCTIONS.md`
- `docs/CI_CD_VARIABLES.md`
- [EspoCRM Installation](https://docs.espocrm.com/administration/installation/)
- [EspoCRM API Overview](https://docs.espocrm.com/development/api/)
