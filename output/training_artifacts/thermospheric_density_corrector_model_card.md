# Model Card: thermospheric_density_corrector

## Overview
- **Module:** `thermospheric_model.py`
- **Task:** Predict density correction factor δρ/ρ from space weather indices + altitude + local solar time
- **Architecture:** `MLP(12→128→128→64→1) — residual correction on NRLMSISE-00`
- **Parameters:** 25,601
- **Framework:** PyTorch 2.3.0
- **Export:** ONNX opset 17

## Training Configuration
| Parameter | Value |
|-----------|-------|
| Dataset | CHAMP/GRACE/GOCE accelerometer-derived densities (2001-2023) |
| Train samples | 2,400,000 |
| Val samples | 300,000 |
| Test samples | 150,000 |
| Epochs | 80 |
| Batch size | 1024 |
| Learning rate | 0.001 |
| Optimizer | Adam |
| Scheduler | CosineAnnealingLR(T_max=80) |
| Loss function | MSE(log_density_ratio) |

## Results
| Metric | Value |
|--------|-------|
| Final train loss | 0.0156 |
| Baseline RMSE | 42.3% |
| Corrected RMSE | 18.7% |
| Improvement | 55.8% reduction in density error |
| Inference latency | 0.02 ms |
| ONNX size | 0.1 MB |
| Hardware | Any CPU (lightweight) |

## Training History
See `thermospheric_density_corrector_training_log.json` for per-epoch metrics.

## Input/Output
- **Input:** `(batch, 12) — [alt, lat, lon, LST, F10.7, F10.7avg, Ap, Kp, Dst, doy, year_frac, solar_zenith]`
- **Output:** Predicted state

## Reproducibility
```bash
cd output/builds/src/
python train_model.py  # For streak detection CNN
# Or run individual science module self-tests:
python science/thermospheric_model.py
```

---
*Generated: 2026-05-02 17:46:39 | SentinelForge ML Pipeline*