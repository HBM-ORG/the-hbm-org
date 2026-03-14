# Admin DB Sync Job Checklist

Track the planning and phased implementation of an admin-triggered DB-to-DB delta sync flow without exposing raw database credentials to the browser.

This checklist is intentionally architecture-first. The sync must remain backend-owned even when initiated from the admin UI.

## Goals

- [ ] Keep source and target DB credentials server-side only
- [ ] Allow an authenticated admin to trigger a guarded sync job from the `Settings` tab
- [ ] Require an explicit confirmation step before any sync run starts
- [ ] Record a durable audit trail for every sync attempt
- [ ] Show run history, status, totals, and per-model breakdown in admin
- [ ] Reuse the existing delta-sync logic rather than maintaining two separate sync engines
- [ ] Keep local bootstrap usage possible for first-time environment bring-up
- [ ] Prevent accidental production-impacting runs through policy and environment guards

## Scope Definition

### In scope

- [ ] backend job wrapper around the existing DB delta-sync logic
- [ ] admin UI trigger and confirmation modal
- [ ] sync run audit table and details view
- [ ] source/target connection profile model handled by backend
- [ ] run status lifecycle: queued, running, succeeded, failed, cancelled
- [ ] per-model result summary for each run

### Out of scope for first pass

- [ ] browser-direct DB connections
- [ ] exposing raw connection strings to the client
- [ ] automatic scheduled syncs
- [ ] bidirectional conflict resolution
- [ ] row-by-row visual diff editor before execution
- [ ] cross-environment self-service access for non-admin users

## Security And Policy

### Credential handling

- [ ] Keep source and target DB URLs out of admin client bundles
- [ ] Store connection profiles only in backend-controlled storage
- [ ] Decide whether connection profiles live in DB, env vars, or a mixed model
- [ ] Mask sensitive connection details in audit/history responses
- [ ] Ensure logs never print full DB credentials

### Execution guards

- [ ] Restrict sync execution to authenticated admin users only
- [ ] Add a dedicated authorization check for dangerous operational actions
- [ ] Require a confirmation modal with a clear irreversible-impact message
- [ ] Require explicit source and target selection before enabling the CTA
- [ ] Block same-source and same-target runs
- [ ] Add environment guardrails so production targets require stricter confirmation
- [ ] Decide whether production-target runs require a second confirmation phrase

### Operational safety

- [ ] Prevent concurrent runs for the same source-target pair unless explicitly allowed
- [ ] Add timeout handling and failure status updates
- [ ] Persist partial progress when a run fails mid-way
- [ ] Define retry rules for transient failures
- [ ] Ensure worker/web restarts do not orphan in-progress job state

## Backend Architecture

### Shared sync engine

- [ ] Extract the reusable parts of `apps/server/scripts/sync-db-to-db.ts` into a shared server module
- [ ] Keep the CLI entrypoint thin and local-operator friendly
- [ ] Make the shared sync engine return structured per-model summaries
- [ ] Add options for dry-run vs execute
- [ ] Add options for model selection filters
- [ ] Add options for source/target profile labels used in audit entries

### Job orchestration

- [ ] Decide whether sync jobs run in the web process or the worker
- [ ] Prefer worker-owned execution if long-running jobs should not block API requests
- [ ] Define a job payload contract for sync requests
- [ ] Add a server endpoint to enqueue a sync job
- [ ] Add a server endpoint to list sync jobs
- [ ] Add a server endpoint to fetch a single sync job with detailed results
- [ ] Add a server endpoint to cancel a queued job if supported

### Persistence model

- [ ] Add a Prisma model for sync run audit entries
- [ ] Add a Prisma model for sync run detail rows or structured JSON breakdown
- [ ] Record initiating admin identity on each run
- [ ] Record source label and target label on each run
- [ ] Record dry-run vs execute mode
- [ ] Record started-at, completed-at, duration, status, and error summary
- [ ] Record counts by domain/model

### Suggested audit fields

