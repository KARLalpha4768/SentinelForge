# SentinelForge

**Enterprise Architecture Demonstration — Space Domain Awareness (SDA)**

SentinelForge is a full-stack space surveillance pipeline that pushes ML inference to the edge, fuses multi-sensor observations in the cloud, and applies state-of-the-art astrophysics to solve the catalog staleness problem plaguing the U.S. Space Surveillance Network.

**13,575 lines of code** across **60+ files** — Python, C++/CUDA, HTML/JS, Terraform, Kubernetes.

---

## Architecture

```
sentinelforge/
├── main.py                              # Entry point — boots the Orchestrator
├── config.py                            # Sites, credentials, model paths
├── db.py                                # SQLite task/sprint tracking
├── knowledge.py                         # Domain knowledge loader
├── end_to_end_test.py                   # Full pipeline integration test
├── requirements.txt                     # Python dependencies
├── CI_CD_pipeline.yml                   # GitHub Actions CI/CD
├── SOTA_2026_EXECUTIVE_SUMMARY.md       # Technical executive summary (A–N)
│
├── agents/                              # 20-AGENT AI SYSTEM (5 Tiers)
│   ├── tier1_cpp/                       # C++/CUDA code generation (Agents 1-4)
│   ├── tier2_python/                    # Python pipeline agents (Agents 5-8)
│   ├── tier3_testing/                   # Testing & validation (Agents 9-12)
│   ├── tier4_deploy/                    # Deployment & ops (Agents 13-16)
│   └── tier5_mgmt/                      # Management & orchestration (Agents 17-20)
│
├── output/builds/src/                   # GENERATED PIPELINE CODE
│   ├── cpp/                             # Edge inference (C++/CUDA)
│   │   ├── photometry.cpp               #   Aperture photometry extraction
│   │   └── plate_solver.cpp             #   Gaia DR3 astrometric calibration
│   │
│   ├── api/                             # Cloud API layer
│   │   ├── api_server.py                #   FastAPI REST endpoints
│   │   └── twin_ws.py                   #   Digital Twin WebSocket (1Hz streaming)
│   │
│   ├── science/                         # SOTA SCIENCE MODULES (14 modules)
│   │   ├── light_curve_analyzer.py      #   A. Contrastive Transformer fingerprinting
│   │   ├── graph_associator.py          #   B. GNN + Sinkhorn optimal transport
│   │   ├── pinn_orbit.py                #   C. Physics-Informed Neural Network (J2+Drag)
│   │   ├── non_gaussian_pc.py           #   D. Skewness tensor conjunction screening
│   │   ├── data_assimilation_engine.py  #   F. Global catalog assimilation (weather model)
│   │   ├── thermospheric_model.py       #   G. ML-corrected NRLMSISE-00 density
│   │   ├── bayesian_iod.py              #   H. MCMC orbit determination for UCTs
│   │   ├── srp_estimator.py             #   I. Solar radiation pressure + HAMR detection
│   │   ├── koopman_propagator.py        #   J. EDMD linearized propagation
│   │   ├── cislunar_dynamics.py         #   K. CR3BP Lagrange points + manifolds
│   │   ├── fourier_neural_operator.py   #   L. FNO propagation surrogate
│   │   ├── spectral_characterizer.py    #   M. Multi-band material identification
│   │   └── rcs_fusion.py               #   N. Radar + optical size estimation
│   │
│   ├── core/                            # Coordinate frames, FITS, hardware
│   │   └── coordinate_frames.py         #   J2000/TEME/ITRF transforms
│   ├── data/                            # Neuromorphic event stream parser
│   ├── hardware/                        # ASCOM telescope/camera HAL
│   │
│   ├── simulate_frames.py              # Synthetic telescope frame generator
│   ├── source_extract.py               # Detection table assembly
│   ├── correlator.py                   # Mahalanobis catalog matching
│   ├── anomaly_detect.py               # Maneuver/breakup/new-object alerts
│   ├── orbit_propagator.py             # Gauss IOD + Kepler/J2 propagation
│   ├── multi_sensor_fusion.py          # Kalman filter, multi-site fusion
│   ├── conjunction_screener.py         # Foster-Estes collision probability
│   ├── observation_scheduler.py        # Priority-based telescope tasking
│   ├── autonomous.py                   # Night-cycle state machine
│   ├── cloud_ingest.py                 # Async Kafka consumer pipeline
│   ├── train_model.py                  # PyTorch training + ONNX export
│   ├── deploy.py                       # Fleet deployment orchestration
│   └── monitor.py                      # Site health monitoring
│
├── frontend/                            # VISUALIZATION
│   ├── dashboard.html                   #   Operations dashboard
│   └── digital_twin.html               #   E. CesiumJS 3D globe + WebSocket
│
├── terraform/                           # INFRASTRUCTURE AS CODE
│   └── main.tf                          #   AWS EKS + MSK + RDS provisioning
│
└── data/                                # DOMAIN KNOWLEDGE
    ├── sentinelforge.db                 #   Task/sprint tracking database
    └── knowledge/                       #   Equations, algorithms, hardware specs
```

