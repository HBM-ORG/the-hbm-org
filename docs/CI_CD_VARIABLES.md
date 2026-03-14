# CI/CD Variables And Secrets

This project now targets a three-app deployment boundary:

- `apps/site` as the public site
- `apps/admin` as the admin static UI
- `apps/server` as the backend app, containing:
  - API web runtime
  - worker runtime

For a trackable checklist with placeholder example values, see:

- `docs/CI_CD_EXAMPLE_VALUES_CHECKLIST.md`

## Branch Mapping

- `dev`: DigitalOcean development environment
- `staging`: DigitalOcean staging environment
- `main`: GCP production environment

## Workflow Layout

### Shared / orchestration

- `.github/workflows/ci.yml`: shared workspace validation for root-level and cross-cutting changes

### Component CI

- `.github/workflows/site-ci.yml`: validates `apps/site`
- `.github/workflows/admin-ci.yml`: validates `apps/admin`
- `.github/workflows/backend-ci.yml`: validates `apps/server`, including explicit Prisma generation

### Deploy

- `.github/workflows/deploy-do.yml`: deploys `dev` and `staging` to DigitalOcean using three app IDs per environment:
  - `site`
  - `admin`
  - `backend`
- `.github/workflows/deploy-gcp.yml`: deploys `main` to GCP and runs backend Prisma generation plus schema migration before backend rollout

## App Root Deployment Boundary

Each deployable now installs and validates from its own app root:

- `apps/site`
- `apps/admin`
- `apps/server`

That means frontend deploys no longer need the root `package.json` install path or backend Prisma hooks in order to build successfully.

## GitHub Environments

Use these GitHub environments:

- `development`
- `staging`
- `production`

Environment-scoped variable names should stay consistent across environments. The value changes per environment, but the key name stays the same.

## Exact GitHub Secrets And Variables Matrix

### Shared repository secret

- `DO_API_TOKEN`

Used by:

- `.github/workflows/deploy-do.yml`

### `development` environment

#### Development secrets

- `BACKEND_DATABASE_URL`

#### Development variables

- `DO_APP_ID_SITE`
- `DO_APP_ID_ADMIN`
- `DO_APP_ID_BACKEND`

Purpose:

- `site` DO App Platform app ID for `testwww.thehbm.org`
- `admin` DO App Platform app ID for `testadmin.thehbm.org`
- `backend` DO App Platform app ID for `testapi.thehbm.org`
- Prisma migrations for DigitalOcean should run from the backend App Platform deployment/runtime path, not from the GitHub runner

### `staging` environment

#### Staging secrets

- `BACKEND_DATABASE_URL`

#### Staging variables

- `DO_APP_ID_SITE`
- `DO_APP_ID_ADMIN`
- `DO_APP_ID_BACKEND`

Purpose:

- same variable names as `development`
- values point to staging App Platform app IDs and staging backend DB

### `production` environment

#### Production secrets

- `GCP_CREDENTIALS_JSON`
- `BACKEND_DATABASE_URL`

#### Production variables

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_CLOUD_RUN_SERVICE`
- `GCP_ARTIFACT_REGISTRY_REGION`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY`

Purpose:

- `GCP_CREDENTIALS_JSON` authenticates GitHub Actions to GCP
- `BACKEND_DATABASE_URL` is used by backend deployment automation to run `prisma migrate deploy`
- `GCP_*` values drive Cloud Build, Artifact Registry, and Cloud Run deployment

## Why `BACKEND_DATABASE_URL` Lives In GitHub

Runtime application config should still live in the hosting platform. For GCP production, backend schema deployment can run automatically in CI/CD from GitHub Actions. For DigitalOcean dev/staging, GitHub-hosted runners may not have trusted network access to the managed MySQL instance.

That means GitHub Actions needs a DB connection string for:

- `npm --prefix apps/server run prisma:migrate:deploy`

Use `BACKEND_DATABASE_URL` in GitHub for environments where the runner can actually reach the database. For DO dev/staging, keep `DATABASE_URL` on the backend app itself and run Prisma migrations from the backend App Platform deployment/runtime path instead.

## Runtime Application Environment Variables

These live in the hosting platform, not in GitHub Actions variables.

### Site app runtime variables

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- `VITE_SITE_OG_IMAGE_URL` as needed
- `VITE_GA_ID`
- `VITE_CLARITY_ID`
- `VITE_FB_PIXEL_ID`

### Admin app runtime variables

- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_API_BASE`
- `VITE_CLARITY_ID` as needed

### Shared frontend notes

- Frontend asset and legacy upload URLs now derive from `VITE_API_BASE`; separate `VITE_ASSET_BASE` and `VITE_CMS_UPLOADS_BASE` keys are no longer required.
- Site and admin favicons are now repo-served from each app's own `public/` directory, so `VITE_FAVICON_URL` and `VITE_APPLE_TOUCH_ICON_URL` are no longer required.
- Organization/contact/social metadata now lives in DB-backed site settings and is maintained from the admin `Settings` tab instead of app-local hardcoded runtime env keys.

### Backend app runtime variables

- `NODE_ENV`
- `PORT`
- `BASE_URL`
- `SITE_PUBLIC_URL`
- `SITE_APP_URL`
- `ADMIN_APP_URL`
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `RUN_EMAIL_WORKER=false` on the web component
- `STORAGE_PROVIDER`
- `SPACES_ENDPOINT`
- `SPACES_REGION`
- `SPACES_BUCKET`
- `SPACES_KEY`
- `SPACES_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GEMINI_API_KEY`
- `GOOGLE_BOOKS_API_KEY`
- `OPENAI_API_KEY`

### Frontend variables that must stay server-side

Do not expose these as `VITE_*` vars in `apps/site` or `apps/admin`:

- `GOOGLE_BOOKS_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `DATABASE_URL`
- storage credentials
- SMTP credentials

## Environment-Specific Hostname Matrix

### Development

- site: `https://testwww.thehbm.org`
- admin: `https://testadmin.thehbm.org`
- backend: `https://testapi.thehbm.org`

### Staging

- site: set the staging public site hostname
- admin: set the staging admin hostname
- backend: set the staging API hostname

### Production

- site: production public hostname
- admin: production admin hostname
- backend: production API hostname

## Local Development Defaults

The checked-in frontend env examples default to localhost:

### `apps/site/.env.example`

- `VITE_API_BASE=http://localhost:3001`
- `VITE_SITE_URL=http://localhost:4200`
- `VITE_ADMIN_URL=http://localhost:4300`

### `apps/admin/.env.example`

- `VITE_API_BASE=http://localhost:3001`
- `VITE_SITE_URL=http://localhost:4200`
- `VITE_ADMIN_URL=http://localhost:4300`

### `apps/server/.env.example`

- `BASE_URL=http://localhost:3001`
- `SITE_APP_URL=http://localhost:4200`
- `ADMIN_APP_URL=http://localhost:4300`
- `RUN_EMAIL_WORKER=false`

## Prisma Automation Notes

The backend pipeline now treats Prisma as a backend-wide concern:

1. `npm ci`
2. `npm run prisma:generate -w apps/server`
3. backend build / typecheck
4. `npm run prisma:migrate:deploy -w apps/server`
5. deploy backend runtime

This applies to:

- DigitalOcean backend deployment
- GCP production backend deployment

## Production / GCP Notes

Current production workflow still uses:

1. `apps/server/Dockerfile`
2. `gcloud builds submit`
3. `gcloud run deploy`

The deployment boundary is being aligned to the same logical model as DO:

- site
- admin
- backend

The backend Prisma migration step is now automated in the production pipeline through `BACKEND_DATABASE_URL`.
