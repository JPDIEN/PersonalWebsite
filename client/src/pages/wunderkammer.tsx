import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Each artifact: thing in the cabinet + the note it reveals on hover
const artifacts = [
  {
    id: "frassati",
    label: "Pier Giorgio Frassati",
    sub: "1901–1925",
    category: "Person",
    note: "He died at 24 having lived more than most do in 80 years. The idea that you can choose to actually live. That stuck.",
    visual: "quote",
    content: "We must never just exist, but live.",
    rotation: -2,
    size: "wide",
  },
  {
    id: "mans-search",
    label: "Man's Search for Meaning",
    sub: "Viktor Frankl",
    category: "Book",
    note: "Read it in one sitting. The argument that meaning can be found even in suffering. I return to it constantly.",
    visual: "spine",
    spineColor: "#1a1a2e",
    spineText: "Man's Search for Meaning",
    rotation: 1,
    size: "tall",
  },
  {
    id: "chess",
    label: "Chess",
    sub: "a patient game",
    category: "Practice",
    note: "Losing teaches more than winning. I lose a lot. Still can't stop.",
    visual: "chess",
    rotation: 0,
    size: "square",
  },
  {
    id: "nd",
    label: "Notre Dame",
    sub: "41.7052° N, 86.2353° W",
    category: "Place",
    note: "Not just a school. The Grotto at midnight. The Basilica before exams. Something about this place changes you.",
    visual: "coordinates",
    rotation: -1,
    size: "square",
  },
  {
    id: "perelandra",
    label: "Perelandra",
    sub: "C.S. Lewis",
    category: "Book",
    note: "The Space Trilogy rewired how I think about good and evil. Ransom on a living ocean. Nothing else like it.",
    visual: "spine",
    spineColor: "#2d4a3e",
    spineText: "Perelandra",
    rotation: 2,
    size: "tall",
  },
  {
    id: "piano",
    label: "The Piano",
    sub: "an ongoing conversation",
    category: "Practice",
    note: "Keith Jarrett improvising for two hours alone. The idea that you can find something true in real time.",
    visual: "piano-keys",
    rotation: 0,
    size: "wide",
  },
  {
    id: "homeschool",
    label: "Homeschooled",
    sub: "K–12",
    category: "Origin",
    note: "My parents gave me the rarest thing: time to go deep on what I cared about. I didn't know how unusual that was until much later.",
    visual: "stamp",
    stampText: "SELF-DIRECTED",
    rotation: -3,
    size: "square",
  },
  {
    id: "oldest",
    label: "Oldest of Six",
    sub: "the first attempt",
    category: "Origin",
    note: "Five younger siblings taught me more about leadership, patience, and chaos than any book. Still learning.",
    visual: "tally",
    rotation: 1,
    size: "square",
  },
  {
    id: "three-body",
    label: "The Three-Body Problem",
    sub: "Liu Cixin",
    category: "Book",
    note: "Genuinely unsettling in the best way. Made me feel small and curious at the same time. That's rare.",
    visual: "spine",
    spineColor: "#1e1e3f",
    spineText: "The Three-Body Problem",
    rotation: -1,
    size: "tall",
  },
  {
    id: "climbing",
    label: "Rock Climbing",
    sub: "whenever there's a wall",
    category: "Practice",
    note: "There's no thinking about anything else when you're ten feet up and your arms are burning. Just the problem.",
    visual: "topo",
    rotation: 2,
    size: "square",
  },
  {
    id: "faith",
    label: "Faith",
    sub: "the thing under everything",
    category: "Origin",
    note: "Not performative. Not inherited on autopilot. Deliberately chosen. Still asking hard questions.",
    visual: "cross",
    rotation: -1,
    size: "square",
  },
  {
    id: "shoe-dog",
    label: "Shoe Dog",
    sub: "Phil Knight",
    category: "Book",
    note: "The honest version of a startup story. No clean arc. Just obsession, near-failure, and stubbornness.",
    visual: "spine",
    spineColor: "#3d1a00",
    spineText: "Shoe Dog",
    rotation: 1,
    size: "tall",
  },
  {
    id: "jarrett",
    label: "Keith Jarrett",
    sub: "Köln Concert, 1975",
    category: "Music",
    note: "Broken piano. Sick. Two hours of pure improvisation. Became one of the best-selling jazz albums ever. Conditions don't matter.",
    visual: "waveform",
    rotation: -2,
    size: "wide",
  },
  {
    id: "founder",
    label: "The Founder Mindset",
    sub: "a working theory",
    category: "Idea",
    note: "Before product, before traction: what makes someone worth betting on? I keep refining the answer.",
    visual: "note-card",
    content: "What do they do when no one is watching?",
    rotation: 0,
    size: "wide",
  },
];

