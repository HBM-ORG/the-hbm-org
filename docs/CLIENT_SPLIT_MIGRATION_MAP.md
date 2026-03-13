# Client Split Migration Map

## Goal

Track the source-level migration from the current transitional `apps/client` tree into the new deployable frontend apps:

- `apps/site` for `thehbm.org` / `www.thehbm.org`
- `apps/admin` for `admin.thehbm.org`
- shared packages only where code is genuinely reused and stable enough to survive a future repo split

This document is the file-ownership map for the remaining split work so we do not lose context across multiple iterations.

## Current Status

- [x] Created `apps/site` workspace and build entrypoint.
- [x] Created `apps/admin` workspace and build entrypoint.
- [x] Proved that the frontend runtime can work without a shared package by localizing URL/runtime helpers back into each app.
- [x] Updated CI/build/runtime wiring to recognize separate site/admin artifacts.
- [x] Localized the first site-owned runtime slice under `apps/site` (`App`, `Layout`, `PageErrorBoundary`, and site analytics now start draining away from `apps/client`).
- [x] Localized the next site shell dependency slice under `apps/site` (`Navbar`, `Footer`, `NewsletterSection`, `LanguageSwitcher`, and `CookieConsent` now drain away from `apps/client`).
- [x] `apps/client` is no longer treated as an active workspace app; its package/app-shell files are now archival cleanup targets rather than live build entrypoints.
- [x] Local split runtime now boots cleanly as four separate local processes: `site` (`4200`), `admin` (`4300`), `server` (`3001`), and `worker`.
- [x] Remaining `apps/client` source/runtime references were fully classified as delete/archive targets and are no longer needed by active builds.
- [x] Physical runtime ownership has been drained into `apps/site`, `apps/admin`, server-backed data, or explicit delete targets.

## Ownership Rules

- [x] Public-only pages, layout, analytics, SEO, sitemap, and marketing components belong in `apps/site`.
- [x] Admin-only pages, editing flows, upload helpers, and internal tooling belong in `apps/admin`.
- [x] Default to local ownership and duplicate app runtime code when that keeps `site`, `admin`, and `server` independently movable to separate repositories.
- [x] Shared code moves to packages only after it is proven to be used by both apps, low-churn, and safer to version as a contract than to duplicate.
- [x] Server runtime/business logic is not shared with either frontend; only API-facing contracts are candidates for sharing.
- [x] File-backed legacy data was classified before cleanup rather than moved blindly.
- [x] `apps/client` has been reduced to zero runtime ownership ahead of deletion.

## Phase 1: Site-Owned Files

### Public entry/runtime

- [x] Move the site entry/runtime fully under `apps/site` and stop importing these responsibilities from `apps/client`:
  - `apps/client/src/main.jsx`
  - `apps/client/src/App.jsx`

### Public pages

- [x] Move public pages into `apps/site/src/pages/`:
  - `apps/client/src/pages/Home.jsx`
  - `apps/client/src/pages/About.jsx`
  - `apps/client/src/pages/TeamMember.jsx`
  - `apps/client/src/pages/Contact.jsx`
  - `apps/client/src/pages/Events.jsx`
  - `apps/client/src/pages/EventDetails.jsx`
  - `apps/client/src/pages/EventRegister.jsx`
  - `apps/client/src/pages/Knowledge.jsx`
  - `apps/client/src/pages/Meeter.jsx`
  - `apps/client/src/pages/MeeterWhat.jsx`
  - `apps/client/src/pages/MeeterWho.jsx`
  - `apps/client/src/pages/MeeterFeatures.jsx`
  - `apps/client/src/pages/B2B.jsx`
  - `apps/client/src/pages/Gallery.jsx`
  - `apps/client/src/pages/CookiePolicy.jsx`
  - `apps/client/src/pages/LegalPage.jsx`

### Public shell and site-only components

- [x] Move site shell/layout components into `apps/site/src/components/`:
  - `apps/client/src/components/Layout.jsx`
  - `apps/client/src/components/Navbar.jsx`
  - `apps/client/src/components/Footer.jsx`
  - `apps/client/src/components/NewsletterSection.jsx`
  - `apps/client/src/components/PageErrorBoundary.jsx`
  - `apps/client/src/components/SEO.jsx`
  - `apps/client/src/components/LanguageSwitcher.jsx`
  - `apps/client/src/components/LeadGenCTA.jsx`
  - `apps/client/src/components/LegalModal.jsx`
  - `apps/client/src/components/NextPageBridge.jsx`
  - `apps/client/src/components/BubbleContainer.jsx`
  - `apps/client/src/components/EyebrowBadge.jsx`

