# Vercel Deployment Setup

## ⚠️ Important Note

**Vercel is not ideal for this Express + PostgreSQL stack.** Railway or Render are strongly recommended because:
- They support long-running Express servers
- Easier database setup
- Better suited for full-stack apps

However, if you want to use Vercel, I've converted your Express API routes to Vercel serverless functions.

## What Changed

1. **Created serverless functions** in `/api/` directory:
   - `api/blog.ts` - GET all posts, POST new post
   - `api/blog/[id].ts` - GET single post by ID
   - `api/timeline.ts` - Timeline milestones
   - `api/media.ts` - Media items
   - `api/contact.ts` - Contact submissions

2. **Updated `vercel.json`** with proper routing

## Deployment Steps

1. **Push to GitHub** (if not already done)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the build settings

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` (if using a database)
   - Add `NODE_ENV=production`

4. **Deploy:**
   - Vercel will automatically build and deploy
   - The frontend will be served from `dist/public`
   - API routes will be serverless functions

## Known Limitations

- **In-memory storage:** The current `MemStorage` class stores data in memory, so data will be lost on each serverless function invocation. For production, you'll need a real database.
- **No persistent state:** Each API call is independent
- **Cold starts:** First request after inactivity may be slower

## Fixing the Database Issue

If you want persistent data, you need to:
1. Set up a PostgreSQL database (Neon, Supabase, or Railway)
2. Update `server/storage.ts` to use the database instead of in-memory storage
3. Run migrations: `npm run db:push`

## Testing

After deployment, test these endpoints:
- `https://your-app.vercel.app/api/blog` - Should return blog posts
- `https://your-app.vercel.app/api/timeline` - Should return milestones
- `https://your-app.vercel.app/api/media` - Should return media items

## If It Still Doesn't Work

Check the Vercel deployment logs for errors. Common issues:
- Missing environment variables
- Build failures
- Import path issues

**Still having trouble?** Railway or Render will work much better for this architecture.

