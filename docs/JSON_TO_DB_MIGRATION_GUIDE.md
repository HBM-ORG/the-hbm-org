# JSON-to-DB Migration Guide

This repo now supports moving mutable runtime content out of JSON files and into MySQL, while moving uploaded media into object storage.

## What Changed

- Runtime content now has database-backed route/controller/service structure.
- Object storage support was added for DigitalOcean Spaces and Google Cloud Storage.
- Uploads can use pre-signed URLs instead of writing to local disk.
- Migration scripts were added for JSON data and media files.

## Current Status

- Already moved to DB:
  - CRM registrations
  - events and site content managed through DB-backed services
  - email engagement log
  - cookie consent log
  - email automation settings (`EmailFlow`, `EmailSequence`, `SmtpConfig`, `GlobalStyling`)
  - campaigns (`EmailCampaign`)
  - suppression list (`EmailSuppression`)
  - remaining mutable content configs (`ContentEntry` for video event, how-it-works, knowledge base)
- Already moved to object storage:
  - admin uploads through `/api/upload/*`
- Legacy JSON files now exist only as migration sources / historical backups for one-off backfill scripts.

## New Server Structure

- `apps/server/src/routes/upload.routes.ts`
- `apps/server/src/routes/cms.routes.ts`
- `apps/server/src/controllers/upload.controller.ts`
- `apps/server/src/controllers/cms.controller.ts`
- `apps/server/src/services/storage.service.ts`
- `apps/server/src/services/cms.service.ts`
- `apps/server/src/storage/index.ts`
- `apps/server/src/storage/adapter.ts`
- `apps/server/src/storage/types.ts`

## Migration Scripts

- `scripts/one-off/migrate-json-to-db.ts`
- `scripts/one-off/migrate-files-to-storage.ts`
- `scripts/one-off/migrate-engagement-log-to-db.ts`
- `scripts/one-off/migrate-storage-provider.ts`

## Environment

Required storage env vars depend on `STORAGE_PROVIDER`.

For Spaces:

```bash
STORAGE_PROVIDER=spaces
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=your-bucket
SPACES_KEY=your-key
SPACES_SECRET=your-secret
```

For GCS:

```bash
STORAGE_PROVIDER=gcs
GCS_BUCKET=your-bucket
GCS_PROJECT_ID=your-project
GCS_CREDENTIALS_JSON='{"type":"service_account", ... }'
```

## Suggested Flow

1. Run Prisma migrations against `apps/server/prisma`.
2. Run `scripts/one-off/migrate-json-to-db.ts` to backfill all legacy JSON-backed runtime data into Prisma tables.
3. Run `scripts/one-off/migrate-files-to-storage.ts` to move media and rewrite URLs.
4. Verify admin upload flows against the new `/api/upload/*` endpoints.
5. Treat the old JSON files as migration-only artifacts; runtime reads and writes now go through Prisma-backed services.

## Notes

- The route files are intentionally thin now.
- OpenAPI-style annotations were added at controller level so docs can be enabled later.
- `apps/admin/src/utils/upload.js` is now the admin frontend helper for pre-signed uploads.
- `apps/server/src/paths.ts` no longer points at client runtime JSON files; it is now only used for repo/app/env paths.
