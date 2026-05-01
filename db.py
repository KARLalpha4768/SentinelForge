"""
SentinelForge Database Layer
Task tracking, sprint management, agent activity log, and benchmark history.
SQLite with WAL mode for concurrent agent access.
"""
import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from config import DB_PATH, TASK_STATES, PRIORITIES

def get_conn():
    """Thread-safe connection with WAL mode."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create all tables if they don't exist."""
    conn = get_conn()
    conn.executescript("""
    -- Sprints: 2-week planning cycles
    CREATE TABLE IF NOT EXISTS sprints (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT NOT NULL,
        goal            TEXT,
        start_date      TEXT NOT NULL,
        end_date        TEXT NOT NULL,
        status          TEXT DEFAULT 'ACTIVE',
        created_at      TEXT DEFAULT (datetime('now'))
    );

    -- Tasks: individual work items assigned to agents
    CREATE TABLE IF NOT EXISTS tasks (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        sprint_id       INTEGER REFERENCES sprints(id),
        title           TEXT NOT NULL,
        description     TEXT,
        agent_id        INTEGER NOT NULL,
        priority        TEXT DEFAULT 'P2_MEDIUM',
        state           TEXT DEFAULT 'BACKLOG',
        deliverables    TEXT,  -- JSON list of file paths
        depends_on      TEXT,  -- JSON list of task IDs
        estimated_hours REAL,
        actual_hours    REAL,
        created_at      TEXT DEFAULT (datetime('now')),
        started_at      TEXT,
        completed_at    TEXT,
        review_status   TEXT,  -- PENDING, APPROVED, REJECTED
        review_notes    TEXT
    );

    -- Agent activity log: every action every agent takes
    CREATE TABLE IF NOT EXISTS agent_log (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id        INTEGER NOT NULL,
        task_id         INTEGER REFERENCES tasks(id),
        action          TEXT NOT NULL,
        details         TEXT,  -- JSON payload
        files_modified  TEXT,  -- JSON list of file paths
        duration_sec    REAL,
        status          TEXT DEFAULT 'SUCCESS',  -- SUCCESS, FAILED, SKIPPED
        timestamp       TEXT DEFAULT (datetime('now'))
    );

    -- Code artifacts: files produced by agents
    CREATE TABLE IF NOT EXISTS artifacts (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id         INTEGER REFERENCES tasks(id),
        agent_id        INTEGER NOT NULL,
        file_path       TEXT NOT NULL,
        language        TEXT,  -- cuda, cpp, python, docker, yaml
        lines_of_code   INTEGER,
        version         TEXT,
        checksum        TEXT,
        review_status   TEXT DEFAULT 'PENDING',
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT
    );

    -- Benchmarks: performance measurements over time
    CREATE TABLE IF NOT EXISTS benchmarks (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        build_version   TEXT NOT NULL,
        metric          TEXT NOT NULL,
        value           REAL NOT NULL,
        unit            TEXT,
        site_id         TEXT,
        passed          INTEGER,  -- 1=pass, 0=fail
        measured_at     TEXT DEFAULT (datetime('now'))
    );

    -- Site deployments: what version is running where
    CREATE TABLE IF NOT EXISTS deployments (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id         TEXT NOT NULL,
        image_version   TEXT NOT NULL,
        status          TEXT DEFAULT 'DEPLOYING',  -- DEPLOYING, ACTIVE, ROLLED_BACK, FAILED
        deployed_at     TEXT DEFAULT (datetime('now')),
        health_check_at TEXT,
        health_status   TEXT  -- JSON health telemetry
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
    CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
    CREATE INDEX IF NOT EXISTS idx_log_agent ON agent_log(agent_id);
    CREATE INDEX IF NOT EXISTS idx_log_task ON agent_log(task_id);
    CREATE INDEX IF NOT EXISTS idx_benchmarks_metric ON benchmarks(metric);
    CREATE INDEX IF NOT EXISTS idx_deployments_site ON deployments(site_id);
    """)
    conn.commit()
    conn.close()
    print(f"[DB] Initialized at {DB_PATH}")

# ─── Task Operations ────────────────────────────────────────────

