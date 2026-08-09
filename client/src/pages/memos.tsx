import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Search } from "lucide-react";
import { memos, kindLabels, kindDescriptions, type Memo, type MemoKind } from "@/lib/memos-data";

const filterOptions: Array<{ value: MemoKind | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "memo", label: "Internal memos" },
  { value: "notes", label: "Investment notes" },
  { value: "thesis", label: "Theses" },
  { value: "classic", label: "Classics" },
];

const kindOrder: MemoKind[] = ["memo", "notes", "thesis", "classic"];

const sectionTitles: Record<MemoKind, string> = {
  memo: "Internal memos",
  notes: "Investment notes",
  thesis: "Theses",
  classic: "Classics",
};

function MemoCard({ memo, index }: { memo: Memo; index: number }) {
  const meta = [memo.stage, memo.year].filter(Boolean).join(" · ");
  return (
    <motion.a
      href={memo.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03, duration: 0.35 }}
      className="group flex flex-col justify-between rounded-lg border border-border p-5 transition-colors duration-200 hover:border-foreground"
      style={{ background: "hsl(var(--background) / 0.55)" }}
      data-testid={`memo-card-${memo.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {memo.company}
          </p>
          <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {memo.firm}
          {meta && <span className="opacity-70"> — {meta}</span>}
        </p>
        {memo.note && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">{memo.note}</p>
        )}
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {kindLabels[memo.kind]}
      </p>
    </motion.a>
  );
}

export default function Memos() {
  const [filter, setFilter] = useState<MemoKind | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memos.filter((m) => {
      if (filter !== "all" && m.kind !== filter) return false;
      if (!q) return true;
      return (
        m.company.toLowerCase().includes(q) ||
        m.firm.toLowerCase().includes(q) ||
        (m.stage ?? "").toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const featured = useMemo(
    () => (filter === "all" && !query.trim() ? memos.filter((m) => m.featured) : []),
    [filter, query],
  );

  const sections = useMemo(
    () =>
      kindOrder
        .map((kind) => ({ kind, items: filtered.filter((m) => m.kind === kind) }))
        .filter((s) => s.items.length > 0),
    [filtered],
  );

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-5xl font-bold mb-4 tracking-tight">Memos</h1>
          <p className="text-muted-foreground text-lg max-w-[640px]">
            A library of {memos.length} venture capital investment memos, investment
            notes, and theses on top companies — the actual documents investors wrote
            when they decided to write the check. Collected from firm archives and
            public collections.
          </p>

          {/* Controls */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className="rounded-full border px-3.5 py-1.5 text-xs tracking-wide transition-colors"
                  style={{
                    borderColor:
                      filter === opt.value ? "hsl(var(--foreground))" : "hsl(var(--border))",
                    color:
                      filter === opt.value
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))",
                  }}
                  data-testid={`filter-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Company or firm…"
                className="w-full rounded-full border border-border bg-transparent py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors"
                data-testid="memo-search"
              />
            </div>
          </div>

          {/* Featured row */}
          {featured.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-2xl font-semibold mb-1">Start here</h2>
              <p className="text-sm text-muted-foreground mb-6">
                The legendary ones — YouTube, Shopify, Snap, Coinbase.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((m, i) => (
                  <MemoCard key={m.href + m.company} memo={m} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.kind} className="mt-14">
              <h2 className="font-serif text-2xl font-semibold mb-1">
                {sectionTitles[section.kind]}
                <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
                  {section.items.length}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {kindDescriptions[section.kind]}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((m, i) => (
                  <MemoCard key={m.href + m.company + (m.stage ?? "")} memo={m} index={i} />
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="mt-16 text-muted-foreground">Nothing matches — try another search.</p>
          )}

          <p className="mt-16 text-xs leading-relaxed text-muted-foreground/70 max-w-[640px]">
            Sources: firm archives (Bessemer, Blackbird, Greylock, Sequoia, USV, a16z,
            Multicoin, Root Ventures' public GitHub repo, Weekend Fund) and public
            collections (Alexander Jarvis's memo collection, greatmemos.com). All
            documents belong to their authors; links open the original source.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
