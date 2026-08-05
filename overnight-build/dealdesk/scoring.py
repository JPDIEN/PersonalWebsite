"""Thesis-based scoring: weighted keyword rules with per-rule explanations.

A thesis is a JSON file:

{
  "name": "Midwest pre-seed B2B",
  "rules": [
    {"label": "Core sector", "field": "sector", "match": ["fintech", "ai"], "weight": 25},
    {"label": "Stage fit",   "field": "round",  "match": ["pre-seed", "seed"], "weight": 20}
  ],
  "vetoes": [
    {"label": "Out of scope", "field": "any", "match": ["gambling"]}
  ]
}

`field` may be any deal text field or "any" (searches name, description, sector, round,
location, founders, source, and extra values). Matching is case-insensitive on word
boundaries, so "ai" matches "AI infra" but not "chain". Score = matched weight as a
percentage of total weight (0-100). A veto match forces the score to 0.
"""

from __future__ import annotations

import json
import re
import sqlite3

from .db import utcnow

SEARCHABLE_FIELDS = ["name", "description", "sector", "round", "location",
                     "founders", "source"]


class ThesisError(ValueError):
    """Raised for a malformed thesis file, with a human-readable message."""


def load_thesis(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as fh:
            thesis = json.load(fh)
    except json.JSONDecodeError as e:
        raise ThesisError(f"{path} is not valid JSON: {e}") from e
    return validate_thesis(thesis, origin=path)


def validate_thesis(thesis: dict, origin: str = "thesis") -> dict:
    if not isinstance(thesis, dict):
        raise ThesisError(f"{origin}: top level must be a JSON object")
    rules = thesis.get("rules")
    if not isinstance(rules, list) or not rules:
        raise ThesisError(f"{origin}: 'rules' must be a non-empty list")
    allowed_fields = set(SEARCHABLE_FIELDS) | {"any", "raise_amount", "url"}
    for i, rule in enumerate(rules):
        _check_rule(rule, f"{origin}: rules[{i}]", allowed_fields, need_weight=True)
    for i, veto in enumerate(thesis.get("vetoes", [])):
        _check_rule(veto, f"{origin}: vetoes[{i}]", allowed_fields, need_weight=False)
    return thesis


def _check_rule(rule, where: str, allowed_fields: set, need_weight: bool) -> None:
    if not isinstance(rule, dict):
        raise ThesisError(f"{where}: must be an object")
    if rule.get("field") not in allowed_fields:
        raise ThesisError(f"{where}: 'field' must be one of "
                          f"{', '.join(sorted(allowed_fields))}")
    match = rule.get("match")
    if not isinstance(match, list) or not match or not all(
            isinstance(m, str) and m.strip() for m in match):
        raise ThesisError(f"{where}: 'match' must be a non-empty list of strings")
    if need_weight:
        w = rule.get("weight")
        if not isinstance(w, (int, float)) or w <= 0:
            raise ThesisError(f"{where}: 'weight' must be a positive number")


def _term_re(term: str) -> re.Pattern:
    return re.compile(r"(?<!\w)" + re.escape(term.strip().lower()) + r"(?!\w)")


def _field_text(deal: dict, field: str) -> str:
    if field == "any":
        parts = [str(deal.get(f) or "") for f in SEARCHABLE_FIELDS]
        extra = deal.get("extra")
        if isinstance(extra, dict):
            parts.extend(str(v) for v in extra.values())
        return " | ".join(parts)
    return str(deal.get(field) or "")


def _match_rule(rule: dict, deal: dict) -> str | None:
    """Return the first matching term, or None."""
    text = _field_text(deal, rule["field"]).lower()
    for term in rule["match"]:
        if _term_re(term).search(text):
            return term
    return None


def score_deal(deal: dict, thesis: dict) -> tuple[float, dict]:
    """Score one deal. Returns (score 0-100, detail dict)."""
    detail: dict = {"thesis": thesis.get("name", ""), "rules": [], "veto": None,
                    "scored_at": utcnow()}

    for veto in thesis.get("vetoes", []):
        term = _match_rule(veto, deal)
        if term:
            detail["veto"] = {"label": veto.get("label", "veto"), "term": term,
                              "field": veto["field"]}
            return 0.0, detail

    total = sum(r["weight"] for r in thesis["rules"])
    earned = 0.0
    for rule in thesis["rules"]:
        term = _match_rule(rule, deal)
        entry = {"label": rule.get("label", rule["field"]), "field": rule["field"],
                 "weight": rule["weight"], "matched": bool(term)}
        if term:
            entry["term"] = term
            earned += rule["weight"]
        detail["rules"].append(entry)

    score = round(100.0 * earned / total, 1) if total else 0.0
    return score, detail


def score_all(conn: sqlite3.Connection, thesis: dict) -> int:
    """Score every deal in the DB; persists score + score_detail. Returns count."""
    from .db import deal_to_dict  # local import to avoid cycle at module load

    rows = conn.execute("SELECT * FROM deals").fetchall()
    for row in rows:
        deal = deal_to_dict(row)
        score, detail = score_deal(deal, thesis)
        conn.execute("UPDATE deals SET score = ?, score_detail = ?, updated_at = ? "
                     "WHERE id = ?",
                     (score, json.dumps(detail), utcnow(), row["id"]))
    conn.commit()
    return len(rows)


TEMPLATE = {
    "name": "My thesis (edit me)",
    "rules": [
        {"label": "Core sectors", "field": "sector", "weight": 30,
         "match": ["fintech", "ai", "developer tools", "b2b saas"]},
        {"label": "Stage fit", "field": "round", "weight": 25,
         "match": ["pre-seed", "preseed", "seed"]},
        {"label": "Geography", "field": "location", "weight": 20,
         "match": ["chicago", "detroit", "indiana", "ohio", "michigan", "midwest"]},
        {"label": "Business model keywords", "field": "any", "weight": 15,
         "match": ["saas", "recurring revenue", "marketplace", "api"]},
        {"label": "Traction signals", "field": "any", "weight": 10,
         "match": ["revenue", "pilot", "customers", "arr"]},
    ],
    "vetoes": [
        {"label": "Out of scope", "field": "any",
         "match": ["gambling", "tobacco"]},
    ],
}