### Public feature components

- [x] Move site feature component families into `apps/site/src/components/`:
  - `apps/client/src/components/Home/*`
  - `apps/client/src/components/Meeter/*`
  - `apps/client/src/components/CookieCompliance/*`
  - `apps/client/src/components/Events/*` except files promoted to shared below
  - `apps/client/src/components/ui/*` that are site-only after review
  - `apps/client/src/components/SmartMatchingZone.jsx`
  - `apps/client/src/components/MeasureTheMagic.jsx`
  - `apps/client/src/components/EmotionMatrixMockup.jsx`
  - `apps/client/src/components/CustomizeMeeter.jsx`
  - `apps/client/src/components/CustomLocationsMockup.jsx`
  - `apps/client/src/components/ConnectionCardMockup.jsx`
  - `apps/client/src/components/IceBreakerCard.jsx`

### Public utilities

- [x] Move site-only utilities into `apps/site/src/utils/`:
  - `apps/client/src/utils/analytics.js`
  - `apps/client/src/utils/analytics-clarity.js`
  - `apps/client/src/utils/embed.js`
  - `apps/client/src/utils/calendar.js` if only the site uses it

### Public context and i18n

- [x] Move site-owned runtime context into `apps/site` unless later promoted to shared:
  - `apps/client/src/context/EventsContext.jsx`
  - `apps/client/src/i18n/*`

### Public static assets and metadata

- [x] Rehome site static hosting assets under `apps/site/public/`:
  - `apps/client/public/sitemap.xml`
  - `apps/client/public/robots.txt`
  - `apps/client/public/site.webmanifest`
  - `apps/client/public/visual-sitemap.html`
  - favicon / apple-touch-icon / logo / public image assets
  - `apps/client/public/data/events.json`
  - `apps/client/public/assets/**`

## Phase 2: Admin-Owned Files

### Admin entry/runtime

- [x] Move admin entry/runtime fully under `apps/admin` and stop importing these responsibilities from `apps/client`:
  - `apps/client/src/pages/AdminDashboard.jsx`

### Admin feature components

- [x] Move admin components into `apps/admin/src/components/`:
  - `apps/client/src/components/Admin/VisualEventEditor.jsx`
  - `apps/client/src/components/Admin/SiteContentManager.jsx`
  - `apps/client/src/components/Admin/EmailEngine.jsx`
  - `apps/client/src/components/Admin/CookieConsentLogs.jsx`
  - `apps/client/src/components/Admin/AnalyticsDashboard.jsx`

### Admin utilities and auth/session helpers

- [x] Move admin-specific helpers into `apps/admin/src/utils/`:
  - `apps/client/src/utils/upload.js`
- [x] Extract admin auth/session handling out of `AdminDashboard.jsx` into dedicated admin utilities/hooks.

### Admin shell

- [x] Keep admin shell separate from the public shell and do not reintroduce dependencies on:
  - `apps/client/src/components/Layout.jsx`
  - `apps/client/src/components/Navbar.jsx`
  - `apps/client/src/components/Footer.jsx`
  - `apps/client/src/components/NewsletterSection.jsx`
  - `apps/client/src/components/CookieCompliance/CookieConsent.jsx`
  - `apps/client/src/components/SEO.jsx`

## Phase 3: Shared Extraction Candidates

### Keep empty unless a package earns its existence

- [x] Removed the temporary shared frontend runtime helper package so `site` and `admin` do not depend on shared source for basic URL/runtime behavior.

### Promote to shared only if both apps still need them and a repo split would still want the same package

- [x] Review event-preview and editing overlap and keep app-local ownership unless a true contract/package boundary emerges:
  - `apps/client/src/components/Events/NextEventHero.jsx`
  - `apps/client/src/utils/eventUtils.js`
  - `apps/client/src/utils/calendar.js`
