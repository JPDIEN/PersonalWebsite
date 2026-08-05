import os
import tempfile
import unittest
from datetime import date, timedelta

from dealdesk import db as dbmod
from dealdesk.ingest import ingest_rows
from dealdesk.pipeline import (PipelineError, add_note, move,
                               parse_followup_date, set_followup, todo)


class PipelineBase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.conn = dbmod.connect(os.path.join(self.tmp.name, "t.db"))
        self.addCleanup(self.conn.close)
        ingest_rows(self.conn, [{"Name": "Acme"}, {"Name": "Beta"}], ["Name"])


class TestMove(PipelineBase):
    def test_move_changes_stage_and_logs_event(self):
        old, new = move(self.conn, 1, "reviewing")
        self.assertEqual((old, new), ("inbox", "reviewing"))
        row = self.conn.execute("SELECT stage FROM deals WHERE id = 1").fetchone()
        self.assertEqual(row["stage"], "reviewing")
        ev = self.conn.execute(
            "SELECT detail FROM events WHERE deal_id = 1 AND kind = 'stage_change'"
        ).fetchone()
        self.assertEqual(ev["detail"], "inbox -> reviewing")

    def test_move_same_stage_is_noop(self):
        move(self.conn, 1, "inbox")
        n = self.conn.execute(
            "SELECT COUNT(*) c FROM events WHERE kind = 'stage_change'").fetchone()["c"]
        self.assertEqual(n, 0)

    def test_bad_stage_rejected(self):
        with self.assertRaises(PipelineError):
            move(self.conn, 1, "yolo")

    def test_missing_deal_rejected(self):
        with self.assertRaises(PipelineError):
            move(self.conn, 99, "reviewing")


class TestNotes(PipelineBase):
    def test_add_note(self):
        add_note(self.conn, 1, "met at demo day")
        row = self.conn.execute("SELECT body FROM notes WHERE deal_id = 1").fetchone()
        self.assertEqual(row["body"], "met at demo day")

    def test_empty_note_rejected(self):
        with self.assertRaises(PipelineError):
            add_note(self.conn, 1, "   ")


class TestFollowupDates(unittest.TestCase):
    def test_iso(self):
        self.assertEqual(parse_followup_date("2026-09-01"), "2026-09-01")

    def test_relative_days(self):
        t = date(2026, 8, 5)
        self.assertEqual(parse_followup_date("+3d", t), "2026-08-08")

    def test_relative_weeks(self):
        t = date(2026, 8, 5)
        self.assertEqual(parse_followup_date("+2w", t), "2026-08-19")

    def test_garbage_rejected(self):
        with self.assertRaises(PipelineError):
            parse_followup_date("next tuesday")


class TestTodo(PipelineBase):
    def test_due_and_upcoming(self):
        t = date(2026, 8, 5)
        set_followup(self.conn, 1, "2026-08-01", t)   # overdue
        set_followup(self.conn, 2, "2026-08-20", t)   # upcoming
        view = todo(self.conn, t)
        self.assertEqual([d["id"] for d in view["due"]], [1])
        self.assertEqual([d["id"] for d in view["upcoming"]], [2])

    def test_clear_followup(self):
        t = date(2026, 8, 5)
        set_followup(self.conn, 1, "2026-08-01", t)
        set_followup(self.conn, 1, None)
        view = todo(self.conn, t)
        self.assertEqual(view["due"], [])

    def test_stale_detection(self):
        # Backdate deal 1's updated_at beyond the stale window.
        self.conn.execute("UPDATE deals SET updated_at = ? WHERE id = 1",
                          ("2026-07-01T00:00:00Z",))
        self.conn.commit()
        view = todo(self.conn, date(2026, 8, 5))
        self.assertIn(1, [d["id"] for d in view["stale"]])
        self.assertNotIn(2, [d["id"] for d in view["stale"]])

    def test_closed_deals_never_stale(self):
        self.conn.execute("UPDATE deals SET stage = 'passed', updated_at = ? WHERE id = 1",
                          ("2026-07-01T00:00:00Z",))
        self.conn.commit()
        view = todo(self.conn, date(2026, 8, 5))
        self.assertEqual(view["stale"], [])


if __name__ == "__main__":
    unittest.main()
