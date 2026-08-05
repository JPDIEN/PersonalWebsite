# Build Log — Overnight Autonomous Build

## 2026-08-05 03:09 UTC — Start

Session start. Operating unattended per the overnight brief.

**Setup decision:** The brief asks for a fresh directory with its own `git init`, but my
binding git instructions for this session require all work to be developed and pushed on
branch `claude/overnight-autonomous-build-hwwmlr` of `JPDIEN/PersonalWebsite`. Reconciled
by building the project in a self-contained `overnight-build/` subdirectory of that repo,
using the repo's git on the designated branch. Nothing outside `overnight-build/` will be
modified. Commits after every milestone, as required by both documents.

Created `BUILD_LOG.md`, `TODO.md`, `STATUS.md`.

## 2026-08-05 03:12 UTC — Phase 1: Idea selection

Seed block was blank, so choosing freely. Context signals from the repo/owner: personal
site of a Notre Dame student with a "Pivot North" page and VC-tooling connectors attached
to their workspace — strong signal that early-stage investing / deal research is a real,
recurring workflow for them.

Candidates scored 1–5 on Buildable / Useful / Self-contained / Verifiable / Worth it:

| # | Idea | B | U | S | V | W | Total |
|---|------|---|---|---|---|---|-------|
| 1 | **DealDesk** — local deal-flow pipeline: ingest company CSVs, normalize + dedupe, score against a configurable thesis, track stages, generate weekly-review markdown; CLI + local web dashboard | 5 | 5 | 5 | 5 | 4 | **24** |
| 2 | RSS research digest — fetch public feeds, cluster into a morning markdown digest | 4 | 3 | 3 | 3 | 3 | 16 |
| 3 | Standalone markdown static-blog generator | 4 | 3 | 5 | 4 | 3 | 19 |
| 4 | Personal CRM / follow-up tracker CLI (SQLite) | 5 | 4 | 5 | 5 | 3 | 22 |
| 5 | Spaced-repetition flashcards from markdown notes | 5 | 3 | 5 | 5 | 3 | 21 |

**Pick: #1 DealDesk (24).** It matches the owner's weekly workflow (sourcing/triaging
startups) better than anything else on the list, and every part of it — CSV ingest, SQLite
storage, scoring rules, markdown reports, a stdlib-served dashboard — is fully testable
offline with bundled sample data. #2 lost on the self-contained/verifiable gate (needs
live network at runtime); #4 is the runner-up if DealDesk hits a wall.

**Stack decision:** Python 3.11 stdlib only (sqlite3, csv, json, argparse, http.server,
unittest). Zero pip installs means zero dependency risk unattended, and the whole thing
stays runnable anywhere with `python3`.
