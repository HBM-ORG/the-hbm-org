# Three-App Deployment Checklist

Track the short-term deployment target for this repo:

- `apps/site` deployed independently
- `apps/admin` deployed independently
- `apps/server` deployed as one backend app with:
  - API web component
  - worker component
  - shared MySQL and object storage resources

This is the agreed transition model for now:

- `dev` -> DigitalOcean App Platform
- `staging` -> DigitalOcean App Platform
- `main` -> GCP

## Goals

- [ ] Keep the public site deployable independently from admin and backend
- [ ] Keep the admin deployable independently from site and backend
- [ ] Keep backend runtime grouped as one deploy target with shared env and Prisma lifecycle
- [x] Automate Prisma generation and migrations in backend CI/deploy flow
- [x] Replace one-app-per-environment DO deploy assumptions with three app IDs per environment
- [ ] Keep production on GCP while aligning the deployment boundary to `site`, `admin`, and `backend`

## Final Target Topology

### DigitalOcean `dev` and `staging`

- [ ] `site` App Platform app
- [ ] `admin` App Platform app
- [ ] `backend` App Platform app
- [ ] backend app contains `web` + `worker` components
- [ ] backend app owns Managed MySQL connection
- [ ] backend app owns Spaces credentials

### GCP `main`

- [ ] `site` production target separated from backend runtime
- [ ] `admin` production target separated from backend runtime
- [ ] `backend` production target owns API runtime
- [ ] `worker` production runtime remains backend-owned infrastructure
- [ ] production deployment docs match the same logical boundary as DO: `site`, `admin`, `backend`

## Branch Mapping

- [ ] `dev` deploys to DO development resources
- [ ] `staging` deploys to DO staging resources
- [ ] `main` deploys to GCP production resources

## CI/CD Split

### Root orchestration

- [ ] Keep root `package.json` minimal and orchestration-focused
- [x] Keep root install/build usable from repo root
- [ ] Limit root workflows to shared validation or orchestration only

### Component CI workflows

- [x] Add `.github/workflows/site-ci.yml`
- [x] Add `.github/workflows/admin-ci.yml`
- [x] Add `.github/workflows/backend-ci.yml`
- [ ] Use `paths` filters so each workflow reacts only to its component plus shared files

### DigitalOcean deploy workflows

- [x] Update `.github/workflows/deploy-do.yml` or replace it with equivalent component-aware DO deploy workflows
- [ ] Trigger deploys separately for:
  - `site`
  - `admin`
  - `backend`
- [ ] Keep backend deploy as one app ID even though it contains `web` and `worker`

### GCP deploy workflow

- [ ] Update `.github/workflows/deploy-gcp.yml` so production matches the same boundary model
- [ ] Keep backend deploy explicit and separate from static frontend delivery
- [ ] Document whether worker is deployed as separate Cloud Run service or job

## Package And Script Ownership

### `apps/site`

- [x] Keep `apps/site/package.json` as the source of truth for site build/run scripts
- [x] Ensure site build can run from:
  - repo root via `npm run validate:site`
  - `apps/site` directly via local package scripts

### `apps/admin`

- [x] Keep `apps/admin/package.json` as the source of truth for admin build/run scripts
- [x] Ensure admin build can run from:
  - repo root via `npm run validate:admin`
  - `apps/admin` directly via local package scripts

### `apps/server`

- [x] Keep `apps/server/package.json` as the source of truth for backend web/worker/Prisma scripts
- [x] Ensure backend commands can run from:
  - repo root via orchestration scripts
  - `apps/server` directly via local package scripts
- [x] Keep `web` and `worker` under the same backend package root

## Prisma Automation

### Backend CI build

- [x] Run `npm ci` inside `apps/server`
- [x] Run `npm run prisma:generate` inside `apps/server`
- [x] Run backend typecheck/build
- [x] Keep Prisma generation explicit in backend CI without relying on root `postinstall`

### Backend deploy

- [x] Run `npm run prisma:migrate:deploy -w apps/server` automatically during backend deployment flow
- [ ] Ensure migrations run before backend rollout completes
- [ ] Ensure worker rollout happens only after schema compatibility is guaranteed

## DigitalOcean App IDs

### Development

- [x] Add `DO_APP_ID_DEV_SITE`
- [x] Add `DO_APP_ID_DEV_ADMIN`
- [x] Add `DO_APP_ID_DEV_BACKEND`

### Staging

- [x] Add `DO_APP_ID_STAGING_SITE`
- [x] Add `DO_APP_ID_STAGING_ADMIN`
- [x] Add `DO_APP_ID_STAGING_BACKEND`

### Shared DO secret

- [ ] Keep `DO_API_TOKEN`

## DigitalOcean Runtime Setup

### Site app (`testwww.thehbm.org`)

- [ ] Create static app from `apps/site`
- [ ] Build with `npm ci && npm run validate`
- [ ] Publish `dist`
- [ ] Set:
  - `VITE_SITE_URL=https://testwww.thehbm.org`
  - `VITE_ADMIN_URL=https://testadmin.thehbm.org`
  - `VITE_API_BASE=https://testapi.thehbm.org`

### Admin app (`testadmin.thehbm.org`)

- [ ] Create static app from `apps/admin`
- [ ] Build with `npm ci && npm run validate`
- [ ] Publish `dist`
- [ ] Set:
  - `VITE_SITE_URL=https://testwww.thehbm.org`
  - `VITE_ADMIN_URL=https://testadmin.thehbm.org`
  - `VITE_API_BASE=https://testapi.thehbm.org`