---

## The Science (14 SOTA Modules)

SentinelForge implements fourteen state-of-the-art techniques spanning orbital mechanics, sensor physics, machine learning, and applied astrophysics. See [`SOTA_2026_EXECUTIVE_SUMMARY.md`](SOTA_2026_EXECUTIVE_SUMMARY.md) for full details.

| # | Module | Technique | What It Solves |
|---|--------|-----------|---------------|
| A | `light_curve_analyzer.py` | Contrastive Transformer embeddings | Satellite anomaly detection without IRL |
| B | `graph_associator.py` | GNN + Sinkhorn optimal transport | O(N²) data association (surpasses MFAST) |
| C | `pinn_orbit.py` | Physics-Informed Neural Network | Sparse-data orbit determination |
| D | `non_gaussian_pc.py` | Skewness tensor propagation | False-alarm collision reduction |
| E | `digital_twin.html` + `twin_ws.py` | CesiumJS + WebSocket | Real-time 3D visualization |
| F | `data_assimilation_engine.py` | Global meteorological model | Space weather-coupled catalog |
| G | `thermospheric_model.py` | ML-corrected NRLMSISE-00 | 40% → 20% density error |
| H | `bayesian_iod.py` | Admissible Region + MCMC | UCT orbit probability cloud |
| I | `srp_estimator.py` | SRP + A/m estimation | GEO HAMR debris tracking |
| J | `koopman_propagator.py` | EDMD linearization | Ultra-fast matrix propagation |
| K | `cislunar_dynamics.py` | CR3BP + Lagrange manifolds | Earth-Moon tracking |
| L | `fourier_neural_operator.py` | Spectral convolution | Single-pass orbit surrogate |
| M | `spectral_characterizer.py` | Multi-band color indices | Satellite material ID |
| N | `rcs_fusion.py` | NASA SEM + optical fusion | Joint radar-optical sizing |

---

## The Pipeline

```
Raw CCD Frame (32 MB)
  → calibration.cu         (dark subtract, flat field, sky background)
  → streak_detect.cu       (matched filter bank, 900 filters, 5σ)
  → plate_solver.cpp       (Gaia DR3 triangle matching, WCS fit)
  → source_extract.py      (detection table assembly)
  → correlator.py          (Mahalanobis distance vs. catalog)
  → graph_associator.py    (Sinkhorn OT assignment + UCT flagging)
  → bayesian_iod.py        (MCMC orbit determination for UCTs)
  → light_curve_analyzer.py (FFT spin + contrastive fingerprint)
  → Detection package (10 KB) uploaded to cloud via Kafka
  → data_assimilation_engine.py (global catalog correction)
  → conjunction_screener.py (non-Gaussian Pc evaluation)
  → observation_scheduler.py (telescope tasking for next pass)
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/KARLalpha4768/SentinelForge.git
cd SentinelForge

# 2. Install
pip install -r requirements.txt

# 3. Verify
python main.py
python end_to_end_test.py

# 4. Run science modules independently
cd output/builds/src/science/
python light_curve_analyzer.py      # FFT spin estimation + contrastive embedding
python graph_associator.py          # Sinkhorn data association + UCT detection
python bayesian_iod.py              # MCMC orbit determination
python koopman_propagator.py        # EDMD linearized propagation
python cislunar_dynamics.py         # CR3BP Lagrange points + manifolds
python data_assimilation_engine.py  # Global catalog assimilation

# 5. Launch Digital Twin
pip install fastapi uvicorn websockets
uvicorn src.api.twin_ws:app --port 8001
# Open frontend/digital_twin.html in browser
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Edge Inference | C++/CUDA on NVIDIA Jetson AGX Orin |
| Cloud Backend | FastAPI + Async Kafka + PostgreSQL/PostGIS |
| ML Framework | PyTorch + ONNX + TensorRT |
| Visualization | CesiumJS + WebSocket (1Hz streaming) |
| Orchestration | Kubernetes (EKS) + Docker |
| Infrastructure | Terraform (AWS EKS/MSK/RDS) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

---

## Author

**Karl David** — Principal Engineer, Kham Enterprises LLC

Built as an enterprise architecture demonstration of autonomous space surveillance engineering. The system demonstrates that a single engineer can architect and operate the equivalent of a 20-person team through AI agent orchestration, while implementing research-grade astrophysics across 14 scientific domains.

---

## License

Proprietary. All rights reserved. For evaluation and interview demonstration purposes only.
