# JSON-to-DB Migration Guide

This repo now supports moving mutable runtime content out of JSON files and into MySQL, while moving uploaded media into object storage.

## What Changed

- Runtime content now has database-backed route/controller/service structure.
- Object storage support was added for DigitalOcean Spaces and Google Cloud Storage.
- Uploads can use pre-signed URLs instead of writing to local disk.
- Migration scripts were added for JSON data and media files.

## New Server Structure

- `server/routes/upload.routes.ts`
- `server/routes/cms.routes.ts`
- `server/controllers/upload.controller.ts`
- `server/controllers/cms.controller.ts`
- `server/services/storage.service.ts`
- `server/services/cms.service.ts`
- `server/storage/index.ts`
- `server/storage/adapter.ts`
- `server/storage/types.ts`

## Migration Scripts

- `scripts/migrate-json-to-db.ts`
- `scripts/migrate-files-to-storage.ts`

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

1. Run Prisma migrations against the new schema.
2. Run `migrate-json-to-db.ts` to load textual content.
3. Run `migrate-files-to-storage.ts` to move media and rewrite URLs.
4. Verify admin upload flows against the new `/api/upload/*` endpoints.
5. Remove legacy JSON write paths only after verification.

## Notes

- The route files are intentionally thin now.
- OpenAPI-style annotations were added at controller level so docs can be enabled later.
- `src/utils/upload.js` is now the frontend helper for pre-signed uploads.
