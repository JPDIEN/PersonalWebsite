#!/bin/sh
# One-command demo: builds demo.db from the bundled sample data, scores it,
# prints the pipeline and a weekly report, then serves the dashboard.
set -e
cd "$(dirname "$0")"

DB=demo.db
rm -f "$DB"

echo "==> Ingesting sample_data/demo_day.csv"
python3 -m dealdesk --db "$DB" ingest sample_data/demo_day.csv --source "demo day"

echo "==> Ingesting sample_data/referrals.csv (watch the dedupe merge)"
python3 -m dealdesk --db "$DB" ingest sample_data/referrals.csv --source "referrals"

echo "==> Scoring against sample_data/thesis.json"
python3 -m dealdesk --db "$DB" score --thesis sample_data/thesis.json

echo
python3 -m dealdesk --db "$DB" list --top 10
echo
echo "==> Weekly report preview:"
python3 -m dealdesk --db "$DB" report | head -30
echo
echo "==> Starting the dashboard (Ctrl-C to stop)"
python3 -m dealdesk --db "$DB" serve "$@"
