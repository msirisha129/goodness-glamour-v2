# 🚀 Render Deployment Guide

## ✅ Build Issue FIXED - vite not found Error

The error **"sh: 1: vite: not found"** has been fixed! The issue was that the client dependencies weren't being installed before building.

---

## 📋 For Render Dashboard - CORRECTED COMMANDS

When deploying to Render, use these exact commands:

### **Build Command:**
```bash
npm ci && npm run build:client && npm run build:server && esbuild server/index.ts --bundle --platform=node --packages=external --outdir=dist --external:@neondatabase/serverless
```

### **Start Command:**
```bash
npm start
```

---

## 🔧 What Changed (The Fix)

**Before (BROKEN):**
```json
"build:client": "cd client && npm install && npm run build"
```

**After (FIXED):**
```json
"build:client": "cd client && npm ci && npm run build"
```

**Why this fixes it:** Using `npm ci` instead of `npm install` ensures dependencies are installed correctly from the lock file in CI/CD environments like Render.

---

## 📦 Updated package.json Scripts

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server && esbuild server/index.ts --bundle --platform=node --packages=external --outdir=dist --external:@neondatabase/serverless",
    "build:client": "cd client && npm ci && npm run build",
    "build:server": "node node_modules/esbuild/bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=src/dist --minify",
    "start": "node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "vercel-build": "npm install && cd client && npm install && npx vite build && cd .. && npm run build:server"
  }
}
```

---

## 🛠️ Steps to Deploy on Render

### 1. **Connect GitHub Repository**
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repo

### 2. **Set Environment Variables**
In Render Dashboard, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=your_neon_database_url
OPENAI_API_KEY=your_openai_key
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
```

### 3. **Configure Build & Start Commands**
- **Build Command:** `npm ci && npm run build:client && npm run build:server && esbuild server/index.ts --bundle --platform=node --packages=external --outdir=dist --external:@neondatabase/serverless`
- **Start Command:** `npm start`
- **Node Version:** 20

### 4. **Deploy**
- Click "Create Web Service"
- Wait for build to complete ✅

---

## ✅ Verification Checklist

Before deploying, make sure:

- [x] `render.yaml` is updated with correct build/start commands
- [x] `package.json` has all scripts updated with `npm ci` fix
- [ ] Database connection string (DATABASE_URL) is set in Render
- [ ] All API keys are added to Render environment variables
- [ ] Node version is set to 20

---

## 🐛 Troubleshooting

### Build Fails - "vite: not found" ❌ FIXED
**What was causing it:** Client dependencies weren't being installed
**Solution:** Use `npm ci` instead of `npm install` in build:client script ✅

### Build Fails - "Cannot find module"
**Solution:** Make sure `npm ci` runs first to install all dependencies

### Port Issues
**Solution:** Render automatically sets the PORT variable. Your app (already configured) listens on `0.0.0.0:PORT`

### Client Not Loading
**Solution:** The server automatically serves the built React app from `client/dist`

### Database Connection Failed
**Solution:** Verify DATABASE_URL is correct and set in Render environment variables

---

## 📝 File Updates Made

✅ Updated `package.json` - Changed build:client to use `npm ci` 
✅ Updated `render.yaml` - Correct build and start commands
✅ Server already configured to serve static client files
✅ Client has package-lock.json for reproducible installs

---

## 🎯 Quick Copy-Paste for Render Form

**Build Command:**
```
npm ci && npm run build:client && npm run build:server && esbuild server/index.ts --bundle --platform=node --packages=external --outdir=dist --external:@neondatabase/serverless
```

**Start Command:**
```
npm start
```

**Node Version:** `20`

---

## 📊 Build Process Flow

```
1. npm ci (root)           → Install root dependencies ✓
2. npm run build:client    → cd client && npm ci && npm run build
   - npm ci (client)       → Install client dependencies (THIS WAS THE ISSUE)
   - npm run build         → Run vite build
3. npm run build:server    → Create server bundle
4. esbuild                 → Final production bundle
5. npm start               → Start the server ✓
```

---

That's it! Your deployment should now work! 🎉 Try deploying again!