- [ ] `id`
- [ ] `triggeredBy`
- [ ] `sourceLabel`
- [ ] `targetLabel`
- [ ] `mode`
- [ ] `selectedModels`
- [ ] `status`
- [ ] `startedAt`
- [ ] `completedAt`
- [ ] `summaryJson`
- [ ] `errorMessage`

## Admin UI

### Settings tab integration

- [ ] Add a new sync management section inside `SettingsManager`
- [ ] Show available source and target profiles using backend-provided labels
- [ ] Allow dry-run before execute
- [ ] Allow optional model filtering for targeted syncs
- [ ] Disable the action button while required fields are missing
- [ ] Surface current job state and last successful run

### Confirmation UX

- [ ] Add a modal with `Are You Sure?` confirmation
- [ ] Show source, target, mode, and selected models in the modal
- [ ] Warn clearly when target is production
- [ ] Require a final `Yes` action before job submission
- [ ] Ensure accidental double-submits are prevented

### Audit/history UX

- [ ] Add a table of recent sync runs
- [ ] Show run time, user, source, target, mode, status, and totals
- [ ] Add a details modal or drawer for each run
- [ ] Show per-model created/skipped counts in the details view
- [ ] Show failure reason and partial progress when applicable
- [ ] Add filtering by status or environment if the list grows

## Server Routes And Modules

- [ ] Add a dedicated route group for admin sync jobs
- [ ] Add a controller focused on enqueue/list/detail actions only
- [ ] Add a service for profile resolution and authorization checks
- [ ] Add a service for audit persistence
- [ ] Add a service for job execution that wraps the shared sync engine
- [ ] Keep controllers thin and avoid DB sync logic in route handlers

## Worker / Runtime Decision

### If executed in worker

- [ ] Define how the worker receives and claims sync jobs
- [ ] Ensure only one worker handles a given job
- [ ] Add heartbeat/progress updates for long-running runs
- [ ] Ensure the worker can load all required DB target/source credentials safely

### If executed in web process

- [ ] Limit first pass to small operator-only runs
- [ ] Add clear timeout boundaries
- [ ] Return job IDs immediately if execution becomes asynchronous
- [ ] Revisit worker migration before enabling heavier usage

## Rollout Plan

### Phase 1: local/operator hardening

- [ ] Finish stabilizing the CLI delta-sync path for local operator use
- [ ] Validate dry-run output against a real local-to-DO test
- [ ] Validate execute mode against a controlled dev target
- [ ] Confirm the sync summary shape is suitable for future audit storage

### Phase 2: backend job foundation

- [ ] Extract shared sync module from the CLI script
- [ ] Add Prisma audit models and migration
- [ ] Add backend endpoints and auth guards
- [ ] Add job execution path and structured result storage

### Phase 3: admin UI

- [ ] Add `Settings` UI for sync request creation
- [ ] Add confirmation modal
- [ ] Add run history table
- [ ] Add run details modal

### Phase 4: environment hardening

- [ ] Add production-specific safeguards
- [ ] Add cancellation/retry policy if still needed
- [ ] Add monitoring and alerting hooks if sync becomes operationally important

## Validation

- [ ] Dry-run against dev source and dev target
- [ ] Execute against dev source and empty dev target
- [ ] Execute against dev source and partially-seeded dev target
- [ ] Confirm duplicate rows are not reinserted
- [ ] Confirm audit rows are written for success and failure cases
- [ ] Confirm admin history reflects backend truth after page refresh
- [ ] Confirm no DB credentials appear in client responses, logs, or browser devtools

## Definition Of Done

- [ ] Admin can safely launch a guarded sync job from `Settings`
- [ ] Backend owns all DB credentials and execution
- [ ] Every run produces an audit record with structured details
- [ ] History and run details are visible in admin
- [ ] Existing local CLI sync remains usable for operator bootstrap flows

## Related Files

- `apps/server/scripts/sync-db-to-db.ts`
- `apps/admin/src/components/Admin/SettingsManager.jsx`
- `apps/admin/src/pages/AdminDashboard.jsx`
- `apps/server/prisma/schema.prisma`
- `apps/server/src/controllers/*`
- `apps/server/src/services/*`