def create_task(sprint_id, title, description, agent_id, priority="P2_MEDIUM",
                deliverables=None, depends_on=None, estimated_hours=None):
    conn = get_conn()
    conn.execute("""
        INSERT INTO tasks (sprint_id, title, description, agent_id, priority,
                          deliverables, depends_on, estimated_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (sprint_id, title, description, agent_id, priority,
          json.dumps(deliverables or []),
          json.dumps(depends_on or []),
          estimated_hours))
    conn.commit()
    task_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    return task_id

def update_task_state(task_id, new_state):
    conn = get_conn()
    updates = {"state": new_state}
    if new_state == "IN_PROGRESS":
        updates["started_at"] = datetime.now(timezone.utc).isoformat()
    elif new_state == "DONE":
        updates["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    conn.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?",
                 list(updates.values()) + [task_id])
    conn.commit()
    conn.close()

def get_tasks_for_agent(agent_id, state=None):
    conn = get_conn()
    if state:
        rows = conn.execute(
            "SELECT * FROM tasks WHERE agent_id = ? AND state = ? ORDER BY priority",
            (agent_id, state)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM tasks WHERE agent_id = ? ORDER BY priority, state",
            (agent_id,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_blocked_tasks():
    """Find tasks whose dependencies aren't DONE yet."""
    conn = get_conn()
    tasks = conn.execute(
        "SELECT * FROM tasks WHERE state != 'DONE' AND depends_on != '[]'"
    ).fetchall()
    result = []
    for t in tasks:
        deps = json.loads(t["depends_on"])
        for dep_id in deps:
            dep = conn.execute("SELECT state FROM tasks WHERE id = ?", (dep_id,)).fetchone()
            if dep and dep["state"] != "DONE":
                result.append(dict(t))
                break
    conn.close()
    return result

# ─── Agent Log Operations ───────────────────────────────────────

def log_action(agent_id, action, task_id=None, details=None,
               files_modified=None, duration_sec=None, status="SUCCESS"):
    conn = get_conn()
    conn.execute("""
        INSERT INTO agent_log (agent_id, task_id, action, details,
                              files_modified, duration_sec, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (agent_id, task_id, action, json.dumps(details) if details else None,
          json.dumps(files_modified) if files_modified else None,
          duration_sec, status))
    conn.commit()
    conn.close()

# ─── Artifact Operations ────────────────────────────────────────

def register_artifact(task_id, agent_id, file_path, language, lines_of_code, version):
    conn = get_conn()
    conn.execute("""
        INSERT OR REPLACE INTO artifacts (task_id, agent_id, file_path, language,
                                         lines_of_code, version, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    """, (task_id, agent_id, file_path, language, lines_of_code, version))
    conn.commit()
    conn.close()

# ─── Benchmark Operations ───────────────────────────────────────

def record_benchmark(build_version, metric, value, unit=None, site_id=None, passed=True):
    conn = get_conn()
    conn.execute("""
        INSERT INTO benchmarks (build_version, metric, value, unit, site_id, passed)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (build_version, metric, value, unit, site_id, 1 if passed else 0))
    conn.commit()
    conn.close()

def get_latest_benchmarks(build_version=None):
    conn = get_conn()
    if build_version:
        rows = conn.execute(
            "SELECT * FROM benchmarks WHERE build_version = ? ORDER BY measured_at DESC",
            (build_version,)
        ).fetchall()
    else:
        rows = conn.execute("""
            SELECT * FROM benchmarks WHERE id IN (
                SELECT MAX(id) FROM benchmarks GROUP BY metric
            ) ORDER BY metric
        """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ─── Deployment Operations ──────────────────────────────────────

def record_deployment(site_id, image_version):
    conn = get_conn()
    conn.execute("""
        INSERT INTO deployments (site_id, image_version) VALUES (?, ?)
    """, (site_id, image_version))
    conn.commit()
    conn.close()

def get_fleet_status():
    """Current deployment version at each site."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT d.* FROM deployments d
        INNER JOIN (
            SELECT site_id, MAX(id) as max_id FROM deployments GROUP BY site_id
        ) latest ON d.id = latest.max_id
        ORDER BY d.site_id
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ─── Sprint Operations ──────────────────────────────────────────

def create_sprint(name, goal, start_date, end_date):
    conn = get_conn()
    conn.execute("""
        INSERT INTO sprints (name, goal, start_date, end_date) VALUES (?, ?, ?, ?)
    """, (name, goal, start_date, end_date))
    conn.commit()
    sprint_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    return sprint_id

def get_sprint_summary(sprint_id):
    conn = get_conn()
    sprint = dict(conn.execute("SELECT * FROM sprints WHERE id = ?", (sprint_id,)).fetchone())
    tasks = conn.execute("SELECT state, COUNT(*) as cnt FROM tasks WHERE sprint_id = ? GROUP BY state",
                         (sprint_id,)).fetchall()
    sprint["task_counts"] = {r["state"]: r["cnt"] for r in tasks}
    conn.close()
    return sprint

# ─── Reporting ──────────────────────────────────────────────────

def get_agent_stats():
    """Summary of each agent's activity."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT agent_id,
               COUNT(*) as total_actions,
               SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) as successes,
               SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) as failures,
               ROUND(SUM(duration_sec), 1) as total_seconds
        FROM agent_log
        GROUP BY agent_id
        ORDER BY agent_id
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def dashboard():
    """Print full system status."""
    conn = get_conn()
    task_states = conn.execute(
        "SELECT state, COUNT(*) as cnt FROM tasks GROUP BY state"
    ).fetchall()
    total_tasks = sum(r["cnt"] for r in task_states)
    done_tasks = next((r["cnt"] for r in task_states if r["state"] == "DONE"), 0)
    
    agent_stats = get_agent_stats()
    fleet = get_fleet_status()
    benchmarks = get_latest_benchmarks()
    conn.close()

    print("\n" + "="*60)
    print("  SENTINELFORGE DASHBOARD")
    print("="*60)
    print(f"\n  Tasks: {done_tasks}/{total_tasks} complete")
    for r in task_states:
        print(f"    {r['state']:15s} {r['cnt']}")
    
    print(f"\n  Agent Activity:")
    for a in agent_stats:
        print(f"    Agent {a['agent_id']:2d}: {a['total_actions']} actions, "
              f"{a['successes']} ok, {a['failures']} fail, "
              f"{a['total_seconds'] or 0:.0f}s total")
    
    print(f"\n  Fleet ({len(fleet)} sites deployed):")
    for f in fleet:
        print(f"    {f['site_id']:8s} -> {f['image_version']:20s} [{f['status']}]")
    
    if benchmarks:
        print(f"\n  Latest Benchmarks:")
        for b in benchmarks:
            status = "PASS" if b["passed"] else "FAIL"
            print(f"    {b['metric']:30s} {b['value']:.4f} {b.get('unit',''):10s} [{status}]")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    init_db()
    dashboard()
