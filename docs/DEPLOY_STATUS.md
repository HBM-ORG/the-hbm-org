# Deployment Status And Handoff

## Executive Summary

The runtime is no longer tracked as a single server serving everything together. The active deployment target is now:

- `site` app
- `admin` app
- `backend` app

where backend contains:

- web/API component
- worker component

## Current Status Overview

| Area | Status | Notes |
|------|--------|------|
| Site/admin frontend split | ✅ | `apps/site` and `apps/admin` are independent workspaces |
| Backend web/worker split | ✅ | `apps/server` exposes separate `web` and `worker` entrypoints |
| Prisma / MySQL runtime | ✅ | backend uses Prisma + MySQL |
| Backend CI Prisma generation | ✅ | automated in backend CI |
| Backend schema migration automation | ✅ | deploy workflows now run `prisma migrate deploy` |
| Backend container ownership | ✅ | backend Docker build now lives in `apps/server/Dockerfile` |
| DO deploy topology | ✅ In progress | workflows/docs updated for three app IDs per environment |
| GCP deploy topology | ⚠️ Transitional | production workflow still uses the current Cloud Run path while the logical boundary is being aligned |

## Active Short-Term Deployment Model

### DigitalOcean

- `dev` and `staging` use:
  - one `site` app ID
  - one `admin` app ID
  - one `backend` app ID

### GCP

- `main` remains deployed through the existing GCP workflow
- backend Prisma automation is now explicit in the workflow
- production boundary alignment is still in progress

## Current Workflow Ownership

- shared validation: `.github/workflows/ci.yml`
- site validation: `.github/workflows/site-ci.yml`
- admin validation: `.github/workflows/admin-ci.yml`
- backend validation: `.github/workflows/backend-ci.yml`
- DigitalOcean deployment: `.github/workflows/deploy-do.yml`
- GCP deployment: `.github/workflows/deploy-gcp.yml`

## Immediate Operational Notes

- Site should target the backend through `VITE_API_BASE`
- Admin should target the backend through `VITE_API_BASE`
- Backend owns:
  - `DATABASE_URL`
  - Prisma generation/migration lifecycle
  - storage credentials
  - SMTP / AI secrets

## Related Docs

- [THREE_APP_DEPLOYMENT_CHECKLIST.md](THREE_APP_DEPLOYMENT_CHECKLIST.md)
- [CI_CD_VARIABLES.md](CI_CD_VARIABLES.md)
- [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
