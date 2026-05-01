# SentinelForge

**A 20-Agent Autonomous Space Surveillance Engineering System**

SentinelForge is a multi-agent AI system that autonomously writes, tests, reviews, deploys, and monitors a complete space surveillance pipeline — from raw telescope frames to collision warnings. The system comprises two layers:

1. **The Agent System** (~3,600 lines) — 20 specialized AI agents organized in 5 tiers that collaborate to build and maintain the surveillance software.
2. **The Generated Pipeline** (~2,500 lines) — The actual space surveillance code produced by those agents: calibration, streak detection, orbit propagation, conjunction screening, and autonomous observatory control.

Total: **7,244 lines of Python across 44 files.**

---

## Quick Start

```bash
# 1. Clone / unzip
cd sentinelforge/

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize the database and verify the system
python main.py

# 4. Run the end-to-end integration test
python end_to_end_test.py

# 5. Verify the agent-generated pipeline independently
cd output/builds/src/
python simulate_frames.py      # Generates synthetic telescope data
python source_extract.py       # Extracts detections from frames
python correlator.py            # Matches detections to catalog
python anomaly_detect.py        # Triages uncorrelated tracks
python orbit_propagator.py      # Computes orbital elements
python conjunction_screener.py  # Evaluates collision probability
python observation_scheduler.py # Assigns telescope tasks
```

---

## Architecture

```
sentinelforge/
├── main.py                          # Entry point — boots the Orchestrator
├── config.py                        # Sites, credentials, model paths, API config
├── db.py                            # SQLite task/sprint tracking (310 lines)
├── knowledge.py                     # Domain knowledge loader (equations, algorithms)
├── end_to_end_test.py               # Full pipeline integration test
├── requirements.txt                 # Python dependencies
│
├── agents/                          # THE 20-AGENT SYSTEM
│   ├── tier1_cpp/                   # C++/CUDA code generation agents
│   │   ├── frame_architect.py       # Agent 1:  GPU calibration kernels
│   │   ├── gpu_kernel_engineer.py   # Agent 2:  Streak detection kernels
│   │   ├── plate_solver.py          # Agent 3:  Astrometric solution
│   │   └── hardware_interface.py    # Agent 4:  CCD/telescope drivers
│   │
│   ├── tier2_python/                # Python pipeline agents
│   │   ├── pipeline_orchestrator.py # Agent 5:  Observatory state machine
│   │   ├── ml_trainer.py            # Agent 6:  PyTorch model training
│   │   ├── correlator.py            # Agent 7:  Catalog matching
│   │   └── anomaly_hunter.py        # Agent 8:  Uncorrelated track triage
│   │
│   ├── tier3_testing/               # Testing & validation agents
│   │   ├── data_simulator.py        # Agent 9:  Synthetic frame generation
│   │   ├── benchmark_runner.py      # Agent 10: Performance measurement
│   │   ├── shadow_validator.py      # Agent 11: Edge vs. cloud comparison
│   │   └── regression_guard.py      # Agent 12: CI/CD regression gate
│   │
│   ├── tier4_deploy/                # Deployment & operations agents
│   │   ├── docker_builder.py        # Agent 13: Container image builds
│   │   ├── fleet_deployer.py        # Agent 14: Multi-site rollout
│   │   ├── site_monitor.py          # Agent 15: Health telemetry
│   │   └── fault_responder.py       # Agent 16: Auto-remediation
│   │
│   └── tier5_mgmt/                  # Management agents
│       ├── orchestrator.py          # Agent 20: Master coordinator
│       ├── sprint_planner.py        # Agent 17: Task decomposition
│       ├── code_reviewer.py         # Agent 19: Automated code review
│       └── doc_writer.py            # Agent 18: Documentation generation
│
├── data/
│   ├── sentinelforge.db             # Populated task/sprint tracking database
│   └── knowledge/
│       ├── algorithms.json          # Matched filter, Hough transform specs
│       ├── equations.json           # Kepler, Gauss IOD, Foster-Estes formulas
│       └── hardware.json            # CCD specs, Jetson Orin, telescope params
│
├── output/
│   └── builds/src/                  # AGENT-GENERATED PIPELINE CODE
│       ├── simulate_frames.py       # Synthetic telescope frame generator
│       ├── source_extract.py        # Detection table assembly
│       ├── correlator.py            # Mahalanobis distance matching
│       ├── anomaly_detect.py        # Maneuver/breakup/new-object alerts
│       ├── orbit_propagator.py      # Gauss IOD + Kepler/J2 propagation
│       ├── multi_sensor_fusion.py   # Kalman filter, multi-site fusion
│       ├── conjunction_screener.py  # Foster-Estes collision probability
│       ├── observation_scheduler.py # Priority-based telescope tasking
│       ├── autonomous.py            # Night-cycle state machine
│       ├── train_model.py           # PyTorch training + ONNX export
│       ├── benchmark.py             # Performance measurement harness
│       ├── regression_guard.py      # CI/CD gate
│       ├── deploy.py                # Fleet deployment orchestration
│       └── monitor.py               # Site health monitoring
│
└── templates/                       # (Reserved for CUDA/C++ templates)
```

