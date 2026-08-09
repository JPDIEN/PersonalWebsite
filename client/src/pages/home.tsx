import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const WORD_STAGGER = 0.055;
const WORD_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const LONG_VERSION_URL =
  "https://outofdistributionthinking.substack.com/p/for-the-ones-who-saw-me-first";

// Shared as "anyone with the link → viewer"; if that ever changes,
// set this back to "" and the phrase falls back to plain text.
const CURIOSITY_DOC_URL =
  "https://docs.google.com/document/d/1HUfrHBi7eUv-_2VVWisEXElHmpSLWcq_kNLXWT8FijA/edit?usp=sharing";

type BioLink = { text: string; href: string; external?: boolean };
type BioSegment = string | BioLink;

const CURIOSITY_PHRASE = "a running doc of what I’m curious about";

const BIO_PARAGRAPHS: { delay: number; segments: BioSegment[] }[] = [
  {
    delay: 0.1,
    segments: [
      "Grew up the oldest of six, homeschooled. Made my own opportunities —",
      { text: "the long version is here", href: LONG_VERSION_URL, external: true },
      ".",
    ],
  },
  {
    delay: 0.55,
    segments: [
      "Now at",
      { text: "Notre Dame", href: "https://www.nd.edu", external: true },
      "studying finance, spending most of my time in the startup and VC world.",
    ],
  },
  {
    delay: 1.05,
    segments: [
      "I play piano, read too many books at once, and keep",
      CURIOSITY_DOC_URL
        ? { text: CURIOSITY_PHRASE, href: CURIOSITY_DOC_URL, external: true }
        : CURIOSITY_PHRASE,
      ". The best ideas show up when you stop looking for them.",
    ],
  },
  {
    delay: 1.55,
    segments: [
      "Say hello on",
      { text: "X", href: "https://x.com/Joseph__Diener", external: true },
      "or by",
      { text: "email", href: "mailto:jdiener2@nd.edu" },
      ". I answer everyone.",
    ],
  },
];

// Merge neighboring plain-text segments so word spacing and punctuation
// ("…curious about" + ". The best…") resolve before any words are split.
function normalizeSegments(segments: BioSegment[]): BioSegment[] {
  return segments.reduce<BioSegment[]>((acc, seg) => {
    const prev = acc[acc.length - 1];
    if (typeof seg === "string" && typeof prev === "string") {
      const joined = /^[.,;:!?]/.test(seg) ? `${prev}${seg}` : `${prev} ${seg}`;
      return [...acc.slice(0, -1), joined];
    }
    return [...acc, seg];
  }, []);
}

function Word({
  delay,
  spacing = "0.28em",
  children,
}: {
  delay: number;
  spacing?: string;
  children: ReactNode;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ delay, duration: 0.5, ease: WORD_EASE }}
      style={{ display: "inline-block", marginRight: spacing }}
    >
      {children}
    </motion.span>
  );
}

// Same word-by-word reveal as before, but segments can be inline links.
// Links keep the stagger rhythm; punctuation after a link stays glued to it.
function BioReveal({
  segments,
  delay,
}: {
  segments: BioSegment[];
  delay: number;
}) {
  const normalized = normalizeSegments(segments);
  const nodes: ReactNode[] = [];
  let wordIndex = 0;
  const at = (n: number) => delay + n * WORD_STAGGER;

  normalized.forEach((seg, s) => {
    if (typeof seg === "string") {
      let text = seg;
      const leadingPunct = s > 0 ? text.match(/^[.,;:!?]+/) : null;
      if (leadingPunct) {
        // Inline (not inline-block) so it can never wrap onto its own line.
        text = text.slice(leadingPunct[0].length).trimStart();
        nodes.push(
          <motion.span
            key={`p${s}`}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: at(wordIndex), duration: 0.5, ease: WORD_EASE }}
            style={{ marginRight: "0.28em" }}
          >
            {leadingPunct[0]}
          </motion.span>
        );
        wordIndex += 1;
      }
      text
        .split(" ")
        .filter(Boolean)
        .forEach((word, w) => {
          nodes.push(
            <Word key={`${s}-${w}`} delay={at(wordIndex)}>
              {word}
            </Word>
          );
          wordIndex += 1;
        });
    } else {
      const words = seg.text.split(" ");
      const next = normalized[s + 1];
      const tight =
        s === normalized.length - 1 ||
        (typeof next === "string" && /^[.,;:!?]/.test(next));
      // The anchor fades in with its first word so the underline never
      // sits on empty space ahead of the reveal.
      nodes.push(
        <motion.a
          key={`a${s}`}
          href={seg.href}
          {...(seg.external
            ? { target: "_blank", rel: "noopener noreferrer", "data-ext": true }
            : {})}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: at(wordIndex), duration: 0.5, ease: WORD_EASE }}
          style={{ marginRight: tight ? 0 : "0.28em" }}
        >
          {words.map((word, w) => (
            <Word key={w} delay={at(wordIndex + w)} spacing="0">
              {word}
              {w < words.length - 1 ? " " : ""}
            </Word>
          ))}
        </motion.a>
      );
      wordIndex += words.length;
    }
  });

  return <>{nodes}</>;
}

export default function Home() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-28 md:pt-0 pb-16">
      <div className="max-w-2xl">

        {/* Name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.22em] uppercase mb-10"
          style={{ color: "var(--muted-foreground)", opacity: 0.72 }}
        >
          Joseph Diener
        </motion.p>

        {/* Bio paragraphs */}
        <div className="bio space-y-5">
          {BIO_PARAGRAPHS.map((para, i) => (
            <p
              key={i}
              className="leading-relaxed"
              style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)" }}
            >
              <BioReveal segments={para.segments} delay={para.delay} />
            </p>
          ))}
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
            style={{ color: "var(--muted-foreground)", opacity: 0.72 }}
          >
            "We must never just exist, but live." — Pier Giorgio Frassati
          </p>
        </motion.div>

      </div>

      {/* Terminal hint — tappable on mobile, keyboard hint on desktop */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.72 }}
        transition={{ delay: 3, duration: 1 }}
        whileHover={{ opacity: 1 }}
        onClick={() => window.dispatchEvent(new CustomEvent("open-terminal"))}
        className="fixed bottom-7 right-8 text-xs font-mono cursor-pointer"
        style={{ color: "var(--muted-foreground)", background: "none", border: "none", padding: 0 }}
        aria-label="Open terminal"
      >
        <span className="hidden sm:inline">press </span>
        <kbd
          className="px-1 py-0.5 rounded text-xs"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          <span className="hidden sm:inline">/</span>
          <span className="sm:hidden">&gt;_</span>
        </kbd>
        <span className="hidden sm:inline"> to explore</span>
        <span className="sm:hidden"> explore</span>
      </motion.button>
    </div>
  );
}
