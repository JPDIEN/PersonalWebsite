import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { TimelineMilestone } from "@shared/schema";

export default function Experience() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data: milestones = [], isLoading } = useQuery<TimelineMilestone[]>({
    queryKey: ["/api/timeline"],
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [milestones]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading the score...</p>
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
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-experience-title">
            The Score
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            a timeline of experiences, moments, and lessons — each informing who i am and who i want to be.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${scrollProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            scroll horizontally to explore the journey
          </p>
        </div>

        {/* Desktop: Horizontal Scroll */}
        <div className="hidden md:block">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollSnapType: "x mandatory" }}
          >
            <div className="flex gap-6 min-w-max px-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="snap-center"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <Card
                    className="w-80 h-64 p-6 hover:-translate-y-3 transition-transform duration-300 shadow-lg hover:shadow-xl flex flex-col"
                    data-testid={`card-milestone-${milestone.id}`}
                  >
                    <div className="mb-4">
                      <Badge variant="secondary" className="mb-2">
                        {milestone.startDate} - {milestone.endDate || "Present"}
                      </Badge>
                      <h3 className="font-bold text-xl mb-1">{milestone.company}</h3>
                      <p className="text-muted-foreground">{milestone.role}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium mb-2">{milestone.impact}</p>
                      <p className="font-serif italic text-sm text-muted-foreground leading-relaxed">
                        "{milestone.insight}"
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Scroll */}
        <div className="md:hidden space-y-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 shadow-lg" data-testid={`card-milestone-mobile-${milestone.id}`}>
                <Badge variant="secondary" className="mb-3">
                  {milestone.startDate} - {milestone.endDate || "Present"}
                </Badge>
                <h3 className="font-bold text-xl mb-1">{milestone.company}</h3>
                <p className="text-muted-foreground mb-4">{milestone.role}</p>
                <p className="text-base font-medium mb-3">{milestone.impact}</p>
                <p className="font-serif italic text-sm text-muted-foreground leading-relaxed">
                  "{milestone.insight}"
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Closing Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center max-w-3xl mx-auto"
        >
          <blockquote className="font-serif text-xl md:text-2xl italic leading-relaxed" data-testid="text-experience-quote">
            "every role and challenge has built on the last. each one’s taught me something new, 
            pushed me to adapt, and shaped how I think about what comes next."
          </blockquote>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
