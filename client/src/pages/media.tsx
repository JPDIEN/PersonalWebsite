import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Image as ImageIcon, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { MediaItem } from "@shared/schema";

export default function Media() {
  const { data: mediaItems = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/media"],
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "playlist":
        return <Music className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  const getAspectRatioClass = (ratio: string | null) => {
    switch (ratio) {
      case "1:1":
        return "aspect-square";
      case "16:9":
        return "aspect-video";
      case "4:5":
        return "aspect-[4/5]";
      default:
        return "aspect-video";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
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
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-media-title">
            Encore
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            rhythms I live by — playlists, moments, and the soundtracks i enjoy.
          </p>
        </motion.div>

        {mediaItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">the gallery is being composed.</p>
            <p className="text-sm text-muted-foreground mt-2">new media coming soon.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={index % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""}
              >
                <Card
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
                  data-testid={`card-media-${item.id}`}
                >
                  <div className="relative">
                    <div className={`w-full ${getAspectRatioClass(item.aspectRatio)} bg-muted overflow-hidden`}>
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          {getIcon(item.type)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      {item.description && (
                        <p className="text-white text-sm leading-relaxed backdrop-blur-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-lg md:text-xl font-semibold leading-tight">
                        {item.title}
                      </h3>
                      <div className="text-muted-foreground shrink-0">
                        {getIcon(item.type)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.musicalKey && (
                        <Badge variant="secondary" className="text-xs">
                          {item.musicalKey}
                        </Badge>
                      )}
                      {item.mood && (
                        <Badge variant="outline" className="text-xs">
                          {item.mood}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
