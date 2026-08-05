"""Weekly review report: a markdown summary of the pipeline's last N days."""

from __future__ import annotations

import sqlite3
from datetime import date, timedelta

from .db import PIPELINE_STAGES
from .pipeline import todo


def _deal_line(d: dict) -> str:
    bits = [f"**{d['name']}**"]
    if d.get("score") is not None:
        bits.append(f"score {d['score']:.0f}")
    for key in ("sector", "round", "location"):
        if d.get(key):
            bits.append(str(d[key]))
    if d.get("source"):
        bits.append(f"via {d['source']}")
    line = f"- #{d['id']} " + " · ".join(bits)
    if d.get("description"):
        line += f" — {d['description']}"
    return line


def generate_report(conn: sqlite3.Connection, days: int = 7,
                    today: date | None = None) -> str:
    today = today or date.today()
    since = today - timedelta(days=days)
    since_ts = since.isoformat()  # compares fine against ISO timestamps

    out: list[str] = [f"# Deal-flow review — {today.isoformat()}",
                      f"_Covering the last {days} days (since {since.isoformat()})_", ""]

    # Pipeline snapshot
    counts = {s: 0 for s in PIPELINE_STAGES}
    for row in conn.execute("SELECT stage, COUNT(*) c FROM deals GROUP BY stage"):
        counts[row["stage"]] = row["c"]
    total = sum(counts.values())
    out += ["## Pipeline snapshot",
            " | ".join(f"{s}: {counts[s]}" for s in PIPELINE_STAGES),
            f"\n{total} deals tracked.", ""]

    # New this period
    new = [dict(r) for r in conn.execute(
        "SELECT * FROM deals WHERE substr(created_at, 1, 10) >= ? "
        "ORDER BY score IS NULL, score DESC", (since_ts,))]
    out.append(f"## New this period ({len(new)})")
    out += [_deal_line(d) for d in new] or ["_None._"]
    out.append("")

    # Top of the inbox
    top = [dict(r) for r in conn.execute(
        "SELECT * FROM deals WHERE stage = 'inbox' "
        "ORDER BY score IS NULL, score DESC, id LIMIT 5")]
    out.append("## Top of the inbox")
    out += [_deal_line(d) for d in top] or ["_Inbox is empty._"]
    out.append("")

    # Stage changes
    changes = conn.execute(
        "SELECT e.created_at, e.detail, d.id, d.name FROM events e "
        "JOIN deals d ON d.id = e.deal_id "
        "WHERE e.kind = 'stage_change' AND substr(e.created_at, 1, 10) >= ? "
        "ORDER BY e.created_at", (since_ts,)).fetchall()
    out.append(f"## Stage changes ({len(changes)})")
    out += [f"- {r['created_at'][:10]} — #{r['id']} {r['name']}: {r['detail']}"
            for r in changes] or ["_None._"]
    out.append("")

    # Needs attention
    view = todo(conn, today)
    out.append("## Needs attention")
    if not (view["due"] or view["stale"]):
        out.append("_Nothing due, nothing stale._")
    for d in view["due"]:
        out.append(f"- #{d['id']} {d['name']} — follow-up due {d['follow_up']} "
                   f"[{d['stage']}]")
    for d in view["stale"]:
        out.append(f"- #{d['id']} {d['name']} — untouched since "
                   f"{d['updated_at'][:10]} [{d['stage']}]")
    out.append("")

    # Recent passes, for the anti-portfolio file
    passed = conn.execute(
        "SELECT e.created_at, d.id, d.name FROM events e JOIN deals d ON d.id = e.deal_id "
        "WHERE e.kind = 'stage_change' AND e.detail LIKE '%-> passed' "
        "AND substr(e.created_at, 1, 10) >= ? ORDER BY e.created_at", (since_ts,)
    ).fetchall()
    if passed:
        out.append(f"## Passed this period ({len(passed)})")
        out += [f"- {r['created_at'][:10]} — #{r['id']} {r['name']}" for r in passed]
        out.append("")

    return "\n".join(out)
