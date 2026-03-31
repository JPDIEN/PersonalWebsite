import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBlogPostSchema,
  insertTimelineMilestoneSchema,
  insertMediaItemSchema,
  insertContactSubmissionSchema,
} from "@shared/schema";
import { parseTsvNow, type NowData } from "./now-sheet";

let nowCache: { data: NowData; fetchedAt: number } | null = null;
const NOW_CACHE_TTL = 5 * 60 * 1000;

export async function registerRoutes(app: Express): Promise<Server> {
  // Blog Posts
  app.get("/api/blog", async (_req, res) => {
    const posts = await storage.getAllBlogPosts();
    res.json(posts);
  });

  app.get("/api/blog/:id", async (req, res) => {
    const post = await storage.getBlogPost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid blog post data" });
    }
  });

  // Timeline Milestones
  app.get("/api/timeline", async (_req, res) => {
    const milestones = await storage.getAllMilestones();
    res.json(milestones);
  });

  app.post("/api/timeline", async (req, res) => {
    try {
      const data = insertTimelineMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(data);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  // Media Items
  app.get("/api/media", async (_req, res) => {
    const media = await storage.getAllMediaItems();
    res.json(media);
  });

  app.post("/api/media", async (req, res) => {
    try {
      const data = insertMediaItemSchema.parse(req.body);
      const item = await storage.createMediaItem(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid media item data" });
    }
  });

  // Contact Submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(data);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact submission data" });
    }
  });

  app.get("/api/contact", async (_req, res) => {
    const submissions = await storage.getAllContactSubmissions();
    res.json(submissions);
  });

  // Now page — fetches from Google Sheets if NOW_SHEET_ID is set
  app.get("/api/now", async (_req, res) => {
    if (nowCache && Date.now() - nowCache.fetchedAt < NOW_CACHE_TTL) {
      return res.json(nowCache.data);
    }

    const sheetId = process.env.NOW_SHEET_ID;
    if (!sheetId) {
      return res.status(503).json({ error: "NOW_SHEET_ID not configured" });
    }

    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);

      const tsv = await response.text();
      const data = parseTsvNow(tsv);

      nowCache = { data, fetchedAt: Date.now() };
      return res.json(data);
    } catch (err) {
      console.error("Failed to fetch now data from Google Sheets:", err);
      return res.status(500).json({ error: "Failed to fetch now data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
