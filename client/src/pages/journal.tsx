import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Music2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";

export default function Journal() {
  const [selectedTempo, setSelectedTempo] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const filteredPosts = selectedTempo
    ? posts.filter((post) => post.tempo === selectedTempo)
    : posts;

  const tempoTypes = [
    { label: "All Tempos", value: null, icon: Music2 },
    { label: "♩ = 140 Fast", value: "Fast", icon: Music2 },
    { label: "♩ = 60 Adagio", value: "Adagio", icon: Music2 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-journal-title">
            Interlude
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            a living notebook — essays, reflections, and thought experiments organized by tempo and theme.
          </p>
        </motion.div>

        {/* Tempo Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {tempoTypes.map((tempo) => (
            <button
              key={tempo.label}
              onClick={() => setSelectedTempo(tempo.value)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedTempo === tempo.value
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card border-2 border-border hover-elevate"
              }`}
              data-testid={`button-tempo-${tempo.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <tempo.icon className="h-4 w-4" />
              {tempo.label}
            </button>
          ))}
        </motion.div>

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No posts yet in this tempo.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for new compositions.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={`/journal/${post.id}`} data-testid={`link-post-${post.id}`} className="block">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer">
                    {post.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <Badge variant="secondary" className="mb-2">
                          ♩ = {post.tempoValue} {post.tempo}
                        </Badge>
                      </div>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime} min read</span>
                        </div>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
