import { useState, useEffect, useRef, useCallback } from "react";
// Note: useState is used for pressedKeys and hoveredKey
import * as Tone from "tone";

interface PianoKeyboardProps {
  onNotePlay?: (note: string) => void;
  octaves?: number;
  keyHints?: Record<string, string>;
}

const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];

// Black key positions within an octave: which white-key gap they sit in (0 = after white key 0)
const BLACK_KEY_SLOTS = [
  { name: "C#", slot: 0 },
  { name: "D#", slot: 1 },
  { name: "F#", slot: 3 },
  { name: "G#", slot: 4 },
  { name: "A#", slot: 5 },
];

export function PianoKeyboard({ onNotePlay, octaves = 2, keyHints = {} }: PianoKeyboardProps) {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    // Connect directly to destination first so sound works immediately
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle8" },
      envelope: {
        attack: 0.002,
        decay: 1.6,
        sustain: 0.06,
        release: 1.8,
      },
    }).toDestination();

    synth.volume.value = -10;
    synthRef.current = synth;

    // Add reverb only after it finishes generating its impulse response
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).toDestination();
    reverb.ready.then(() => {
      if (synthRef.current) {
        synthRef.current.disconnect();
        synthRef.current.connect(reverb);
      }
    });

    return () => {
      synth.dispose();
      reverb.dispose();
    };
  }, []);

  const pressKey = useCallback(async (note: string) => {
    try {
      if (Tone.context.state !== "running") await Tone.start();
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(note, "1.5n");
      }
    } catch (_) {}

    setPressedKeys(prev => new Set(prev).add(note));
    setTimeout(() => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 300);

    onNotePlay?.(note);
  }, [onNotePlay]);

  // Build key arrays
  const whiteKeys: string[] = [];
  const blackKeys: { note: string; afterIndex: number }[] = [];

  for (let o = 0; o < octaves; o++) {
    WHITE_NOTES.forEach(n => whiteKeys.push(`${n}${4 + o}`));
    BLACK_KEY_SLOTS.forEach(({ name, slot }) => {
      blackKeys.push({ note: `${name}${4 + o}`, afterIndex: o * 7 + slot });
    });
  }

  const N = whiteKeys.length;
  // White key width as % of total keyboard
  const wkw = 100 / N;
  // Black key width: 58% of white key
  const bkw = wkw * 0.58;

  return (
    <div
      className="relative select-none mx-auto"
      style={{ maxWidth: 900, padding: "0 20px" }}
      onMouseLeave={() => { isDragging.current = false; }}
    >
      {/* Keyboard housing */}
      <div
        style={{
          background: "linear-gradient(180deg, #1a0f08 0%, #0e0806 100%)",
          padding: "14px 10px 0",
          borderRadius: "4px 4px 14px 14px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
        onMouseDown={() => { isDragging.current = true; }}
        onMouseUp={() => { isDragging.current = false; }}
      >
        {/* Keys container */}
        <div className="relative" style={{ display: "flex", gap: 1.5 }}>

          {/* White keys */}
          {whiteKeys.map((note, i) => {
            const pressed = pressedKeys.has(note);
            const hovered = hoveredKey === note;
            const hint = keyHints[note];

            return (
              <div
                key={note}
                data-testid={`piano-key-${note}`}
                className="relative flex-1 cursor-pointer"
                style={{
                  height: 156,
                  borderRadius: "0 0 7px 7px",
                  background: pressed
                    ? "linear-gradient(180deg, #ddd8cc 0%, #c8c0b0 100%)"
                    : hovered
                    ? "linear-gradient(180deg, #fffef8 0%, #f2ede2 100%)"
                    : "linear-gradient(180deg, #fffefa 0%, #f8f3ea 55%, #ece6d8 100%)",
                  boxShadow: pressed
                    ? "inset 0 -1px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3), 1px 0 0 rgba(0,0,0,0.1), -1px 0 0 rgba(0,0,0,0.05)"
                    : "inset 0 -3px 6px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.3), 1px 0 0 rgba(0,0,0,0.1), -1px 0 0 rgba(0,0,0,0.05)",
                  transform: pressed ? "translateY(4px) rotateX(1.5deg)" : "translateY(0) rotateX(0deg)",
                  transformOrigin: "top center",
                  transition: "transform 60ms ease, box-shadow 60ms ease, background 80ms ease",
                  borderLeft: "1px solid rgba(180,170,155,0.5)",
                  borderRight: "1px solid rgba(180,170,155,0.4)",
                  borderBottom: "3px solid rgba(160,148,128,0.8)",
                  zIndex: 1,
                  outline: "none",
                }}
                onMouseDown={() => pressKey(note)}
                onMouseEnter={() => {
                  setHoveredKey(note);
                  if (isDragging.current) pressKey(note);
                }}
                onMouseLeave={() => setHoveredKey(null)}
                onTouchStart={e => { e.preventDefault(); pressKey(note); }}
              >
                {/* Ivory sheen */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "8%",
                  width: "28%",
                  height: "45%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
                  borderRadius: "0 0 3px 3px",
                  pointerEvents: "none",
                }} />

                {hint && hovered && (
                  <div style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.65)",
                    color: "white",
                    fontSize: 9,
                    fontFamily: "sans-serif",
                    padding: "2px 6px",
                    borderRadius: 3,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    letterSpacing: "0.06em",
                  }}>
                    {hint}
                  </div>
                )}
              </div>
            );
          })}

          {/* Black keys — absolutely positioned over the white key row */}
          {blackKeys.map(({ note, afterIndex }) => {
            const pressed = pressedKeys.has(note);
            const hovered = hoveredKey === note;
            const hint = keyHints[note];

            // Center the black key at the gap between white keys
            // afterIndex is the 0-based index of the white key it follows
            // The gap is at position (afterIndex + 1) white key widths from left
            // Account for 1.5px gaps between keys
            const gapOffset = (afterIndex + 1) * 1.5;
            const leftExpr = `calc(${(afterIndex + 1) * wkw}% + ${gapOffset}px - ${bkw / 2}%)`;

            return (
              <div
                key={note}
                data-testid={`piano-key-${note}`}
                className="absolute cursor-pointer"
                style={{
                  top: 0,
                  left: leftExpr,
                  width: `${bkw}%`,
                  height: 98,
                  borderRadius: "0 0 6px 6px",
                  background: pressed
                    ? "linear-gradient(180deg, #606060 0%, #303030 30%, #181818 100%)"
                    : hovered
                    ? "linear-gradient(180deg, #585858 0%, #282828 30%, #141414 100%)"
                    : "linear-gradient(180deg, #484848 0%, #1c1c1c 35%, #080808 100%)",
                  boxShadow: pressed
                    ? "0 2px 8px rgba(0,0,0,0.9), inset 0 2px 5px rgba(0,0,0,0.6)"
                    : "3px 8px 16px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.12), -1px 0 3px rgba(0,0,0,0.6)",
                  transform: pressed ? "translateY(5px)" : "translateY(0)",
                  transformOrigin: "top center",
                  transition: "transform 55ms ease, box-shadow 55ms ease, background 70ms ease",
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                  borderRight: "1px solid rgba(0,0,0,0.6)",
                  borderBottom: "2px solid rgba(0,0,0,0.8)",
                  zIndex: 10,
                  outline: "none",
                }}
                onMouseDown={e => { e.stopPropagation(); pressKey(note); }}
                onMouseEnter={() => {
                  setHoveredKey(note);
                  if (isDragging.current) pressKey(note);
                }}
                onMouseLeave={() => setHoveredKey(null)}
                onTouchStart={e => { e.preventDefault(); pressKey(note); }}
              >
                {/* Gloss highlight */}
                <div style={{
                  position: "absolute",
                  top: 3,
                  left: "18%",
                  width: "32%",
                  height: "40%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)",
                  borderRadius: "0 0 3px 3px",
                  pointerEvents: "none",
                }} />

                {hint && hovered && (
                  <div style={{
                    position: "absolute",
                    bottom: -24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    fontSize: 8,
                    fontFamily: "sans-serif",
                    padding: "2px 5px",
                    borderRadius: 3,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}>
                    {hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom rail */}
        <div style={{
          height: 14,
          marginTop: 0,
          background: "linear-gradient(180deg, #0a0604 0%, #050302 100%)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        }} />
      </div>

    </div>
  );
}
