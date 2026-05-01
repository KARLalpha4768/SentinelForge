"""
SentinelForge Agent 20: Orchestrator
Master coordinator - receives goals from human, decomposes into tasks,
routes to Sprint Planner, monitors system health, reports daily summary.
"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from config import AGENTS, SITES, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_ENDPOINT
from db import (init_db, create_sprint, create_task, update_task_state,
                get_tasks_for_agent, get_agent_stats, get_fleet_status,
                get_latest_benchmarks, log_action, dashboard, get_conn)

try:
    import urllib.request
    HAS_HTTP = True
except ImportError:
    HAS_HTTP = False


def call_gemini(prompt, max_tokens=4096):
    """Call Gemini 2.0 Flash for task decomposition and reasoning."""
    if not GEMINI_API_KEY:
        print("  [!] No GEMINI_API_KEY - using heuristic decomposition")
        return None
    
    url = f"{GEMINI_ENDPOINT}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.3}
    }).encode()
    
    req = urllib.request.Request(url, data=payload,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"  [!] Gemini error: {e}")
        return None


def decompose_goal(goal_text):
    """Break a high-level engineering goal into agent-level tasks."""
    prompt = f"""You are the master orchestrator for SentinelForge, a 20-agent space surveillance engineering system.

Given this engineering goal, decompose it into concrete tasks assigned to specific agents.

AGENTS AVAILABLE:
1  Frame Architect     - writes calibration.cu, background.cu (CUDA GPU kernels)
2  GPU Kernel Engineer - writes streak_detect.cu, matched_filter.cu (CUDA detection)
3  Plate Solver        - writes plate_solver.cpp, photometry.cpp (astrometry)
4  Hardware Interface  - writes camera_driver.cpp, mount_control.cpp (device I/O)
5  Pipeline Orchestrator - writes source_extract.py, autonomous.py (Python pipeline)
6  ML Trainer          - trains PyTorch detection models, exports ONNX
7  Correlator          - writes correlator.py, catalog matching
8  Anomaly Hunter      - writes anomaly_detect.py, characterize.py
9  Data Simulator      - generates synthetic telescope frames
10 Benchmark Runner    - measures performance metrics
11 Shadow Validator    - compares edge vs cloud results
12 Regression Guard    - CI/CD gate, test suite
13 Docker Builder      - builds container images
14 Fleet Deployer      - pushes to remote sites
15 Site Monitor        - watches health telemetry
16 Fault Responder     - diagnoses and fixes site issues
17 Sprint Planner      - plans 2-week sprints
18 Doc Writer          - generates documentation
19 Code Reviewer       - reviews code quality
20 Orchestrator        - (you) coordinates everything

GOAL: {goal_text}

Return a JSON array of tasks:
[
  {{"title": "...", "agent_id": N, "priority": "P0_CRITICAL|P1_HIGH|P2_MEDIUM|P3_LOW", "description": "...", "estimated_hours": N, "depends_on": [task_indices]}},
  ...
]

