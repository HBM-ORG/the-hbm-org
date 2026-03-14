# CI/CD Example Values Checklist

Use this document as a trackable companion to:

- `docs/CI_CD_VARIABLES.md`

All values below are example placeholders only. Replace them with the real values from GitHub, DigitalOcean, GCP, MySQL, Spaces, SMTP, and your DNS targets.

## Goals

- [ ] Keep GitHub environment keys aligned with workflow expectations
- [ ] Keep DigitalOcean runtime env keys aligned with app ownership
- [ ] Keep GCP production env keys aligned with the production workflow
- [ ] Avoid mixing frontend `VITE_*` values with backend-only secrets
- [ ] Keep secrets out of frontend runtimes

## GitHub Actions Configuration

### Repository-level secret

- [ ] `DO_API_TOKEN=dop_v1_example_replace_me`

Used by:

- `.github/workflows/deploy-do.yml`

### `development` environment

#### Development secrets

- [ ] `BACKEND_DATABASE_URL=mysql://dbuser:dbpass@dev-mysql-host:25060/thehbm_dev?sslaccept=strict`

#### Development variables

- [ ] `DO_APP_ID_SITE=11111111-1111-1111-1111-111111111111`
- [ ] `DO_APP_ID_ADMIN=22222222-2222-2222-2222-222222222222`
- [ ] `DO_APP_ID_BACKEND=33333333-3333-3333-3333-333333333333`

#### Development notes

- [ ] Confirm these values belong to the GitHub `development` environment
- [ ] Confirm `BACKEND_DATABASE_URL` points to the `dev` database only
- [ ] Confirm app IDs point to `testwww`, `testadmin`, and `testapi` dev apps

### `staging` environment

#### Staging secrets

- [ ] `BACKEND_DATABASE_URL=mysql://dbuser:dbpass@staging-mysql-host:25060/thehbm_staging?sslaccept=strict`

#### Staging variables

- [ ] `DO_APP_ID_SITE=44444444-4444-4444-4444-444444444444`
- [ ] `DO_APP_ID_ADMIN=55555555-5555-5555-5555-555555555555`
- [ ] `DO_APP_ID_BACKEND=66666666-6666-6666-6666-666666666666`

#### Staging notes

- [ ] Confirm these values belong to the GitHub `staging` environment
- [ ] Confirm staging values do not point to `dev` resources

### `production` environment

#### Production secrets

- [ ] `GCP_CREDENTIALS_JSON={...service account json...}`
- [ ] `BACKEND_DATABASE_URL=mysql://dbuser:dbpass@prod-mysql-host:3306/thehbm_prod?sslmode=required`

#### Production variables

- [ ] `GCP_PROJECT_ID=thehbm-prod`
- [ ] `GCP_REGION=europe-west1`
- [ ] `GCP_CLOUD_RUN_SERVICE=thehbm-api`
- [ ] `GCP_ARTIFACT_REGISTRY_REGION=europe-west1`
- [ ] `GCP_ARTIFACT_REGISTRY_REPOSITORY=thehbm-images`

#### Production notes

- [ ] Confirm these values belong to the GitHub `production` environment
- [ ] Confirm `GCP_CREDENTIALS_JSON` grants Cloud Build and Cloud Run deploy access
- [ ] Confirm `BACKEND_DATABASE_URL` points to the production database only

## DigitalOcean Dev Runtime Examples

These values live in DigitalOcean App Platform, not in GitHub variables.

### Site app runtime: `testwww.thehbm.org`

- [ ] `VITE_SITE_URL=https://testwww.thehbm.org`
- [ ] `VITE_ADMIN_URL=https://testadmin.thehbm.org`
- [ ] `VITE_API_BASE=https://testapi.thehbm.org`
- [ ] `VITE_SITE_OG_IMAGE_URL=https://testwww.thehbm.org/og-default.png`
- [ ] `VITE_GA_ID=G-XXXXXXXXXX`
- [ ] `VITE_CLARITY_ID=replace_me`
- [ ] `VITE_FB_PIXEL_ID=123456789012345`

### Admin app runtime: `testadmin.thehbm.org`

