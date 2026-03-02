# HBM Deployment Guide 🚀

To keep your site and admin dashboard running 24/7 and ensuring live updates, follow these steps:

## 1. Prerequisites
Ensure you have **Node.js** and **PM2** installed on your server:
```bash
npm install -g pm2
```

## 2. Build the Site
Before starting the server, you must build the frontend:
```bash
npm run build
```

## 3. Run with PM2 (Always Up)
Use the ecosystem file in `config/` to start the server. This ensures that if the server crashes or the computer restarts, HBM will come back online automatically.
```bash
pm2 start config/ecosystem.config.cjs
pm2 save
pm2 startup
```

## 4. Subdomain Setup (admin.thehbm.org)
1. In your Domain Provider (e.g., GoDaddy, Cloudflare), add an **A Record**:
   - **Host**: `admin`
   - **Points to**: Your Server IP
2. The server will now automatically detect `admin.thehbm.org` and redirect it to the Dashboard.

## 5. Live Updates
Since the server serves both the API and the files, any "Save" action in the admin dashboard updates the server's data files. The site fetches this data every time it loads, ensuring you see changes **instantly** without needing to rebuild.

---
**Server Port**: Default is 3001. Ensure your firewall/Nginx allows traffic to this port.
**Admin Credentials**: Currently open. Consider adding Basic Auth or a Login middleware for production.
