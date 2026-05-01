"""
SentinelForge Agent 17: Sprint Planner
Breaks quarterly engineering goals into 2-week sprints with prioritized task
assignments for each agent. Uses domain heuristics to decompose goals into
dependency-ordered work items.

The Sprint Planner is the first agent the Orchestrator consults after receiving
a human goal. It determines:
  1. Which agents are needed (based on keyword analysis of the goal)
  2. Task ordering (dependency graph construction)
  3. Priority assignment (P0-P3 based on pipeline criticality)
  4. Effort estimation (hours, based on module complexity heuristics)
"""
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))))

from db import log_action, create_task, create_sprint
from datetime import datetime, timezone, timedelta
from config import AGENTS

AGENT_ID = 17

# --- Task Templates ---
# Pre-defined task specifications keyed by pipeline domain.
# Each template maps goal keywords → ordered list of tasks.

TASK_TEMPLATES = {
    "calibration": [
        {"title": "Write calibration CUDA kernel", "agent_id": 1, "priority": "P1_HIGH",
         "description": "Implement dark subtraction and flat field division on GPU",
         "estimated_hours": 20, "depends_on": []},
        {"title": "Write background subtraction kernel", "agent_id": 1, "priority": "P1_HIGH",
         "description": "Sigma-clipped tiled median background estimation on GPU",
         "estimated_hours": 20, "depends_on": [0]},
    ],
    "detection": [
        {"title": "Generate synthetic test frames", "agent_id": 9, "priority": "P1_HIGH",
         "description": "Create frames with known streaks at various magnitudes (mag 14-22)",
         "estimated_hours": 10, "depends_on": []},
        {"title": "Write streak detection CUDA kernel", "agent_id": 2, "priority": "P0_CRITICAL",
         "description": "Matched filter bank (180 angles x 5 lengths) + Hough line transform on GPU",
         "estimated_hours": 40, "depends_on": []},
        {"title": "Review streak detection code", "agent_id": 19, "priority": "P1_HIGH",
         "description": "Review CUDA kernel for correctness, race conditions, and performance",
         "estimated_hours": 4, "depends_on": [1]},
        {"title": "Benchmark detection performance", "agent_id": 10, "priority": "P1_HIGH",
         "description": "Measure detection rate, false positive rate, and latency vs baselines",
         "estimated_hours": 8, "depends_on": [1, 0]},
    ],
    "astrometry": [
        {"title": "Write plate solver", "agent_id": 3, "priority": "P1_HIGH",
         "description": "Triangle pattern matching against Gaia DR3, WCS least-squares fitting with SIP distortion",
         "estimated_hours": 30, "depends_on": []},
        {"title": "Write photometry module", "agent_id": 3, "priority": "P2_MEDIUM",
         "description": "PSF fitting, aperture photometry, instrumental magnitudes, FWHM measurement",
         "estimated_hours": 15, "depends_on": [0]},
    ],
    "orbit": [
        {"title": "Write orbit propagator", "agent_id": 5, "priority": "P1_HIGH",
         "description": "Gauss IOD from 3 observations, Kepler equation + J2 perturbation propagation",
         "estimated_hours": 25, "depends_on": []},
        {"title": "Write conjunction screener", "agent_id": 8, "priority": "P0_CRITICAL",
         "description": "Foster-Estes 2D Pc with full 3x3 RTN covariance, encounter-plane projection",
         "estimated_hours": 30, "depends_on": [0]},
    ],
    "correlation": [
        {"title": "Write catalog correlator", "agent_id": 7, "priority": "P1_HIGH",
         "description": "Mahalanobis distance gating with uncertainty propagation against local catalog",
         "estimated_hours": 20, "depends_on": []},
        {"title": "Write anomaly detector", "agent_id": 8, "priority": "P2_MEDIUM",
         "description": "Flag uncorrelated tracks; classify MANEUVER / BREAKUP / NEW_OBJECT per 18 SDS taxonomy",
         "estimated_hours": 30, "depends_on": [0]},
    ],
    "ml": [
        {"title": "Train detection ML model", "agent_id": 6, "priority": "P2_MEDIUM",
         "description": "PyTorch model for faint streak detection at mag 18+, export to ONNX for edge inference",
         "estimated_hours": 40, "depends_on": []},
    ],
    "deployment": [
        {"title": "Build Docker image", "agent_id": 13, "priority": "P1_HIGH",
         "description": "Multi-stage build: compile C++/CUDA → Python runtime → NVIDIA CUDA base",
         "estimated_hours": 4, "depends_on": []},
        {"title": "Deploy canary to primary site", "agent_id": 14, "priority": "P2_MEDIUM",
         "description": "Push container to CHL-01, 24hr soak test with shadow validation",
         "estimated_hours": 4, "depends_on": [0]},
        {"title": "Monitor canary site", "agent_id": 15, "priority": "P2_MEDIUM",
         "description": "Watch health telemetry for 24 hours — detection rate, latency, GPU temp, disk I/O",
         "estimated_hours": 2, "depends_on": [1]},
    ],
}

