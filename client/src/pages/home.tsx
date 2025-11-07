import { motion, useScroll, useTransform } from "framer-motion";
import { PianoKeyboard } from "@/components/piano-keyboard";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import pianoImage from "@assets/generated_images/Grand_piano_soft_focus_cd549071.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  // Map each piano key to an interactive action
  const keyActions: Record<string, () => void> = {
    // First Octave (C4-B4) - Main navigation
    "C4": () => setTimeout(() => setLocation("/about"), 300),
    "C#4": () => setTimeout(() => setLocation("/experience"), 300),
    "D4": () => setTimeout(() => setLocation("/journal"), 300),
    "D#4": () => setTimeout(() => setLocation("/media"), 300),
    "E4": () => setTimeout(() => setLocation("/contact"), 300),
    "F4": () => {
      // Scroll to philosophy section
      setTimeout(() => {
        const element = document.getElementById("philosophy-section");
        element?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    },
    "F#4": () => {
      // Scroll back to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    },
    "G4": () => setTimeout(() => setLocation("/about"), 300),
    "G#4": () => setTimeout(() => setLocation("/experience"), 300),
    "A4": () => setTimeout(() => setLocation("/journal"), 300),
    "A#4": () => setTimeout(() => setLocation("/media"), 300),
    "B4": () => setTimeout(() => setLocation("/contact"), 300),
    
    // Second Octave (C5-B5) - Alternative actions
    "C5": () => {
      // Scroll to piano section
      setTimeout(() => {
        const element = document.getElementById("piano-section");
        element?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    },
    "C#5": () => setTimeout(() => setLocation("/about"), 300),
    "D5": () => setTimeout(() => setLocation("/experience"), 300),
    "D#5": () => setTimeout(() => setLocation("/journal"), 300),
    "E5": () => setTimeout(() => setLocation("/media"), 300),
    "F5": () => setTimeout(() => setLocation("/contact"), 300),
    "F#5": () => {
      // Scroll to philosophy
      setTimeout(() => {
        const element = document.getElementById("philosophy-section");
        element?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    },
    "G5": () => {
      // Scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    },
    "G#5": () => setTimeout(() => setLocation("/about"), 300),
    "A5": () => setTimeout(() => setLocation("/experience"), 300),
    "A#5": () => setTimeout(() => setLocation("/journal"), 300),
    "B5": () => setTimeout(() => setLocation("/media"), 300),
  };

  // Map each key to a user-friendly hint
  const keyHints: Record<string, string> = {
    "C4": "About",
    "C#4": "Experience",
    "D4": "Journal",
    "D#4": "Media",
    "E4": "Contact",
    "F4": "Philosophy",
    "F#4": "Back to Top",
    "G4": "About",
    "G#4": "Experience",
    "A4": "Journal",
    "A#4": "Media",
    "B4": "Contact",
    "C5": "Piano",
    "C#5": "About",
    "D5": "Experience",
    "D#5": "Journal",
    "E5": "Media",
    "F5": "Contact",
    "F#5": "Philosophy",
    "G5": "Back to Top",
    "G#5": "About",
    "A5": "Experience",
    "A#5": "Journal",
    "B5": "Media",
  };

  const handleNotePlay = (note: string) => {
    const action = keyActions[note];
    if (action) {
      action();
    }
  };

  const scrollToKeyboard = () => {
    const keyboardElement = document.getElementById("piano-section");
    keyboardElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pianoImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-wide"
            data-testid="text-hero-title"
          >
            Every note a story.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            welcome to my personal website! feel free to explore and learn about me.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm md:text-base text-muted-foreground space-y-2"
            data-testid="text-hero-roles"
          >
            <p className="font-medium">Growth & GTM Lead at Yelo</p>
            <p>Startup Coach • Growth Specialist • Notre Dame Student</p>
            <p className="font-serif italic">Builder • Daydreamer • Friend</p>
          </motion.div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          onClick={scrollToKeyboard}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Scroll to piano"
          data-testid="button-scroll-to-piano"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.button>
      </section>

      {/* Piano Section */}
      <section
        id="piano-section"
        className="py-20 md:py-32 px-4 bg-gradient-to-b from-background to-muted/20"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-5xl font-semibold mb-4" data-testid="text-piano-title">
            Begin the melody
          </h2>
          <p className="text-muted-foreground text-lg" data-testid="text-piano-subtitle">
            Each key unlocks a different part of my story. Explore and discover.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PianoKeyboard onNotePlay={handleNotePlay} octaves={2} keyHints={keyHints} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-muted-foreground italic"
          data-testid="text-piano-footnote"
        >
          Each key opens a window. Each note tells a story.
        </motion.p>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy-section" className="py-20 md:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-center italic border-l-4 border-primary pl-6 md:pl-8" data-testid="text-philosophy-quote">
            "i've found life's most meaningful experiences come from improvisation.
            this balance between structure and spontaneity has shaped how I live and create. 
            i build frameworks, but i’ve learned to let curiosity bend them when the moment asks for something new."
          </blockquote>
          <p className="text-right mt-6 text-muted-foreground" data-testid="text-philosophy-attribution">— Joseph Diener</p>
        </motion.div>
      </section>
    </div>
  );
}
