"""Local web dashboard, served entirely from the Python stdlib.

GET  /                      dashboard page
GET  /api/deals             all deals as JSON (score detail parsed)
GET  /api/todo              due / upcoming / stale view
POST /api/deals/<id>/stage  {"stage": "reviewing"}  -> move deal
POST /api/deals/<id>/note   {"body": "text"}        -> add note
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import db as dbmod
from .pipeline import PipelineError, add_note, move, todo

_HTML_PATH = os.path.join(os.path.dirname(__file__), "dashboard.html")

_STAGE_RE = re.compile(r"^/api/deals/(\d+)/stage$")
_NOTE_RE = re.compile(r"^/api/deals/(\d+)/note$")

# Serialize writes: sqlite handles this fine, but one lock keeps tests deterministic.
_write_lock = threading.Lock()


def _fetch_deals(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM deals ORDER BY score IS NULL, score DESC, id").fetchall()
    deals = [dbmod.deal_to_dict(r) for r in rows]
    notes: dict[int, list] = {}
    for n in conn.execute("SELECT deal_id, body, created_at FROM notes ORDER BY id"):
        notes.setdefault(n["deal_id"], []).append(
            {"body": n["body"], "created_at": n["created_at"]})
    for d in deals:
        d["notes"] = notes.get(d["id"], [])
    return deals


class DealDeskHandler(BaseHTTPRequestHandler):
    db_path: str | None = None  # set by make_server
    server_version = "DealDesk/1.0"

    # -- plumbing ---------------------------------------------------------
    def log_message(self, fmt, *args):  # quiet by default
        if os.environ.get("DEALDESK_HTTP_LOG"):
            super().log_message(fmt, *args)

    def _send(self, status: int, body: bytes, ctype: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload) -> None:
        self._send(status, json.dumps(payload).encode(), "application/json")

    def _read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            return json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return None

    # -- routes -----------------------------------------------------------
    def do_GET(self):
        path = self.path.split("?")[0]
        conn = dbmod.connect(self.db_path)
        try:
            if path == "/":
                with open(_HTML_PATH, encoding="utf-8") as fh:
                    self._send(200, fh.read().encode(), "text/html; charset=utf-8")
            elif path == "/api/deals":
                self._json(200, {"stages": dbmod.PIPELINE_STAGES,
                                 "deals": _fetch_deals(conn)})
            elif path == "/api/todo":
                view = todo(conn)
                self._json(200, view)
            else:
                self._json(404, {"error": "not found"})
        finally:
            conn.close()

    def do_POST(self):
        path = self.path.split("?")[0]
        m_stage, m_note = _STAGE_RE.match(path), _NOTE_RE.match(path)
        if not (m_stage or m_note):
            self._json(404, {"error": "not found"})
            return
        payload = self._read_json_body()
        if payload is None:
            self._json(400, {"error": "body must be valid JSON"})
            return
        deal_id = int((m_stage or m_note).group(1))
        conn = dbmod.connect(self.db_path)
        try:
            with _write_lock:
                if m_stage:
                    old, new = move(conn, deal_id, str(payload.get("stage", "")))
                    self._json(200, {"id": deal_id, "from": old, "to": new})
                else:
                    add_note(conn, deal_id, str(payload.get("body", "")))
                    self._json(200, {"id": deal_id, "ok": True})
        except PipelineError as e:
            self._json(400, {"error": str(e)})
        finally:
            conn.close()


def make_server(db_path: str | None, host: str = "127.0.0.1",
                port: int = 8756) -> ThreadingHTTPServer:
    handler = type("BoundHandler", (DealDeskHandler,), {"db_path": db_path})
    return ThreadingHTTPServer((host, port), handler)


def serve(db_path: str | None, host: str = "127.0.0.1", port: int = 8756) -> None:
    httpd = make_server(db_path, host, port)
    print(f"DealDesk dashboard: http://{host}:{httpd.server_address[1]}  (Ctrl-C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")
    finally:
        httpd.server_close()