# Keyword → template domain mapping
KEYWORD_MAP = {
    "calibration": ["calibrat", "dark", "flat", "background"],
    "detection":   ["streak", "detect", "matched", "hough", "filter"],
    "astrometry":  ["plate", "astrometr", "wcs", "star", "gaia"],
    "orbit":       ["orbit", "propagat", "kepler", "conjunction", "iod", "gauss"],
    "correlation": ["correlat", "catalog", "mahalanobis", "anomal", "uct"],
    "ml":          ["train", "model", "pytorch", "onnx", "neural", "ml"],
    "deployment":  ["deploy", "docker", "container", "fleet", "canary"],
}

# Full pipeline task ordering — used when goal is broad
FULL_PIPELINE_ORDER = [
    "calibration", "detection", "astrometry", "orbit",
    "correlation", "ml", "deployment"
]


def decompose_goal(goal_text: str) -> list:
    """
    Decompose an engineering goal into prioritized, dependency-ordered tasks.

    Strategy:
      1. Keyword scan to identify relevant pipeline domains
      2. If goal is broad ("full pipeline", "end-to-end"), include everything
      3. Always append code review (Agent 19), regression gate (Agent 12),
         and documentation (Agent 18) tasks
      4. Resolve cross-template dependency indices
    """
    goal_lower = goal_text.lower()
    tasks = []

    # Check for full pipeline goals
    is_full = any(w in goal_lower for w in ["pipeline", "full", "end-to-end", "all", "complete"])

    if is_full:
        # Include all domains in pipeline order
        matched_domains = FULL_PIPELINE_ORDER
    else:
        # Match specific domains via keywords
        matched_domains = []
        for domain, keywords in KEYWORD_MAP.items():
            if any(kw in goal_lower for kw in keywords):
                matched_domains.append(domain)

    # Build task list from matched templates
    offset = 0
    for domain in matched_domains:
        template = TASK_TEMPLATES.get(domain, [])
        for t in template:
            task = dict(t)
            # Shift dependency indices by current offset
            task["depends_on"] = [d + offset for d in t["depends_on"]]
            tasks.append(task)
        offset += len(template)

    # Append cross-cutting tasks
    if tasks:
        code_task_indices = list(range(len(tasks)))

        # Code review covers all code tasks
        tasks.append({
            "title": "Review all code changes",
            "agent_id": 19,
            "priority": "P1_HIGH",
            "description": "Review C++/CUDA/Python for correctness, performance, and domain accuracy",
            "estimated_hours": max(4, len(code_task_indices) * 2),
            "depends_on": code_task_indices,
        })

        # Regression gate after review
        tasks.append({
            "title": "Run regression test suite",
            "agent_id": 12,
            "priority": "P1_HIGH",
            "description": "Verify no performance degradation vs baselines across all metrics",
            "estimated_hours": 4,
            "depends_on": [len(tasks) - 1],
        })

        # Documentation at the end
        tasks.append({
            "title": "Generate documentation",
            "agent_id": 18,
            "priority": "P3_LOW",
            "description": "API docs, architecture decision record, and deployment runbook",
            "estimated_hours": 8,
            "depends_on": [len(tasks) - 1],
        })

    # Fallback: unrecognized goal
    if not tasks:
        tasks = [{
            "title": f"Investigate: {goal_text[:60]}",
            "agent_id": 20,
            "priority": "P2_MEDIUM",
            "description": goal_text,
            "estimated_hours": 2,
            "depends_on": [],
        }]

    return tasks


