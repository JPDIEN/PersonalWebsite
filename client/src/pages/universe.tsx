import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Category = "book" | "place" | "person" | "idea";

type Star = {
  id: string;
  label: string;
  category: Category;
  note: string;
  magnitude: 1 | 2 | 3 | 4; // 1 = brightest/largest
  x: number; y: number; z: number;
};

type Edge = [string, string];

// Sophisticated, slightly desaturated palette
const CAT_COLOR: Record<Category, [number, number, number]> = {
  book:   [212, 172, 108],
  place:  [120, 176, 208],
  person: [204, 120, 120],
  idea:   [140, 196, 116],
};

const hex = ([r, g, b]: [number, number, number], a = 1) =>
  `rgba(${r},${g},${b},${a})`;

const STARS: Star[] = [
  // magnitude 1 — anchors
  { id: "nd",    label: "Notre Dame",               category: "place",  magnitude: 1, x:   20, y:   40, z:  140, note: "The Dome, the Grotto, the startup ecosystem. I've met more interesting people here than anywhere else. Right place, right time." },
  { id: "home",  label: "Home",                     category: "place",  magnitude: 1, x: -340, y:  -20, z:   60, note: "Grew up oldest of six, homeschooled in Connecticut. No one handed me a structure, so I built one. Still pretty much how I operate." },
  { id: "faith", label: "Faith",                    category: "idea",   magnitude: 1, x:  340, y:  120, z:   80, note: "Shapes how I read, how I make decisions, and why I think the most important things require vulnerability." },

  // magnitude 2
  { id: "msm",   label: "Man's Search for Meaning", category: "book",   magnitude: 2, x: -300, y: -160, z: -40,  note: "Frankl wrote this in a concentration camp. The argument is that meaning is the one thing no one can take from you. I keep coming back to it when things feel pointless." },
  { id: "fras",  label: "Pier Giorgio Frassati",    category: "person", magnitude: 2, x:  300, y:  -80, z:  60,  note: "Climbed mountains, served the poor, died at 24. We must never just exist, but live. Keeps me honest when I am overthinking things." },
  { id: "found", label: "Founder Mindset",          category: "idea",   magnitude: 2, x:  140, y:  180, z: -60,  note: "Not a title. Refusing to wait for permission. I have been doing this since before I had a name for it." },
  { id: "imp",   label: "Improvisation",            category: "idea",   magnitude: 2, x:  -60, y:  160, z: -140, note: "The best conversations, pitches, and moments at the piano happen when I know the structure well enough to stop following it." },

  // magnitude 3
  { id: "shoe",  label: "Shoe Dog",                 category: "book",   magnitude: 3, x: -120, y:  -80, z: -160, note: "Phil Knight almost went bankrupt a dozen times building Nike. The book made me feel better about not having everything figured out. Best startup story I've read." },
  { id: "3body", label: "The Three-Body Problem",   category: "book",   magnitude: 3, x:  260, y: -180, z: -100, note: "Made me feel genuinely small. Three civilizations, millions of years, the kind of scale that makes human ambition feel both ridiculous and more urgent at the same time." },
  { id: "perl",  label: "Perelandra",               category: "book",   magnitude: 3, x:  100, y: -140, z: -200, note: "Lewis wrote sci-fi as moral philosophy. It's strange and beautiful. Goodness feels exciting in it, not just correct." },
  { id: "yale",  label: "Yale Law School",          category: "place",  magnitude: 3, x: -180, y:  120, z: -120, note: "Spent a summer co-designing a law course on epistemology with Prof. Greco. The question of what it means to actually know something has stuck with me." },
  { id: "greco", label: "Prof. John Greco",         category: "person", magnitude: 3, x:  200, y:   80, z: -180, note: "Yale philosopher. He pushed me to be precise about what I claim to know versus what I just believe confidently. The distinction matters more than I thought." },

  // magnitude 4
  { id: "chess", label: "Chess",                    category: "idea",   magnitude: 4, x: -240, y:  -40, z: -240, note: "[YOUR WORDS HERE] Something about pattern recognition, patience, or a specific moment the game taught you something real." },
  { id: "climb", label: "Rock Climbing",            category: "place",  magnitude: 4, x:   60, y:  240, z:  120, note: "[YOUR WORDS HERE] Something about being fully present on a wall, or a specific climb that stuck with you." },
  { id: "sibs",  label: "Five Siblings",            category: "person", magnitude: 4, x: -360, y: -120, z:  -80, note: "[YOUR WORDS HERE] The one thing having five younger siblings taught you that you could not have learned any other way." },
];

