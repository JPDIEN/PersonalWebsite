"""CSV ingestion with flexible header mapping and dedupe-on-merge."""

from __future__ import annotations

import csv
import json
import sqlite3
from dataclasses import dataclass, field

from .db import add_event, utcnow
from .normalize import norm_domain, norm_name, norm_text

# Canonical field -> accepted header aliases (compared case/space-insensitively).
HEADER_ALIASES: dict[str, list[str]] = {
    "name": ["name", "company", "company name", "startup", "organization", "org"],
    "url": ["website", "url", "domain", "site", "homepage", "link", "web"],
    "description": ["description", "blurb", "summary", "about", "pitch",
                    "one liner", "one-liner", "oneliner", "tagline"],
    "sector": ["sector", "industry", "category", "vertical", "market", "tags", "space"],
    "round": ["stage", "round", "funding stage", "last round", "funding round"],
    "location": ["location", "city", "hq", "geography", "region", "country",
                 "headquarters"],
    "founders": ["founders", "founder", "ceo", "team", "founder names"],
    "raise_amount": ["raise", "amount", "raising", "ask", "round size", "raise amount",
                     "amount raising"],
    "source": ["source", "referred by", "referrer", "via", "origin"],
    "email": ["email", "contact", "contact email", "founder email"],
}

# Fields merged into an existing deal only when the existing value is empty.
_FILLABLE = ["description", "sector", "round", "location", "founders",
             "raise_amount", "url", "source"]


@dataclass
class IngestResult:
    added: int = 0
    merged: int = 0
    skipped: int = 0
    unmapped_headers: list[str] = field(default_factory=list)

    def summary(self) -> str:
        parts = [f"added {self.added}", f"merged {self.merged}", f"skipped {self.skipped}"]
        line = ", ".join(parts)
        if self.unmapped_headers:
            line += f"  (unmapped columns kept in 'extra': {', '.join(self.unmapped_headers)})"
        return line


def _canon_header(h: str) -> str:
    return " ".join((h or "").strip().lower().replace("_", " ").replace("-", " ").split())


def map_headers(headers: list[str]) -> tuple[dict[str, str], list[str]]:
    """Map raw CSV headers to canonical fields. Returns (raw->canonical, unmapped raws)."""
    alias_lookup = {
        _canon_header(alias): canon
        for canon, aliases in HEADER_ALIASES.items()
        for alias in aliases
    }
    mapping: dict[str, str] = {}
    unmapped: list[str] = []
    claimed: set[str] = set()
    for raw in headers:
        canon = alias_lookup.get(_canon_header(raw))
        if canon and canon not in claimed:
            mapping[raw] = canon
            claimed.add(canon)
        else:
            unmapped.append(raw)
    return mapping, unmapped


def _find_existing(conn: sqlite3.Connection, domain: str | None, nname: str):
    if domain:
        row = conn.execute("SELECT * FROM deals WHERE domain = ?", (domain,)).fetchone()
        if row:
            return row
    return conn.execute("SELECT * FROM deals WHERE norm_name = ?", (nname,)).fetchone()


def ingest_rows(conn: sqlite3.Connection, rows: list[dict], headers: list[str],
                default_source: str = "") -> IngestResult:
    mapping, unmapped = map_headers(headers)
    result = IngestResult(unmapped_headers=[h for h in unmapped if h])
    now = utcnow()

    for raw_row in rows:
        rec = {canon: norm_text(raw_row.get(raw)) for raw, canon in mapping.items()}
        extra = {h: norm_text(raw_row.get(h)) for h in unmapped
                 if h and norm_text(raw_row.get(h))}

        name = rec.get("name", "")
        if not name:
            result.skipped += 1
            continue

        domain = norm_domain(rec.get("url", "")) or norm_domain(rec.get("email", ""))
        nname = norm_name(name)
        rec.setdefault("source", "")
        if not rec["source"]:
            rec["source"] = default_source

        existing = _find_existing(conn, domain, nname)
        if existing:
            updates: dict[str, str] = {}
            for f in _FILLABLE:
                if rec.get(f) and not existing[f]:
                    updates[f] = rec[f]
            if domain and not existing["domain"]:
                updates["domain"] = domain
            merged_extra = dict(json.loads(existing["extra"] or "{}"))
            for k, v in extra.items():
                merged_extra.setdefault(k, v)
            if merged_extra != json.loads(existing["extra"] or "{}"):
                updates["extra"] = json.dumps(merged_extra)
            if updates:
                sets = ", ".join(f"{k} = ?" for k in updates)
                conn.execute(
                    f"UPDATE deals SET {sets}, updated_at = ? WHERE id = ?",
                    [*updates.values(), now, existing["id"]],
                )
            add_event(conn, existing["id"], "seen_again",
                      f"re-ingested from {rec['source'] or 'csv'}")
            result.merged += 1
        else:
            cur = conn.execute(
                """INSERT INTO deals (name, norm_name, domain, description, sector,
                       round, location, founders, raise_amount, url, source, extra,
                       created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (name, nname, domain, rec.get("description", ""), rec.get("sector", ""),
                 rec.get("round", ""), rec.get("location", ""), rec.get("founders", ""),
                 rec.get("raise_amount", ""), rec.get("url", ""), rec["source"],
                 json.dumps(extra), now, now),
            )
            add_event(conn, cur.lastrowid, "created",
                      f"ingested from {rec['source'] or 'csv'}")
            result.added += 1

    conn.commit()
    return result


def ingest_csv(conn: sqlite3.Connection, path: str, default_source: str = "") -> IngestResult:
    with open(path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        headers = reader.fieldnames or []
        rows = list(reader)
    if not headers:
        raise ValueError(f"{path}: empty file or no header row")
    return ingest_rows(conn, rows, headers, default_source=default_source)
