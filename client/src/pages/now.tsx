import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NowData } from "../../../server/now-sheet";

// Static fallback — shown if the sheet isn't configured yet
const FALLBACK: NowData = {
  lastUpdated: "April 2026",
  sections: [
    {
      label: "Reading",
      items: [
        { title: "Perelandra", sub: "C.S. Lewis — deep in the Space Trilogy" },
        { title: "The Three-Body Problem", sub: "Liu Cixin — halfway through, feel genuinely unsettled" },
      ],
    },
    {
      label: "Building",
      items: [
        { title: "This website", sub: "learning to code by doing" },
        { title: "ND Venture Capital", sub: "sourcing B2B Vertical AI deals, building the thesis" },
        { title: "Intercollegiate VC event", sub: "first of its kind at Notre Dame" },
      ],
    },
    {
      label: "Thinking about",
      items: [
        { title: "What makes a founder worth betting on early", sub: "before product, before traction" },
        { title: "How homeschooling shaped the way I learn", sub: "still processing this one" },
        { title: "Frassati's idea of living vs. existing", sub: "trying to take it seriously" },
      ],
    },
    {
      label: "Listening to",
      items: [
        { title: "A lot of piano", sub: "Keith Jarrett, Brad Mehldau, Glenn Gould" },
        { title: "Whatever helps me focus", sub: "changes weekly" },
      ],
    },
    {
      label: "Outside",
      items: [
        { title: "Chess", sub: "losing more than I'd like to admit" },
        { title: "Rock climbing when I can get to a wall", sub: "" },
        { title: "Skiing whenever there's snow", sub: "" },
      ],
    },
  ],
};

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function Now() {
  const { data, isLoading } = useQuery<NowData>({
    queryKey: ["/api/now"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/now");
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { sections, lastUpdated } = data ?? FALLBACK;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl mb-4" style={{ letterSpacing: "-0.02em" }}>
            Now
          </h1>
          <p className="text-sm text-muted-foreground">
            What I'm actually doing{" "}
            <span className="text-foreground/50">
              {isLoading ? "..." : `updated ${lastUpdated}`}
            </span>
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, si) => (
            <motion.div
              key={section.label}
              custom={si}
              initial="hidden"
              animate="show"
              variants={fade}
            >
              {/* Section label */}
              <p
                className="text-xs uppercase mb-4"
                style={{ letterSpacing: "0.15em", color: "var(--muted-foreground)", opacity: 0.5 }}
              >
                {section.label}
              </p>

              {/* Items */}
              <ul className="space-y-4">
                {section.items.map((item, ii) => (
                  <motion.li
                    key={ii}
                    custom={si + ii * 0.3}
                    initial="hidden"
                    animate="show"
                    variants={fade}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="mt-2 shrink-0 rounded-full"
                      style={{ width: 4, height: 4, background: "currentColor", opacity: 0.25 }}
                    />
                    <div>
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      {item.sub && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 text-xs text-muted-foreground/40 leading-relaxed"
        >
          If you have a now page too, I'd like to read it.
        </motion.p>

      </div>
    </div>
  );
}
