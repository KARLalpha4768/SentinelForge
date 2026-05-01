"""
SentinelForge Configuration
20-Agent Space Surveillance Engineering Coordination System
"""
import os
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"
TEMPLATE_DIR = BASE_DIR / "templates"
DB_PATH = DATA_DIR / "sentinelforge.db"

# ─── AI Backend ─────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
MAX_TOKENS = 8192
TEMPERATURE = 0.3  # Low temp for code generation accuracy

# ─── Observatory Sites ──────────────────────────────────────────
SITES = [
    # Easy Tier (fiber, accessible)
    {"id": "USA-01", "country": "USA", "region": "Texas",          "tier": "easy",   "sensors": ["varda", "horus"], "connectivity": "fiber",     "climate": "temperate"},
    {"id": "USA-02", "country": "USA", "region": "New Mexico",     "tier": "easy",   "sensors": ["varda", "horus"], "connectivity": "fiber",     "climate": "arid"},
    {"id": "USA-03", "country": "USA", "region": "Hawaii",         "tier": "medium", "sensors": ["horus"],          "connectivity": "fiber",     "climate": "tropical"},
    {"id": "FRA-01", "country": "France", "region": "Provence",    "tier": "easy",   "sensors": ["varda", "horus"], "connectivity": "fiber",     "climate": "mediterranean"},
    {"id": "ESP-01", "country": "Spain", "region": "Mainland",     "tier": "easy",   "sensors": ["horus"],          "connectivity": "fiber",     "climate": "mediterranean"},
    # Medium Tier
    {"id": "ESP-02", "country": "Spain", "region": "Canary Islands","tier": "medium","sensors": ["varda", "horus"], "connectivity": "fiber",     "climate": "subtropical"},
    {"id": "CHL-01", "country": "Chile", "region": "Atacama",      "tier": "medium", "sensors": ["varda", "horus"], "connectivity": "fiber",     "climate": "arid"},
    {"id": "CHL-02", "country": "Chile", "region": "Northern",     "tier": "medium", "sensors": ["horus"],          "connectivity": "mixed",     "climate": "arid"},
    {"id": "GRC-01", "country": "Greece", "region": "Peloponnese", "tier": "medium", "sensors": ["horus"],          "connectivity": "mixed",     "climate": "mediterranean"},
    {"id": "AUS-01", "country": "Australia", "region": "NSW",      "tier": "medium", "sensors": ["varda", "horus"], "connectivity": "mixed",     "climate": "temperate"},
    # Hard Tier (satellite, remote)
    {"id": "AUS-02", "country": "Australia", "region": "Western",  "tier": "hard",   "sensors": ["varda", "horus"], "connectivity": "satellite", "climate": "arid"},
    {"id": "MAR-01", "country": "Morocco", "region": "Atlas Mtns", "tier": "hard",   "sensors": ["varda", "horus"], "connectivity": "satellite", "climate": "arid"},
    {"id": "MAR-02", "country": "Morocco", "region": "Coastal",    "tier": "hard",   "sensors": ["horus"],          "connectivity": "satellite", "climate": "arid"},
    {"id": "NAM-01", "country": "Namibia", "region": "Gamsberg",   "tier": "hard",   "sensors": ["varda", "horus"], "connectivity": "satellite", "climate": "desert"},
    {"id": "NAM-02", "country": "Namibia", "region": "South",      "tier": "hard",   "sensors": ["horus"],          "connectivity": "satellite", "climate": "desert"},
]

# ─── Edge Hardware Spec ─────────────────────────────────────────
EDGE_BOX_SPEC = {
    "gpu": "NVIDIA Jetson AGX Orin 64GB",
    "cpu": "12-core ARM Cortex-A78AE",
    "ram_gb": 64,
    "storage_tb": 2,
    "os": "Ubuntu 22.04 LTS",
    "cuda_version": "12.2",
    "docker": True,
    "power_draw_watts": 300,
    "cost_usd": 5000,
}

# ─── Sensor Specifications ──────────────────────────────────────
SENSOR_SPECS = {
    "varda": {
        "type": "gimbaled_cued",
        "aperture_inches": 16,
        "focal_ratio": "f/4",
        "ccd_pixels": (4096, 4096),
        "pixel_size_um": 9.0,
        "bit_depth": 16,
        "fov_deg": 0.5,
        "frame_size_mb": 32,
        "cooling_target_c": -20,
        "mount_protocol": "LX200",
        "interface": "USB3",
    },
    "horus": {
        "type": "staring_uncued",
        "lens_count": 6,
        "fov_per_lens_deg": 15,
        "total_fov_deg": 90,
        "sensor_type": "CMOS",
        "pixel_size_um": 3.76,
        "resolution": (6144, 4096),
        "bit_depth": 14,
        "frame_size_mb": 48,
        "interface": "GigE",
    },
}

