# GitHub Pages Setup

## Important Note

⚠️ **GitHub Pages only serves static files.** Your API endpoints (`/api/blog`, `/api/timeline`, etc.) will **not work** on GitHub Pages because there's no backend server.

The frontend will load and display, but:
- API calls will fail (you'll see empty data)
- Contact form won't work
- No dynamic content

**For full functionality, deploy to Railway or Render instead** (see `SQUARESPACE_DOMAIN_SETUP.md`).

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/JPDIEN/PersonalWebsite
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Source:** `GitHub Actions`
5. Click **"Save"**

### Step 2: Push the Workflow

The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) will automatically:
- Build your frontend when you push to `main`
- Deploy to GitHub Pages
- Your site will be available at: `https://JPDIEN.github.io/PersonalWebsite/`

### Step 3: Wait for Deployment

1. After pushing, go to **"Actions"** tab in your repository
2. You'll see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Once green, your site is live!

### Step 4: Access Your Site

Your site will be available at:
**https://JPDIEN.github.io/PersonalWebsite/**

## What Works / Doesn't Work

✅ **Works:**
- All pages load
- Navigation works
- Piano keyboard (visual/interactive)
- Styling and animations
- Static content

❌ **Doesn't Work:**
- API endpoints (blog posts, timeline, media)
- Contact form submission
- Any backend functionality

## To Get Full Functionality

Deploy to **Railway** or **Render** instead:
- See `SQUARESPACE_DOMAIN_SETUP.md` for complete instructions
- Your API will work
- You can connect your Squarespace domain
- Full-stack functionality

## Manual Deployment (Alternative)

If you want to deploy manually:

1. Build locally: `npm run build`
2. Copy `dist/public/*` to a `docs/` folder
3. In GitHub Settings → Pages, set source to `docs/` folder
4. Push the `docs/` folder

But the GitHub Actions workflow is easier and automatic!

