import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertBlogPostSchema } from '@shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all posts (for /api/blog)
      const posts = await storage.getAllBlogPosts();
      return res.json(posts);
    }

    if (req.method === 'POST') {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      return res.status(201).json(post);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid blog post data', details: error.errors });
    }
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

