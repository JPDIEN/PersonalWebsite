"""DealDesk command-line interface."""

from __future__ import annotations

import argparse
import sys

from . import db as dbmod
from .ingest import ingest_csv


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

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not getattr(args, "func", None):
        parser.print_help()
        return 0
    return args.func(args)