def estimate_sprint_capacity(task_list: list) -> dict:
    """Compute sprint capacity and agent load distribution."""
    total_hours = sum(t.get("estimated_hours", 0) for t in task_list)
    agent_load = {}
    for t in task_list:
        aid = t["agent_id"]
        agent_name = AGENTS.get(aid, {}).get("name", f"Agent {aid}")
        if aid not in agent_load:
            agent_load[aid] = {"name": agent_name, "tasks": 0, "hours": 0}
        agent_load[aid]["tasks"] += 1
        agent_load[aid]["hours"] += t.get("estimated_hours", 0)

    critical_path = [t for t in task_list if t.get("priority") in ("P0_CRITICAL", "P1_HIGH")]

    return {
        "total_tasks": len(task_list),
        "total_hours": total_hours,
        "critical_count": len(critical_path),
        "agent_load": agent_load,
        "fits_2_week_sprint": total_hours <= 160,  # 2 engineers x 80hr
    }


def execute(task):
    """
    Sprint planning entry point — called by the Orchestrator.
    Decomposes the sprint's parent goal and validates the plan.
    """
    print("           [SprintPlanner] Decomposing goal into task graph...")

    goal_text = task.get("description", task.get("title", ""))
    task_list = decompose_goal(goal_text)
    capacity = estimate_sprint_capacity(task_list)

    print(f"           [SprintPlanner] Generated {capacity['total_tasks']} tasks, "
          f"{capacity['total_hours']:.0f}h estimated, "
          f"{capacity['critical_count']} critical-path")

    if not capacity["fits_2_week_sprint"]:
        print(f"           [SprintPlanner] WARNING: {capacity['total_hours']:.0f}h exceeds "
              f"2-week capacity (160h) — consider splitting into 2 sprints")

    # Log agent load distribution
    for aid, info in sorted(capacity["agent_load"].items()):
        print(f"           [SprintPlanner]   Agent {aid:2d} ({info['name']:22s}): "
              f"{info['tasks']} tasks, {info['hours']:.0f}h")

    log_action(
        AGENT_ID, "PLAN_SPRINT", task["id"],
        details={
            "goal": goal_text,
            "task_count": capacity["total_tasks"],
            "total_hours": capacity["total_hours"],
            "critical_path_count": capacity["critical_count"],
            "fits_sprint": capacity["fits_2_week_sprint"],
        },
        status="SUCCESS"
    )

    return True


# --- CLI for standalone testing ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sprint_planner.py \"Your engineering goal\"")
        print("\nExamples:")
        print("  python sprint_planner.py \"Build the full edge detection pipeline\"")
        print("  python sprint_planner.py \"Improve streak detection for mag 18+ objects\"")
        print("  python sprint_planner.py \"Deploy updated conjunction screener\"")
        sys.exit(0)

    goal = " ".join(sys.argv[1:])
    print(f"\n{'='*60}")
    print(f"  SPRINT PLANNER — Goal Decomposition")
    print(f"  Goal: {goal}")
    print(f"{'='*60}\n")

    tasks = decompose_goal(goal)
    capacity = estimate_sprint_capacity(tasks)

    for i, t in enumerate(tasks):
        agent_name = AGENTS.get(t["agent_id"], {}).get("name", f"Agent {t['agent_id']}")
        dep_str = f" (after: {t['depends_on']})" if t["depends_on"] else ""
        print(f"  [{i:2d}] {t['priority']:12s} Agent {t['agent_id']:2d} ({agent_name:22s}) "
              f"| {t['title']}{dep_str}")
        print(f"       {t['description']}")
        print(f"       Est: {t.get('estimated_hours', '?')}h\n")

    print(f"{'='*60}")
    print(f"  Summary: {capacity['total_tasks']} tasks, "
          f"{capacity['total_hours']:.0f}h, "
          f"{capacity['critical_count']} critical-path")
    fits = "YES" if capacity["fits_2_week_sprint"] else "NO — split recommended"
    print(f"  Fits 2-week sprint: {fits}")
    print(f"{'='*60}\n")
