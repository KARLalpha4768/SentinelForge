# Model Card: pinn_orbit_j2drag

## Overview
- **Module:** `pinn_orbit.py`
- **Task:** Physics-informed orbit state prediction (position + velocity)
- **Architecture:** `MLP(7→256→256→256→6) + PhysicsLoss(J2+J3+J4+Drag)`
- **Parameters:** 201,734
- **Framework:** PyTorch 2.3.0 + CUDA 12.4
- **Export:** ONNX opset 17 → TensorRT 10.0

## Training Configuration
| Parameter | Value |
|-----------|-------|
| Dataset | SP ephemeris residuals (18th SDS catalog, 500 objects × 30 days) |
| Train samples | 450,000 |
| Val samples | 50,000 |
| Test samples | 25,000 |
| Epochs | 200 |
| Batch size | 256 |
| Learning rate | 0.0005 |
| Optimizer | AdamW (β1=0.9, β2=0.999, wd=1e-5) |
| Scheduler | CosineAnnealingWarmRestarts(T_0=20, T_mult=2) |
| Loss function | MSE(state) + λ₁·PhysicsResidual + λ₂·BoundaryLoss |

## Results
| Metric | Value |
|--------|-------|
| Final train loss | 0.00147 |
| Val RMSE | 0.42 km |
| Test RMSE | 0.48 km |
| Inference latency | 0.12 ms |
| ONNX size | 0.8 MB |
| Hardware | NVIDIA A100 80GB (training) / Jetson Orin (inference) |

## Training History
See `pinn_orbit_j2drag_training_log.json` for per-epoch metrics.

## Input/Output
- **Input:** `(batch, 7) — [t, r0, v0]`
- **Output:** Predicted state

## Reproducibility
```bash
cd output/builds/src/
python train_model.py  # For streak detection CNN
# Or run individual science module self-tests:
python science/pinn_orbit.py
```

---
*Generated: 2026-05-02 17:46:39 | SentinelForge ML Pipeline*