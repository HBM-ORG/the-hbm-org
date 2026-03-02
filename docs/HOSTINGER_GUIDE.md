# 🚀 HBM Production Deployment Guide (Hostinger)

This guide explains how to deploy the HBM platform (Site + Admin + Server) to Hostinger.

## 1. Preparation
Before uploading, ensure you have the latest production build:
```bash
npm run build
```
This generates the `dist` folder.

## 2. File Mapping (What to upload)
Upload the following structure to your Hostinger server (use `public_html` or a dedicated Node.js app folder):

| Folder / File | Description | Destination |
| :--- | :--- | :--- |
| `dist/` | The static frontend site | `public_html/` (or served via server) |
| `admin-server.js` | The backend Node.js server | `/` (Application Root) |
| `package.json` | Dependencies | `/` (Application Root) |
| `public/logos/` | Brand assets | `public/logos/` |
| `public/assets/` | Video and event assets | `public/assets/` |
| `src/data/` | JSON Databases (CMS, Regs) | `src/data/` |
| `.env` | API Keys (Google, Gemini) | **Must be set in Hostinger Panel** |

## 3. Hostinger Configuration
1. **Node.js Selector**: Go to Hostinger Panel -> Advanced -> Node.js.
2. **App Root**: Select the folder where you uploaded the files.
3. **Startup File**: `admin-server.js`.
4. **Environment Variables**: Add these in the Panel:
   - `PORT=3001`
   - `GOOGLE_BOOKS_API_KEY=...`
   - `GEMINI_API_KEY=...`
   - `NODE_ENV=production`

## 4. Troubleshooting "Different Design"
If the local design looks different from the live site, check:
- **Cache**: Hostinger (LiteSpeed) often caches static files. Purge the cache after deployment.
- **Environment Variables**: Ensure `import.meta.env.DEV` is correctly handled. The current code uses:
  ```javascript
  const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
  ```
  In production, `base` is an empty string, meaning it hits the same origin. This is correct if `admin-server.js` serves the `dist` folder.

## 5. Persistence (Important!)
Since this app uses file-based storage (`src/data/*.json`), ensure the Node.js process has **write permissions** to the `src/data/` directory.

---
**Verified QA Status (2026-02-25):** ✅
- Registration Flow: **PASS**
- Email Engine: **PASS**
- Content Sync: **PASS**
- Build Status: **STABLE**
