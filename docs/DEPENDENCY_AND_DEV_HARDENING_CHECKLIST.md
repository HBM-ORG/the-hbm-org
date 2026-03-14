# Dependency And Dev Hardening Checklist

Track the next planning phase for this repo without starting implementation yet:

- verify the new `dev` deployment path on DigitalOcean
- confirm GitHub secrets, app IDs, and DNS mapping are complete
- plan safe Node / Prisma / dependency alignment work
- document the backend container base-image policy before changing it

This checklist is intentionally planning-focused. It should be used alongside the active deployment boundary doc:

- `docs/THREE_APP_DEPLOYMENT_CHECKLIST.md`

## Goals

- [ ] Verify the three-app `dev` environment is fully configured and deployable
- [ ] Validate the first `dev` branch deployment end-to-end and capture any missing assumptions
- [ ] Define one supported Node baseline across local, CI, Docker, DO, and GCP
- [ ] Resolve Prisma package alignment before any major upgrade
- [ ] Decide whether `@prisma/adapter-mariadb` is required or should be removed
- [ ] Keep the backend Docker base image stable until Prisma compatibility is proven for any alternative base
- [ ] Prepare a sequenced dependency/security upgrade plan instead of bulk-updating everything at once

## Dev Environment Bring-Up

### GitHub `development` environment

- [ ] Confirm `DO_API_TOKEN` is set
- [ ] Confirm `BACKEND_DATABASE_URL` is set
- [ ] Confirm `DO_APP_ID_SITE` is set
- [ ] Confirm `DO_APP_ID_ADMIN` is set
- [ ] Confirm `DO_APP_ID_BACKEND` is set
- [ ] Confirm any backend storage, SMTP, and AI secrets needed by current runtime are present

### DigitalOcean apps

- [ ] Confirm `site` App Platform app exists for `dev`
- [ ] Confirm `admin` App Platform app exists for `dev`
- [ ] Confirm `backend` App Platform app exists for `dev`
- [ ] Confirm backend app contains both `web` and `worker` components
- [ ] Confirm backend env vars are shared correctly between `web` and `worker`
- [ ] Confirm `RUN_EMAIL_WORKER=false` is applied to the backend web component
- [ ] Confirm backend worker instance count is `1` for now

### Shared backend resources

- [ ] Confirm Managed MySQL is provisioned for `dev`
- [ ] Confirm backend runtime can reach the `dev` database
- [ ] Confirm object storage configuration is present if required by current runtime
- [ ] Confirm backend-only secrets are not exposed to site/admin apps

### DNS and custom domains

- [ ] Wait until DO apps expose their target hostnames
- [ ] Map `testwww.thehbm.org` to the site app
- [ ] Map `testadmin.thehbm.org` to the admin app
- [ ] Map `testapi.thehbm.org` to the backend app
- [ ] Confirm certificate issuance completes successfully for all custom domains

## First `dev` Deployment Verification

- [ ] Push a small `dev` branch change to trigger deployment
- [ ] Confirm the DO deploy workflow runs successfully
- [ ] Confirm site-only changes redeploy only the site app
- [ ] Confirm admin-only changes redeploy only the admin app
- [ ] Confirm backend-only changes redeploy only the backend app
- [ ] Confirm backend Prisma migration runs successfully before backend rollout completes
- [ ] Confirm `testwww.thehbm.org` loads correctly
- [ ] Confirm `testadmin.thehbm.org` loads correctly
- [ ] Confirm `testapi.thehbm.org` responds correctly
- [ ] Confirm backend worker starts successfully and does not duplicate work
- [ ] Capture all warnings, missing env vars, path assumptions, or cloud-only errors discovered during this first pass

## Node Version Policy Review

- [ ] Compare current repo engine policy with actual CI and Docker runtime usage
- [ ] Decide whether root `package.json` should move from loose `>=18` to one pinned supported LTS target
- [ ] Prefer one Node version across local, CI, Docker, DO, and GCP
- [ ] Evaluate moving from Node 20 to Node 22 instead of staying on a near-EOL line
- [ ] Identify all files that must stay aligned if Node baseline changes:
  - `package.json`
  - `config/.nvmrc`
  - `apps/server/Dockerfile`
  - GitHub workflows

## Prisma Alignment Review

- [ ] Inventory current versions of `prisma`, `@prisma/client`, and `@prisma/adapter-mariadb`
- [ ] Resolve the current major-version mismatch between Prisma packages
- [ ] Confirm whether `@prisma/adapter-mariadb` is actually used by runtime code
- [ ] If the adapter is unused, plan its removal
- [ ] If Prisma 7 is desired, document all required preparation work before upgrading
- [ ] Review current schema expectations in `apps/server/prisma/schema.prisma`
- [ ] Define the required validation sequence for any Prisma upgrade:
  - `prisma generate`
  - backend typecheck
  - backend build/validate
  - `prisma migrate deploy`
  - container build
  - runtime smoke test

## Docker Base Image Policy

- [ ] Keep `node:20-bookworm-slim` as the current backend default until a change is justified
- [ ] Document why this repo should not automatically inherit `node:20-alpine` from the platform repo
- [ ] Review Prisma OpenSSL/runtime expectations for Debian slim vs Alpine
- [ ] If Alpine is reconsidered later, require proof that these succeed in-container:
  - `prisma generate`
  - `prisma migrate deploy`
  - backend startup
  - deploy smoke test
- [ ] Revisit the base image only after dependency/runtime alignment is complete

## Dependency And Security Review

- [ ] Run a dependency status review for root and all workspaces
- [ ] Separate safe routine updates from planned breaking upgrades
- [ ] Prioritize runtime, security, and infra-sensitive packages first
- [ ] Check whether any upgrade requires recovery, credential rotation, or package replacement because of published compromise guidance
- [ ] Prepare an ordered upgrade sequence instead of updating everything in one pass

## CI/CD Strictness Hardening

- [ ] Re-check workflows for assumptions that local runs tolerate but cloud CI may reject
- [ ] Avoid hidden dependency on local shell or sandbox-only env vars
- [ ] Keep backend validation explicit in CI and deploy flows
- [ ] Capture cloud-only warnings from the first `dev` deployment and feed them back into docs/checklists
- [ ] Add a repeatable pre-deploy validation list for future dependency/runtime changes

## Expected Outputs

- [ ] Verified `dev` environment configuration for the three-app model
- [ ] Gap list from the first real `dev` deployment
- [ ] Decision on Node baseline policy
- [ ] Decision on Prisma alignment path
- [ ] Documented backend container base-image policy
- [ ] Sequenced dependency/security upgrade plan for later implementation

## Related Files

- `docs/THREE_APP_DEPLOYMENT_CHECKLIST.md`
- `docs/CI_CD_VARIABLES.md`
- `.github/workflows/deploy-do.yml`
- `.github/workflows/deploy-gcp.yml`
- `apps/server/package.json`
- `apps/server/prisma/schema.prisma`
- `apps/server/Dockerfile`
- `package.json`
