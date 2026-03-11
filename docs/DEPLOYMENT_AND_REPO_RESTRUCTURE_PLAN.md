# Deployment And Repo Restructure Plan

Track the planned move from the current combined app layout to a clearer deployment and repository structure that supports:

- separate frontend, API, and worker responsibilities
- safer scaling on DigitalOcean App Platform and GCP Cloud Run
- cleaner build outputs for client and server
- better script hygiene after one-time migration work is complete

This document is intentionally a plan only. It does not mean the changes should be implemented in one pass.

## Goals

- [ ] Keep production behavior stable while restructuring
- [ ] Separate static UI delivery from API and background jobs
- [ ] Prevent duplicate queue workers when web instances scale
- [ ] Make `dev`, `staging`, and `main` deployment topology explicit
- [ ] Introduce a clearer repo layout for client, server, shared code, and scripts
- [ ] Split build artifacts so client and server outputs are not mixed
- [ ] Distinguish permanent operational scripts from one-time migration scripts
- [ ] Preserve `npm run typecheck`, `npm run build`, CI, and deploy workflows throughout the transition

## Recommended Target Architecture

### Runtime topology

- [ ] Frontend/UI deployed separately as a static app
- [ ] API deployed as its own web service
- [ ] Background email/queue processing deployed as a dedicated worker service
- [ ] Only the worker service runs queue polling by default
- [ ] Web service can scale independently from the worker

### Platform mapping

- [ ] `dev` branch deploys to DigitalOcean App Platform
- [ ] `staging` branch deploys to DigitalOcean App Platform
- [ ] `main` branch deploys to GCP
- [ ] DO environments use the same logical shape as production where practical
- [ ] GCP production uses managed static hosting + CDN for the frontend and Cloud Run for backend services

## Recommended Instance Strategy

### Initial safe setup

- [ ] Web service uses exactly 1 instance until worker split is complete
- [ ] Worker uses exactly 1 instance initially
- [ ] Autoscaling above 1 web instance is disabled until queue work is isolated from the web role

### After worker split

- [ ] Web service may autoscale independently
- [ ] Worker remains pinned to 1 instance until queue leasing/claiming is implemented
- [ ] Multi-worker support is deferred until queue concurrency control exists

## Recommended Deployment Shape

### DigitalOcean App Platform

Recommended target for `dev` and `staging`:

- [ ] One App Platform app per environment
- [ ] Static site component for frontend
- [ ] Web service component for API
- [ ] Worker component for background processing
- [ ] Shared environment config managed at the app/component level

Notes:

- This keeps one environment grouped as a single platform app while still separating responsibilities.
- If App Platform component constraints become awkward, splitting into multiple apps is acceptable later, but not required for the first pass.

### GCP production

Recommended target for `main`:

- [ ] Static frontend deployed to a bucket/static hosting target
- [ ] CDN in front of the static frontend
- [ ] API deployed as a Cloud Run service
- [ ] Worker deployed as a separate Cloud Run service or job
- [ ] Object storage remains externalized through Spaces or GCS adapter configuration

Notes:

- This is the cleanest production shape for scale, cacheability, and cost control.
- Static frontend delivery should not depend on the Node/Express runtime once the split is complete.

## Repo Structure Recommendation

## Current issue

Today the repo mixes concerns:

- frontend lives under `src/`
- backend lives under `server/`
- build output is effectively frontend-oriented and served by the backend
- one-time migration scripts sit beside scripts that may remain useful long-term

That works during migration, but it becomes harder to reason about once frontend, web, and worker become independent deployment units.

## Recommended target layout

```text
.
├── apps/
│   ├── client/
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── server/
│       ├── src/
│       │   ├── bootstrap/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── storage/
│       │   ├── types/
│       │   ├── web/
│       │   └── worker/
│       ├── prisma/
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       └── package.json
├── scripts/
│   ├── dev/
│   ├── ops/
│   ├── build/
│   └── one-off/
├── docs/
└── .github/
```

## Repo structure decisions

- [ ] Introduce `apps/client` as the explicit frontend root
- [ ] Introduce `apps/server` as the explicit backend root
- [ ] Add `apps/server/src` so server code has the same structure clarity as the client
- [ ] Keep room for `packages/shared` for shared types/constants/schemas if needed
- [ ] Move backend entrypoints under `apps/server/src`
- [ ] Move Prisma schema and migrations under `apps/server/prisma`

## Prisma recommendation

Opinionated recommendation:

- [ ] Move the Prisma schema/migrations under the server app when the repo split happens
- [ ] Keep Prisma Client generation in its normal package-managed location unless there is a strong reason to customize output

Rationale:

- Moving `prisma/` under the server app makes sense because Prisma is a backend concern.
- Moving the generated Prisma client to a custom folder is usually not worth the extra import/path/tooling complexity unless the monorepo requires it.

## Build Output Recommendation

### Target output model

- [ ] Client builds to its own output directory, for example `apps/client/dist`
- [ ] Server builds to its own output directory, for example `apps/server/dist`
- [ ] Deployment never depends on a combined mixed artifact layout
- [ ] Static frontend artifact can be deployed without packaging the API
- [ ] Server artifact can be deployed without bundling the frontend

### Transitional note

- [ ] Keep the current combined production behavior until the frontend split is ready
- [ ] Do not attempt frontend split, worker split, and repo relocation in the same pass

## Worker Split Plan

### Configuration

