import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import natureImage from "@assets/generated_images/nature-hero.jpg";

const FALLBACK_NOW = [
  { label: "Reading", value: "Man's Search for Meaning" },
  { label: "Working on", value: "Notre Dame Venture Capital" },
  { label: "Based at", value: "University of Notre Dame" },
];

function useNowData() {
  const [now, setNow] = useState(FALLBACK_NOW);

  useEffect(() => {
    const url = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL;
    if (!url) return;

    fetch(url)
      .then((r) => r.text())
      .then((csv) => {
        const rows = csv.trim().split("\n").slice(1); // skip header row
        const parsed = rows
          .map((row) => {
            const commaIdx = row.indexOf(",");
            if (commaIdx === -1) return null;
            const label = row.slice(0, commaIdx).replace(/^"|"$/g, "").trim();
            const value = row.slice(commaIdx + 1).replace(/^"|"$/g, "").trim();
            return label && value ? { label, value } : null;
          })
          .filter(Boolean) as { label: string; value: string }[];
        if (parsed.length > 0) setNow(parsed);
      })
      .catch(() => {}); // keep fallback on error
  }, []);

  return now;
}

export default function Home() {
  const now = useNowData();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 180]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen flex flex-col justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y }}>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${natureImage})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </motion.div>

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
            style={{ fontSize: "clamp(3.2rem, 8.5vw, 8rem)", letterSpacing: "-0.03em" }}
          >
            "We must never
            <br />just exist, but live."
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

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          onClick={() =>
            document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" })
          }
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

      {/* Intro */}
      <section id="intro" className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-base md:text-lg leading-relaxed text-foreground/75">
              Grew up the oldest of six kids, homeschooled. Made my own opportunities.
              Now at Notre Dame studying finance and spending most of my time in the
              startup and VC world.
            </p>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-foreground/75">
              I play piano, read too many books at once, and think the best ideas show
              up when you're not trying to have them.
            </p>
          </motion.div>

          {/* Now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="space-y-7"
          >
            {now.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs tracking-[0.2em] uppercase text-foreground/35 mb-1">
                  {label}
                </p>
                <p className="text-base font-medium">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
