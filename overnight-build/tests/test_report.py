import os
import tempfile
import unittest
from datetime import date

from dealdesk import db as dbmod
from dealdesk.ingest import ingest_rows
from dealdesk.pipeline import move, set_followup
from dealdesk.report import generate_report
from dealdesk.scoring import score_all


THESIS = {"name": "T", "rules": [
    {"label": "Sector", "field": "sector", "weight": 100, "match": ["fintech"]}]}


class TestReport(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.conn = dbmod.connect(os.path.join(self.tmp.name, "t.db"))
        self.addCleanup(self.conn.close)
        ingest_rows(self.conn, [
            {"Name": "Acme", "Industry": "Fintech", "Description": "Bank APIs"},
            {"Name": "Beta", "Industry": "Biotech"},
            {"Name": "Gamma", "Industry": "Fintech"},
        ], ["Name", "Industry", "Description"], default_source="unit")
        score_all(self.conn, THESIS)
        self.today = date.today()

    def test_report_sections_present(self):
        md = generate_report(self.conn, days=7, today=self.today)
        for heading in ["# Deal-flow review", "## Pipeline snapshot",
                        "## New this period (3)", "## Top of the inbox",
                        "## Stage changes", "## Needs attention"]:
            self.assertIn(heading, md)

    def test_snapshot_counts(self):
        move(self.conn, 1, "meeting")
        md = generate_report(self.conn, days=7, today=self.today)
        self.assertIn("inbox: 2", md)
        self.assertIn("meeting: 1", md)
        self.assertIn("3 deals tracked.", md)

    def test_top_inbox_sorted_by_score(self):
        md = generate_report(self.conn, days=7, today=self.today)
        top = md.split("## Top of the inbox")[1].split("##")[0]
        self.assertLess(top.index("Acme"), top.index("Beta"))

    def test_stage_changes_and_passes_listed(self):
        move(self.conn, 2, "passed")
        md = generate_report(self.conn, days=7, today=self.today)
        self.assertIn("Beta: inbox -> passed", md)
        self.assertIn("## Passed this period (1)", md)

    def test_due_followup_in_needs_attention(self):
        set_followup(self.conn, 3, "2020-01-01", self.today)
        md = generate_report(self.conn, days=7, today=self.today)
        self.assertIn("follow-up due 2020-01-01", md)

    def test_old_deals_not_in_new_section(self):
        self.conn.execute("UPDATE deals SET created_at = '2020-01-01T00:00:00Z' "
                          "WHERE id = 2")
        self.conn.commit()
        md = generate_report(self.conn, days=7, today=self.today)
        new_section = md.split("## New this period")[1].split("##")[0]
        self.assertNotIn("Beta", new_section)
        self.assertIn("(2)", md.split("## New this period")[1][:5])


if __name__ == "__main__":
    unittest.main()
