# Site Media Pipeline Checklist

Track the phased rollout for general site media management, large uploads, and performance-friendly derived assets.

This checklist focuses on the new admin-managed site media flow, starting with the `Join The Movement` home-page video and expanding into a reusable media pipeline later.

## Goals

- [ ] Manage general site media from `Admin -> Settings`
- [ ] Keep site media URLs in backend-owned settings data rather than hardcoded frontend constants
- [ ] Allow large uploads for selected site-media use cases without raising limits globally
- [ ] Keep uploads working even when direct browser-to-bucket CORS is not configured
- [ ] Improve runtime performance on slow mobile networks
- [ ] Preserve the original uploaded asset as the source of truth
- [ ] Generate lighter-weight derived assets for delivery

## Current Baseline

- [x] Add a `Site Media` panel inside `SettingsManager`
- [x] Store `Join The Movement` video URL inside `site-settings`
- [x] Update the home page to read from `site-settings`
- [x] Raise upload size limit for `cms/site-settings` to `500 MB`
- [x] Add backend proxy upload fallback for site-settings media when Spaces CORS blocks presigned browser uploads

## Scope

### In scope

- [ ] General site media fields stored in `site-settings`
- [ ] Admin upload UX for settings-owned media
- [ ] Safe server-side upload fallback
- [ ] Derived media generation for faster playback
- [ ] Poster/preview/full-video delivery strategy

### Out of scope for first pass

- [ ] Full DAM/media library UI
- [ ] Automatic content moderation
- [ ] Per-frame editor or manual transcoding UI
- [ ] Public anonymous uploads
- [ ] End-user facing media ingestion from the browser

## Upload Safety

- [ ] Keep `500 MB` limit restricted to `cms/site-settings` uploads only
- [ ] Keep stricter limits for event/gallery/general uploads
- [ ] Ensure admin receives real upload errors, not generic failures
- [ ] Decide whether large uploads should always use backend proxy or only fall back when direct upload fails
- [ ] Add upload progress UI for large site-media files
- [ ] Add cancel/retry handling for long uploads

## Storage Strategy

### Original asset

- [ ] Keep the original upload as the archival/master asset
- [ ] Store original URL in `site-settings.siteMedia`
- [ ] Preserve mime type, file size, and upload timestamp in metadata if later needed

### Derived assets

- [ ] Add `webVideoUrl` for delivery-optimized playback
- [ ] Add `posterImageUrl` for first paint / no-autoplay contexts
- [ ] Add `previewVideoUrl` for short hover/tap previews
- [ ] Decide whether to store derived asset metadata in `site-settings` JSON or a dedicated media model

## Suggested `site-settings.siteMedia` Shape

- [ ] `joinMovementVideoUrl`
- [ ] `joinMovementWebVideoUrl`
- [ ] `joinMovementPosterImageUrl`
- [ ] `joinMovementPreviewVideoUrl`
- [ ] `joinMovementVideoUpdatedAt`

## Admin UX

### Settings panel

- [ ] Keep `Site Media` as a dedicated subpanel under `Settings`
- [ ] Show current URL and preview for each managed asset
- [ ] Show source file size and type when available
- [ ] Add upload progress for large files
- [ ] Add remove/replace actions
- [ ] Add a warning before deleting currently active media

### Future enhancements

- [ ] Add optional `Import from URL` flow for publicly accessible assets
- [ ] Decide whether Google Drive links should be supported directly or require server-side fetch/import
- [ ] Add validation messaging when pasted URLs are not directly renderable asset URLs

## Performance Plan

### Delivery

- [ ] Use poster image as first paint instead of forcing the full video immediately
- [ ] Set `preload="none"` or `metadata"` for non-critical videos
- [ ] Lazy-load video when section approaches viewport
- [ ] Prefer derived `webVideoUrl` over original upload for public playback
- [ ] Keep original file as fallback only

### Preview behavior

- [ ] Show a static poster by default
- [ ] Optionally play a short muted preview clip on hover
- [ ] Only load/play the full video on explicit user interaction
- [ ] Consider disabling autoplay on mobile by default if real-world performance remains poor

### Encoding

- [ ] Generate H.264 MP4 output for broad compatibility
- [ ] Choose a bitrate cap appropriate for home-page hero/supporting media
- [ ] Generate a poster frame at a useful focal point
- [ ] Decide whether WebM should be generated in addition to MP4
- [ ] Revisit HLS/adaptive streaming only if large long-form videos become common

## Background Processing

- [ ] Decide where transcoding runs: web process, worker, or external job
- [ ] Keep long-running transcoding out of request/response lifecycle
- [ ] Add durable job status if processing becomes asynchronous
- [ ] Record processing success/failure per derived asset
- [ ] Ensure failed transcodes do not remove the original upload

## Backend Work

- [ ] Add a shared media-processing service
- [ ] Add job payload shape for media derivation
- [ ] Add storage helpers for derived asset naming conventions
- [ ] Add cleanup rules when replacing an asset
- [ ] Decide whether previous derived files should be deleted immediately or retained temporarily

## Frontend Work

- [ ] Update the home page section to prefer derived media when present
- [ ] Keep fallback to original upload while derived pipeline is rolling out
- [ ] Add poster-first rendering
- [ ] Add lightweight preview behavior only after derived preview clip exists

## Validation

- [ ] Upload a large source video through admin in local dev
- [ ] Upload the same source video in deployed dev/staging
- [ ] Confirm public site can render the updated media from DB settings
- [ ] Confirm slow-network/mobile behavior is improved once derived assets are used
- [ ] Confirm deleting/replacing media does not leave broken references in `site-settings`

## Definition Of Done

- [ ] Admin manages general site media without hardcoded legacy URLs
- [ ] Large site-media uploads work reliably
- [ ] Public site prefers optimized derived media over heavy originals
- [ ] Poster/preview/full-video strategy is implemented for the home-page movement media
- [ ] Original uploads remain available as fallback/source of truth

## Related Files

- `apps/admin/src/components/Admin/SettingsManager.jsx`
- `apps/admin/src/utils/upload.js`
- `apps/site/src/components/Home/Why8Minutes.jsx`
- `apps/site/src/config/public-brand.js`
- `apps/server/src/controllers/upload.controller.ts`
- `apps/server/src/routes/upload.routes.ts`
- `apps/server/src/services/storage.service.ts`
- `apps/server/src/services/content.service.ts`
