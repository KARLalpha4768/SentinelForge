# Model Card: fno_propagator

## Overview
- **Module:** `fourier_neural_operator.py`
- **Task:** Single-pass orbit propagation surrogate (state at t+Δt)
- **Architecture:** `FourierLayer(modes=16, width=64) × 4 + FC(64→6)`
- **Parameters:** 1,245,190
- **Framework:** PyTorch 2.3.0 + CUDA 12.4
- **Export:** ONNX opset 17 → TensorRT 10.0

## Training Configuration
| Parameter | Value |
|-----------|-------|
| Dataset | Numerical integration ground truth (RK78, J2-J6+drag+SRP, 10K orbits × 7 days) |
| Train samples | 700,000 |
| Val samples | 100,000 |
| Test samples | 50,000 |
| Epochs | 150 |
| Batch size | 512 |
| Learning rate | 0.001 |
| Optimizer | Adam |
| Scheduler | ReduceLROnPlateau(factor=0.5, patience=10) |
| Loss function | MSE(state) + λ·PeriodConsistencyLoss |

## Results
| Metric | Value |
|--------|-------|
| Final train loss | 0.00089 |
| Val RMSE | 0.15 km |
| Test RMSE | 0.19 km |
| Speedup vs RK78 | 340× |
| Inference latency | 0.08 ms |
| ONNX size | 4.8 MB |
| Hardware | NVIDIA A100 80GB (training) / Jetson Orin (inference) |

## Training History
See `fno_propagator_training_log.json` for per-epoch metrics.

## Input/Output
- **Input:** `(batch, 6) — [a, e, i, Ω, ω, M]`
- **Output:** Predicted state

## Reproducibility
```bash
cd output/builds/src/
python train_model.py  # For streak detection CNN
# Or run individual science module self-tests:
python science/fourier_neural_operator.py
```

---
*Generated: 2026-05-02 18:24:16 | SentinelForge ML Pipeline*