import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  tempo: text("tempo").notNull(), // "Fast" or "Adagio"
  tempoValue: integer("tempo_value").notNull(), // 140 or 60
  imageUrl: text("image_url"),
  readTime: integer("read_time").notNull(), // in minutes
  publishedAt: text("published_at").notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const timelineMilestones = pgTable("timeline_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  impact: text("impact").notNull(),
  insight: text("insight").notNull(),
  logoUrl: text("logo_url"),
  order: integer("order").notNull(),
});

export const insertTimelineMilestoneSchema = createInsertSchema(timelineMilestones).omit({
  id: true,
});

export type InsertTimelineMilestone = z.infer<typeof insertTimelineMilestoneSchema>;
export type TimelineMilestone = typeof timelineMilestones.$inferSelect;

export const mediaItems = pgTable("media_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "playlist", "image", "video"
  url: text("url").notNull(),
  musicalKey: text("musical_key"), // "E Major", "F Minor", etc.
  mood: text("mood"),
  thumbnailUrl: text("thumbnail_url"),
  aspectRatio: text("aspect_ratio"), // "1:1", "16:9", "4:5"
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
});

export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItems.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// About section themes
export type AboutTheme = {
  key: string;
  name: string;
  title: string;
  content: string;
  musicalKey: string;
};
