import sqlite3

import pytest

import db


def test_database_context_rolls_back_and_closes_on_error(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "sentinelforge.db")
    db.init_db()

    with pytest.raises(RuntimeError):
        with db.get_db() as conn:
            conn.execute(
                "INSERT INTO deployments (site_id, image_version) VALUES (?, ?)",
                ("site-1", "test"),
            )
            raise RuntimeError("abort transaction")

    with pytest.raises(sqlite3.ProgrammingError):
        conn.execute("SELECT 1")
    assert db.get_fleet_status() == []


def test_task_state_update_uses_fixed_sql_and_persists(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "sentinelforge.db")
    db.init_db()
    task_id = db.create_task(None, "Test", "Description", agent_id=1)

    db.update_task_state(task_id, "DONE")

    task = db.get_tasks_for_agent(1)[0]
    assert task["state"] == "DONE"
    assert task["completed_at"] is not None
