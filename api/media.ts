import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertMediaItemSchema } from '@shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const media = await storage.getAllMediaItems();
      return res.json(media);
    }

    if (req.method === 'POST') {
      const data = insertMediaItemSchema.parse(req.body);
      const item = await storage.createMediaItem(data);
      return res.status(201).json(item);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid media item data', details: error.errors });
    }
    console.error('Media API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

