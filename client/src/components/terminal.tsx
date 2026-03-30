import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const COMMANDS: Record<string, { description: string; action?: string }> = {
  help:     { description: "list available commands" },
  about:    { description: "who I am",              action: "/about" },
  work:     { description: "what I've done",         action: "/experience" },
  writing:  { description: "things I've written",    action: "/journal" },
  books:    { description: "what I'm reading",       action: "/about#books" },
  contact:  { description: "get in touch",           action: "/contact" },
  universe: { description: "open the constellation", action: "/universe" },
  clear:    { description: "clear the terminal" },
};

type Line = { type: "input" | "output" | "error"; text: string };

const BOOT_LINES = [
  "joseph-diener.com v1.0",
  'type "help" for available commands',
];

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>(
    BOOT_LINES.map((t) => ({ type: "output", text: t }))
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Open on "/" keypress (when not in an input field)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Scroll to bottom on new lines
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const push = useCallback((type: Line["type"], text: string) => {
    setLines((prev) => [...prev, { type, text }]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      push("input", `> ${raw.trim()}`);
      setHistory((h) => [raw.trim(), ...h]);
      setHistoryIdx(-1);

      if (cmd === "clear") {
        setLines(BOOT_LINES.map((t) => ({ type: "output", text: t })));
        return;
      }

      if (cmd === "help") {
        push("output", "");
        Object.entries(COMMANDS).forEach(([name, { description }]) => {
          push("output", `  ${name.padEnd(10)} ${description}`);
        });
        push("output", "");
        return;
      }

      const match = COMMANDS[cmd];
      if (match?.action) {
        push("output", `navigating to ${match.action}…`);
        setTimeout(() => {
          setOpen(false);
          if (match.action!.includes("#")) {
            const [path, hash] = match.action!.split("#");
            navigate(path);
            setTimeout(() => {
              document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
            }, 400);
          } else {
            navigate(match.action!);
          }
        }, 300);
        return;
      }

      push("error", `command not found: ${cmd}. type "help" for options.`);
    },
    [push, navigate]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : history[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Terminal panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] mx-auto max-w-2xl px-4 pb-6"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: "rgba(10,10,10,0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="h-3 w-3 rounded-full transition-opacity hover:opacity-70"
                  style={{ background: "#ff5f57" }}
                />
                <div className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                <span
                  className="ml-2 text-xs font-mono"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  joseph-diener — terminal
                </span>
              </div>

              {/* Output */}
              <div className="px-4 py-3 font-mono text-sm max-h-56 overflow-y-auto">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="leading-6"
                    style={{
                      color:
                        line.type === "input"
                          ? "rgba(255,255,255,0.9)"
                          : line.type === "error"
                          ? "#ff6b6b"
                          : "rgba(255,255,255,0.45)",
                      whiteSpace: "pre",
                    }}
                  >
                    {line.text}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div
                className="flex items-center gap-2 px-4 py-3 font-mono text-sm"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{">"}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: "rgba(255,255,255,0.9)", caretColor: "white" }}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="type a command…"
                />
              </div>
            </div>

            <p
              className="text-center mt-2 text-xs font-mono"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              esc to close · tab to complete · ↑↓ history
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
