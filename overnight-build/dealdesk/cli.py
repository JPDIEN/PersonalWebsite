"""DealDesk command-line interface."""

from __future__ import annotations

import argparse
import json
import os
import sys

from . import db as dbmod
from .ingest import ingest_csv
from .pipeline import PipelineError, add_note, move, set_followup, todo
from .scoring import TEMPLATE, ThesisError, load_thesis, score_all


def _fmt_table(rows: list[dict], columns: list[tuple[str, str]]) -> str:
    """Render rows as a plain-text table. columns = [(key, heading), ...]."""
    if not rows:
        return "(no deals)"
    widths = {key: len(head) for key, head in columns}
    cells = []
    for r in rows:
        cell = {}
        for key, _ in columns:
            v = r.get(key)
            v = "" if v is None else str(v)
            if len(v) > 40:
                v = v[:37] + "..."
            cell[key] = v
            widths[key] = max(widths[key], len(v))
        cells.append(cell)
    head = "  ".join(h.ljust(widths[k]) for k, h in columns)
    sep = "  ".join("-" * widths[k] for k, _ in columns)
    body = "\n".join("  ".join(c[k].ljust(widths[k]) for k, _ in columns) for c in cells)
    return f"{head}\n{sep}\n{body}"


def cmd_ingest(args: argparse.Namespace) -> int:
    conn = dbmod.connect(args.db)
    try:
        result = ingest_csv(conn, args.csv, default_source=args.source or "")
    except FileNotFoundError:
        print(f"error: no such file: {args.csv}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    finally:
        conn.close()
    print(f"{args.csv}: {result.summary()}")
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    conn = dbmod.connect(args.db)
    q = "SELECT * FROM deals"
    params: list = []
    if args.stage:
        if args.stage not in dbmod.PIPELINE_STAGES:
            print(f"error: unknown stage '{args.stage}' "
                  f"(expected one of: {', '.join(dbmod.PIPELINE_STAGES)})", file=sys.stderr)
            return 1
        q += " WHERE stage = ?"
        params.append(args.stage)
    q += " ORDER BY score IS NULL, score DESC, id ASC"
    if args.top:
        q += " LIMIT ?"
        params.append(args.top)
    rows = [dbmod.deal_to_dict(r) for r in conn.execute(q, params).fetchall()]
    conn.close()
    for r in rows:
        r["score"] = "" if r["score"] is None else f"{r['score']:.1f}"
    print(_fmt_table(rows, [
        ("id", "ID"), ("name", "Name"), ("stage", "Stage"), ("score", "Score"),
        ("sector", "Sector"), ("round", "Round"), ("location", "Location"),
    ]))
    print(f"\n{len(rows)} deal(s)")
    return 0


def cmd_score(args: argparse.Namespace) -> int:
    try:
        thesis = load_thesis(args.thesis)
    except FileNotFoundError:
        print(f"error: no such thesis file: {args.thesis}\n"
              f"hint: create one with: dealdesk init-thesis", file=sys.stderr)
        return 1
    except ThesisError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    conn = dbmod.connect(args.db)
    n = score_all(conn, thesis)
    conn.close()
    print(f"scored {n} deal(s) against '{thesis.get('name', args.thesis)}'")
    return 0


def cmd_show(args: argparse.Namespace) -> int:
    conn = dbmod.connect(args.db)
    row = conn.execute("SELECT * FROM deals WHERE id = ?", (args.id,)).fetchone()
    if not row:
        conn.close()
        print(f"error: no deal with id {args.id}", file=sys.stderr)
        return 1
    d = dbmod.deal_to_dict(row)
    notes = conn.execute("SELECT * FROM notes WHERE deal_id = ? ORDER BY id",
                         (args.id,)).fetchall()
    conn.close()

    print(f"#{d['id']}  {d['name']}  [{d['stage']}]")
    for label, key in [("Domain", "domain"), ("Sector", "sector"), ("Round", "round"),
                       ("Location", "location"), ("Founders", "founders"),
                       ("Raising", "raise_amount"), ("Source", "source"),
                       ("Follow-up", "follow_up")]:
        if d.get(key):
            print(f"  {label + ':':<12}{d[key]}")
    if d.get("description"):
        print(f"  {'About:':<12}{d['description']}")
    if isinstance(d.get("extra"), dict) and d["extra"]:
        for k, v in d["extra"].items():
            print(f"  {k + ':':<12}{v}")

    if d.get("score") is not None:
        print(f"\n  Score: {d['score']:.1f} / 100")
        detail = d.get("score_detail")
        if isinstance(detail, dict):
            if detail.get("veto"):
                v = detail["veto"]
                print(f"    VETO — {v['label']}: matched '{v['term']}' in {v['field']}")
            for r in detail.get("rules", []):
                mark = "+" if r["matched"] else " "
                why = f" (matched '{r.get('term')}')" if r["matched"] else ""
                print(f"    [{mark}] {r['label']:<28}{r['weight']:>3}{why}")
    if notes:
        print("\n  Notes:")
        for n in notes:
            print(f"    {n['created_at'][:10]}  {n['body']}")
    return 0


def _with_pipeline(args, fn) -> int:
    conn = dbmod.connect(args.db)
    try:
        fn(conn)
        return 0
    except PipelineError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    finally:
        conn.close()


def cmd_move(args: argparse.Namespace) -> int:
    def run(conn):
        old, new = move(conn, args.id, args.stage)
        if args.note:
            add_note(conn, args.id, args.note)
        print(f"#{args.id}: {old} -> {new}" if old != new
              else f"#{args.id}: already in {new}")
    return _with_pipeline(args, run)


def cmd_note(args: argparse.Namespace) -> int:
    def run(conn):
        add_note(conn, args.id, args.text)
        print(f"#{args.id}: note added")
    return _with_pipeline(args, run)


def cmd_followup(args: argparse.Namespace) -> int:
    def run(conn):
        iso = set_followup(conn, args.id, None if args.clear else args.when)
        print(f"#{args.id}: follow-up cleared" if iso is None
              else f"#{args.id}: follow-up set for {iso}")
    if not args.clear and not args.when:
        print("error: give a date (YYYY-MM-DD, +Nd, +Nw) or --clear", file=sys.stderr)
        return 1
    return _with_pipeline(args, run)


def _todo_line(d: dict) -> str:
    bits = [f"#{d['id']} {d['name']} [{d['stage']}]"]
    if d.get("follow_up"):
        bits.append(f"due {d['follow_up']}")
    return "  " + "  ".join(bits)


def cmd_todo(args: argparse.Namespace) -> int:
    conn = dbmod.connect(args.db)
    view = todo(conn)
    conn.close()
    sections = [("Due now", view["due"]),
                ("Upcoming follow-ups", view["upcoming"]),
                (f"Stale (no touch in 14+ days)", view["stale"])]
    any_items = False
    for title, items in sections:
        if not items:
            continue
        any_items = True
        print(f"{title}:")
        for d in items:
            print(_todo_line(d))
        print()
    if not any_items:
        print("Nothing due, nothing stale. Inbox zero.")
    return 0


def cmd_init_thesis(args: argparse.Namespace) -> int:
    path = args.path
    if os.path.exists(path) and not args.force:
        print(f"error: {path} already exists (use --force to overwrite)", file=sys.stderr)
        return 1
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(TEMPLATE, fh, indent=2)
        fh.write("\n")
    print(f"wrote template thesis to {path} — edit the rules, then run: "
          f"dealdesk score --thesis {path}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="dealdesk",
        description="Local-first deal-flow pipeline: ingest company CSVs, score them "
                    "against your thesis, and manage your pipeline.",
    )
    p.add_argument("--db", metavar="PATH",
                   help="SQLite database file (default: $DEALDESK_DB or ./dealdesk.db)")
    sub = p.add_subparsers(dest="command", metavar="COMMAND")

    sp = sub.add_parser("ingest", help="ingest a CSV of companies (dedupes automatically)",
                        description="Ingest a CSV. Headers are matched flexibly "
                                    "(e.g. Company/Name, Website/URL, Industry/Sector); "
                                    "unrecognized columns are preserved.")
    sp.add_argument("csv", help="path to the CSV file")
    sp.add_argument("--source", help="label for where this list came from "
                                     "(e.g. 'demo day', 'referrals')")
    sp.set_defaults(func=cmd_ingest)

    sp = sub.add_parser("list", help="list deals in the pipeline")
    sp.add_argument("--stage", help="filter by pipeline stage "
                                    f"({', '.join(dbmod.PIPELINE_STAGES)})")
    sp.add_argument("--top", type=int, metavar="N", help="show only the top N by score")
    sp.set_defaults(func=cmd_list)

    sp = sub.add_parser("score", help="score all deals against a thesis file")
    sp.add_argument("--thesis", default="thesis.json",
                    help="path to thesis JSON (default: thesis.json)")
    sp.set_defaults(func=cmd_score)

    sp = sub.add_parser("show", help="show one deal in full, with score breakdown")
    sp.add_argument("id", type=int, help="deal id (from 'list')")
    sp.set_defaults(func=cmd_show)

    sp = sub.add_parser("move", help="move a deal to another pipeline stage")
    sp.add_argument("id", type=int)
    sp.add_argument("stage", help=f"one of: {', '.join(dbmod.PIPELINE_STAGES)}")
    sp.add_argument("--note", help="attach a note explaining the move")
    sp.set_defaults(func=cmd_move)

    sp = sub.add_parser("note", help="add a note to a deal")
    sp.add_argument("id", type=int)
    sp.add_argument("text")
    sp.set_defaults(func=cmd_note)

    sp = sub.add_parser("followup", help="set or clear a follow-up date")
    sp.add_argument("id", type=int)
    sp.add_argument("when", nargs="?", help="YYYY-MM-DD, +Nd, or +Nw")
    sp.add_argument("--clear", action="store_true", help="clear the follow-up")
    sp.set_defaults(func=cmd_followup)

    sp = sub.add_parser("todo", help="what needs attention: due follow-ups, stale deals")
    sp.set_defaults(func=cmd_todo)

    sp = sub.add_parser("init-thesis", help="write a starter thesis.json to edit")
    sp.add_argument("path", nargs="?", default="thesis.json",
                    help="where to write it (default: thesis.json)")
    sp.add_argument("--force", action="store_true", help="overwrite an existing file")
    sp.set_defaults(func=cmd_init_thesis)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not getattr(args, "func", None):
        parser.print_help()
        return 0
    return args.func(args)
