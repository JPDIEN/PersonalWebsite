import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseTsvNow, type NowData } from "../server/now-sheet";

// Module-level cache (lives for the duration of one function instance)
let cache: { data: NowData; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.json(cache.data);
  }

  const sheetId = process.env.NOW_SHEET_ID;
  if (!sheetId) {
    return res.status(503).json({ error: "NOW_SHEET_ID not configured" });
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);

    const tsv = await response.text();
    const data = parseTsvNow(tsv);

    cache = { data, fetchedAt: Date.now() };
    return res.json(data);
  } catch (err) {
    console.error("Failed to fetch now data from Google Sheets:", err);
    return res.status(500).json({ error: "Failed to fetch now data" });
  }
}
