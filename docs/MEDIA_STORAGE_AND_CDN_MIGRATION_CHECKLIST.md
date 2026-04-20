# Media Storage And CDN Migration Checklist

## Goal

- [ ] Make CMS-managed media use one source of truth: DB + object storage only
- [ ] Stop relying on checked-in static copies of CMS-managed media under the site build
- [ ] Enable CDN delivery for bucket-backed media
- [ ] Keep only app-owned, versioned static assets in the repo/site deploy

## Current State Summary

- [x] The public site is a static SPA on DigitalOcean App Platform
- [x] The public site fetches live events from `/api/events`, but falls back to build-time data when API fetch fails
- [x] Admin uploads already return object storage URLs for new uploads
- [x] Many legacy records and fallback files still reference `/assets/...`
- [x] App Platform deploy currently uploads checked-in event/team/media files as part of the site build
- [x] Spaces CDN is not yet enabled for the CMS media bucket

## Desired Media Ownership

### Keep In Repo / Static Site

- [ ] Brand assets: `/logo.png`, favicon, OG image, manifest
- [ ] Fixed decorative assets in `how-it-works`, `hero`, and other app-owned UI folders
- [ ] Default placeholders such as `/assets/default-hero.jpg`
- [ ] Legal PDFs if they should remain code/version controlled

### Move To DB + Bucket/CDN Only

- [ ] Event images
- [ ] Event videos
- [ ] Event galleries and card images
- [ ] Team photos
- [ ] Testimonial/company logos
- [ ] Partner logos
- [ ] Uploaded email/media assets maintained from admin

## CDN Decision

- [ ] Enable DigitalOcean Spaces CDN on the CMS media bucket
- [ ] Add a custom media hostname such as `sitemedia.thehbm.org`
- [ ] Serve CMS media from the CDN/custom hostname rather than raw bucket origin URLs
- [ ] Keep the raw bucket origin available operationally, but do not use it as the primary public URL in saved records

## Recommended Env / Config Shape

### Backend

- [ ] Keep `SPACES_ENDPOINT` for API, signed upload, and key extraction against the Spaces origin
- [ ] Keep `SPACES_BUCKET`
- [ ] Add a new public media base env, proposed name: `SPACES_PUBLIC_BASE_URL`
- [ ] Set `SPACES_PUBLIC_BASE_URL=https://sitemedia.thehbm.org` after CDN + custom domain are ready
- [ ] If custom media domain is not ready yet, temporary value can be the Spaces CDN endpoint for the bucket

### Frontend

- [ ] Do not add frontend-only media endpoint envs unless the UI must construct URLs directly
- [ ] Prefer saving fully resolved public media URLs in DB from the backend so site/admin can render them without extra URL composition rules

### Fallback / Rollback

- [ ] Raw bucket origin remains available as an operational fallback
- [ ] Saved public URLs should still point to one canonical public media base
- [ ] Avoid storing both raw-origin and CDN-domain URLs for the same asset set

## Phase 1: Bucket CDN Setup

- [ ] Enable Spaces CDN for `test-org-site-media-files`
- [ ] Set edge cache TTL to a reasonable default such as `1 hour`
- [ ] Add custom subdomain `sitemedia.thehbm.org`
- [ ] Create the required DNS record in Hostinger for the media subdomain
- [ ] Confirm TLS/certificate provisioning completes for the media hostname
- [ ] Decide final canonical media base:
  - [ ] `https://sitemedia.thehbm.org`
  - [ ] or temporary DO CDN endpoint if the custom domain is not ready

## Phase 2: Backend Public Media URL Support

### Files To Update

- [ ] `apps/server/src/storage/adapters/spaces.adapter.ts`
  - [ ] Build public `viewUrl` from `SPACES_PUBLIC_BASE_URL` when set
  - [ ] Fall back to current raw origin format when `SPACES_PUBLIC_BASE_URL` is not set
  - [ ] Extend `extractKeyFromUrl()` to accept:
    - [ ] raw Spaces origin URLs
    - [ ] Spaces CDN endpoint URLs
    - [ ] custom media domain URLs
