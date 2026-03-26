import { motion, useScroll, useTransform } from "framer-motion";
import { PianoKeyboard } from "@/components/piano-keyboard";
import { ChevronDown } from "lucide-react";
import natureImage from "@assets/generated_images/nature-hero.jpg";

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 180]);

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col justify-center overflow-hidden">

        {/* Parallax photo */}
        <motion.div className="absolute inset-0 z-0" style={{ y }}>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${natureImage})` }}
          />
          {/* Gradient: stronger at top (behind nav) + bottom */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)"
            }}
          />
        </motion.div>

        {/* Quote — center of the screen */}
        <div className="relative z-10 px-8 md:px-16 max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-white/50 text-xs tracking-[0.25em] uppercase mb-5 font-sans"
          >
            Joseph Diener
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-white leading-[1.02]"
            style={{
              fontSize: "clamp(3.2rem, 8.5vw, 8rem)",
              letterSpacing: "-0.03em",
            }}
          >
            "We must never<br />just exist, but live."
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-7 flex items-center gap-4"
          >
            <div className="h-px w-10 bg-white/35" />
            <p className="text-white/45 text-sm font-sans tracking-widest">
              Pier Giorgio Frassati
            </p>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          onClick={() => document.getElementById("piano-section")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-8 right-8 z-10 text-white/35 hover:text-white/70 transition-colors"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </section>

      {/* ── Piano ────────────────────────────────────────────── */}
      <section
        id="piano-section"
        style={{ background: "#0f0f0f" }}
        className="py-20 md:py-28 px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2
            className="font-serif mb-2"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Look around
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
            Each key takes you somewhere.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <PianoKeyboard octaves={2} />
        </motion.div>
      </section>

    </div>
  );
}
