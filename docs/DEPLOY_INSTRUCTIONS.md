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

### Site app runtime

- deploys `apps/site`
- static site app
- expected dev hostname: `testwww.thehbm.org`
- set App Platform source directory to `apps/site`

Build:

```bash
npm ci && npm run validate
```

Output directory:

```bash
dist
```

### Admin app runtime

- deploys `apps/admin`
- static site app
- expected dev hostname: `testadmin.thehbm.org`
- set App Platform source directory to `apps/admin`

Build:

```bash
npm ci && npm run validate
```

Output directory:

```bash
dist
```

### Backend app runtime

- deploys `apps/server`
- one App Platform app with:
  - `web` component
  - `worker` component
- expected dev hostname: `testapi.thehbm.org`
- set App Platform source directory to `apps/server`

Backend build:

```bash
npm ci && npm run validate
```

Backend web run command:

```bash
npm run web
```

Backend worker run command:

```bash
npm run worker
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
cd apps/server
npm ci
npm run validate
npm run prisma:migrate:deploy
```

For DigitalOcean dev/staging, do not run `prisma migrate deploy` from the GitHub-hosted runner if the managed MySQL instance is restricted to trusted sources. Run migrations from the backend App Platform deployment/runtime path instead. GitHub-triggered DO deploys should validate and trigger the backend deployment, while the backend app itself owns DB reachability.

## Runtime Environment Ownership

### Site app

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- local icons come from `apps/site/public/favicon.svg` and `apps/site/public/apple-touch-icon.svg`

### Admin app

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- local icon comes from `apps/admin/public/favicon.svg`

Shared organization contact/social metadata is persisted in DB and maintained from the admin `Settings` tab through `/api/site-settings`.

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