# ─── Agent Registry ─────────────────────────────────────────────
AGENTS = {
    # Tier 1: C++/CUDA Development (30%)
    1:  {"name": "Frame Architect",       "tier": 1, "module": "tier1_cpp.frame_architect",       "lang": "cuda",   "deliverables": ["calibration.cu", "background.cu"]},
    2:  {"name": "GPU Kernel Engineer",   "tier": 1, "module": "tier1_cpp.gpu_kernel_engineer",   "lang": "cuda",   "deliverables": ["streak_detect.cu", "matched_filter.cu"]},
    3:  {"name": "Plate Solver",          "tier": 1, "module": "tier1_cpp.plate_solver",          "lang": "cpp",    "deliverables": ["plate_solver.cpp", "photometry.cpp"]},
    4:  {"name": "Hardware Interface",    "tier": 1, "module": "tier1_cpp.hardware_interface",    "lang": "cpp",    "deliverables": ["camera_driver.cpp", "mount_control.cpp"]},
    # Tier 2: Python Pipeline (25%)
    5:  {"name": "Pipeline Orchestrator", "tier": 2, "module": "tier2_python.pipeline_orchestrator","lang": "python","deliverables": ["source_extract.py", "autonomous.py"]},
    6:  {"name": "ML Trainer",            "tier": 2, "module": "tier2_python.ml_trainer",           "lang": "python","deliverables": ["train.py", "evaluate.py", "export_onnx.py"]},
    7:  {"name": "Correlator",            "tier": 2, "module": "tier2_python.correlator",           "lang": "python","deliverables": ["correlator.py", "catalog_mirror.py"]},
    8:  {"name": "Anomaly Hunter",        "tier": 2, "module": "tier2_python.anomaly_hunter",       "lang": "python","deliverables": ["anomaly_detect.py", "characterize.py"]},
    # Tier 3: Testing (20%)
    9:  {"name": "Data Simulator",        "tier": 3, "module": "tier3_testing.data_simulator",      "lang": "python","deliverables": ["simulate_frames.py", "inject_streaks.py"]},
    10: {"name": "Benchmark Runner",      "tier": 3, "module": "tier3_testing.benchmark_runner",    "lang": "python","deliverables": ["benchmark.py", "profile_gpu.py"]},
    11: {"name": "Shadow Validator",      "tier": 3, "module": "tier3_testing.shadow_validator",    "lang": "python","deliverables": ["shadow_compare.py", "accuracy_report.py"]},
    12: {"name": "Regression Guard",      "tier": 3, "module": "tier3_testing.regression_guard",    "lang": "python","deliverables": ["test_suite.py", "ci_gate.py"]},
    # Tier 4: Deployment (15%)
    13: {"name": "Docker Builder",        "tier": 4, "module": "tier4_deploy.docker_builder",      "lang": "docker","deliverables": ["Dockerfile", "docker-compose.yml"]},
    14: {"name": "Fleet Deployer",        "tier": 4, "module": "tier4_deploy.fleet_deployer",      "lang": "python","deliverables": ["deploy.py", "rollback.py"]},
    15: {"name": "Site Monitor",          "tier": 4, "module": "tier4_deploy.site_monitor",        "lang": "python","deliverables": ["monitor.py", "dashboard.py"]},
    16: {"name": "Fault Responder",       "tier": 4, "module": "tier4_deploy.fault_responder",     "lang": "python","deliverables": ["diagnose.py", "remediate.py"]},
    # Tier 5: Management (10%)
    17: {"name": "Sprint Planner",        "tier": 5, "module": "tier5_mgmt.sprint_planner",        "lang": "python","deliverables": ["plan_sprint.py"]},
    18: {"name": "Doc Writer",            "tier": 5, "module": "tier5_mgmt.doc_writer",            "lang": "python","deliverables": ["generate_docs.py"]},
    19: {"name": "Code Reviewer",         "tier": 5, "module": "tier5_mgmt.code_reviewer",         "lang": "python","deliverables": ["review.py"]},
    20: {"name": "Orchestrator",          "tier": 5, "module": "tier5_mgmt.orchestrator",          "lang": "python","deliverables": ["orchestrate.py"]},
}

# ─── Pipeline Specifications ────────────────────────────────────
PIPELINE_SPEC = {
    "detection_snr_threshold": 5.0,
    "streak_min_length_px": 3,
    "plate_solve_residual_max_arcsec": 0.5,
    "correlation_mahalanobis_max": 4.0,
    "background_tile_size_px": 64,
    "sigma_clip_iterations": 3,
    "sigma_clip_threshold": 3.0,
    "matched_filter_angles": 180,
    "matched_filter_lengths": [5, 10, 20, 50, 100],
    "max_frame_process_ms": 500,
    "target_gpu_utilization_pct": 40,
}

# ─── Deployment Spec ────────────────────────────────────────────
DEPLOY_SPEC = {
    "container_registry": "ecr.aws-govcloud.slingshot.internal",
    "image_name": "slingshot-edge",
    "rollout_strategy": "canary",  # canary → staged → full
    "canary_site": "CHL-01",       # Best seeing, most reliable
    "canary_soak_hours": 24,
    "staged_batch_size": 5,
    "health_check_interval_sec": 60,
    "rollback_on_detection_drop_pct": 10,
}

# ─── Performance Baselines ──────────────────────────────────────
BASELINES = {
    "detection_rate_mag16": 0.99,   # 99% at magnitude 16
    "detection_rate_mag18": 0.85,   # 85% at magnitude 18
    "detection_rate_mag20": 0.40,   # 40% at magnitude 20
    "false_positive_rate": 0.001,   # 0.1%
    "frame_process_ms": 380,        # Target processing time
    "correlation_accuracy": 0.98,   # 98% correct catalog match
    "uptime_pct": 99.5,             # Per-site availability
}

# ─── Task States ────────────────────────────────────────────────
TASK_STATES = ["BACKLOG", "PLANNED", "IN_PROGRESS", "REVIEW", "TESTING", "DEPLOYING", "DONE", "BLOCKED"]
PRIORITIES = ["P0_CRITICAL", "P1_HIGH", "P2_MEDIUM", "P3_LOW"]