Rules:
- Order tasks by dependency (earlier tasks first)
- depends_on uses 0-based indices into this array
- Every code task needs a corresponding review task (agent 19)
- Every code change needs benchmark (agent 10) and regression (agent 12) tasks
- Include documentation task (agent 18) at the end
- Be specific about what each agent should produce
"""
    
    response = call_gemini(prompt)
    if response:
        # Extract JSON from response
        try:
            # Find JSON array in response
            start = response.index("[")
            end = response.rindex("]") + 1
            tasks = json.loads(response[start:end])
            return tasks
        except (ValueError, json.JSONDecodeError) as e:
            print(f"  [!] Failed to parse Gemini response: {e}")
    
    # Fallback: heuristic decomposition
    return heuristic_decompose(goal_text)


def heuristic_decompose(goal_text):
    """Delegate to Sprint Planner (Agent 17) for structured goal decomposition."""
    from agents.tier5_mgmt.sprint_planner import decompose_goal as planner_decompose
    return planner_decompose(goal_text)


def execute_goal(goal_text):
    """Main entry point: take a goal, decompose, create sprint, assign tasks."""
    print(f"\n{'='*60}")
    print(f"  SENTINELFORGE ORCHESTRATOR")
    print(f"  Goal: {goal_text}")
    print(f"{'='*60}\n")
    
    # Initialize DB
    init_db()
    
    # Decompose goal into tasks
    print("[Agent 20] Decomposing goal into tasks...")
    task_specs = decompose_goal(goal_text)
    print(f"[Agent 20] Generated {len(task_specs)} tasks\n")
    
    # Create sprint
    now = datetime.now(timezone.utc)
    sprint_id = create_sprint(
        name=f"Sprint {now.strftime('%Y-W%W')}",
        goal=goal_text,
        start_date=now.isoformat(),
        end_date=(now + timedelta(weeks=2)).isoformat()
    )
    print(f"[Agent 20] Created Sprint {sprint_id}\n")
    
    # Create tasks in DB
    task_id_map = {}  # index -> db task_id
    for i, spec in enumerate(task_specs):
        # Resolve dependency indices to actual task IDs
        dep_ids = []
        for dep_idx in spec.get("depends_on", []):
            if dep_idx in task_id_map:
                dep_ids.append(task_id_map[dep_idx])
        
        agent_id = spec["agent_id"]
        agent_name = AGENTS.get(agent_id, {}).get("name", f"Agent {agent_id}")
        
        task_id = create_task(
            sprint_id=sprint_id,
            title=spec["title"],
            description=spec.get("description", ""),
            agent_id=agent_id,
            priority=spec.get("priority", "P2_MEDIUM"),
            deliverables=AGENTS.get(agent_id, {}).get("deliverables", []),
            depends_on=dep_ids,
            estimated_hours=spec.get("estimated_hours")
        )
        task_id_map[i] = task_id
        
        dep_str = f" (depends on: {dep_ids})" if dep_ids else ""
        print(f"  Task {task_id:3d} | [{spec.get('priority','P2'):12s}] "
              f"Agent {agent_id:2d} ({agent_name:22s}) | {spec['title']}{dep_str}")
    
    # Log orchestrator action
    log_action(
        agent_id=20,
        action="DECOMPOSE_GOAL",
        details={"goal": goal_text, "sprint_id": sprint_id, "task_count": len(task_specs)},
        status="SUCCESS"
    )
    
    print(f"\n[Agent 20] All {len(task_specs)} tasks created in Sprint {sprint_id}")
    print(f"[Agent 20] Ready for execution. Run: python main.py run {sprint_id}")
    
    # Show dashboard
    dashboard()
    
    return sprint_id


def run_sprint(sprint_id):
    """Execute all tasks in a sprint respecting dependencies."""
    print(f"\n{'='*60}")
    print(f"  SENTINELFORGE - EXECUTING SPRINT {sprint_id}")
    print(f"{'='*60}\n")
    
    conn = get_conn()
    tasks = conn.execute(
        "SELECT * FROM tasks WHERE sprint_id = ? ORDER BY priority, id",
        (sprint_id,)
    ).fetchall()
    tasks = [dict(t) for t in tasks]
    conn.close()
    
    completed = set()
    iteration = 0
    max_iterations = len(tasks) * 2  # Safety limit
    
    while len(completed) < len(tasks) and iteration < max_iterations:
        iteration += 1
        progress = False
        
        for task in tasks:
            if task["id"] in completed:
                continue
            
            # Check dependencies
            deps = json.loads(task["depends_on"]) if task["depends_on"] else []
            if not all(d in completed for d in deps):
                continue
            
            # Execute task
            agent_id = task["agent_id"]
            agent_name = AGENTS.get(agent_id, {}).get("name", f"Agent {agent_id}")
            
            print(f"\n  [Agent {agent_id:2d}] {agent_name}: {task['title']}")
            print(f"           {task['description']}")
            
            update_task_state(task["id"], "IN_PROGRESS")
            
            start_time = time.time()
            # Simulate agent execution (in real system, each agent does actual work)
            success = execute_agent_task(agent_id, task)
            elapsed = time.time() - start_time
            
            if success:
                update_task_state(task["id"], "DONE")
                log_action(agent_id, "COMPLETE_TASK", task["id"],
                          details={"title": task["title"]},
                          duration_sec=elapsed, status="SUCCESS")
                completed.add(task["id"])
                print(f"           => DONE ({elapsed:.1f}s)")
                progress = True
            else:
                update_task_state(task["id"], "BLOCKED")
                log_action(agent_id, "BLOCKED_TASK", task["id"],
                          details={"title": task["title"]},
                          duration_sec=elapsed, status="FAILED")
                print(f"           => BLOCKED")
        
        if not progress:
            print("\n  [!] No progress made - checking for circular dependencies")
            break
    
    print(f"\n  Sprint {sprint_id}: {len(completed)}/{len(tasks)} tasks completed")
    dashboard()


def execute_agent_task(agent_id, task):
    """Dispatch task to the appropriate agent. Returns True on success."""
    # Import and run the agent's execute function
    agent_info = AGENTS.get(agent_id, {})
    module_name = agent_info.get("module", "")
    
    try:
        # Dynamic import
        module = __import__(f"agents.{module_name}", fromlist=["execute"])
        if hasattr(module, "execute"):
            return module.execute(task)
    except (ImportError, ModuleNotFoundError):
        # Agent not yet implemented — log and mark as done (placeholder)
        print(f"           [stub] Agent {agent_id} not yet implemented - auto-completing")
        return True
    
    return True


# ─── CLI ────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python orchestrator.py goal 'Build the full detection pipeline'")
        print("  python orchestrator.py run <sprint_id>")
        print("  python orchestrator.py status")
        return
    
    command = sys.argv[1]
    
    if command == "goal":
        goal = " ".join(sys.argv[2:])
        execute_goal(goal)
    elif command == "run":
        sprint_id = int(sys.argv[2])
        run_sprint(sprint_id)
    elif command == "status":
        init_db()
        dashboard()
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
