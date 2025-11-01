import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBlogPostSchema,
  insertTimelineMilestoneSchema,
  insertMediaItemSchema,
  insertContactSubmissionSchema,
} from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
