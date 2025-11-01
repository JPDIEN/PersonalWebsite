import { motion, useScroll, useTransform } from "framer-motion";
import { PianoKeyboard } from "@/components/piano-keyboard";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import pianoImage from "@assets/generated_images/Grand_piano_soft_focus_cd549071.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  const handleNotePlay = (note: string) => {
    if (note === "C4") {
      setTimeout(() => {
        setLocation("/about");
      }, 300);
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
            Welcome to the world of Joseph Diener — where strategy meets creativity,
            where structure dances with improvisation, and where every melody reveals
            a new chapter of growth, innovation, and curiosity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm md:text-base text-muted-foreground space-y-2"
            data-testid="text-hero-roles"
          >
            <p className="font-medium">Growth & GTM Lead at Yelo</p>
            <p>Startup Coach • Yale Law Researcher • Notre Dame Alumnus</p>
            <p className="font-serif italic">Pianist • Daydreamer • Adventurer</p>
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
            Press Middle C to continue your journey through Joseph's world.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PianoKeyboard onNotePlay={handleNotePlay} octaves={2} />
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
      <section className="py-20 md:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-center italic border-l-4 border-primary pl-6 md:pl-8" data-testid="text-philosophy-quote">
            "Life's most meaningful melodies come from improvisation —
            the beautiful tension between structure and spontaneity,
            between what we plan and what we discover along the way."
          </blockquote>
          <p className="text-right mt-6 text-muted-foreground" data-testid="text-philosophy-attribution">— Joseph Diener</p>
        </motion.div>
      </section>
    </div>
  );
}
