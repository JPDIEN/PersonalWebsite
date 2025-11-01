import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/journal/:id");
  const postId = params?.id;

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const post = posts.find((p) => p.id === postId);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Post not found</h1>
          <Link href="/journal">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Journal
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/journal">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-8" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Journal
            </button>
          </Link>

          {post.imageUrl && (
            <div className="aspect-video w-full mb-8 rounded-xl overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              ♩ = {post.tempoValue} {post.tempo}
            </Badge>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="text-post-title">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("> ")) {
                return (
                  <blockquote
                    key={index}
                    className="border-l-4 border-primary pl-6 my-6 font-serif italic text-xl leading-loose"
                  >
                    {paragraph.substring(2)}
                  </blockquote>
                );
              }
              return (
                <p key={index} className="mb-6 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/journal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8" data-testid="button-back-bottom">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all posts
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
