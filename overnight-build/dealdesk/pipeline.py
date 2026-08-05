"""Pipeline operations: stage moves, notes, follow-ups, and the daily todo view."""

from __future__ import annotations

import re
import sqlite3
from datetime import date, timedelta

from .db import PIPELINE_STAGES, add_event, utcnow

ACTIVE_STAGES = ["inbox", "reviewing", "meeting", "diligence"]
STALE_AFTER_DAYS = 14


class PipelineError(ValueError):
    """User-facing pipeline error (bad stage, missing deal, bad date...)."""


def _get_deal(conn: sqlite3.Connection, deal_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM deals WHERE id = ?", (deal_id,)).fetchone()
    if not row:
        raise PipelineError(f"no deal with id {deal_id}")
    return row


def move(conn: sqlite3.Connection, deal_id: int, stage: str) -> tuple[str, str]:
    """Move a deal to a stage. Returns (old_stage, new_stage)."""
    stage = stage.strip().lower()
    if stage not in PIPELINE_STAGES:
        raise PipelineError(f"unknown stage '{stage}' "
                            f"(expected one of: {', '.join(PIPELINE_STAGES)})")
    row = _get_deal(conn, deal_id)
    old = row["stage"]
    if old != stage:
        conn.execute("UPDATE deals SET stage = ?, updated_at = ? WHERE id = ?",
                     (stage, utcnow(), deal_id))
        add_event(conn, deal_id, "stage_change", f"{old} -> {stage}")
        conn.commit()
    return old, stage


def add_note(conn: sqlite3.Connection, deal_id: int, body: str) -> None:
    body = (body or "").strip()
    if not body:
        raise PipelineError("note text is empty")
    _get_deal(conn, deal_id)
    conn.execute("INSERT INTO notes (deal_id, body, created_at) VALUES (?, ?, ?)",
                 (deal_id, body, utcnow()))
    conn.commit()


def parse_followup_date(spec: str, today: date | None = None) -> str:
    """Accept 'YYYY-MM-DD' or a relative '+Nd' / '+Nw'. Returns ISO date string."""
    today = today or date.today()
    spec = (spec or "").strip().lower()
    m = re.fullmatch(r"\+(\d+)([dw])", spec)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        return (today + timedelta(days=n * (7 if unit == "w" else 1))).isoformat()
    try:
        return date.fromisoformat(spec).isoformat()
    except ValueError:
        raise PipelineError(
            f"can't parse date '{spec}' (use YYYY-MM-DD, +Nd, or +Nw)") from None


def set_followup(conn: sqlite3.Connection, deal_id: int, spec: str | None,
                 today: date | None = None) -> str | None:
    """Set (or clear, when spec is None) a deal's follow-up date."""
    _get_deal(conn, deal_id)
    iso = parse_followup_date(spec, today) if spec else None
    conn.execute("UPDATE deals SET follow_up = ?, updated_at = ? WHERE id = ?",
                 (iso, utcnow(), deal_id))
    add_event(conn, deal_id, "followup_set", iso or "cleared")
    conn.commit()
    return iso


def todo(conn: sqlite3.Connection, today: date | None = None) -> dict:
    """The daily view: overdue/today follow-ups, upcoming ones, and stale active deals."""
    today = today or date.today()
    iso_today = today.isoformat()
    due = [dict(r) for r in conn.execute(
        "SELECT * FROM deals WHERE follow_up IS NOT NULL AND follow_up <= ? "
        "ORDER BY follow_up", (iso_today,))]
    upcoming = [dict(r) for r in conn.execute(
        "SELECT * FROM deals WHERE follow_up IS NOT NULL AND follow_up > ? "
        "ORDER BY follow_up LIMIT 10", (iso_today,))]
    stale_cutoff = (today - timedelta(days=STALE_AFTER_DAYS)).isoformat()
    placeholders = ",".join("?" for _ in ACTIVE_STAGES)
    stale = [dict(r) for r in conn.execute(
        f"SELECT * FROM deals WHERE stage IN ({placeholders}) "
        "AND substr(updated_at, 1, 10) <= ? AND (follow_up IS NULL OR follow_up > ?) "
        "ORDER BY updated_at", (*ACTIVE_STAGES, stale_cutoff, iso_today))]
    return {"due": due, "upcoming": upcoming, "stale": stale}
