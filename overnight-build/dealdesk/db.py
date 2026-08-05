"""SQLite storage for DealDesk. One file, no server, no ORM."""

from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone

DEFAULT_DB = "dealdesk.db"

PIPELINE_STAGES = ["inbox", "reviewing", "meeting", "diligence", "invested", "passed"]

_SCHEMA = """
CREATE TABLE IF NOT EXISTS deals (
    id           INTEGER PRIMARY KEY,
    name         TEXT NOT NULL,
    norm_name    TEXT NOT NULL,
    domain       TEXT,
    description  TEXT DEFAULT '',
    sector       TEXT DEFAULT '',
    round        TEXT DEFAULT '',
    location     TEXT DEFAULT '',
    founders     TEXT DEFAULT '',
    raise_amount TEXT DEFAULT '',
    url          TEXT DEFAULT '',
    source       TEXT DEFAULT '',
    extra        TEXT DEFAULT '{}',
    stage        TEXT NOT NULL DEFAULT 'inbox',
    score        REAL,
    score_detail TEXT,
    follow_up    TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_deals_domain ON deals(domain);
CREATE INDEX IF NOT EXISTS idx_deals_norm_name ON deals(norm_name);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);

CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY,
    deal_id    INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY,
    deal_id    INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    detail     TEXT DEFAULT '',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_deal ON events(deal_id);
"""


def utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def resolve_db_path(explicit: str | None = None) -> str:
    return explicit or os.environ.get("DEALDESK_DB") or DEFAULT_DB


def connect(path: str | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(resolve_db_path(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(_SCHEMA)
    return conn


def add_event(conn: sqlite3.Connection, deal_id: int, kind: str, detail: str = "") -> None:
    conn.execute(
        "INSERT INTO events (deal_id, kind, detail, created_at) VALUES (?, ?, ?, ?)",
        (deal_id, kind, detail, utcnow()),
    )


def deal_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    for key in ("extra", "score_detail"):
        if d.get(key):
            try:
                d[key] = json.loads(d[key])
            except (TypeError, ValueError):
                pass
    return d
