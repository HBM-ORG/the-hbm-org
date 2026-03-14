# WordPress Media Migration Map

## Goal

Remove the remaining dependency on legacy WordPress-style media hosting (`/wp-content/uploads`) without breaking the public site, admin previews, favicon/head assets, or SEO metadata.

## Current State

- WordPress is **not** an active application/runtime platform anymore.
- There is **no** live `wp-admin`, `wp-json`, or WordPress API integration left in the active codebase.
- Active runtime media no longer depends on `/wp-content/uploads`.
- Frontend content data in `apps/site/src/data/content.js` and mirrored admin preview data in `apps/admin/src/data/content.js` now point directly to DigitalOcean Spaces URLs under `legacy/wordpress-media`.
- HTML head asset defaults, SEO organization branding, and the `Homo Deus` fallback cover no longer depend on WordPress-hosted media.

## Migration Attempt Status

- A live migration attempt to DO Spaces was executed for the public `wp-content/uploads` URLs.
- Result: the old public `wp-content/uploads` URLs returned an HTML page instead of the original binaries for the main media bundle.
- The checked-in WordPress backup under `wp-content/` does **not** contain an `uploads/` tree, so it was not an authoritative recovery source for the remaining binaries.
- Despite that, the migration mapping in `scripts/one-off/wordpress-media-mapping.json` provided authoritative Spaces targets for the remaining HBM media bundle.
- Successful migrations:
  - `og-default.png` moved to Spaces
  - `Homo Deus` fallback cover moved to Spaces
  - favicon / touch icon / organization logo no longer depend on WordPress-hosted media and now use local app assets / DB-backed settings
  - `content.js` media bundle moved off WordPress-shaped runtime URLs and now uses Spaces-hosted legacy media URLs directly

## Active Runtime Compatibility Layer

- None in active runtime for WordPress media paths.

Purpose:

- WordPress-style path compatibility has been removed from the active site and admin runtime.
- The remaining WordPress references in this repository are historical only: mapping files, docs, and backups.
- `scripts/one-off/wordpress-media-mapping.json` is retained as an audit manifest of the finalized source-to-Spaces migration.

## Migrated Content Inventory

The following assets were the final WordPress-hosted runtime bundle referenced in both:

- `apps/site/src/data/content.js`
- `apps/admin/src/data/content.js`

These entries were updated in **both** files and now resolve to Spaces-hosted URLs.

### `meeter.banner`

- `2025/05/banner-video.mp4`
- Usage: Meeter banner / "Why 8 Minutes?" section
- Risk if removed early: broken hero/banner video on Meeter-related experience

### `meeter.guidelines.items`

- `2025/06/Show-up-as-yourself.svg`
- `2025/06/Show-up-as-yourself.-1.svg`
- `2025/06/Lead-with-curiosity.svg`
- `2025/06/Be-generous.svg`
- `2025/06/Respect-every-vibe.svg`
- `2025/06/Keep-it-light-when-needed.svg`
- `2025/06/Celebrate-different-perspectives.svg`
- `2025/06/End-strong.svg`
- Usage: guideline/icon cards
- Risk if removed early: guidance cards lose icons

### `about.vision`

- `2025/06/vision-video.mp4`
- Usage: About page vision section
- Risk if removed early: About page vision video breaks

### `about.values.groups`

- Background video:
  - `2025/06/0_Blue-Sky_Clouds_1920x1080-1.mp4`
- Card images:
  - `2025/06/64b98af75218168718545305b74f140db8fdf320.jpg`
  - `2025/06/add7278ee0a03cd074c76a1e5065f3b8eb071b8d-min.jpg`
  - `2025/06/f85d08655c800c423fc2b7c577e95bd8a1541397-min.jpg`
  - `2025/06/df61281a9cb4e8a73b2ea532dd3ea9eaf0754d77-min.jpg`
  - `2025/06/3e9a2f16dffdd7c84f9c8b3050635f8572aa90d2.jpg`
  - `2025/06/fa6fdd033d2e5c63c227f0f5b0e0ed1b966f4f1e.jpg`
  - `2025/06/c9e281bfd1b044faaa101d5cfd29bf2c896deb94.jpg`