- [x] Review generic UI primitives and keep them app-local unless they remain identical and low-churn across apps:
  - `apps/client/src/components/ui/MagicCard.jsx`
  - `apps/client/src/components/ui/wobble-card.jsx`
  - `apps/client/src/components/ui/MacbookScroll.jsx`
  - `apps/client/src/components/ui/Globe.jsx`
  - `apps/client/src/components/ui/GlobeDemo.jsx`
  - `apps/client/src/components/ui/GlobalNetwork.jsx`
- [x] Defer any shared type/contracts package until a real cross-app API/data boundary needs one:
  - events
  - content blocks
  - knowledge entries
  - upload responses
  - auth check responses

### Do not prematurely share

- [x] Keep these app-owned unless a real second consumer appears:
  - site SEO
  - site analytics
  - admin auth/session storage
  - app URL/runtime helpers
  - public layout
  - admin shell

## Phase 4: Data And Config Classification

### Likely site-owned transitional data

- [x] Classify and move public fallback/build-time data under `apps/site/src/data/` when still needed:
  - `apps/client/src/data/content.js`
  - `apps/client/src/data/eventsConfig.js`
  - `apps/client/src/data/events.js`
  - `apps/client/src/data/galleriesConfig.js`
  - `apps/client/src/data/globe.json`
  - `apps/client/src/data/knowledgeConfig.js`
  - `apps/client/src/data/knowledgeData.js`
  - `apps/client/src/data/knowledgeDataChunks/**`
  - `apps/client/src/data/legal.js`

### Legacy/server-backed data that should not define new frontend ownership

- [x] Audit and delete or archive legacy file-backed data still present in `apps/client/src/data/` when no longer needed by runtime:
  - `apps/client/src/data/automationConfig.json`
  - `apps/client/src/data/campaigns.json`
  - `apps/client/src/data/emailQueue.json`
  - `apps/client/src/data/emailTemplate.json`
  - `apps/client/src/data/engagement.json`
  - `apps/client/src/data/howItWorksConfig.json`
  - `apps/client/src/data/knowledgeBaseConfig.json`
  - `apps/client/src/data/registrations.json`
  - `apps/client/src/data/suppression.json`
  - `apps/client/src/data/videoEvent.json`

## Phase 5: Transitional Cleanup

- [x] Remove site imports from `apps/site` that still point back into `../../client/...`.
- [x] Remove admin imports from `apps/admin` that still point back into `../../client/...`.
- [x] Remove `apps/client` from active workspace/build ownership and repoint live scripts to `apps/site`.
- [x] Remove server references that still conceptually assume one combined frontend app.
- [x] Update scripts/docs that still describe `apps/client` as the primary deployable frontend.
- [x] Delete `apps/client` once all runtime ownership has moved elsewhere.

### Current `apps/client` classification snapshot

- [x] App shell files are delete candidates because the active frontends now live under `apps/site` and `apps/admin`:
  - `apps/client/package.json`
  - `apps/client/index.html`
  - `apps/client/vite.config.js`
- [x] Remaining archival app entry files were deleted in the final source cleanup pass:
  - `apps/client/src/App.jsx`
  - `apps/client/src/main.jsx`
- [x] Site/admin duplicated runtime source under `apps/client/src/components/`, `apps/client/src/pages/`, `apps/client/src/utils/`, `apps/client/src/i18n/`, `apps/client/src/context/`, and `apps/client/src/lib/` was deleted after runtime ownership moved elsewhere.
- [x] Public fallback/build-time data under `apps/client/src/data/*.js` is now owned by `apps/site/src/data/` or removed as obsolete.
- [x] Legacy file-backed JSON data under `apps/client/src/data/*.json` was archived/deleted after server-side migration cleanup completed.
- [x] Docs and operational scripts now reference `apps/site/public/*` as the active public asset root; `apps/client/public/*` remains only as a temporary deletion target.

## Definition Of Done

- [x] Every runtime-owned file in `apps/client` was classified as `site`, `admin`, `shared`, `legacy`, or `delete`.
- [x] `apps/site` no longer imports runtime code from `apps/client`.
- [x] `apps/admin` no longer imports runtime code from `apps/client`.
- [x] Shared code lives in packages only where there is a proven multi-app need.
- [x] Shared packages, if any remain, are contract-first and repo-split-friendly rather than runtime-coupling shortcuts.
- [x] `apps/client` was reduced to zero runtime responsibility and can be removed safely.
