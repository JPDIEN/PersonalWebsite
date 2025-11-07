import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { motion } from "framer-motion";

interface PianoKeyProps {
  note: string;
  isBlack?: boolean;
  index: number;
  onPlay?: (note: string) => void;
  isMiddleC?: boolean;
  actionHint?: string;
}

function PianoKey({ note, isBlack = false, index, onPlay, isMiddleC = false, actionHint }: PianoKeyProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const synthRef = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.1,
        release: 0.8,
      },
    }).toDestination();
    synthRef.current.volume.value = -12;

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const playNote = async () => {
    if (synthRef.current && Tone.context.state !== "running") {
      await Tone.start();
    }
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, "8n");
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onPlay?.(note);
    }
  };

  const baseWhiteKeyClass = "relative h-32 md:h-40 flex-1 rounded-b-md transition-all duration-150 cursor-pointer select-none";
  const baseBlackKeyClass = "absolute h-20 md:h-24 w-8 md:w-10 rounded-b-md transition-all duration-150 cursor-pointer select-none z-10";

  return isBlack ? (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`${baseBlackKeyClass} ${
        isPressed
          ? "bg-gray-700 shadow-inner scale-98"
          : "bg-gray-900 shadow-lg hover:bg-gray-800"
      }`}
      style={{ left: "-1rem" }}
      onClick={playNote}
      onMouseEnter={() => {
        if (!isPressed) {
          setIsPressed(true);
          setShowHint(true);
        }
      }}
      onMouseLeave={() => {
        setIsPressed(false);
        setShowHint(false);
      }}
      data-testid={`piano-key-${note}`}
      role="button"
      aria-label={`Piano key ${note}${actionHint ? ` - ${actionHint}` : ""}`}
    >
      <div className="absolute inset-0 rounded-b-md bg-gradient-to-b from-gray-800 to-gray-900 opacity-50" />
      {showHint && actionHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
        >
          {actionHint}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
        </motion.div>
      )}
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`${baseWhiteKeyClass} relative ${
        isPressed
          ? "bg-gray-100 shadow-inner translate-y-1"
          : isMiddleC
          ? "bg-primary/10 border-2 border-primary shadow-md hover:shadow-lg hover:-translate-y-1"
          : "bg-white border border-gray-300 shadow-md hover:shadow-lg hover:-translate-y-1"
      }`}
      onClick={playNote}
      onMouseEnter={() => {
        if (!isPressed) {
          setIsPressed(true);
          setShowHint(true);
        }
      }}
      onMouseLeave={() => {
        setIsPressed(false);
        setShowHint(false);
      }}
      data-testid={`piano-key-${note}`}
      role="button"
      aria-label={`Piano key ${note}${isMiddleC ? " (Middle C)" : ""}${actionHint ? ` - ${actionHint}` : ""}`}
    >
      <div className="absolute inset-0 rounded-b-md bg-gradient-to-b from-white/50 to-transparent" />
      {isMiddleC && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-primary"
        >
          C
        </motion.div>
      )}
      {showHint && actionHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none"
        >
          {actionHint}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
        </motion.div>
      )}
    </motion.div>
  );
}

interface PianoKeyboardProps {
  onNotePlay?: (note: string) => void;
  octaves?: number;
  keyHints?: Record<string, string>;
}

export function PianoKeyboard({ onNotePlay, octaves = 2, keyHints = {} }: PianoKeyboardProps) {
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackNotePositions: Record<string, number> = {
    "C#": 0,
    "D#": 1,
    "F#": 3,
    "G#": 4,
    "A#": 5,
  };

  const generateKeys = () => {
    const keys: Array<{ note: string; isBlack: boolean; position: number; isMiddleC: boolean }> = [];
    const startOctave = 4;

    for (let octave = 0; octave < octaves; octave++) {
      whiteNotes.forEach((note, idx) => {
        const fullNote = `${note}${startOctave + octave}`;
        const position = octave * 7 + idx;
        const isMiddleC = fullNote === "C4";
        keys.push({ note: fullNote, isBlack: false, position, isMiddleC });
      });
    }

    return keys;
  };

  const generateBlackKeys = () => {
    const blackKeys: Array<{ note: string; position: number }> = [];
    const startOctave = 4;

    for (let octave = 0; octave < octaves; octave++) {
      Object.entries(blackNotePositions).forEach(([note, offset]) => {
        const fullNote = `${note}${startOctave + octave}`;
        const position = octave * 7 + offset;
        blackKeys.push({ note: fullNote, position });
      });
    }

    return blackKeys;
  };

  const whiteKeys = generateKeys();
  const blackKeys = generateBlackKeys();

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4" data-testid="piano-keyboard">
      <div className="relative flex gap-0.5">
        {whiteKeys.map((key, index) => (
          <PianoKey
            key={key.note}
            note={key.note}
            index={index}
            onPlay={onNotePlay}
            isMiddleC={key.isMiddleC}
            actionHint={keyHints[key.note]}
          />
        ))}
        {blackKeys.map((key, index) => (
          <div
            key={key.note}
            className="absolute"
            style={{
              left: `calc(${(key.position / whiteKeys.length) * 100}% + ${((key.position + 1) / whiteKeys.length) * 100 * 0.35}%)`,
            }}
          >
            <PianoKey
              note={key.note}
              isBlack
              index={index + whiteKeys.length}
              onPlay={onNotePlay}
              actionHint={keyHints[key.note]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