- [ ] `apps/server/.env.example`
  - [ ] Document `SPACES_PUBLIC_BASE_URL`
  - [ ] Clarify that `SPACES_ENDPOINT` is the API/origin endpoint, not necessarily the public delivery URL
- [ ] `apps/server/.env`
  - [ ] Add `SPACES_PUBLIC_BASE_URL` in deployed environments after CDN/custom domain is ready

### Validation

- [ ] Upload a new image from admin
- [ ] Confirm saved URL uses the public media base, not the raw origin
- [ ] Confirm delete flow still works with the new public URL format

## Phase 3: Data Migration To Bucket-Backed URLs

### Live CMS Data To Normalize

- [ ] `Event.image`
- [ ] `Event.heroVideo`
- [ ] `Event.gallery`
- [ ] `Event.imageBubbles[*].image`
- [ ] `Event.partners[*].logo`
- [ ] `TeamMember.image`
- [ ] `Testimonial.companyLogo`
- [ ] `Partner.logoUrl`

### Existing Scripts To Use / Review

- [ ] `scripts/one-off/reconcile-event-assets.ts`
  - [ ] Use to remap or clear broken legacy `/assets/...` event paths
- [ ] `scripts/one-off/migrate-files-to-storage.ts`
  - [ ] Review before use because it still references legacy `apps/client` paths
- [ ] `scripts/one-off/migrate-storage-provider.ts`
  - [ ] Keep for provider-to-provider migration scenarios

### Script Fixes Before Running Large Migration

- [ ] `scripts/one-off/migrate-files-to-storage.ts`
  - [ ] Replace legacy `apps/client` path assumptions with current repo layout
  - [ ] Review whether it should scan `apps/site/public` or another source of truth for remaining legacy files

## Phase 4: Fallback / Seed / Build-Time Data Cleanup

### Event Fallbacks

- [ ] `apps/site/public/data/events.json`
  - [ ] Remove dependence on legacy `/assets/events/...` paths
  - [ ] Replace with bucket/CDN URLs or reduce fallback usage
- [ ] `apps/site/src/data/eventsConfig.js`
  - [ ] Audit for any legacy fallback event media references
- [ ] `apps/site/src/data/videoEvent.json`
  - [ ] Replace local event image references with bucket/CDN URL or intentional static asset
- [ ] `apps/site/src/data/galleriesConfig.js`
  - [ ] Decide whether these gallery folders are app-owned static assets or CMS-managed assets

### Content / Team / Partner Fallbacks

- [ ] `apps/site/src/data/content.js`
  - [ ] Remove CMS-managed team image dependencies on `/assets/team/...`
- [ ] `apps/admin/src/data/content.js`
  - [ ] Remove CMS-managed team image dependencies on `/assets/team/...`

### UI Components That Still Assume Local Event Paths

- [ ] `apps/site/src/components/Events/EventModal.jsx`
  - [ ] Stop constructing `/assets/events/${folderName}/...` when records should already carry final URLs
- [ ] `apps/admin/src/pages/AdminDashboard.jsx`
  - [ ] Stop constructing fallback `/assets/events/...` paths for gallery/media when bucket-backed URLs are expected
- [ ] `apps/admin/src/components/Admin/VisualEventEditor.jsx`
  - [ ] Stop constructing fallback `/assets/events/...` paths for editor previews when URLs are already resolved
- [ ] `apps/site/src/utils/eventUtils.js`
  - [ ] Reassess auto-generated `/assets/events/${folderName}/${i}.jpg` logic

## Phase 5: Keep Intentional Static Assets Only

### Likely Static / Keep

