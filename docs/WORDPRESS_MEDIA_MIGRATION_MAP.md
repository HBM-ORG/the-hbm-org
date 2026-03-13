# WordPress Media Migration Map

## Goal

Remove the remaining dependency on legacy WordPress-style media hosting (`/wp-content/uploads`) without breaking the public site, admin previews, favicon/head assets, or SEO metadata.

## Current State

- WordPress is **not** an active application/runtime platform anymore.
- There is **no** live `wp-admin`, `wp-json`, or WordPress API integration left in the active codebase.
- The remaining dependency is a **legacy media source/path convention** used by:
  - frontend content data in `apps/site/src/data/content.js`
  - mirrored admin preview data in `apps/admin/src/data/content.js`
  - HTML head asset defaults in both apps
  - the SEO organization logo
  - one hardcoded book cover in `apps/site/src/hooks/useBookData.js`

## Migration Attempt Status

- A live migration attempt to DO Spaces was executed for the public `wp-content/uploads` URLs.
- Result: the old public `wp-content/uploads` URLs returned an HTML page instead of the original binaries for the main media bundle.
- Because of that, the full content-media migration could **not** be safely completed from the public host alone.
- Successful partial migrations:
  - `og-default.png` moved to Spaces
  - `Homo Deus` fallback cover moved to Spaces
  - favicon / touch icon / organization logo no longer depend on WordPress-hosted media and now use local `/assets/logo.png`
- Remaining blocker:
  - the `content.js` media bundle still needs an authoritative binary source (Hostinger filesystem export, backup archive, or original local asset pack) before it can be migrated safely

## Active Runtime Compatibility Layer

- `apps/site/src/utils/api.js`
- `apps/admin/src/utils/api.js`
- `apps/site/index.html`
- `apps/admin/index.html`
- `apps/site/src/components/SEO.jsx`

Purpose:

- These files currently preserve backward compatibility through `VITE_CMS_UPLOADS_BASE` and a fallback to `VITE_SITE_URL + /wp-content/uploads`.
- This is safe for the transition period, but should be removed only **after** the media assets below are migrated.

## Content Inventory

The following WordPress-hosted assets are still referenced in both:

- `apps/site/src/data/content.js`
- `apps/admin/src/data/content.js`

That means every media migration below must be updated in **both** files unless the admin is refactored to consume the same source directly.

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

- favicon / apple-touch-icon / org logo can still resolve via `VITE_CMS_UPLOADS_BASE`
- these should eventually move to:
  - repo-served public assets, or
  - object storage/CDN URLs not shaped around WordPress paths

### Book Cover Fallback

- `apps/site/src/hooks/useBookData.js`
- Remaining external WordPress-hosted asset:
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

- [ ] Migrate all `${WP}/...` assets used in `apps/site/src/data/content.js`
- [ ] Mirror the same updated asset URLs into `apps/admin/src/data/content.js`
- [x] Repoint the HTML head asset config away from WordPress-hosted media
- [x] Move the SEO organization logo source off the WordPress host
- [x] Replace the `Homo Deus` WordPress-hosted cover in `apps/site/src/hooks/useBookData.js`
- [ ] Remove `VITE_WP_CONTENT_BASE` compatibility
- [ ] Remove the `/wp-content/uploads` fallback from `getCmsUploadsBase()`
- [ ] Remove WordPress-shaped fallback logic from `apps/site/index.html` and `apps/admin/index.html`
- [ ] Update or archive Hostinger-specific docs
- [ ] Remove backup-only legacy references if no longer needed

## Recommended Migration Target

Preferred target for the remaining assets:

- object storage/CDN on DigitalOcean Spaces or GCS

Fallback option:

- checked-in public assets for stable brand/media files that do not need runtime mutability

## Suggested Execution Strategy

1. Move stable brand/head assets first.
2. Move `about` and `b2b` media next, since they represent the largest visible dependency surface.
3. Move `meeter` banner/guidelines assets.
4. Replace the single `Homo Deus` fallback image.
5. Remove the compatibility layer only after browser QA confirms parity on:
   - `/about`
   - `/meeter`
   - `/b2b`
   - admin preview surfaces that read `apps/admin/src/data/content.js`

## Notes

- The inventory above is currently mirrored across `site` and `admin`, so each migration item effectively affects both runtime and preview unless the duplication is removed.
- The safest long-term improvement would be to stop maintaining duplicate content/media definitions across both apps and have the admin preview consume the same normalized content source.