type Artifact = typeof artifacts[number];

// Visual renderers for each artifact type
function ArtifactVisual({ artifact }: { artifact: Artifact }) {
  const v = artifact.visual;

  if (v === "quote") {
    return (
      <div className="h-full flex flex-col justify-center px-5 py-4">
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>
          "{artifact.content}"
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 10, letterSpacing: "0.1em" }}>
          {artifact.label.toUpperCase()}
        </p>
      </div>
    );
  }

  if (v === "note-card") {
    return (
      <div className="h-full flex flex-col justify-center px-5 py-4">
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 8, textTransform: "uppercase" }}>
          {artifact.category}
        </p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
          "{artifact.content}"
        </p>
      </div>
    );
  }

  if (v === "spine") {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ background: artifact.spineColor }}
      >
        <p
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "Georgia, serif",
            padding: "12px 0",
          }}
        >
          {artifact.spineText}
        </p>
      </div>
    );
  }

  if (v === "chess") {
    // Simple chess board fragment
    const squares = Array.from({ length: 25 }, (_, i) => i);
    return (
      <div className="h-full flex items-center justify-center p-3">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, width: 80, height: 80 }}>
          {squares.map((i) => (
            <div
              key={i}
              style={{
                background: (Math.floor(i / 5) + i) % 2 === 0
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (v === "coordinates") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-3">
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 6, letterSpacing: "0.05em" }}>
          LAT / LON
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 15, color: "rgba(255,255,255,0.75)", letterSpacing: "0.05em", lineHeight: 1.8 }}>
          41.7052° N
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 15, color: "rgba(255,255,255,0.75)", letterSpacing: "0.05em" }}>
          86.2353° W
        </div>
      </div>
    );
  }

  if (v === "piano-keys") {
    const whites = 10;
    const blacks = [1, 2, 4, 5, 6, 8, 9];
    const kw = 24;
    const kh = 56;
    return (
      <div className="h-full flex items-center justify-center">
        <div style={{ position: "relative", width: whites * kw, height: kh }}>
          {Array.from({ length: whites }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * kw + 1,
                top: 0,
                width: kw - 2,
                height: kh,
                background: "rgba(245,243,238,0.9)",
                borderRadius: "0 0 4px 4px",
                border: "none",
              }}
            />
          ))}
          {blacks.map((pos) => (
            <div
              key={pos}
              style={{
                position: "absolute",
                left: pos * kw - 8,
                top: 0,
                width: 16,
                height: kh * 0.6,
                background: "#111",
                borderRadius: "0 0 3px 3px",
                zIndex: 2,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (v === "stamp") {
    return (
      <div className="h-full flex items-center justify-center p-3">
        <div
          style={{
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 4,
            padding: "10px 14px",
            transform: "rotate(-8deg)",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontFamily: "monospace", textTransform: "uppercase" }}>
            {artifact.stampText}
          </p>
        </div>
      </div>
    );
  }

  if (v === "tally") {
    // Six tally marks (5 + 1)
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="flex items-end gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 2, height: 28, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
          ))}
          <div style={{ width: 20, height: 2, background: "rgba(255,255,255,0.5)", borderRadius: 1, transform: "rotate(-65deg) translateY(-12px) translateX(4px)" }} />
          <div style={{ width: 2, height: 28, background: "rgba(255,255,255,0.5)", borderRadius: 1, marginLeft: 4 }} />
        </div>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>SIX</p>
      </div>
    );
  }

  if (v === "topo") {
    // Topographic line art
    const lines = [
      "M10,50 Q30,20 60,35 Q90,50 110,30",
      "M10,60 Q35,30 65,45 Q95,60 115,40",
      "M10,70 Q40,45 70,55 Q100,68 118,50",
      "M10,80 Q45,58 72,65 Q105,75 120,60",
    ];
    return (
      <div className="h-full flex items-center justify-center p-2">
        <svg width="120" height="100" viewBox="0 0 130 100" fill="none">
          {lines.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke={`rgba(255,255,255,${0.15 + i * 0.06})`}
              strokeWidth="1.2"
              fill="none"
            />
          ))}
        </svg>
      </div>
    );
  }

  if (v === "cross") {
    return (
      <div className="h-full flex items-center justify-center">
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
          <rect x="14" y="0" width="4" height="44" rx="2" fill="rgba(255,255,255,0.35)" />
          <rect x="0" y="12" width="32" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
        </svg>
      </div>
    );
  }

  if (v === "waveform") {
    const heights = [8, 14, 22, 18, 30, 26, 18, 34, 28, 20, 38, 30, 22, 28, 20, 14, 24, 18, 12, 8];
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="flex items-center gap-[2px]">
          {heights.map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                background: `rgba(255,255,255,${0.15 + (h / 38) * 0.5})`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function Wunderkammer() {
  const [hovered, setHovered] = useState<string | null>(null);

  const hoveredArtifact = artifacts.find((a) => a.id === hovered) ?? null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 38,
              color: "rgba(255,255,255,0.88)",
              letterSpacing: "-0.02em",
              marginBottom: 10,
            }}
          >
            Wunderkammer
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
            A cabinet of things that made me. Hover to read.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: 130,
            gap: 10,
          }}
        >
          {artifacts.map((artifact, i) => {
            const isHovered = hovered === artifact.id;
            const colSpan =
              artifact.size === "wide" ? 2
              : artifact.size === "tall" ? 1
              : 1;
            const rowSpan = artifact.size === "tall" ? 2 : 1;

            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.45 }}
                style={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`,
                  position: "relative",
                  transform: `rotate(${artifact.rotation}deg)`,
                  cursor: "default",
                }}
                onMouseEnter={() => setHovered(artifact.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Card */}
                <motion.div
                  animate={{
                    scale: isHovered ? 1.025 : 1,
                    rotate: isHovered ? 0 : artifact.rotation,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.04)",
                    border: isHovered
                      ? "1px solid rgba(255,255,255,0.18)"
                      : "1px solid rgba(255,255,255,0.07)",
                    position: "relative",
                    transform: `rotate(${artifact.rotation}deg)`,
                    boxShadow: isHovered
                      ? "0 8px 32px rgba(0,0,0,0.5)"
                      : "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Visual layer */}
                  <div style={{ height: "100%", opacity: isHovered ? 0.25 : 1, transition: "opacity 0.2s" }}>
                    <ArtifactVisual artifact={artifact} />
                  </div>

                  {/* Reveal layer */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          padding: "14px 16px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
                            {artifact.category}
                          </p>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                            {artifact.note}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif" }}>
                            {artifact.label}
                          </p>
                          {artifact.sub && (
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                              {artifact.sub}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          textAlign: "center",
          marginTop: 60,
          fontSize: 11,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.1em",
        }}
      >
        Things accumulate. Some on purpose.
      </motion.p>
    </div>
  );
}
