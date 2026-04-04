import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";

// Key → note mapping (two octaves, standard QWERTY piano layout)
const KEY_MAP: Record<string, string> = {
  a: "C4", w: "C#4", s: "D4", e: "D#4", d: "E4",
  f: "F4", t: "F#4", g: "G4", y: "G#4", h: "A4",
  u: "A#4", j: "B4", k: "C5", o: "C#5", l: "D5",
  p: "D#5", ";": "E5",
};

const WHITE_KEYS = [
  { note: "C4", key: "a" }, { note: "D4", key: "s" }, { note: "E4", key: "d" },
  { note: "F4", key: "f" }, { note: "G4", key: "g" }, { note: "A4", key: "h" },
  { note: "B4", key: "j" }, { note: "C5", key: "k" }, { note: "D5", key: "l" },
  { note: "E5", key: ";" },
];

const BLACK_KEYS = [
  { note: "C#4", key: "w", position: 1 },
  { note: "D#4", key: "e", position: 2 },
  { note: "F#4", key: "t", position: 4 },
  { note: "G#4", key: "y", position: 5 },
  { note: "A#4", key: "u", position: 6 },
  { note: "C#5", key: "o", position: 8 },
  { note: "D#5", key: "p", position: 9 },
];

export function KeyboardPiano() {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  // Build synth once
  useEffect(() => {
    const reverb = new Tone.Reverb({ decay: 2.8, wet: 0.28 }).toDestination();
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle8" },
      envelope: { attack: 0.003, decay: 1.6, sustain: 0.08, release: 1.8 },
      volume: -10,
    }).connect(reverb);
    synthRef.current = synth;
    reverbRef.current = reverb;
    return () => { synth.dispose(); reverb.dispose(); };
  }, []);

  const playNote = useCallback(async (note: string) => {
    if (!synthRef.current) return;
    await Tone.start();
    synthRef.current.triggerAttackRelease(note, "2n");
    setPressed(p => new Set(p).add(note));
    setTimeout(() => setPressed(p => { const n = new Set(p); n.delete(note); return n; }), 220);
  }, []);

  // Global P key to toggle, other keys play notes
  useEffect(() => {
    const down = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "P" && !open) { setOpen(true); return; }
      if (e.key === "Escape" && open) { setOpen(false); return; }
      if (!open) return;

      const note = KEY_MAP[e.key.toLowerCase()];
      if (note) playNote(note);
    };
    const openFromTerminal = () => setOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("open-piano", openFromTerminal);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("open-piano", openFromTerminal);
    };
  }, [open, playNote]);

  const WHITE_W = 52;
  const BLACK_W = 32;
  const WHITE_H = 160;
  const BLACK_H = 100;
  const totalW = WHITE_KEYS.length * WHITE_W;

  // Scale piano to fit viewport on mobile
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const upd = () => setScale(Math.min(1, (window.innerWidth - 16) / totalW));
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, [totalW]);

  // Touch handler factory for keys
  const touchPlay = useCallback((note: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    playNote(note);
  }, [playNote]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — click outside to close */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-1/2 z-50 flex flex-col items-center"
            style={{ translateX: "-50%", transformOrigin: "bottom center", scale }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between w-full px-6 py-3 rounded-t-2xl"
              style={{
                background: "#111",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                width: totalW + 32,
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.18em" }} className="uppercase">
                Play
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: "0.1em", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                className="uppercase"
              >
                ✕ close
              </button>
            </div>

            {/* Keys container */}
            <div
              style={{
                position: "relative",
                width: totalW,
                height: WHITE_H,
                background: "#0a0a0a",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                overflow: "hidden",
                padding: "0 0 12px 0",
                userSelect: "none",
              }}
            >
              {/* White keys */}
              {WHITE_KEYS.map((k, i) => {
                const isPressed = pressed.has(k.note);
                return (
                  <div
                    key={k.note}
                    onMouseDown={() => playNote(k.note)}
                    onTouchStart={touchPlay(k.note)}
                    style={{
                      position: "absolute",
                      left: i * WHITE_W + 1,
                      top: 0,
                      width: WHITE_W - 2,
                      height: WHITE_H - 12,
                      background: isPressed
                        ? "rgba(200,200,220,0.85)"
                        : "rgba(245,243,238,0.96)",
                      borderRadius: "0 0 8px 8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingBottom: 10,
                      boxShadow: isPressed
                        ? "inset 0 -2px 4px rgba(0,0,0,0.2)"
                        : "inset 0 -4px 6px rgba(0,0,0,0.15), 0 2px 0 rgba(0,0,0,0.4)",
                      transform: isPressed ? "scaleY(0.98)" : "scaleY(1)",
                      transformOrigin: "top",
                      transition: "background 0.08s, transform 0.06s",
                      zIndex: 1,
                    }}
                  >
                    <span style={{ fontSize: 9, color: "rgba(0,0,0,0.3)", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                      {k.key.toUpperCase()}
                    </span>
                  </div>
                );
              })}

              {/* Black keys */}
              {BLACK_KEYS.map((k) => {
                const isPressed = pressed.has(k.note);
                return (
                  <div
                    key={k.note}
                    onMouseDown={(e) => { e.stopPropagation(); playNote(k.note); }}
                    onTouchStart={(e) => { e.stopPropagation(); touchPlay(k.note)(e); }}
                    style={{
                      position: "absolute",
                      left: k.position * WHITE_W - BLACK_W / 2,
                      top: 0,
                      width: BLACK_W,
                      height: BLACK_H,
                      background: isPressed
                        ? "#3a3a4a"
                        : "linear-gradient(to bottom, #1a1a1a, #111)",
                      borderRadius: "0 0 6px 6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: 7,
                      boxShadow: isPressed
                        ? "0 2px 4px rgba(0,0,0,0.8)"
                        : "0 4px 8px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
                      transform: isPressed ? "scaleY(0.97)" : "scaleY(1)",
                      transformOrigin: "top",
                      transition: "background 0.06s, transform 0.05s",
                      zIndex: 2,
                    }}
                  >
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                      {k.key.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
