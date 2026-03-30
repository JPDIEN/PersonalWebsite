import {
  type BlogPost,
  type InsertBlogPost,
  type TimelineMilestone,
  type InsertTimelineMilestone,
  type MediaItem,
  type InsertMediaItem,
  type ContactSubmission,
  type InsertContactSubmission,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Timeline Milestones
  getAllMilestones(): Promise<TimelineMilestone[]>;
  createMilestone(milestone: InsertTimelineMilestone): Promise<TimelineMilestone>;

  // Media Items
  getAllMediaItems(): Promise<MediaItem[]>;
  createMediaItem(item: InsertMediaItem): Promise<MediaItem>;

  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
}

export class MemStorage implements IStorage {
  private blogPosts: Map<string, BlogPost>;
  private milestones: Map<string, TimelineMilestone>;
  private mediaItems: Map<string, MediaItem>;
  private contactSubmissions: Map<string, ContactSubmission>;

  constructor() {
    this.blogPosts = new Map();
    this.milestones = new Map();
    this.mediaItems = new Map();
    this.contactSubmissions = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed Timeline Milestones
    const milestones: InsertTimelineMilestone[] = [
      {
        company: "Notre Dame Venture Capital",
        role: "General Partner",
        startDate: "Jan 2026",
        endDate: null,
        impact: "Leading a team sourcing and diligencing deals for Irish Angels. Spearheading ND's first Intercollegiate VC Networking and Pitch event. Building a B2B Vertical AI investment thesis.",
        insight: "Still learning what makes a great investor. Mostly listening.",
        logoUrl: null,
        order: 0,
      },
      {
        company: "FouNDers Club",
        role: "Co-Director",
        startDate: "Jan 2026",
        endDate: null,
        impact: "Coordinating a community of 60+ entrepreneurs across speaker events, fireside chats, founders' lunches, and pitch competitions at Notre Dame.",
        insight: "The best founders I've met are usually the ones asking the most interesting questions.",
        logoUrl: null,
        order: 1,
      },
      {
        company: "Notre Dame Idea Center",
        role: "Startup Coach",
        startDate: "Oct 2025",
        endDate: null,
        impact: "Advising startups on fundraising strategy and storytelling. Conducting market research for a stealth biotech startup. Judging pre-accelerator pitch competitions.",
        insight: "Good coaching is mostly asking the right questions.",
        logoUrl: null,
        order: 2,
      },
      {
        company: "Symbal AI (Founders Fund)",
        role: "Growth",
        startDate: "Oct 2025",
        endDate: null,
        impact: "Enabling college students across the U.S. to use an AI-enhanced sales funnel. Designed and iterated on funnel workflows through messaging and sequencing experimentation.",
        insight: "A lot of growth is just running experiments fast and being honest about what works.",
        logoUrl: null,
        order: 3,
      },
      {
        company: "Yelo (VC backed)",
        role: "Growth + GTM Lead",
        startDate: "Jul 2025",
        endDate: "Oct 2025",
        impact: "Spearheaded go-to-market across 15 college institutions. Managed a team of growth interns. Built and iterated on growth playbooks across acquisition and retention.",
        insight: "Managing 30+ people at 18 was a crash course. Mostly learned by messing up and adjusting.",
        logoUrl: null,
        order: 4,
      },
      {
        company: "Yale Law School",
        role: "Research Assistant & Course Developer",
        startDate: "Jul 2024",
        endDate: "Jan 2025",
        impact: "Co-designed a Yale Law course on epistemology and law with Professor John Greco. Proposed texts and discussion structures that made dense material more accessible to students.",
        insight: "Spending a summer at Yale Law taught me how to think more carefully about what I claim to know.",
        logoUrl: null,
        order: 5,
      },
    ];

    milestones.forEach((m) => {
      const id = randomUUID();
      this.milestones.set(id, { 
        ...m, 
        id,
        endDate: m.endDate ?? null,
        logoUrl: m.logoUrl ?? null,
      });
    });

    // Seed Blog Posts
    const posts: InsertBlogPost[] = [
      {
        title: "The Rhythm of Rapid Iteration",
        excerpt: "In startups, speed isn't reckless — it's a deliberate tempo that keeps you ahead of stagnation. Here's how to move fast without breaking your foundation.",
        content: `In the world of startups, there's a common misconception that moving fast means being chaotic. But true velocity comes from establishing rhythm — a cadence of experimentation, learning, and iteration that feels almost musical.

When I work with founders, I often use musical metaphors. A startup's early days are like a jazz improvisation: you have a core theme (your vision), a set of instruments (your team and resources), and the courage to riff on ideas without knowing exactly where they'll lead.

> "The fastest way forward isn't a straight line — it's a series of thoughtful pivots, each building on the last."

Speed in startups isn't about doing everything at once. It's about finding your tempo: fast enough to learn quickly, slow enough to internalize those lessons. It's about creating feedback loops that sing — where every experiment teaches you something valuable, every failure is a note that sharpens the next attempt.

At Yelo, we've learned that rapid iteration doesn't mean abandoning strategy. It means treating strategy as a living composition, constantly refined through real-world performance. Each customer conversation is a new verse. Each metric is a measure we analyze and adjust.

The key is knowing when to accelerate and when to hold. When a hypothesis shows promise, lean in. When data suggests a different direction, pivot gracefully. And always, always keep the melody of your mission at the center of every decision.`,
        tempo: "Fast",
        tempoValue: 140,
        imageUrl: null,
        readTime: 5,
        publishedAt: new Date("2024-10-15").toISOString(),
      },
      {
        title: "On Daydreaming as Strategic Practice",
        excerpt: "The most innovative ideas don't come from forcing creativity — they emerge in moments of spacious wonder. A meditation on the power of letting your mind wander.",
        content: `There's a quiet paradox in modern productivity culture: we're obsessed with optimization, yet we've forgotten that some of our best thinking happens when we're not actively trying to think.

I do my deepest strategic work on ski slopes, on climbing routes, or during long piano improvisations. Not because I'm avoiding work, but because these are the moments when my mind shifts from execution mode to exploration mode.

Neuroscience backs this up. The default mode network — the brain's "daydreaming" circuit — is where we make unexpected connections, synthesize disparate ideas, and discover insights hiding in plain sight. It's the mental state where creativity doesn't just happen; it flourishes.

> "Strategic thinking isn't about grinding harder. It's about creating space for insights to find you."

At Yale, my research often hit walls when I was staring at the screen for hours. But step away for a walk, let my mind wander through unrelated thoughts, and suddenly a connection would emerge — a pattern I'd been too focused to see.

For founders and leaders, the lesson is clear: schedule white space. Protect time for unstructured thinking. Take walks without your phone. Play music. Ski. Climb. Let your subconscious do the heavy lifting.

The best strategies aren't manufactured through sheer willpower. They're discovered in the interplay between intense focus and spacious wonder. They're the melodies that emerge when you're not forcing the composition — when you're simply listening to what wants to be played.`,
        tempo: "Adagio",
        tempoValue: 60,
        imageUrl: null,
        readTime: 6,
        publishedAt: new Date("2024-09-22").toISOString(),
      },
    ];

    posts.forEach((p) => {
      const id = randomUUID();
      this.blogPosts.set(id, { 
        ...p, 
        id,
        imageUrl: p.imageUrl ?? null,
      });
    });

    // Seed Media Items
    const media: InsertMediaItem[] = [
      {
        title: "Curiosity in C Major",
        description: "A playlist for deep work and strategic thinking — clear, focused, uplifting",
        type: "playlist",
        url: "https://open.spotify.com/playlist/example1",
        musicalKey: "E Major",
        mood: "Curiosity",
        thumbnailUrl: null,
        aspectRatio: "1:1",
      },
      {
        title: "Late Night Contemplations",
        description: "For the quiet hours when the best ideas emerge from stillness",
        type: "playlist",
        url: "https://open.spotify.com/playlist/example2",
        musicalKey: "F Minor",
        mood: "Reflection",
        thumbnailUrl: null,
        aspectRatio: "1:1",
      },
    ];

    media.forEach((m) => {
      const id = randomUUID();
      this.mediaItems.set(id, { 
        ...m, 
        id,
        description: m.description ?? null,
        aspectRatio: m.aspectRatio ?? null,
        musicalKey: m.musicalKey ?? null,
        mood: m.mood ?? null,
        thumbnailUrl: m.thumbnailUrl ?? null,
      });
    });
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = { 
      ...insertPost, 
      id,
      imageUrl: insertPost.imageUrl ?? null,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  // Timeline Milestones
  async getAllMilestones(): Promise<TimelineMilestone[]> {
    return Array.from(this.milestones.values()).sort((a, b) => a.order - b.order);
  }

  async createMilestone(insertMilestone: InsertTimelineMilestone): Promise<TimelineMilestone> {
    const id = randomUUID();
    const milestone: TimelineMilestone = { 
      ...insertMilestone, 
      id,
      endDate: insertMilestone.endDate ?? null,
      logoUrl: insertMilestone.logoUrl ?? null,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  // Media Items
  async getAllMediaItems(): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values());
  }

  async createMediaItem(insertItem: InsertMediaItem): Promise<MediaItem> {
    const id = randomUUID();
    const item: MediaItem = { 
      ...insertItem, 
      id,
      description: insertItem.description ?? null,
      aspectRatio: insertItem.aspectRatio ?? null,
      musicalKey: insertItem.musicalKey ?? null,
      mood: insertItem.mood ?? null,
      thumbnailUrl: insertItem.thumbnailUrl ?? null,
    };
    this.mediaItems.set(id, item);
    return item;
  }

  // Contact Submissions
  async createContactSubmission(
    insertSubmission: InsertContactSubmission
  ): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      submittedAt: new Date().toISOString(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }
}

export const storage = new MemStorage();
