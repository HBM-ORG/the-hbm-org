# CI/CD Variables And Secrets

This project uses separate GitHub Actions workflows for CI, DigitalOcean deploys, and GCP deploys. The frontend is now split into two deployable apps:

- `apps/site` for `thehbm.org` / `www.thehbm.org`
- `apps/admin` for `admin.thehbm.org`
- `apps/server` for the shared API and worker runtime

## Branch Mapping

- `dev`: development environment on DigitalOcean App Platform via `.github/workflows/deploy-do.yml`
- `staging`: staging environment on DigitalOcean App Platform via `.github/workflows/deploy-do.yml`
- `main`: production environment on GCP Cloud Run via `.github/workflows/deploy-gcp.yml`

## Workflows

- `.github/workflows/ci.yml`: runs `npm ci`, server typecheck, and validates `apps/site`, `apps/admin`, and `apps/server`
- `.github/workflows/deploy-do.yml`: validates and deploys `dev` and `staging` to DigitalOcean
- `.github/workflows/deploy-gcp.yml`: validates, builds the Docker image, and deploys `main` to GCP Cloud Run

## GitHub Actions Secrets

These should be configured in GitHub repository or environment secrets.

- `DO_API_TOKEN`: used by the DigitalOcean deploy workflow to trigger App Platform deployments via `doctl`
- `GCP_CREDENTIALS_JSON`: used by the GCP deploy workflow for Cloud Build, Artifact Registry, and Cloud Run

## GitHub Actions Variables

These should be configured as GitHub repository or environment variables.

### DigitalOcean

- `DO_APP_ID_DEV`: `development` environment variable for the App Platform app ID behind the `dev` branch
- `DO_APP_ID_STAGING`: `staging` environment variable for the App Platform app ID behind the `staging` branch

### GCP

- `GCP_PROJECT_ID`: `production` environment variable for the GCP project ID
- `GCP_REGION`: `production` environment variable for the Cloud Run region, for example `europe-west1`
- `GCP_CLOUD_RUN_SERVICE`: `production` environment variable for the Cloud Run service name
- `GCP_ARTIFACT_REGISTRY_REGION`: `production` environment variable for the Artifact Registry region
- `GCP_ARTIFACT_REGISTRY_REPOSITORY`: `production` environment variable for the Artifact Registry Docker repository name

## Runtime Application Environment Variables

GitHub Actions deploys the app, but runtime application config should live in the hosting platform, not in GitHub Actions.

Examples:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `STORAGE_PROVIDER`
- `SPACES_ENDPOINT`, `SPACES_REGION`, `SPACES_BUCKET`, `SPACES_KEY`, `SPACES_SECRET`
- `GCS_BUCKET`, `GCS_PROJECT_ID`, `GCS_CREDENTIALS_JSON`, `GCS_KEY_FILE`
- `GEMINI_API_KEY`
- `GOOGLE_BOOKS_API_KEY`
- `SITE_APP_URL`
- `ADMIN_APP_URL`

## Frontend Static App Variables

These belong to the frontend hosting target for each app, not the server container.

### Site app

- `VITE_API_BASE`
- `VITE_ASSET_BASE`
- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_GA_ID`
- `VITE_CLARITY_ID`
- `VITE_FB_PIXEL_ID`

### Admin app

- `VITE_API_BASE`
- `VITE_ASSET_BASE`
- `VITE_SITE_URL`
- `VITE_ADMIN_URL`
- `VITE_CLARITY_ID` (optional, only for direct Clarity project deep-links from admin)

### Frontend variables that should stay server-side instead

Do not expose these as `VITE_*` vars in `apps/site` or `apps/admin`:

- `GOOGLE_BOOKS_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

Those remain runtime-only server variables in `apps/server`.

## Local Development Defaults

The checked-in frontend env examples default to localhost for split local development:

### `apps/site/.env.example`

- `VITE_API_BASE=http://localhost:3001`
- `VITE_SITE_URL=http://localhost:4200`
- `VITE_ADMIN_URL=http://localhost:4300`

### `apps/admin/.env.example`

- `VITE_API_BASE=http://localhost:3001`
- `VITE_SITE_URL=http://localhost:4200`
- `VITE_ADMIN_URL=http://localhost:4300`

Keep these in:

- DigitalOcean App Platform environment settings for `dev` and `staging`
- GCP Cloud Run service variables and secret bindings for `main`

## Docker / GCP Deploy Notes

Production deploy uses:

1. `Dockerfile`
2. `gcloud builds submit` to build and push an image to Artifact Registry
3. `gcloud run deploy` to deploy that image to Cloud Run

That gives production a stable, explicit build artifact instead of a source-only deploy.
