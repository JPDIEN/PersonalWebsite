import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Music } from "lucide-react";

const themes = [
  {
    key: "C",
    musicalKey: "C Major",
    title: "Notre Dame Journey",
    content: "At the University of Notre Dame, I discovered the intersection of rigorous analytical thinking and creative problem-solving. Studying Economics and Applied Computational Mathematics taught me that the most elegant solutions often emerge from combining disparate disciplines — much like a musical composition weaving together distinct melodic lines into a harmonious whole. The golden dome became my lighthouse, reminding me that excellence isn't about perfection, but about continuous growth and intellectual curiosity.",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    key: "G",
    musicalKey: "G Minor",
    title: "Startup Lessons",
    content: "Working at Yelo and coaching founders at a stealth fund has taught me that startups are jazz ensembles — everyone improvising together toward a shared vision. As Growth & GTM Lead, I've learned that the best strategies embrace uncertainty rather than fear it. Each pivot is a key change, each experiment a new variation on a theme. The minor key reminds us that challenges aren't obstacles; they're the tension that makes resolution so sweet. Growth isn't linear — it's a crescendo built from countless small moments of learning, iteration, and bold decision-making.",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  {
    key: "Ab",
    musicalKey: "A♭ Major",
    title: "Daydreaming & Reflection",
    content: "Research at Yale Law School has shown me the power of stepping back to see the bigger picture. In the quiet moments between meetings, on ski slopes, or while climbing — that's when the most profound insights emerge. Daydreaming isn't escapism; it's essential cognition. It's in these ethereal spaces that I connect dots others miss, finding patterns in chaos and meaning in complexity. The philosopher's key, A-flat major, represents the contemplative side of ambition — the understanding that strategic thinking requires both intense focus and spacious wonder.",
    color: "from-purple-500/20 to-pink-500/20",
  },
];

export default function About() {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-about-title">
            Themes & Variations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-about-subtitle">
            Each variation reveals a different chapter, a different key, a different movement in the ongoing composition.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Key Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="sticky top-24 space-y-3">
              <h3 className="font-serif text-xl font-semibold mb-4 text-muted-foreground" data-testid="text-key-selector">
                Select a Key
              </h3>
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 hover-elevate ${
                    selectedTheme.key === theme.key
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card"
                  }`}
                  data-testid={`button-theme-${theme.key.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-2xl font-bold">{theme.key}</span>
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.musicalKey}</p>
                  <p className="text-sm font-medium mt-1">{theme.title}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTheme.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-8 md:p-12 bg-gradient-to-br ${selectedTheme.color} border-2`} data-testid={`card-theme-${selectedTheme.key.toLowerCase()}`}>
                  <div className="mb-6">
                    <span className="text-sm font-medium text-primary mb-2 block" data-testid="text-theme-key">
                      {selectedTheme.musicalKey}
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6" data-testid="text-theme-title">
                      {selectedTheme.title}
                    </h2>
                  </div>
                  <p className="text-lg leading-relaxed text-foreground/90" data-testid="text-theme-content">
                    {selectedTheme.content}
                  </p>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Improviser's Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 p-8 md:p-12 border-l-4 border-primary bg-muted/30 rounded-r-lg"
              data-testid="card-improviser-note"
            >
              <h3 className="font-serif text-2xl font-semibold mb-4 italic" data-testid="text-improviser-note-title">
                An Improviser's Note
              </h3>
              <p className="text-lg leading-loose text-muted-foreground" data-testid="text-improviser-note-content">
                I've always believed that the best melodies emerge when we embrace uncertainty.
                Whether I'm strategizing growth initiatives, advising founders, or exploring new research,
                I approach each challenge like a jazz musician approaches a solo — with preparation,
                presence, and the courage to play something unexpected. Structure gives us the foundation,
                but improvisation is where magic happens. That's the rhythm I live by: prepared enough to be confident,
                flexible enough to be surprised.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
