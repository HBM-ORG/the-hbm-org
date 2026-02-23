---
description: How to run the HBM environment (Client, Admin, Server) professionally
---

Follow these exact steps to ensure a stable and synchronized development environment.

### 1. Dependency Synchronization
Run this whenever `package.json` changes or after pulling new code.
// turbo
```bash
npm install
```

### 2. Full Stack Execution (Recommended)
This command runs the **React Frontend** and the **Admin Backend** concurrently. This is required for saving events, uploading images, and the Email Engine.
// turbo
```bash
npm run dev:admin
```
- Client: `http://localhost:4200`
- API/Server: `http://localhost:3001`

### 3. Build & Optimization
Prepare the application for production. This generates the `dist` folder.
// turbo
```bash
npm run build
```

### 4. Production Verification
Test the build output before actual deployment to ensure all paths and assets work correctly.
// turbo
```bash
npm run preview
```

### 5. Deployment Sequence
1. Ensure all changes are saved.
2. Run `npm run build` to verify no compilation errors.
3. Push to the repository.
