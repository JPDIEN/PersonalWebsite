import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Music } from "lucide-react";

const themes = [
  {
    key: "C",
    musicalKey: "C Major",
    title: "notre dame journey",
    content: "i came to notre dame thinking growth meant having a plan. turns out it’s mostly about winging it with people who make you laugh when things fall apart. i’ve learned more from shared failures, late-night ideas that didn’t quite work, and saying yes too fast than from any class i’ve taken.",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    key: "G",
    musicalKey: "G Minor",
    title: "startup lessons",
    content: "i’ve learned more from startups than i probably should admit. coaching founders means watching cool, driven people chase crazy ideas — and getting to help them tweak, test, and try again. at yelo, i worked on gem and growth, failed fast, learned faster, and realized that most “overnight successes” are built on a pile of good mistakes.",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  {
    key: "Ab",
    musicalKey: "A♭ Major",
    title: "daydreaming & reflection",
    content: "i think a lot — sometimes too much. but reflection’s how i make sense of everything: work, friendships, the next move. i’ve realized that daydreaming isn’t a break from life, it’s part of how i live it. ideas usually start as a quiet thought i can’t shake, and thinking them through has become its own kind of practice.",
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
            each variation reveals a different chapter, a different story, or a different lesson from life.
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
              i’ve noticed that the best ideas often show up when things don’t go exactly as planned. whether i’m working on growth, 
              helping founders, or exploring new research, i try to stay prepared but flexible. structure gives me a base, but the 
              unexpected moments are usually where the energy and creativity come in. that’s the rhythm i try to live by: 
              ready enough to keep moving, open enough to be surprised.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
