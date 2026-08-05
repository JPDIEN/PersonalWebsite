import csv
import io
import os
import tempfile
import unittest

from dealdesk import db as dbmod
from dealdesk.ingest import ingest_csv, ingest_rows, map_headers


def make_csv(path: str, headers: list[str], rows: list[list[str]]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(headers)
        w.writerows(rows)


class IngestBase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db_path = os.path.join(self.tmp.name, "test.db")
        self.conn = dbmod.connect(self.db_path)
        self.addCleanup(self.conn.close)

    def csv_path(self, name="in.csv"):
        return os.path.join(self.tmp.name, name)


class TestHeaderMapping(unittest.TestCase):
    def test_aliases(self):
        mapping, unmapped = map_headers(["Company Name", "Website", "Industry", "Weird"])
        self.assertEqual(mapping["Company Name"], "name")
        self.assertEqual(mapping["Website"], "url")
        self.assertEqual(mapping["Industry"], "sector")
        self.assertEqual(unmapped, ["Weird"])

    def test_underscores_and_case(self):
        mapping, _ = map_headers(["COMPANY_NAME", "one-liner"])
        self.assertEqual(mapping["COMPANY_NAME"], "name")
        self.assertEqual(mapping["one-liner"], "description")

    def test_first_alias_wins_on_duplicates(self):
        mapping, unmapped = map_headers(["Name", "Company"])
        self.assertEqual(mapping["Name"], "name")
        self.assertIn("Company", unmapped)


class TestIngest(IngestBase):
    def test_basic_ingest(self):
        p = self.csv_path()
        make_csv(p, ["Company", "Website", "Industry", "Stage"],
                 [["Acme", "https://acme.io", "Fintech", "Pre-Seed"],
                  ["Zenlytic Inc", "zenlytic.com", "Data", "Seed"]])
        res = ingest_csv(self.conn, p, default_source="test")
        self.assertEqual((res.added, res.merged, res.skipped), (2, 0, 0))
        rows = self.conn.execute("SELECT * FROM deals ORDER BY id").fetchall()
        self.assertEqual(rows[0]["domain"], "acme.io")
        self.assertEqual(rows[0]["stage"], "inbox")
        self.assertEqual(rows[0]["source"], "test")
        self.assertEqual(rows[1]["round"], "Seed")

    def test_dedupe_by_domain_merges_missing_fields(self):
        p1, p2 = self.csv_path("a.csv"), self.csv_path("b.csv")
        make_csv(p1, ["Name", "URL"], [["Acme", "acme.io"]])
        make_csv(p2, ["Company", "Website", "Location", "Description"],
                 [["Acme Incorporated", "https://www.acme.io", "Chicago", "Roadrunner traps"]])
        ingest_csv(self.conn, p1)
        res = ingest_csv(self.conn, p2)
        self.assertEqual((res.added, res.merged), (0, 1))
        row = self.conn.execute("SELECT * FROM deals").fetchone()
        self.assertEqual(row["location"], "Chicago")
        self.assertEqual(row["description"], "Roadrunner traps")
        self.assertEqual(row["name"], "Acme")  # original name kept

    def test_dedupe_by_name_when_no_domain(self):
        p1, p2 = self.csv_path("a.csv"), self.csv_path("b.csv")
        make_csv(p1, ["Name"], [["Acme, Inc."]])
        make_csv(p2, ["Company"], [["acme"]])
        ingest_csv(self.conn, p1)
        res = ingest_csv(self.conn, p2)
        self.assertEqual((res.added, res.merged), (0, 1))

    def test_merge_never_overwrites_existing(self):
        p1, p2 = self.csv_path("a.csv"), self.csv_path("b.csv")
        make_csv(p1, ["Name", "URL", "Location"], [["Acme", "acme.io", "Chicago"]])
        make_csv(p2, ["Name", "URL", "Location"], [["Acme", "acme.io", "NYC"]])
        ingest_csv(self.conn, p1)
        ingest_csv(self.conn, p2)
        row = self.conn.execute("SELECT * FROM deals").fetchone()
        self.assertEqual(row["location"], "Chicago")

    def test_rows_without_name_are_skipped(self):
        p = self.csv_path()
        make_csv(p, ["Name", "URL"], [["", "acme.io"], ["Beta", ""]])
        res = ingest_csv(self.conn, p)
        self.assertEqual((res.added, res.skipped), (1, 1))

    def test_unmapped_columns_kept_in_extra(self):
        p = self.csv_path()
        make_csv(p, ["Name", "Fund Fit"], [["Acme", "strong"]])
        res = ingest_csv(self.conn, p)
        self.assertIn("Fund Fit", res.unmapped_headers)
        row = dbmod.deal_to_dict(self.conn.execute("SELECT * FROM deals").fetchone())
        self.assertEqual(row["extra"]["Fund Fit"], "strong")

    def test_email_column_yields_domain(self):
        rows = [{"Name": "Acme", "Founder Email": "sam@acme.io"}]
        res = ingest_rows(self.conn, rows, ["Name", "Founder Email"])
        self.assertEqual(res.added, 1)
        row = self.conn.execute("SELECT * FROM deals").fetchone()
        self.assertEqual(row["domain"], "acme.io")

    def test_events_written(self):
        p = self.csv_path()
        make_csv(p, ["Name"], [["Acme"]])
        ingest_csv(self.conn, p)
        ingest_csv(self.conn, p)
        kinds = [r["kind"] for r in self.conn.execute(
            "SELECT kind FROM events ORDER BY id").fetchall()]
        self.assertEqual(kinds, ["created", "seen_again"])

    def test_empty_csv_raises(self):
        p = self.csv_path()
        with open(p, "w", encoding="utf-8"):
            pass
        with self.assertRaises(ValueError):
            ingest_csv(self.conn, p)

    def test_bom_handled(self):
        p = self.csv_path()
        with open(p, "w", newline="", encoding="utf-8-sig") as fh:
            csv.writer(fh).writerows([["Name"], ["Acme"]])
        res = ingest_csv(self.conn, p)
        self.assertEqual(res.added, 1)


if __name__ == "__main__":
    unittest.main()