- [ ] `VITE_SITE_URL=https://testwww.thehbm.org`
- [ ] `VITE_ADMIN_URL=https://testadmin.thehbm.org`
- [ ] `VITE_API_BASE=https://testapi.thehbm.org`
- [ ] `VITE_CLARITY_ID=replace_me`

### Frontend ownership notes

- [ ] Site favicon comes from `apps/site/public/favicon.svg` and `apps/site/public/apple-touch-icon.svg`
- [ ] Admin favicon comes from `apps/admin/public/favicon.svg`
- [ ] Shared organization contact and social links are maintained in the admin `Settings` tab and persisted in DB via `/api/site-settings`

### Backend app shared runtime

Apply to both `web` and `worker` unless explicitly noted otherwise.

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `BASE_URL=https://testapi.thehbm.org`
- [ ] `SITE_PUBLIC_URL=https://testwww.thehbm.org`
- [ ] `SITE_APP_URL=https://testwww.thehbm.org`
- [ ] `ADMIN_APP_URL=https://testadmin.thehbm.org`
- [ ] `DATABASE_URL=mysql://dbuser:dbpass@dev-mysql-host:25060/thehbm_dev?sslaccept=strict`
- [ ] `ADMIN_PASSWORD=replace_with_strong_secret`
- [ ] `STORAGE_PROVIDER=spaces`
- [ ] `SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com`
- [ ] `SPACES_REGION=fra1`
- [ ] `SPACES_BUCKET=thehbm-dev-assets`
- [ ] `SPACES_KEY=replace_me`
- [ ] `SPACES_SECRET=replace_me`
- [ ] `SMTP_HOST=smtp.example.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=mailer@example.com`
- [ ] `SMTP_PASS=replace_me`
- [ ] `SMTP_FROM=The HBM <noreply@thehbm.org>`
- [ ] `GEMINI_API_KEY=replace_me`
- [ ] `GOOGLE_BOOKS_API_KEY=replace_me`
- [ ] `OPENAI_API_KEY=replace_me`

### Backend web-only runtime

- [ ] `RUN_EMAIL_WORKER=false`

### Backend worker-only runtime

- [ ] `RUN_EMAIL_WORKER=true`

## GCP Production Runtime Examples

These values are example placeholders for the current backend production path on GCP.

### Cloud Run backend runtime

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `BASE_URL=https://api.thehbm.org`
- [ ] `SITE_PUBLIC_URL=https://www.thehbm.org`
- [ ] `SITE_APP_URL=https://www.thehbm.org`
- [ ] `ADMIN_APP_URL=https://admin.thehbm.org`
- [ ] `DATABASE_URL=mysql://dbuser:dbpass@prod-mysql-host:3306/thehbm_prod?sslmode=required`
- [ ] `ADMIN_PASSWORD=replace_with_strong_secret`
- [ ] `STORAGE_PROVIDER=gcs`
- [ ] `SMTP_HOST=smtp.example.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=mailer@example.com`
- [ ] `SMTP_PASS=replace_me`
- [ ] `SMTP_FROM=The HBM <noreply@thehbm.org>`
- [ ] `GEMINI_API_KEY=replace_me`
- [ ] `GOOGLE_BOOKS_API_KEY=replace_me`
- [ ] `OPENAI_API_KEY=replace_me`

### GCP artifact/deploy examples

- [ ] Artifact Registry image example: `europe-west1-docker.pkg.dev/thehbm-prod/thehbm-images/org-site:<git-sha>`
- [ ] Cloud Run service example: `thehbm-api`
- [ ] Region example: `europe-west1`

## Safety Checks

- [ ] Do not put `DATABASE_URL`, SMTP credentials, storage credentials, or AI keys into `VITE_*` variables
- [ ] Do not reuse `dev` DB credentials in `staging` or `production`
- [ ] Do not reuse `dev` app IDs in `staging`
- [ ] Confirm backend GitHub deploy secret and runtime `DATABASE_URL` point to the same intended environment
- [ ] Confirm the site/admin public URLs point to the final custom domains, not default DO app URLs, once DNS is ready
- [ ] Confirm worker-only settings do not get copied to the web component by mistake

## Related Files

- `docs/CI_CD_VARIABLES.md`
- `docs/THREE_APP_DEPLOYMENT_CHECKLIST.md`
- `.github/workflows/deploy-do.yml`
- `.github/workflows/deploy-gcp.yml`
