import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Star = {
  id: string;
  x: number; // 0–1 relative
  y: number;
  label: string;
  category: "book" | "place" | "person" | "idea";
  note: string;
};

type Edge = [string, string];

const STARS: Star[] = [
  // Books
  { id: "msm",   x: 0.18, y: 0.22, label: "Man's Search for Meaning", category: "book",   note: "Frankl wrote this in a Nazi death camp. The argument that meaning outlasts suffering changed how I think about hard stretches." },
  { id: "shoe",  x: 0.32, y: 0.38, label: "Shoe Dog",                  category: "book",   note: "Phil Knight built Nike by winging it, almost going bankrupt a dozen times. The best startup memoir I've read." },
  { id: "3body", x: 0.72, y: 0.18, label: "The Three-Body Problem",    category: "book",   note: "Made me feel genuinely small in the best way. Changes how you think about civilization, time, and survival." },
  { id: "perl",  x: 0.58, y: 0.30, label: "Perelandra",                category: "book",   note: "C.S. Lewis doing sci-fi as moral philosophy. Goodness is made to feel genuinely exciting, not just correct." },

  // Places
  { id: "nd",    x: 0.48, y: 0.55, label: "Notre Dame",               category: "place",  note: "Where I spend most of my time. The Dome, the Grotto, the startup ecosystem — it's the right place at the right time." },
  { id: "yale",  x: 0.28, y: 0.65, label: "Yale Law School",          category: "place",  note: "Spent a summer co-designing a law course on epistemology. Taught me to think more carefully about what I claim to know." },
  { id: "home",  x: 0.15, y: 0.52, label: "Home",                     category: "place",  note: "Grew up the oldest of six, homeschooled. No one handed me a structure, so I built one. That's still how I operate." },

  // People
  { id: "greco", x: 0.68, y: 0.62, label: "Prof. John Greco",         category: "person", note: "Yale philosopher who taught me what it means to actually know something rather than just believe it confidently." },
  { id: "fras",  x: 0.82, y: 0.42, label: "Pier Giorgio Frassati",    category: "person", note: "We must never just exist, but live. He climbed mountains, served the poor, and died at 24. Keeps me honest." },

  // Ideas
  { id: "imp",   x: 0.42, y: 0.72, label: "Improvisation",            category: "idea",   note: "The best moments — at the piano, in a conversation, in a pitch — come from knowing the structure well enough to leave it." },
  { id: "found", x: 0.62, y: 0.78, label: "Founder Mindset",          category: "idea",   note: "Not a job title. It's the refusal to wait for permission. I've tried to run this way since before I knew what it was called." },
  { id: "faith", x: 0.85, y: 0.68, label: "Faith",                    category: "idea",   note: "Shapes how I read, how I make decisions, and why I think the best things in life require vulnerability." },
];

const EDGES: Edge[] = [
  ["msm",  "fras"],
  ["msm",  "imp"],
  ["shoe", "found"],
  ["shoe", "nd"],
  ["3body","perl"],
  ["perl", "fras"],
  ["nd",   "found"],
  ["nd",   "greco"],
  ["nd",   "yale"],
  ["yale", "greco"],
  ["home", "found"],
  ["home", "imp"],
  ["imp",  "faith"],
  ["found","faith"],
  ["fras", "faith"],
];

const CATEGORY_COLORS: Record<Star["category"], string> = {
  book:   "#c8a96e",
  place:  "#7eb8c8",
  person: "#c87e7e",
  idea:   "#9ec87e",
};

export default function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Star | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Resize
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      setDims({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getPos = (star: Star) => ({
    x: star.x * dims.w,
    y: star.y * dims.h,
  });

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d")!;

    const draw = (t: number) => {
      timeRef.current = t;
      ctx.clearRect(0, 0, dims.w, dims.h);

      // Background stars (static tiny dots)
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      // Use deterministic positions seeded from index
      for (let i = 0; i < 180; i++) {
        const bx = ((i * 137.508 * 7) % dims.w);
        const by = ((i * 97.31 * 13) % dims.h);
        const r = i % 3 === 0 ? 0.8 : 0.4;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Constellation edges
      EDGES.forEach(([a, b]) => {
        const sa = STARS.find(s => s.id === a)!;
        const sb = STARS.find(s => s.id === b)!;
        const pa = getPos(sa);
        const pb = getPos(sb);
        const isActive = hovered === a || hovered === b || selected?.id === a || selected?.id === b;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)";
        ctx.lineWidth = isActive ? 1 : 0.5;
        ctx.stroke();
      });

      // Stars
      STARS.forEach((star) => {
        const { x, y } = getPos(star);
        const color = CATEGORY_COLORS[star.category];
        const isHov = hovered === star.id;
        const isSel = selected?.id === star.id;
        const pulse = Math.sin(t * 0.001 + star.x * 10) * 0.5 + 0.5;
        const r = isSel ? 7 : isHov ? 6 : 4 + pulse * 1.2;

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
        grd.addColorStop(0, color + (isSel || isHov ? "55" : "33"));
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isSel || isHov ? color : color + "cc";
        ctx.fill();

        // Label
        if (isHov || isSel) {
          ctx.font = "12px Inter, sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.textAlign = x > dims.w * 0.75 ? "right" : "left";
          const lx = x > dims.w * 0.75 ? x - r - 8 : x + r + 8;
          ctx.fillText(star.label, lx, y + 4);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, hovered, selected]);

  // Hit test
  const hitTest = (cx: number, cy: number) => {
    return STARS.find((s) => {
      const { x, y } = getPos(s);
      return Math.hypot(cx - x, cy - y) < 18;
    }) ?? null;
  };

  const handleMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const star = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    setHovered(star?.id ?? null);
    canvasRef.current!.style.cursor = star ? "pointer" : "default";
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const star = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (star) setSelected(selected?.id === star.id ? null : star);
    else setSelected(null);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{ background: "#04060e" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={handleMove}
        onClick={handleClick}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 pointer-events-none">
        <div>
          <p className="font-serif text-white/70 text-sm tracking-wide">Universe</p>
          <p className="text-white/25 text-xs mt-0.5 font-mono">
            things that shaped me · hover to explore
          </p>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>
                {cat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Back link */}
      <a
        href="/"
        className="absolute bottom-6 left-6 font-mono text-xs transition-opacity hover:opacity-70"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        ← back
      </a>

      {/* Selected card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 right-6 w-72 rounded-xl p-5"
            style={{
              background: "rgba(10,12,20,0.92)",
              border: `1px solid ${CATEGORY_COLORS[selected.category]}44`,
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div
              className="text-xs uppercase tracking-widest mb-2 font-mono"
              style={{ color: CATEGORY_COLORS[selected.category] }}
            >
              {selected.category}
            </div>
            <h3 className="font-serif text-white text-base mb-3 leading-snug pr-4">
              {selected.label}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {selected.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
