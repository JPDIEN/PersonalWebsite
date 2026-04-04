import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Split text into words for the reveal animation
function WordReveal({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            delay: delay + i * 0.055,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Home() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-28 pb-16">
      <div className="max-w-2xl">

        {/* Name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.22em] uppercase mb-10"
          style={{ color: "var(--muted-foreground)", opacity: 0.45 }}
        >
          Joseph Diener
        </motion.p>

        {/* Bio paragraphs */}
        <div className="space-y-5">
          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)" }}
          >
            <WordReveal
              text="Grew up the oldest of six, homeschooled. Made my own opportunities."
              delay={0.1}
            />
          </p>

          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)" }}
          >
            <WordReveal
              text="Now at Notre Dame studying finance and spending most of my time in the startup and VC world."
              delay={0.55}
            />
          </p>

          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)" }}
          >
            <WordReveal
              text="I play piano, read too many books at once, and think the best ideas show up when you stop looking for them."
              delay={1.05}
            />
          </p>
        </div>

        {/* Frassati */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.9 }}
          className="mt-14 flex items-center gap-4"
        >
          <div className="h-px w-8 bg-current opacity-20" />
          <p
            className="text-sm font-serif italic"
            style={{ color: "var(--muted-foreground)", opacity: 0.45 }}
          >
            "We must never just exist, but live." — Pier Giorgio Frassati
          </p>
        </motion.div>

      </div>

      {/* Terminal hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="fixed bottom-7 right-8 text-xs font-mono"
        style={{ color: "var(--muted-foreground)", opacity: 0.3 }}
      >
        press <kbd
          className="px-1 py-0.5 rounded text-xs"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            opacity: 1,
            color: "var(--foreground)",
          }}
        >/</kbd> to explore
      </motion.p>
    </div>
  );
}
