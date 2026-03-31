import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type NowEntry = { section: string; item: string; value: string };

const FALLBACK: NowEntry[] = [
  { section: "Currently", item: "Reading", value: "Man's Search for Meaning" },
  { section: "Currently", item: "Working on", value: "Notre Dame Venture Capital" },
  { section: "Currently", item: "Based at", value: "University of Notre Dame" },
];

function parseCSV(csv: string): NowEntry[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  return lines
    .slice(1) // skip header
    .map((line) => {
      // Handle quoted fields (Google Sheets wraps values with commas in quotes)
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
          fields.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      fields.push(current.trim());
      const [section, item, value] = fields;
      return section && item && value ? { section, item, value } : null;
    })
    .filter(Boolean) as NowEntry[];
}

function groupBySection(entries: NowEntry[]): Record<string, NowEntry[]> {
  return entries.reduce<Record<string, NowEntry[]>>((acc, entry) => {
    (acc[entry.section] ??= []).push(entry);
    return acc;
  }, {});
}

function useNowData() {
  const [data, setData] = useState<NowEntry[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = import.meta.env.VITE_NOW_SHEET_CSV_URL;
    if (!url) {
      setLoading(false);
      return;
    }
    fetch(url)
      .then((r) => r.text())
      .then((csv) => {
        const parsed = parseCSV(csv);
        if (parsed.length > 0) setData(parsed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export default function Now() {
  const { data, loading } = useNowData();
  const sections = groupBySection(data);

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <h1 className="font-serif text-5xl font-bold tracking-tight mb-3">Now</h1>
            <p className="text-sm text-muted-foreground">
              What I'm up to at the moment.{" "}
              <span className="italic">Last updated whenever I remember to.</span>
            </p>
          </div>

          {loading ? (
            <div className="space-y-10">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="space-y-3">
                    <div className="h-3 w-48 bg-muted rounded" />
                    <div className="h-3 w-40 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(sections).map(([section, entries], si) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: si * 0.08 }}
                >
                  <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
                    {section}
                  </h2>
                  <div className="space-y-5">
                    {entries.map(({ item, value }, ei) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: si * 0.08 + ei * 0.05 }}
                      >
                        <p className="text-xs text-muted-foreground/60 mb-0.5">{item}</p>
                        <p className="text-base font-medium">{value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
