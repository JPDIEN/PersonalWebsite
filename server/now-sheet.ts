export type NowItem = { title: string; sub: string };
export type NowSection = { label: string; items: NowItem[] };
export type NowData = { sections: NowSection[]; lastUpdated: string };

export function parseTsvNow(tsv: string): NowData {
  const lines = tsv.split("\n").filter((l) => l.trim());
  const sectionMap = new Map<string, NowItem[]>();
  let lastUpdated = "";

  // Skip header row (section, title, sub)
  for (const line of lines.slice(1)) {
    const [section = "", title = "", sub = ""] = line
      .split("\t")
      .map((c) => c.trim());
    if (!section || !title) continue;

    if (section === "_updated") {
      lastUpdated = title;
      continue;
    }

    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section)!.push({ title, sub });
  }

  const sections = Array.from(sectionMap.entries()).map(([label, items]) => ({
    label,
    items,
  }));

  return { sections, lastUpdated };
}
