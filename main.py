"""
SentinelForge — Main Entry Point
20-Agent Space Surveillance Engineering Coordination System

Usage:
    python main.py goal "Build the full edge detection pipeline"
    python main.py run <sprint_id>
    python main.py status
"""
import sys
import os

# Ensure sentinelforge is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.tier5_mgmt.orchestrator import execute_goal, run_sprint, dashboard
from db import init_db


def main():
    if len(sys.argv) < 2:
        print("""
  ╔══════════════════════════════════════════════════════════╗
  ║           SENTINELFORGE v1.0                            ║
  ║   20-Agent Space Surveillance Engineering System        ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  Commands:                                               ║
  ║    goal  "..."   Decompose an engineering goal           ║
  ║    run   <id>    Execute a sprint                        ║
  ║    status        Show system dashboard                   ║
  ║                                                          ║
  ║  Examples:                                               ║
  ║    python main.py goal "Build the full pipeline"         ║
  ║    python main.py goal "Improve mag 18 detection 15%"    ║
  ║    python main.py run 1                                  ║
  ║    python main.py status                                 ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
        """)
        return

    command = sys.argv[1]

    if command == "goal":
        if len(sys.argv) < 3:
            print("  Usage: python main.py goal \"Your engineering goal here\"")
            return
        goal = " ".join(sys.argv[2:])
        execute_goal(goal)

    elif command == "run":
        if len(sys.argv) < 3:
            print("  Usage: python main.py run <sprint_id>")
            return
        sprint_id = int(sys.argv[2])
        run_sprint(sprint_id)

    elif command == "status":
        init_db()
        dashboard()

    else:
        print(f"  Unknown command: {command}")
        print("  Use: goal, run, or status")


if __name__ == "__main__":
    main()
