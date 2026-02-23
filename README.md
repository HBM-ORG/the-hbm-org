# 👑 The HBM - Professional Development Flow

This guide outlines the standard operating procedures for developing, testing, and deploying The HBM platform.

## 🛠 1. Environment Setup
Always ensure your local environment is synchronized with the latest dependencies.
```bash
# Clean install (if you encounter strange bugs)
rm -rf node_modules
npm install

# Standard update
npm install
```

## 🚀 2. Development Execution
Depending on your focus area, use one of the following commands:

### A. Full Stack (Client + Admin Server) - PREFERRED
This runs the React frontend AND the Express backend (for emails, event saving, and image uploads).
```bash
npm run dev:admin
```
- **UI**: `http://localhost:4200`
- **Admin Server**: `http://localhost:3001`

### B. Client Only
If you are only editing styling or UI logic and don't need the database/upload services.
```bash
npm run dev
```

## 🏗 3. Production Readiness
Before deploying, always verify the production bundle.
```bash
# 1. Generate optimized assets
npm run build

# 2. Preview the build locally
npm run preview
```

## 📊 4. Admin Protocol
- **Admin Dashboard**: Accessible via `/admin`
- **Access Key**: Distributed via internal secure channels (`hbm2026`)
- **Intelligence Sync**: Ensure `node admin-server.js` is running (automatic in `dev:admin`)

## 🚢 5. Deployment Flow
1. **Lint**: `npm run lint` (Ensure code quality)
2. **Build**: `npm run build`
3. **Commit**: `git add . && git commit -m "feat: description"`
4. **Push**: `git push origin main`