---

## How It Works

### The Agent Loop

```
HUMAN sets goal
    → Agent 20 (Orchestrator) decomposes into tasks
    → Agent 17 (Sprint Planner) assigns to builder agents
    → Tier 1-2 agents write code
    → Agent 19 (Code Reviewer) reviews
    → Tier 3 agents test (synthetic data, benchmarks, shadow validation)
    → Agent 12 (Regression Guard) gates the merge
    → Tier 4 agents build containers, deploy, monitor
    → Agent 18 (Doc Writer) generates documentation
    → Agent 20 reports results to HUMAN
```

### The Surveillance Pipeline

```
Raw CCD frame (32 MB)
    → calibration.cu (dark subtract, flat field, sky background)
    → streak_detect.cu (matched filter bank, 900 filters, 5σ extraction)
    → plate_solver.cpp (Gaia DR3 triangle matching, WCS fit)
    → source_extract.py (detection table assembly)
    → correlator.py (Mahalanobis distance vs. catalog)
    → anomaly_detect.py (NEW OBJECT / MANEUVER / BREAKUP alerts)
    → Detection package (60 KB) uploaded to cloud
    → multi_sensor_fusion.py (Kalman filter across 20 sites)
    → orbit_propagator.py (Gauss IOD, Kepler+J2)
    → conjunction_screener.py (Foster-Estes collision probability)
    → observation_scheduler.py (telescope tasking for next night)
```

---

## Verification Steps

### 1. Structural Verification
Confirm all 44 Python files are present and parseable:
```bash
python -c "
import ast, pathlib
files = list(pathlib.Path('.').rglob('*.py'))
for f in files:
    try:
        ast.parse(f.read_text())
        print(f'  OK  {f}')
    except SyntaxError as e:
        print(f'FAIL  {f}: {e}')
print(f'\nTotal: {len(files)} files')
"
```

### 2. Database Verification
Inspect the task tracking database:
```bash
python -c "
import sqlite3
conn = sqlite3.connect('data/sentinelforge.db')
for table in conn.execute(\"SELECT name FROM sqlite_master WHERE type='table'\").fetchall():
    count = conn.execute(f'SELECT COUNT(*) FROM {table[0]}').fetchone()[0]
    print(f'  {table[0]}: {count} rows')
conn.close()
"
```

### 3. Knowledge Base Verification
Confirm domain knowledge is populated:
```bash
python -c "
import json
for f in ['data/knowledge/algorithms.json', 'data/knowledge/equations.json', 'data/knowledge/hardware.json']:
    data = json.load(open(f))
    print(f'  {f}: {len(data)} entries')
"
```

### 4. Agent Execution Test
Run the full end-to-end test:
```bash
python end_to_end_test.py
```

### 5. Pipeline Module Tests
Each generated pipeline module can be run independently:
```bash
cd output/builds/src/
python orbit_propagator.py      # Should compute orbital elements
python conjunction_screener.py  # Should evaluate collision probability
python multi_sensor_fusion.py   # Should run Kalman filter
```

---

## Domain Science

The system implements real orbital mechanics and signal processing:

- **Calibration:** Dark subtraction, flat fielding, sigma-clipped sky background
- **Detection:** Matched filter bank (180 angles × 5 lengths), non-maximum suppression
- **Astrometry:** Triangle pattern matching against Gaia DR3, WCS polynomial fit
- **Correlation:** Mahalanobis distance gating with uncertainty propagation
- **Orbit Determination:** Gauss's method (3-observation IOD), Kepler equation with J2 perturbation
- **Conjunction Screening:** Foster-Estes collision probability integral
- **Scheduling:** Visibility geometry, priority queuing, weather-aware tasking

---

## Tech Stack

| Component | Technology |
|---|---|
| Language | Python 3.10+ |
| AI Backbone | Google Gemini 2.0 Flash |
| ML Framework | PyTorch + ONNX export |
| Numerical | NumPy |
| Database | SQLite |
| Containers | Docker (multi-stage CUDA builds) |
| Fleet Ops | Ansible + Docker Compose over VPN |
| Monitoring | Prometheus + Grafana |

---

## Author

Karl David — Principal Engineer, Kham Enterprises LLC

Built as a demonstration of autonomous multi-agent software engineering applied to space domain awareness. The system demonstrates that a single engineer can architect, build, and operate the equivalent of a 20-person engineering team through AI agent orchestration.

---

## License

Proprietary. All rights reserved. For evaluation and interview demonstration purposes only.
