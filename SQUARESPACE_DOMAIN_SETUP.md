# Complete Guide: Connect Your Squarespace Domain to This Website

## Step-by-Step Instructions

### Part 1: Deploy Your Website to Railway (Recommended)

**Why Railway?** It's the easiest platform for Express + PostgreSQL apps and works perfectly with custom domains.

#### Step 1.1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (connect your GitHub account)
4. You'll be taken to your dashboard

#### Step 1.2: Deploy from GitHub
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Find and select your **PersonalWebsite** repository
4. Click **"Deploy Now"**
5. Railway will automatically:
   - Detect it's a Node.js project
   - Run `npm run build`
   - Start the server with `npm run start`
   - Give you a URL like `https://your-app-name.up.railway.app`

#### Step 1.3: Add PostgreSQL Database
1. In your Railway project, click **"New"** button
2. Select **"Database"**
3. Select **"PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable for you
   - You don't need to copy anything - it's auto-connected!

#### Step 1.4: Set Environment Variables
1. Click on your **web service** (not the database)
2. Go to the **"Variables"** tab
3. Add these environment variables:
   - **Key:** `NODE_ENV` **Value:** `production`
   - **Key:** `PORT` **Value:** (leave empty - Railway auto-assigns)
   - `DATABASE_URL` is already set automatically by Railway

#### Step 1.5: Run Database Migrations
1. Click on your **web service**
2. Go to the **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"** - you should see the server starting
5. Go back to your project
6. Click **"New"** → **"Empty Service"**
7. Name it "migrations" (or anything)
8. In the **"Variables"** tab, add:
   - Copy the `DATABASE_URL` from your database service
   - Add it as `DATABASE_URL` in this service
9. In the service settings, set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run db:push`
10. Click **"Deploy"** - this will run your migrations
11. After it completes, you can delete this service

#### Step 1.6: Get Your Railway URL
1. In your Railway project, click on your **web service**
2. Go to **"Settings"** tab
3. Scroll down to **"Domains"** section
4. You'll see a generated domain like: `your-app-name.up.railway.app`
5. **Copy this URL** - you'll need it for DNS

---

### Part 2: Connect Your Squarespace Domain

#### Step 2.1: Add Custom Domain in Railway
1. In Railway, go to your **web service** → **"Settings"** → **"Domains"**
2. Click **"Add Domain"** or **"Custom Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **"Add"**
5. Railway will show you DNS records you need to add
6. **Important:** Railway will show something like:
   - **CNAME record** pointing to: `your-app-name.up.railway.app`
   - OR an **A record** with an IP address
   - **Write these down!**

#### Step 2.2: Configure DNS in Squarespace
1. Log into your **Squarespace account**
2. Go to **"Settings"** (gear icon in left sidebar)
3. Click **"Domains"**
4. Find your domain and click on it
5. Click **"DNS Settings"** (or **"Advanced DNS Settings"**)
6. You'll see a list of DNS records

**For Root Domain (yourdomain.com):**
- If Railway gave you an **A record**:
  - Click **"Add Record"**
  - **Type:** `A`
  - **Host:** `@` (or leave blank)
  - **Points to:** [IP address from Railway]
  - **TTL:** `3600` (or leave default)
  - Click **"Save"**

- If Railway gave you a **CNAME**:
  - Click **"Add Record"**
  - **Type:** `CNAME`
  - **Host:** `@` (or leave blank)
  - **Points to:** `your-app-name.up.railway.app`
  - **TTL:** `3600`
  - Click **"Save"`

**For WWW Subdomain (www.yourdomain.com):**
- Click **"Add Record"**
- **Type:** `CNAME`
- **Host:** `www`
- **Points to:** `your-app-name.up.railway.app` (same as above)
- **TTL:** `3600`
- Click **"Save"**

#### Step 2.3: Verify DNS Settings
Your Squarespace DNS should now have:
- One record for `@` (root domain) pointing to Railway
- One record for `www` pointing to Railway

**Example:**
```
Type    Host    Points to
A       @       123.45.67.89
CNAME   www     your-app-name.up.railway.app
```

---

### Part 3: Wait for DNS Propagation

1. **DNS changes take 5 minutes to 48 hours** to propagate worldwide
2. Check propagation status at: https://www.whatsmydns.net
   - Enter your domain
   - Select "A" or "CNAME" record type
   - See if it's updated globally
3. **Test locally:**
   - Open terminal
   - Run: `nslookup yourdomain.com`
   - Should show Railway's IP or domain

---

### Part 4: SSL Certificate (Automatic)

1. **Railway automatically provisions SSL certificates** via Let's Encrypt
2. This happens automatically after DNS is pointing correctly
3. **Wait 5-10 minutes** after DNS propagates
4. Your site will be available at `https://yourdomain.com` (secure)

---

### Part 5: Verify Everything Works

1. **Wait for DNS propagation** (check with whatsmydns.net)
2. **Test your domain:**
   - Open browser
   - Go to: `http://yourdomain.com`
   - Should redirect to `https://yourdomain.com`
   - You should see your website!

3. **Test API endpoints:**
   - `https://yourdomain.com/api/blog` - Should return JSON
   - `https://yourdomain.com/api/timeline` - Should return JSON
   - `https://yourdomain.com/api/media` - Should return JSON

---

## Troubleshooting

### Domain Not Resolving
- **Wait longer** - DNS can take up to 48 hours
- **Check DNS records** - Make sure they match Railway exactly
- **Clear DNS cache:** 
  - Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - Or use: `8.8.8.8` (Google DNS) to test

### SSL Not Working
- **Wait 10-15 minutes** after DNS propagates
- Railway needs time to provision the certificate
- Check Railway logs for SSL errors

### Website Shows Error
- **Check Railway logs:**
  - Go to Railway project → Your service → "Deployments" → "View Logs"
- **Verify environment variables** are set correctly
- **Check database connection** - Make sure `DATABASE_URL` is set

### Database Connection Errors
- **Verify DATABASE_URL** is set in Railway
- **Run migrations:** Use the migration service method above
- **Check Railway database** is running (should show green status)

---

## Quick Reference: Railway Dashboard Navigation

1. **Project** = Your entire application
2. **Services** = Individual parts (web app, database)
3. **Deployments** = History of deployments
4. **Settings** = Configuration, environment variables, domains
5. **Metrics** = Usage, logs, performance

---

## Alternative: Using Render Instead

If Railway doesn't work for you:

1. Go to https://render.com
2. Sign up with GitHub
3. **"New"** → **"Web Service"**
4. Connect your GitHub repo
5. **Build Command:** `npm run build`
6. **Start Command:** `npm run start`
7. Add PostgreSQL database from dashboard
8. Set environment variables
9. Add custom domain in Render settings
10. Update Squarespace DNS with Render's instructions

---

## Summary Checklist

- [ ] Deployed website to Railway
- [ ] Added PostgreSQL database
- [ ] Set environment variables (`NODE_ENV=production`)
- [ ] Ran database migrations
- [ ] Added custom domain in Railway
- [ ] Got DNS records from Railway
- [ ] Updated DNS in Squarespace
- [ ] Waited for DNS propagation (check with whatsmydns.net)
- [ ] Verified SSL certificate is active
- [ ] Tested website at yourdomain.com
- [ ] Tested API endpoints

---

**Total Time:** ~30 minutes (most of it waiting for DNS propagation)

**Cost:** Railway has a free tier with $5 credit/month. Render also has a free tier.

---

## Need Help?

If you get stuck:
1. Check Railway logs for errors
2. Verify DNS records match exactly
3. Wait longer for DNS propagation
4. Check Railway status page for outages

