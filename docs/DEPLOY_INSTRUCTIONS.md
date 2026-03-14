# HBM Deployment Guide

Current short-term deployment target:

- `apps/site` deployed independently
- `apps/admin` deployed independently
- `apps/server` deployed as one backend app that contains:
  - API web component
  - worker component

## Branch To Platform Mapping

- `dev` -> DigitalOcean
- `staging` -> DigitalOcean
- `main` -> GCP

## DigitalOcean Deployment Shape

### Site app

- deploys `apps/site`
- static site app
- expected dev hostname: `testwww.thehbm.org`

Build:

```bash
npm ci && npm run validate -w apps/site
```

Output directory:

```bash
apps/site/dist
```

### Admin app

- deploys `apps/admin`
- static site app
- expected dev hostname: `testadmin.thehbm.org`

Build:

```bash
npm ci && npm run validate -w apps/admin
```

Output directory:

```bash
apps/admin/dist
```

### Backend app

- deploys `apps/server`
- one App Platform app with:
  - `web` component
  - `worker` component
- expected dev hostname: `testapi.thehbm.org`

Backend build:

```bash
npm ci && npm run validate -w apps/server
```

Backend web run command:

```bash
npm run web -w apps/server
```

Backend worker run command:

```bash
npm run worker -w apps/server
```

### Backend infrastructure ownership

These belong only to the backend app:

- Managed MySQL
- Spaces bucket
- backend secrets
- Prisma schema migrations

## Prisma Deployment Flow

Prisma is now treated as a backend deployment concern, not a manual post-deploy step.

Backend CI/deploy flow:

```bash
npm ci
npm run validate -w apps/server
npm run prisma:migrate:deploy -w apps/server
```

## Runtime Environment Ownership

### Site app

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- `VITE_ASSET_BASE`

### Admin app

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- `VITE_ASSET_BASE`

### Backend app

- `DATABASE_URL`
- `BASE_URL`
- `SITE_PUBLIC_URL`
- `SITE_APP_URL`
- `ADMIN_APP_URL`
- `RUN_EMAIL_WORKER=false` on web
- storage credentials
- SMTP credentials
- AI credentials

## GitHub Actions Entry Points

- shared root validation: `.github/workflows/ci.yml`
- site CI: `.github/workflows/site-ci.yml`
- admin CI: `.github/workflows/admin-ci.yml`
- backend CI: `.github/workflows/backend-ci.yml`
- DigitalOcean deploy: `.github/workflows/deploy-do.yml`
- GCP deploy: `.github/workflows/deploy-gcp.yml`

## Local Transitional Runtime

Local PM2 / single-server instructions are now legacy/transitional only. The current cloud target is the split deployment model described above, not one always-on node serving everything together.

## Related Docs

- [THREE_APP_DEPLOYMENT_CHECKLIST.md](THREE_APP_DEPLOYMENT_CHECKLIST.md)
- [CI_CD_VARIABLES.md](CI_CD_VARIABLES.md)
- [DEPLOYMENT_AND_REPO_RESTRUCTURE_PLAN.md](DEPLOYMENT_AND_REPO_RESTRUCTURE_PLAN.md)

## Backend Container

The backend container build now lives in:

- `apps/server/Dockerfile`