const EDGES: Edge[] = [
  ["msm","fras"], ["msm","imp"], ["shoe","found"], ["shoe","nd"],
  ["3body","perl"], ["perl","fras"], ["nd","found"], ["nd","greco"],
  ["nd","yale"], ["yale","greco"], ["home","found"], ["home","imp"],
  ["home","sibs"], ["imp","faith"], ["found","faith"], ["fras","faith"],
  ["chess","imp"], ["climb","fras"],
];

// Seeded background stars
const BG = Array.from({ length: 320 }, (_, i) => {
  const rand = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
  return {
    x: rand(i * 3.17), y: rand(i * 7.31), z: rand(i * 1.97) * 800 - 400,
    r: rand(i * 2.73) < 0.04 ? 1.6 : rand(i * 2.73) < 0.2 ? 0.9 : 0.45,
    phase: rand(i * 5.91) * Math.PI * 2,
    spd: 0.25 + rand(i * 4.13) * 0.5,
    a: 0.12 + rand(i * 6.37) * 0.52,
  };
});

const MAG_BASE = [0, 11, 8, 6, 4]; // radius per magnitude level

export default function Universe() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Star | null>(null);
  const [dims, setDims]         = useState({ w: 0, h: 0 });
  const animRef  = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const rotY     = useRef(0.2);
  const rotX     = useRef(0.06);
  const velY     = useRef(0.00022); // very slow spin
  const velX     = useRef(0);
  const drag     = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const upd = () => {
      const el = containerRef.current;
      if (el) setDims({ w: el.clientWidth, h: el.clientHeight });
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const proj = useCallback((x: number, y: number, z: number, w: number, h: number) => {
    const cy = Math.cos(rotY.current), sy = Math.sin(rotY.current);
    const x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
    const cx = Math.cos(rotX.current), sx = Math.sin(rotX.current);
    const y2 = cx * y - sx * z1, z2 = sx * y + cx * z1;
    const fov = 850, sc = fov / (fov + z2);
    return { sx: w / 2 + x1 * sc, sy: h / 2 + y2 * sc, sc, z2 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    canvas.width = dims.w; canvas.height = dims.h;
    const ctx = canvas.getContext("2d")!;

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;

      if (!drag.current) {
        rotY.current += velY.current;
        rotX.current += velX.current * 0.95;
        velX.current *= 0.93;
        rotX.current = Math.max(-0.38, Math.min(0.38, rotX.current));
      }

      ctx.clearRect(0, 0, dims.w, dims.h);

      // ── Background ──────────────────────────────────────────────────────
      // Deep navy, slightly lighter at center — no nebula blobs
      const bg = ctx.createRadialGradient(dims.w * .5, dims.h * .42, 0, dims.w * .5, dims.h * .42, dims.w * .8);
      bg.addColorStop(0,   "#0c1022");
      bg.addColorStop(0.6, "#070a18");
      bg.addColorStop(1,   "#030508");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, dims.w, dims.h);

      // Vignette
      const vig = ctx.createRadialGradient(dims.w * .5, dims.h * .5, dims.w * .3, dims.w * .5, dims.h * .5, dims.w * .75);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, dims.w, dims.h);

      // ── Background star field ────────────────────────────────────────────
      BG.forEach((s) => {
        const px = (rotY.current * s.z * 0.14);
        const py = (rotX.current * s.z * 0.09);
        const bx = ((s.x * dims.w + px) % dims.w + dims.w) % dims.w;
        const by = ((s.y * dims.h + py) % dims.h + dims.h) % dims.h;
        const tw = Math.sin(t * s.spd + s.phase) * 0.28 + 0.72;
        ctx.beginPath();
        ctx.arc(bx, by, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,218,255,${s.a * tw})`;
        ctx.fill();
      });

      // ── Project named stars ──────────────────────────────────────────────
      const stars3d = STARS.map(star => ({ star, ...proj(star.x, star.y, star.z, dims.w, dims.h) }));
      stars3d.sort((a, b) => b.z2 - a.z2);

      // ── Constellation lines ──────────────────────────────────────────────
      EDGES.forEach(([a, b]) => {
        const pa = stars3d.find(p => p.star.id === a)!;
        const pb = stars3d.find(p => p.star.id === b)!;
        if (!pa || !pb) return;
        const isSel = selected?.id === a || selected?.id === b;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        // Clean white lines — no color gradient, just precise and thin
        ctx.strokeStyle = isSel ? "rgba(200,218,255,0.5)" : "rgba(200,218,255,0.1)";
        ctx.lineWidth   = isSel ? 0.9 : 0.5;
        ctx.setLineDash([]);
        ctx.stroke();
      });

      // ── Named stars ──────────────────────────────────────────────────────
      stars3d.forEach(({ star, sx, sy, sc }, idx) => {
        const isSel  = selected?.id === star.id;
        const color  = CAT_COLOR[star.category];
        const enter  = Math.min(1, Math.max(0, (t - idx * 0.09) / 0.55));
        if (enter === 0) return;

        const baseR  = MAG_BASE[star.magnitude] * sc;
        const pulse  = Math.sin(t * (0.7 + star.magnitude * 0.12) + star.x * 0.009) * 0.5 + 0.5;
        const r      = isSel ? baseR * 1.35 : baseR + pulse * baseR * 0.15;

        ctx.globalAlpha = enter;

        // ── Diffraction spikes (magnitude 1 & 2 only) ──────────────────
        if (star.magnitude <= 2) {
          const spikeLen = r * (star.magnitude === 1 ? 6.5 : 4.5);
          const spikeOpa = star.magnitude === 1 ? 0.45 : 0.28;
          const angles   = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
          angles.forEach((ang) => {
            const ex = sx + Math.cos(ang) * spikeLen;
            const ey = sy + Math.sin(ang) * spikeLen;
            const sg = ctx.createLinearGradient(sx, sy, ex, ey);
            sg.addColorStop(0,   `rgba(255,255,255,${spikeOpa})`);
            sg.addColorStop(0.4, `rgba(255,255,255,${spikeOpa * 0.3})`);
            sg.addColorStop(1,   "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = sg;
            ctx.lineWidth   = star.magnitude === 1 ? 0.9 : 0.6;
            ctx.stroke();
          });
        }

        // ── Outer halo — very tight, physically accurate falloff ────────
        const haloR = r * (isSel ? 3.2 : 2.8);
        const halo  = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, haloR);
        halo.addColorStop(0,   hex(color, isSel ? 0.55 : 0.38));
        halo.addColorStop(0.5, hex(color, isSel ? 0.12 : 0.07));
        halo.addColorStop(1,   hex(color, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
        ctx.fill();

        // ── Star core — sharp circle ────────────────────────────────────
        const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        cg.addColorStop(0,   "rgba(255,255,255,1)");
        cg.addColorStop(0.3, hex(color, 0.95));
        cg.addColorStop(1,   hex(color, 0.7));
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();

        // ── Label ───────────────────────────────────────────────────────
        const fSize  = Math.max(9, Math.round(8 + (5 - star.magnitude) * 1.2 + sc * 1.5));
        const isLeft = sx < dims.w * 0.2;
        const lx     = isLeft ? sx - r - 8 : sx + r + 8;
        const ly     = sy + fSize * 0.35;

        ctx.textAlign    = isLeft ? "right" : "left";
        ctx.font         = `300 ${fSize}px "Inter", system-ui, sans-serif`;
        ctx.letterSpacing = "0.05em";
        // Category color tint, low opacity
        const lAlpha = isSel ? 0.95 : star.magnitude <= 2 ? 0.6 : 0.38;
        ctx.fillStyle    = hex(color, lAlpha * enter);
        ctx.fillText(star.label.toUpperCase(), lx, ly);

        ctx.globalAlpha  = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, selected, proj]);

  const hitTest = useCallback((cx: number, cy: number) => {
    return STARS.find((star) => {
      const { sx, sy, sc } = proj(star.x, star.y, star.z, dims.w, dims.h);
      return Math.hypot(cx - sx, cy - sy) < MAG_BASE[star.magnitude] * sc + 18;
    }) ?? null;
  }, [dims, proj]);

  const onMouseDown = (e: React.MouseEvent) => { drag.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    rotY.current += dx * 0.004;
    rotX.current  = Math.max(-0.38, Math.min(0.38, rotX.current + dy * 0.004));
    velX.current  = dy * 0.001;
    drag.current  = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (drag.current) {
      const moved = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
      if (moved < 5) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const star  = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        setSelected(star ? (selected?.id === star.id ? null : star) : null);
      }
    }
    drag.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  };

  const onTouchStart = (e: React.TouchEvent) => { drag.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchMove  = (e: React.TouchEvent) => {
    if (!drag.current) return;
    const dx = e.touches[0].clientX - drag.current.x, dy = e.touches[0].clientY - drag.current.y;
    rotY.current += dx * 0.004;
    rotX.current  = Math.max(-0.38, Math.min(0.38, rotX.current + dy * 0.004));
    drag.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const moved = drag.current ? Math.hypot(t.clientX - drag.current.x, t.clientY - drag.current.y) : 99;
    if (moved < 6) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const star  = hitTest(t.clientX - rect.left, t.clientY - rect.top);
      setSelected(star ? (selected?.id === star.id ? null : star) : null);
    }
    drag.current = null;
  };

  return (
    <div ref={containerRef} className="fixed inset-0" style={{ background: "#030508" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-8 pt-7 pointer-events-none">
        <div>
          <p style={{ fontFamily: "Georgia, serif", color: "rgba(200,218,255,0.4)", fontSize: 11, letterSpacing: "0.2em" }} className="uppercase">
            Universe
          </p>
          <p style={{ color: "rgba(200,218,255,0.18)", fontSize: 10, letterSpacing: "0.12em", marginTop: 5 }} className="uppercase">
            drag to rotate &nbsp;·&nbsp; click to explore
          </p>
        </div>
        <div className="flex gap-6" style={{ marginTop: 2 }}>
          {(Object.entries(CAT_COLOR) as [Category, [number,number,number]][]).map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-2">
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: hex(c, 0.9), boxShadow: `0 0 6px ${hex(c, 0.7)}` }} />
              <span style={{ color: "rgba(200,218,255,0.22)", fontSize: 9, letterSpacing: "0.15em" }} className="uppercase">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back */}
      <a
        href="/"
        style={{ color: "rgba(200,218,255,0.16)", fontSize: 10, letterSpacing: "0.15em", fontFamily: "monospace" }}
        className="absolute bottom-7 left-8 uppercase transition-all hover:opacity-60"
      >
        ← Back
      </a>

      {/* Selected card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-7 right-8"
            style={{
              width: 300,
              background: "rgba(5,8,20,0.94)",
              border: `1px solid ${hex(CAT_COLOR[selected.category], 0.2)}`,
              backdropFilter: "blur(28px)",
              borderRadius: 4,
              padding: "24px 24px 22px",
              boxShadow: `0 0 40px ${hex(CAT_COLOR[selected.category], 0.1)}, 0 20px 60px rgba(0,0,0,0.8)`,
            }}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute"
              style={{ top: 14, right: 14, color: "rgba(200,218,255,0.2)", lineHeight: 1 }}
            >
              <X size={12} />
            </button>
            <p style={{ fontSize: 9, letterSpacing: "0.2em", color: hex(CAT_COLOR[selected.category], 0.6), marginBottom: 10 }} className="uppercase">
              {selected.category}
            </p>
            <h3 style={{ fontFamily: "Georgia, serif", color: "rgba(220,232,255,0.92)", fontSize: 17, lineHeight: 1.35, marginBottom: 12, paddingRight: 16 }}>
              {selected.label}
            </h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "rgba(200,218,255,0.46)" }}>
              {selected.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