- [ ] Introduce a runtime flag such as `RUN_EMAIL_WORKER=true|false`
- [ ] Ensure web processes do not start the queue worker unless explicitly enabled
- [ ] Ensure worker processes do not need to serve frontend traffic

### Service boundaries

- [ ] Web role handles HTTP API traffic
- [ ] Worker role handles queue polling and background jobs
- [ ] Shared business logic remains in reusable server services
- [ ] Worker bootstrap becomes a thin entrypoint over the same service modules

### Future concurrency support

- [ ] Add queue claiming/leasing before allowing more than one worker
- [ ] Define retry/visibility strategy for failed or abandoned jobs
- [ ] Document how worker concurrency maps to DB guarantees

## CI/CD Impact Plan

### DigitalOcean workflow evolution

- [ ] Keep existing DO workflow as-is until deployment split starts
- [ ] Update DO deploy workflow to match the final App Platform component layout
- [ ] Ensure `dev` and `staging` each target an app definition with frontend, web, and worker components
- [ ] Add environment variables or app spec support for worker-only runtime flags

### GCP workflow evolution

- [ ] Keep existing GCP workflow as-is until frontend and worker split starts
- [ ] Evolve GCP workflow to deploy frontend separately from backend
- [ ] Deploy API and worker as separate Cloud Run targets
- [ ] Keep production image build/deploy explicit and repeatable

### CI invariants

- [ ] `npm ci` or workspace install remains deterministic
- [ ] Typecheck continues to cover backend TypeScript
- [ ] Frontend build remains validated in CI
- [ ] Deployment workflows stay aligned with `dev` -> `staging` -> `main`

## Script Cleanup Plan

## Script categories

Recommended categories:

- [ ] `scripts/dev/` for local development helpers
- [ ] `scripts/build/` for repeatable build-time tasks
- [ ] `scripts/ops/` for operational scripts that may still be used after launch
- [ ] `scripts/one-off/` for temporary migration/backfill utilities

## Permanent vs temporary scripts

### Permanent

- [ ] Prisma schema migrations remain part of normal deploy lifecycle
- [ ] Build helpers remain versioned and supported
- [ ] Operational scripts that may be used repeatedly stay documented

### Temporary / archive candidates

- [ ] JSON-to-DB migration scripts
- [ ] file-to-object-storage migration scripts
- [ ] provider-to-provider storage migration scripts
- [ ] engagement backfill/import scripts

Important distinction:

- Prisma schema migrations are ongoing deploy assets.
- Data migration/backfill scripts are one-time or rare operational tools and should not be treated as standard runtime/deploy scripts forever.

## Cleanup policy

- [ ] Move one-time migration scripts into a clearly marked `scripts/one-off/` location
- [ ] Keep them until the migration/cutover is validated in all relevant environments
- [ ] After validation, either archive them or leave them with explicit "historical one-off" labeling
- [ ] Remove them from primary docs and default workflows once they are no longer part of the normal operating model

## Suggested Implementation Phases

### Phase 1: planning and guardrails

- [ ] Finalize target deployment topology
- [ ] Finalize repo target layout
- [ ] Decide whether to adopt a workspace/monorepo package structure now or later
- [ ] Document runtime role flags for `web` vs `worker`

### Phase 2: worker isolation without major repo move

- [ ] Add worker runtime flag
- [ ] Prevent queue worker startup on normal web instances
- [ ] Add a dedicated worker entrypoint
- [ ] Keep current repo layout during this phase

### Phase 3: deployment topology split

- [ ] Deploy worker separately in DO `dev`/`staging`
- [ ] Deploy worker separately in GCP production
- [ ] Keep frontend still bundled with web if needed during transition

### Phase 4: frontend split

- [ ] Move client into explicit app folder
- [ ] Deploy frontend as static target
- [ ] Remove backend dependence on serving frontend in production

### Phase 5: backend app relocation

- [ ] Move server code into `apps/server/src`
- [ ] Move Prisma schema into `apps/server/prisma`
- [ ] Update all scripts, tsconfig, and deploy paths accordingly

### Phase 6: script cleanup and final hardening

- [ ] Reclassify scripts into permanent vs one-off
- [ ] Remove obsolete migration scripts from main workflows/docs
- [ ] Add queue leasing before allowing multi-worker scale
- [ ] Revisit autoscaling thresholds after traffic observation

## Definition Of Done

- [ ] Frontend, web, and worker responsibilities are clearly separated
- [ ] Web replicas can scale without duplicating worker behavior
- [ ] Frontend is deployable independently as a static artifact
- [ ] Backend is deployable independently as an API/worker artifact
- [ ] Repo layout clearly communicates client vs server ownership
- [ ] Prisma lives with the server app
- [ ] One-off migration scripts are no longer treated as standard deploy tooling
- [ ] CI/CD reflects the true deployment topology
- [ ] `dev`, `staging`, and `main` remain aligned with the intended hosting model

## Recommendation Summary

Recommended direction:

- [ ] Use separate frontend, web, and worker roles
- [ ] Keep worker count at 1 initially
- [ ] Keep web count at 1 until worker split is complete
- [ ] Use a phased repo move instead of a big-bang restructure
- [ ] Move Prisma under the server app during the repo split
- [ ] Keep generated Prisma client in the standard managed location unless a real need emerges
- [ ] Treat migration/backfill scripts as temporary operational artifacts, not permanent deploy scripts
