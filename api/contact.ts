import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertContactSubmissionSchema } from '@shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const submissions = await storage.getAllContactSubmissions();
      return res.json(submissions);
    }

    if (req.method === 'POST') {
      const data = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(data);
      return res.status(201).json(submission);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid contact submission data', details: error.errors });
    }
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