- Usage: About page values/background visuals
- Risk if removed early: major visual degradation on About page

### `b2b.tabs`

- `2025/06/scene-theme-companies-businessesa.mp4`
- `2025/07/20250703_1555_Heartfelt-Office-Conversation_simple_compose_01jz85pbtyee3v7wkazg6vqgr1.mp4`
- `2025/06/vision-video.mp4`
- Usage: B2B tab background videos
- Risk if removed early: B2B motion/background sections break

### `b2b.adminFlow.steps`

- `2025/06/11.png`
- `2025/06/22.png`
- `2025/06/33.png`
- `2025/06/44.png`
- Usage: admin/event-manager workflow illustrations
- Risk if removed early: workflow steps lose explanatory visuals

### `b2b.steps.items`

- `2025/06/22.png`
- `2025/06/44.png`
- `2025/06/11.png`
- Usage: B2B benefit/steps illustrations
- Risk if removed early: B2B supporting visuals disappear

### `b2b.steps.phoneMockup`

- `2025/05/Settings-3.png`
- Usage: B2B phone mockup / product illustration
- Risk if removed early: core B2B showcase image breaks

## Additional Non-Content WordPress Remnants

### HTML Head / Brand Assets

- `apps/site/index.html`
- `apps/admin/index.html`
- `apps/site/src/components/SEO.jsx`

Current behavior:

- favicon and apple-touch-icon now resolve from repo-served app-local public assets
- organization/contact/social metadata now comes from DB-backed site settings
- these should eventually move to:
  - repo-served public assets, or
  - object storage/CDN URLs not shaped around WordPress paths

### Book Cover Fallback

- `apps/site/src/hooks/useBookData.js`
- Migrated external asset:
  - `https://www.ynharari.com/wp-content/uploads/2017/01/homo_deus.png`

Impact:

- small isolated dependency
- safe to replace independently from the larger HBM media migration

### Legacy / Backup Only

- `src-backup-v6/...`

Impact:

- not active runtime
- can be ignored during migration unless repo cleanup is desired

### Docs / Historical Deployment Text

- `docs/HOSTINGER_GUIDE.md`
- `docs/RENDER_ENV.md`
- `docs/QA_REPORT.md`
- `docs/PRODUCTION_QA_REPORT.md`
- `docs/README.md`
- `README.md`

Impact:

- no runtime risk
- medium operational confusion risk if left stale

## Safe Removal Order

- [x] Migrate all `${WP}/...` assets used in `apps/site/src/data/content.js`
- [x] Mirror the same updated asset URLs into `apps/admin/src/data/content.js`
- [x] Repoint the HTML head asset config away from WordPress-hosted media
- [x] Move the SEO organization logo source off the WordPress host
- [x] Replace the `Homo Deus` WordPress-hosted cover in `apps/site/src/hooks/useBookData.js`
- [x] Remove `VITE_WP_CONTENT_BASE` compatibility
- [x] Remove the `/wp-content/uploads` fallback from `getCmsUploadsBase()`
- [x] Remove WordPress-shaped fallback logic from `apps/site/index.html` and `apps/admin/index.html`
- [ ] Update or archive Hostinger-specific docs
- [ ] Remove backup-only legacy references if no longer needed

## Current Runtime Target

Current target for the migrated assets:

- object storage/CDN on DigitalOcean Spaces

Fallback option:

- checked-in public assets for stable brand/media files that do not need runtime mutability

## Remaining Cleanup Strategy

1. Browser-QA the Spaces-backed media on:
   - `/about`
   - `/meeter`
   - `/b2b`
   - admin preview surfaces that read `apps/admin/src/data/content.js`
2. Update or archive Hostinger/WordPress migration docs that still imply an active runtime dependency.
3. Delete backup-only references once they are no longer needed for audit/history.

## Notes

- The inventory above is currently mirrored across `site` and `admin`, so each migration item effectively affects both runtime and preview unless the duplication is removed.
- The safest long-term improvement would be to stop maintaining duplicate content/media definitions across both apps and have the admin preview consume the same normalized content source.
