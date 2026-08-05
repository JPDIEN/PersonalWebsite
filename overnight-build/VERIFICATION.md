# VERIFICATION

Every claim below was executed for real during the overnight session (2026-08-05,
container: Linux, Python 3.11.15). Commands are exact; outputs are pasted, trimmed only
for length.

## 1. Unit test suite — VERIFIED

```
$ cd overnight-build && python3 -m unittest discover -s tests
Ran 70 tests in 1.042s
OK
```

70 tests across `test_normalize.py` (15), `test_ingest.py` (12), `test_scoring.py` (14),
`test_pipeline.py` (14), `test_report.py` (6), `test_server.py` (9). The server tests run
against a real `ThreadingHTTPServer` instance on an OS-assigned port, not mocks.

## 2. CSV ingest + cross-file dedupe — VERIFIED

```
$ sh demo.sh
==> Ingesting sample_data/demo_day.csv
sample_data/demo_day.csv: added 10, merged 0, skipped 0
==> Ingesting sample_data/referrals.csv (watch the dedupe merge)
sample_data/referrals.csv: added 2, merged 2, skipped 0
```

The two CSVs use different header dialects (`Company/Website/Industry/Stage` vs
`name/url/category/round`). "Ledgerline Inc" @ `www.ledgerline.dev` merged into
"Ledgerline" @ `https://ledgerline.dev` by normalized domain; merge filled empty fields
without overwriting existing ones (unit-tested in `test_ingest.py`).

## 3. Thesis scoring — VERIFIED

```
==> Scoring against sample_data/thesis.json
scored 12 deal(s) against 'Midwest early-stage B2B'

ID  Name                  Stage  Score  Sector           Round     Location
7   Perch Analytics       inbox  100.0  B2B SaaS         Pre-Seed  Milwaukee WI
1   Harvest Lane          inbox  90.0   AgTech           Pre-Seed  South Bend IN
2   Ledgerline            inbox  90.0   Fintech          Seed      Chicago IL
...
8   Casino Royale Social  inbox  0.0    Gaming           Seed      Las Vegas NV
```

Casino Royale Social hit the "gambling" veto → forced 0. Word-boundary matching is
unit-tested ("ai" does not match "chain"). `show <id>` prints the per-rule breakdown
(seen live for Fastline Robotics: Stage fit +25 'seed', Geography +20 'detroit').

## 4. Pipeline commands — VERIFIED

```
$ python3 -m dealdesk --db demo.db move 2 meeting --note "intro call booked"
#2: inbox -> meeting
$ python3 -m dealdesk --db demo.db followup 2 +3d
#2: follow-up set for 2026-08-08
$ python3 -m dealdesk --db demo.db todo
Due now:
  #1 Loamly [inbox]  due 2026-08-01
Upcoming follow-ups:
  #2 Fastline Robotics [meeting]  due 2026-08-08
$ python3 -m dealdesk --db demo.db move 2 nonsense
error: unknown stage 'nonsense' (expected one of: inbox, reviewing, meeting, diligence, invested, passed)   # exit code 1
```

## 5. Weekly report — VERIFIED

`python3 -m dealdesk --db demo.db report` rendered all sections (Pipeline snapshot, New
this period, Top of the inbox, Stage changes, Needs attention) with correct counts and
the overdue follow-up surfaced. Section correctness is also unit-tested in
`test_report.py`.

## 6. Web dashboard — VERIFIED (API + real browser)

API, via the test suite and live curl during `demo.sh`:

```
$ curl -s http://127.0.0.1:8792/api/deals | python3 -c "...; print('API deals:', len(d['deals']))"
API deals: 12
```

Browser, via Playwright driving the pre-installed headless Chromium against the live
server (`scratchpad/browser_check.mjs`):

```
deal rows rendered: 12
detail open, breakdown text: Score breakdown
stage pills: reviewing,inbox,inbox,...   <- stage move via the UI dropdown persisted
rows after reviewing filter: 1           <- filter chips work
js errors: none
```

Full-page screenshot committed at `docs/dashboard.png`.

## 7. The README run command — VERIFIED

`sh demo.sh` performs ingest → dedupe → score → list → report → serve in one shot
(output above). Server startup line: `DealDesk dashboard: http://127.0.0.1:8756`.

## Not fully tested — honest list

- **UNTESTED: concurrent multi-user writes.** The server serializes writes behind a
  lock and SQLite handles the rest, but no load test was run. It's a localhost
  single-user tool.
- **UNTESTED: very large CSVs.** Ingest is O(rows) with an index lookup per row; tested
  only up to dozens of rows. Nothing suggests it would struggle at thousands, but it
  was not measured.
- **UNTESTED: Windows.** Pure stdlib and pathlib-free code should run, but only Linux
  was exercised.
