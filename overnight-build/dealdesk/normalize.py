"""Normalization helpers for company names, domains, and free-text fields."""

from __future__ import annotations

import re

# Legal/entity suffixes that don't distinguish companies.
_LEGAL_SUFFIXES = {
    "inc", "incorporated", "llc", "ltd", "limited", "corp", "corporation",
    "co", "company", "plc", "gmbh", "sas", "bv", "pbc", "pllc", "lp",
}

_PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)
_WS_RE = re.compile(r"\s+")


def norm_name(raw: str) -> str:
    """Canonical form of a company name for dedupe: lowercase, no punctuation,
    trailing legal suffixes removed, whitespace collapsed."""
    s = _PUNCT_RE.sub(" ", (raw or "").lower())
    words = _WS_RE.sub(" ", s).strip().split(" ")
    while len(words) > 1 and words[-1] in _LEGAL_SUFFIXES:
        words = words[:-1]
    return " ".join(w for w in words if w)


def norm_domain(raw: str) -> str | None:
    """Extract a bare registrable-ish domain from a URL, email, or bare host.
    Returns None when nothing domain-like is present."""
    s = (raw or "").strip().lower()
    if not s:
        return None
    if "@" in s:  # email address
        s = s.rsplit("@", 1)[1]
    s = re.sub(r"^[a-z][a-z0-9+.-]*://", "", s)  # scheme
    s = s.split("/")[0].split("?")[0].split("#")[0]
    s = s.split(":")[0]  # port
    if s.startswith("www."):
        s = s[4:]
    s = s.strip(".")
    # Require at least one dot and only hostname characters.
    if "." not in s or not re.fullmatch(r"[a-z0-9.-]+", s):
        return None
    return s


def norm_text(raw: str | None) -> str:
    """Trim and collapse internal whitespace; empty becomes ''."""
    return _WS_RE.sub(" ", (raw or "")).strip()
