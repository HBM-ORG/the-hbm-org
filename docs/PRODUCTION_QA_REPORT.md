# Production QA Report

**Date:** February 2026  
**Scope:** Full technical QA and audit before Hostinger deploy and CTO handover.

---

## 1. Items checked

### Rich link previews (OG tags)

- **ensureAbsoluteImage** in `apps/site/src/components/SEO.jsx`: All relative image paths are turned into absolute URLs using `siteUrl`; missing/empty image falls back to default (1200×630).
- **Static fallback** in `apps/site/index.html`: OG meta matches home defaults (description, default image, 1200×630). React Helmet overwrites these when the app loads.
- **Dynamic routes**: Event details and Knowledge (list + drawer) pass image into SEO; `ensureAbsoluteImage` is used. `getBasePath()` covers `/events/:id`, `/knowledge`, and `/about` (including `/about/team/:slug`).
- **siteUrl**: Set to `https://www.thehbm.org` with a short comment that it is the canonical production origin for OG and canonical URLs.
- **OG dimensions**: Meta tags use 1200×630; custom OG images should also be 1200×630 for best previews (noted in code).

### Team profiles and dynamic content

- **Route added**: `/about/team/:slug` — `TeamMember.jsx` loads team (same source as About), finds member by slug (slugified name), and renders profile with:
  - **SEO**: `title={member.name | The HBM}`, `description={bio or mantra}`, `image={member.image || member.imageUrl}` (absolute via SEO component).
  - LinkedIn and “Back to About” working.
- **About page**: Single `<SEO>` for the whole page; team member sharing for a specific person is done via `/about/team/elad-maor` (example).

### Multi-language (i18n)

- **New translation keys**: `ui.events.loadingEvent`, `eventNotFound`, `backToEvents`; `ui.common.backToHome`, `loadingWorld`, `errorTitle`, `errorMessage`, `cookieSeoTitle`, `cookieSeoDesc`, `termsSeoDesc`, `privacySeoDesc`; `ui.about.eyebrow`, `backToAbout`; `ui.contact.seoTitle`, `seoDesc`; `ui.events.seoTitle`, `seoDesc`; `ui.form.regSeoTitle`, `regSeoDesc`.
- **Components updated**: EventDetails, About (eyebrow), PageErrorBoundary (via ErrorFallback), GlobeDemo now use `t(..., lang)` for the above strings.
- **SEO by language**: Contact, Events, EventRegister, CookiePolicy, LegalPage, EventDetails, and LegalPage pass translated title/description to `<SEO>` so meta tags switch with the selected language.

### Code quality and asset paths

- **Paths**: Root-relative paths (`/assets/...`, `/logos/...`) used for public assets; correct for production. Imports use `./` for local modules.
- **About logo**: Path `/logos/file-2qgRiQ7eUZ1uhx7Xfasq3P-The HBM LOGO.png` documented; must exist in `apps/site/public/logos/` at build/deploy.
- **Production paths**: Public assets are served from `/`; use root-relative paths only (no `./` for public assets). Confirmed in this report and in code comments where relevant.
- **Debug logs**: Both `console.log` calls in `apps/site/src/utils/analytics.js` are wrapped in `if (import.meta.env.DEV)` so they do not run in production builds.

### Deployment readiness

- **apps/site/vite.config.js**: Build uses default `base: '/'`; manual chunks for three, react, animation, lucide; `chunkSizeWarningLimit` is configured for the public site bundle.
- **siteUrl**: `https://www.thehbm.org` in SEO.jsx (no localhost).
- **API base**: Production uses `VITE_API_BASE` or Render backend URL; Hostinger static front can keep pointing to Render for API.

---

## 2. Issues found and fixes applied

| Issue | Fix |
| --- | --- |
| Console logs in analytics in production | Guarded with `import.meta.env.DEV` in `apps/site/src/utils/analytics.js`. |
| No canonical/siteUrl comment in SEO | Added comment above `siteUrl` and note for OG image 1200×630 in `apps/site/src/components/SEO.jsx`. |
| Hardcoded strings (EventDetails, About eyebrow, PageErrorBoundary, GlobeDemo) | New keys in `apps/site/src/i18n/translations.js` and components switched to `t(..., lang)`. |
| SEO title/description not switching with language on Contact, Events, EventRegister, CookiePolicy, LegalPage | Each page now passes `title` and `description` from translations to `<SEO>`. |
| EventDetails SEO always English | EventDetails uses `event.title?.[lang]`, `event.description?.[lang]` and passes them to `<SEO>`. |
| No shareable team profile URL | Added `/about/team/:slug` route and `TeamMember.jsx` with per-member SEO (title, description from bio/mantra, image). |
| getBasePath not handling /about subpaths | Added `if (segments[0] === 'about') return '/about'` in `getBasePath()`. |
| About logo path not documented | Comment in About.jsx that logo must exist in `apps/site/public/logos/` at deploy. |

---

## 3. Manual checks recommended

- **OG image dimensions**: Confirm the default OG image and any event/team images used for OG are 1200×630 (or acceptable quality) for link previews.
- **Logo file on Hostinger**: Ensure `apps/site/public/logos/file-2qgRiQ7eUZ1uhx7Xfasq3P-The HBM LOGO.png` (or the same path you deploy) exists after upload.
- **E2E link preview**: After deploy, test shared links (home, event, knowledge item, `/about`, `/about/team/elad-maor`) in WhatsApp/Facebook/Twitter debuggers to confirm OG title, description, and image.

---

## 4. Files changed (summary)

- `apps/site/src/utils/analytics.js` — DEV-guard for console.log.
- `apps/site/src/components/SEO.jsx` — siteUrl and 1200×630 comments; getBasePath for about.
- `apps/site/src/i18n/translations.js` — New keys for events, common, about, contact, form (SEO and UI).
- `apps/site/src/pages/EventDetails.jsx` — i18n for loading/not-found/back; lang-aware SEO.
- `apps/site/src/pages/About.jsx` — Eyebrow from translations; logo path comment.
- `apps/site/src/components/PageErrorBoundary.jsx` — ErrorFallback with i18n.
- `apps/site/src/components/ui/GlobeDemo.jsx` — Loading text from translations.
- `apps/site/src/pages/Contact.jsx` — SEO title/description from translations; useT vs t usage fixed.
- `apps/site/src/pages/Events.jsx` — SEO title/description from translations.
- `apps/site/src/pages/EventRegister.jsx` — SEO title/description from translations.
- `apps/site/src/pages/CookiePolicy.jsx` — SEO title/description from translations.
- `apps/site/src/pages/LegalPage.jsx` — SEO description from translations.
- `apps/site/src/pages/TeamMember.jsx` — **New**: team member profile page with per-member SEO.
- `apps/site/src/App.jsx` — Route `/about/team/:slug` and TeamMember import.