- [ ] `apps/site/src/components/SEO.jsx`
- [ ] `apps/site/src/components/CustomizeMeeter.jsx`
- [ ] `apps/site/src/components/EmotionMatrixMockup.jsx`
- [ ] `apps/site/src/pages/MeeterFeatures.jsx`
- [ ] `apps/site/src/data/howItWorksConfig.json`
- [ ] Legal PDFs referenced from:
  - [ ] `apps/site/src/components/Home/VideoEventModal.jsx`
  - [ ] `apps/site/src/components/Events/NextEventHero.jsx`
  - [ ] `apps/admin/src/components/Events/NextEventHero.jsx`

### Likely CMS / Remove From Static Site After Migration

- [ ] Event-specific folders under legacy `/assets/events/**`
- [ ] Team photos under legacy `/assets/team/**` once DB values are normalized
- [ ] Editable testimonial/company/partner logos still duplicated in the site bundle

## Phase 6: Repo / Build Cleanup

- [ ] Remove migrated CMS media from `apps/site/public` after verifying live data no longer references `/assets/...`
- [ ] Ensure the site build no longer ships obsolete CMS media folders
- [ ] Rebuild site and confirm deploy file count decreases materially
- [ ] Confirm admin/site still render all live CMS media from bucket/CDN URLs

## Phase 7: DNS / Hostinger Checklist For Media Hostname

- [ ] Choose canonical media host: `sitemedia.thehbm.org`
- [ ] Add DNS record in Hostinger for `sitemedia`
- [ ] Point DNS exactly to the value DigitalOcean shows when adding the custom subdomain to the bucket CDN
- [ ] Wait for DNS propagation
- [ ] Verify HTTPS works for `https://sitemedia.thehbm.org/...`

## Validation Checklist

- [ ] New upload from admin stores a bucket/CDN URL
- [ ] Existing remapped media renders on site
- [ ] Existing remapped media renders in admin
- [ ] Delete flow still removes the correct object from bucket
- [ ] Refreshing site/admin pages does not depend on local static CMS media
- [ ] Site build/deploy no longer uploads migrated CMS media folders
- [ ] Large media loads from CDN/custom media domain

## Rollback Notes

- [ ] Keep raw origin access available while migration is in progress
- [ ] Do not delete legacy static CMS media until DB values and fallback data are verified
- [ ] Make removal of static CMS media a separate step after URL migration is complete

## Repo Files Included In This Checklist

- [ ] `apps/server/src/storage/adapters/spaces.adapter.ts`
- [ ] `apps/server/.env.example`
- [ ] `apps/server/.env`
- [ ] `apps/site/src/context/EventsContext.jsx`
- [ ] `apps/site/public/data/events.json`
- [ ] `apps/site/src/data/eventsConfig.js`
- [ ] `apps/site/src/data/videoEvent.json`
- [ ] `apps/site/src/data/galleriesConfig.js`
- [ ] `apps/site/src/data/content.js`
- [ ] `apps/site/src/utils/eventUtils.js`
- [ ] `apps/site/src/components/Events/EventModal.jsx`
- [ ] `apps/site/src/components/Events/FeaturedEventCard.jsx`
- [ ] `apps/site/src/components/Events/NextEventHero.jsx`
- [ ] `apps/site/src/components/Home/VideoEventModal.jsx`
- [ ] `apps/site/src/components/Home/NextVideoEvent.jsx`
- [ ] `apps/site/src/components/SEO.jsx`
- [ ] `apps/site/src/components/CustomizeMeeter.jsx`
- [ ] `apps/site/src/components/EmotionMatrixMockup.jsx`
- [ ] `apps/site/src/pages/MeeterFeatures.jsx`
- [ ] `apps/admin/src/pages/AdminDashboard.jsx`
- [ ] `apps/admin/src/components/Admin/VisualEventEditor.jsx`
- [ ] `apps/admin/src/components/Admin/SiteContentManager.jsx`
- [ ] `apps/admin/src/utils/api.js`
- [ ] `apps/admin/src/utils/upload.js`
- [ ] `apps/admin/src/data/content.js`
- [ ] `scripts/one-off/reconcile-event-assets.ts`
- [ ] `scripts/one-off/migrate-files-to-storage.ts`
- [ ] `scripts/one-off/migrate-storage-provider.ts`

