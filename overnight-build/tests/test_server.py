import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

from dealdesk import db as dbmod
from dealdesk.ingest import ingest_rows
from dealdesk.scoring import score_all
from dealdesk.server import make_server

THESIS = {"name": "T", "rules": [
    {"label": "Sector", "field": "sector", "weight": 100, "match": ["fintech"]}]}


class ServerBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = os.path.join(cls.tmp.name, "t.db")
        conn = dbmod.connect(cls.db_path)
        ingest_rows(conn, [
            {"Name": "Acme", "Industry": "Fintech"},
            {"Name": "Beta", "Industry": "Biotech"},
        ], ["Name", "Industry"])
        score_all(conn, THESIS)
        conn.close()
        cls.httpd = make_server(cls.db_path, port=0)  # OS-assigned free port
        cls.port = cls.httpd.server_address[1]
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)
        cls.tmp.cleanup()

    def request(self, path, data=None, method=None):
        url = f"http://127.0.0.1:{self.port}{path}"
        body = json.dumps(data).encode() if data is not None else None
        req = urllib.request.Request(url, data=body, method=method,
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()


class TestServer(ServerBase):
    def test_index_serves_dashboard(self):
        status, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"DealDesk", body)
        self.assertIn(b"/api/deals", body)

    def test_api_deals(self):
        status, body = self.request("/api/deals")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertEqual(len(payload["deals"]), 2)
        self.assertEqual(payload["deals"][0]["name"], "Acme")  # sorted by score
        self.assertEqual(payload["deals"][0]["score"], 100.0)
        self.assertIn("inbox", payload["stages"])
        self.assertIsInstance(payload["deals"][0]["score_detail"], dict)

    def test_api_todo(self):
        status, body = self.request("/api/todo")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        for key in ("due", "upcoming", "stale"):
            self.assertIn(key, payload)

    def test_move_stage_via_post(self):
        status, body = self.request("/api/deals/2/stage", {"stage": "reviewing"}, "POST")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["to"], "reviewing")
        _, body = self.request("/api/deals")
        beta = [d for d in json.loads(body)["deals"] if d["id"] == 2][0]
        self.assertEqual(beta["stage"], "reviewing")

    def test_add_note_via_post(self):
        status, _ = self.request("/api/deals/1/note", {"body": "from the web"}, "POST")
        self.assertEqual(status, 200)
        _, body = self.request("/api/deals")
        acme = [d for d in json.loads(body)["deals"] if d["id"] == 1][0]
        self.assertIn("from the web", [n["body"] for n in acme["notes"]])

    def test_bad_stage_is_400(self):
        status, body = self.request("/api/deals/1/stage", {"stage": "bogus"}, "POST")
        self.assertEqual(status, 400)
        self.assertIn("unknown stage", json.loads(body)["error"])

    def test_missing_deal_is_400(self):
        status, _ = self.request("/api/deals/999/stage", {"stage": "reviewing"}, "POST")
        self.assertEqual(status, 400)

    def test_unknown_route_404(self):
        status, _ = self.request("/api/nope")
        self.assertEqual(status, 404)
        status, _ = self.request("/api/nope", {"x": 1}, "POST")
        self.assertEqual(status, 404)

    def test_invalid_json_body_is_400(self):
        url = f"http://127.0.0.1:{self.port}/api/deals/1/note"
        req = urllib.request.Request(url, data=b"not json", method="POST",
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as resp:
                status = resp.status
        except urllib.error.HTTPError as e:
            status = e.code
        self.assertEqual(status, 400)


if __name__ == "__main__":
    unittest.main()
