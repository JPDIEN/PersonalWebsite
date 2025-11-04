# Deploying to Your Squarespace Domain

This guide explains how to deploy your personal website and connect it to a Squarespace domain you own.

## Overview

Since Squarespace doesn't host custom Node.js applications directly, you'll need to:
1. **Deploy your app** to a hosting platform that supports Node.js (Railway, Render, or Vercel)
2. **Point your Squarespace domain** to your deployed app using DNS settings

---

## Option 1: Deploy to Railway (Recommended for Full-Stack Apps)

Railway is excellent for Node.js apps with databases and is beginner-friendly.

### Step 1: Deploy to Railway

1. **Sign up** at [railway.app](https://railway.app) (use GitHub to connect)
2. **Create a new project** → "Deploy from GitHub repo"
3. **Connect your repository** (this PersonalWebsite repo)
4. **Add a PostgreSQL database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable
5. **Configure environment variables:**
   - Go to your service → "Variables" tab
   - Railway sets `DATABASE_URL` automatically
   - Set `NODE_ENV=production`
   - Set `PORT` (Railway will auto-assign, but you can set it explicitly)
6. **Deploy:**
   - Railway will detect your `package.json` and run `npm run build` and `npm run start`
   - Wait for deployment to complete

### Step 2: Get Your Railway URL

After deployment, Railway will give you a URL like: `https://your-app-name.up.railway.app`

### Step 3: Connect Your Squarespace Domain

1. **In Railway:**
   - Go to your service → "Settings" → "Networking"
   - Click "Generate Domain" or add a custom domain
   - Add your Squarespace domain (e.g., `yourdomain.com`)

2. **In Squarespace:**
   - Log into your Squarespace account
   - Go to **Settings** → **Domains** → Select your domain
   - Go to **DNS Settings** or **Advanced DNS Settings**
   - You'll need to add these records:
     - **Type:** `CNAME` (or `A` record if Railway provides an IP)
     - **Host:** `@` (or leave blank for root domain) or `www` (for www.yourdomain.com)
     - **Points to:** The Railway-provided domain or IP (Railway will show this)

3. **DNS Record Types:**
   - **For root domain (`yourdomain.com`):** Use `A` record pointing to Railway's IP, or `ALIAS`/`ANAME` if supported
   - **For subdomain (`www.yourdomain.com`):** Use `CNAME` pointing to Railway's domain

### Step 4: Enable HTTPS

Railway automatically provisions SSL certificates via Let's Encrypt once DNS propagates (can take 24-48 hours).

---

## Option 2: Deploy to Render

Render is another great option with a free tier.

### Step 1: Deploy to Render

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service:**
   - Connect your GitHub repository
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node
3. **Add PostgreSQL Database:**
   - Create a new PostgreSQL database
   - Copy the "Internal Database URL" (it's auto-set as `DATABASE_URL`)
4. **Set Environment Variables:**
   - `NODE_ENV=production`
   - `DATABASE_URL` (auto-set from the database)
   - `PORT` (Render sets this automatically)

### Step 2: Get Your Render URL

Render provides: `https://your-app-name.onrender.com`

### Step 3: Connect Your Squarespace Domain

1. **In Render:**
   - Go to your service → "Settings" → "Custom Domains"
   - Add your domain: `yourdomain.com` and `www.yourdomain.com`

2. **In Squarespace:**
   - Go to **Settings** → **Domains** → **DNS Settings**
   - Add records based on Render's instructions:
     - For root domain: Usually an `A` record or `CNAME` (Render will specify)
     - For www: `CNAME` record pointing to Render's domain

---

## Option 3: Deploy to Vercel

Vercel is best for frontend-first apps. Note: Vercel works best if you split your API routes. For a full-stack Express app, Railway or Render are better choices.

### If You Choose Vercel:

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Install Vercel CLI:** `npm i -g vercel`
3. **Create `vercel.json`** (see below)
4. **Deploy:** `vercel --prod`

**Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

---

## Important Notes

### Environment Variables You'll Need

Make sure to set these in your hosting platform:

- `DATABASE_URL` - Your PostgreSQL connection string (usually auto-set)
- `NODE_ENV=production`
- `PORT` - Usually set automatically by the platform

### Database Setup

1. **After deploying, run migrations:**
   ```bash
   npm run db:push
   ```
   Or set up a one-time migration job in Railway/Render

### DNS Propagation

- DNS changes can take **24-48 hours** to fully propagate
- Use [whatsmydns.net](https://www.whatsmydns.net) to check propagation status
- You can test your Railway/Render URL directly while waiting for DNS

### SSL/HTTPS

- Most platforms (Railway, Render) automatically provision SSL certificates
- Make sure your domain DNS is correctly pointing before SSL can be issued

---

## Quick Reference: Squarespace DNS Settings

To access DNS settings in Squarespace:
1. Log in to Squarespace
2. **Settings** → **Domains**
3. Click your domain
4. **DNS Settings** (or **Advanced DNS Settings**)
5. Add/modify records as specified by your hosting platform

---

## Troubleshooting

### Domain Not Resolving

- Wait 24-48 hours for DNS propagation
- Double-check DNS records match hosting platform requirements exactly
- Verify domain is unlocked (no registrar lock)

### SSL Certificate Issues

- Ensure DNS is correctly pointing before requesting SSL
- Some platforms need both `@` and `www` records configured

### Database Connection Errors

- Verify `DATABASE_URL` environment variable is set correctly
- Ensure database is accessible from your hosting platform (firewall rules)

---

## Recommended: Railway for This Project

For your Express + React + PostgreSQL stack, **Railway is the recommended choice** because:
- ✅ Automatic PostgreSQL provisioning
- ✅ Simple domain configuration
- ✅ Built-in SSL certificates
- ✅ Good free tier for personal projects
- ✅ Automatic deployments from GitHub

Follow **Option 1** above for the easiest deployment experience.

