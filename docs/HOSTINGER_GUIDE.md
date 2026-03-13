# 🌐 HBM Production Deployment (Hostinger)

How to deploy the HBM platform (site + admin + API) on Hostinger.

---

## 1. Preparation

Build the frontend before uploading:
```bash
npm run build
```
This generates the `apps/client/dist/` folder.

---

## 2. What to Upload

| Folder / File | Description | Destination |
|----------------|-------------|-------------|
| `apps/client/dist/` | Static frontend | `public_html/` or app root |
| `apps/server/` (`src/web.ts`) | Backend Node server | Application root |
| `package.json` | Dependencies | Application root |
| `apps/client/public/logos/`, `apps/client/public/assets/` | Brand and media (incl. **event images**) | Same structure under `public/` |
| `apps/client/public/data/events.json` | **Events + gallery paths** (must match assets on server) | `public/data/` |
| `apps/client/src/data/` | Remaining transitional JSON data | Same structure under `src/data/` |

**Important for event images:** Upload the entire `apps/client/public/assets/events/` folder (all event subfolders with their JPG/PNG/MP4 files). Include every event folder and subfolders such as `cards/` (used by the "Important Details" 3 cards). The site and admin load images from `/assets/events/...`. If you ran `node scripts/ops/convert-heic-to-jpg.js`, upload both the converted JPGs and the updated `apps/client/public/data/events.json` so the live site shows all gallery images.

**Checklist so everything looks like local:** After deploy, ensure `apps/client/public/assets/events/<eventFolder>/` contains all images (gallery, hero, cards) before copying them into the server's public web root.

**Do not upload `.env`.** Set all secrets in the Hostinger panel (see below).

---

## 3. Hostinger Configuration

1. **Node.js:** Panel → Advanced → Node.js; select the app folder.
2. **Startup command:** `npm start` (runs `tsx apps/server/src/web.ts` through the workspace root).
3. **Environment variables** (in panel):
   - `PORT=3001`
   - `NODE_ENV=production`
   - `DATABASE_URL` (if using MySQL)
   - `GEMINI_API_KEY`, `GOOGLE_BOOKS_API_KEY` (optional)
   - For email: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (see [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md))
  - For assets: `STORAGE_PROVIDER`, `SPACES_*` or `GCS_*` (see [RENDER_ENV.md](RENDER_ENV.md))

---

## 4. Persistence

The remaining transitional file-backed services write to `apps/client/src/data/*.json`. Ensure the Node process has **write permissions** there until those domains are fully migrated to the database.

---

## 5. Troubleshooting

- **Design looks different:** Purge Hostinger/LiteSpeed cache after deploy.
- **API/base URL:** In production, the frontend uses same-origin requests (`base` empty). Correct if the server (`apps/server/src/web.ts` via `npm start`) serves `apps/client/dist/`.

---

**See also:** [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) · [RENDER_ENV.md](RENDER_ENV.md) · [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