### Backend app (`testapi.thehbm.org`)

- [ ] Create one App Platform app for backend
- [ ] Add `web` component
- [ ] Add `worker` component

#### Backend web component

- [ ] Build with `npm ci && npm run validate`
- [ ] Run with `npm run web`
- [ ] Expose port `3001`
- [ ] Keep `RUN_EMAIL_WORKER=false`
- [ ] Start with `1` instance
- [ ] Allow future horizontal scaling only for the web role

#### Backend worker component

- [ ] Build with `npm ci && npm run validate`
- [ ] Run with `npm run worker`
- [ ] Keep `1` instance initially
- [ ] Do not scale worker horizontally until queue safety guarantees exist

### Managed MySQL

- [ ] Provision one DO Managed MySQL cluster for `dev`
- [ ] Provision one DO Managed MySQL cluster for `staging`
- [ ] Attach `DATABASE_URL` only to backend web + worker
- [ ] Run Prisma migrations against each environment DB

### Spaces

- [ ] Provision one DO Spaces bucket for `dev`
- [ ] Provision one DO Spaces bucket for `staging`
- [ ] Attach Spaces secrets only to backend web + worker

## Backend Runtime Variables

- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `BASE_URL`
- [ ] `SITE_PUBLIC_URL`
- [ ] `SITE_APP_URL`
- [ ] `ADMIN_APP_URL`
- [ ] `DATABASE_URL`
- [ ] `ADMIN_PASSWORD`
- [ ] `RUN_EMAIL_WORKER=false` on web
- [ ] `STORAGE_PROVIDER`
- [ ] `SPACES_ENDPOINT`
- [ ] `SPACES_REGION`
- [ ] `SPACES_BUCKET`
- [ ] `SPACES_KEY`
- [ ] `SPACES_SECRET`
- [ ] SMTP vars as needed
- [ ] AI vars as needed

## Frontend Runtime Variables

Shared organization contact/social metadata is now DB-backed and maintained from the admin `Settings` tab.

### Site

- [ ] `VITE_SITE_URL`
- [ ] `VITE_ADMIN_URL`
- [ ] `VITE_API_BASE`
- [ ] analytics vars as needed
- [ ] confirm local `public/favicon.svg` and `public/apple-touch-icon.svg` are present in the built app

### Admin

- [ ] `VITE_SITE_URL`
- [ ] `VITE_ADMIN_URL`
- [ ] `VITE_API_BASE`
- [ ] admin-only optional vars as needed
- [ ] confirm local `public/favicon.svg` is present in the built app

## GCP Production Preparation

### Current production reality

- [ ] Confirm how much of current `.github/workflows/deploy-gcp.yml` remains valid
- [x] Confirm whether current root `Dockerfile` should continue to own production backend build

### Production target boundary

- [ ] Keep production site independently deployable
- [ ] Keep production admin independently deployable
- [ ] Keep production backend runtime separately deployable from static frontends
- [ ] Keep worker under backend-owned production infrastructure

### GCP variables and secrets

- [ ] Revisit `GCP_PROJECT_ID`
- [ ] Revisit `GCP_REGION`
- [ ] Revisit `GCP_CLOUD_RUN_SERVICE`
- [ ] Revisit `GCP_ARTIFACT_REGISTRY_REGION`
- [ ] Revisit `GCP_ARTIFACT_REGISTRY_REPOSITORY`
- [ ] Revisit `GCP_CREDENTIALS_JSON`

## Documentation Updates

- [x] Update `docs/CI_CD_VARIABLES.md` to reflect three DO app IDs per environment
- [x] Update `docs/DEPLOY_INSTRUCTIONS.md` to remove single-server assumptions
- [x] Update `docs/DEPLOY_STATUS.md` to reflect split deployment ownership
- [ ] Update `docs/DEPLOYMENT_AND_REPO_RESTRUCTURE_PLAN.md` to reference the agreed three-app deployment target where needed

## Verification

### CI

- [ ] Site CI runs only when site-relevant files change
- [ ] Admin CI runs only when admin-relevant files change
- [ ] Backend CI runs only when backend-relevant files change

### DO development

- [ ] `dev` branch redeploys site app
- [ ] `dev` branch redeploys admin app
- [ ] `dev` branch redeploys backend app
- [ ] Site loads from `testwww.thehbm.org`
- [ ] Admin loads from `testadmin.thehbm.org`
- [ ] API responds from `testapi.thehbm.org`
- [ ] Worker runs with one instance
- [ ] Prisma migration is applied automatically

### DO staging

- [ ] `staging` branch redeploys site app
- [ ] `staging` branch redeploys admin app
- [ ] `staging` branch redeploys backend app
- [ ] Staging env vars and resources are isolated from dev

### GCP production

- [ ] `main` deploy flow matches the intended production boundary
- [ ] Production deploy docs are no longer tied to the old single-runtime model

## Key Files To Change

- [x] `.github/workflows/ci.yml`
- [x] `.github/workflows/deploy-do.yml`
- [x] `.github/workflows/deploy-gcp.yml`
- [x] `apps/site/package.json`
- [x] `apps/admin/package.json`
- [x] `apps/server/package.json`
- [x] `package.json`
- [x] `docs/CI_CD_VARIABLES.md`
- [x] `docs/DEPLOY_INSTRUCTIONS.md`
- [x] `docs/DEPLOY_STATUS.md`
