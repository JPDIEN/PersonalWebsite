# TODO — Milestone Queue

Each milestone ends in a working, tested, committed state.

- [x] **M1 — Ingest + store** (est. 60m): `python3 -m dealdesk ingest <csv>` with flexible
      column mapping, name/domain normalization, dedupe on re-ingest; SQLite storage;
      `list` command showing the pipeline. Shippable on its own.
- [x] **M2 — Thesis scoring** (est. 45m): `thesis.json` with weighted rules (sector
      keywords, stage, geography, keyword boosts/vetoes); `score` command writes fit
      scores with per-rule explanations; `list --top N`.
- [ ] **M3 — Pipeline management** (est. 45m): stages (inbox → reviewing → meeting →
      diligence → invested/passed), `move`, `note`, follow-up dates, `todo` command for
      overdue follow-ups.
- [ ] **M4 — Weekly review report** (est. 30m): `report` command → markdown file: new
      this week, top-scored inbox, stage changes, stale deals, pass log.
- [ ] **M5 — Local web dashboard** (est. 60m): `serve` command → stdlib http.server
      dashboard: pipeline board, sortable deal table, score breakdown per deal, stage
      moves via POST. Verified with scripted HTTP checks (+ headless browser if easy).
- [ ] **M6 — Sample data + polish** (est. 30m): realistic bundled sample CSV + demo
      thesis so the demo is instant; helpful `--help`; clean error messages.

Backlog (post-DoD, pull if time remains): more edge-case tests, CSV export, screenshot
via Playwright, launch blurb, refactor pass.
