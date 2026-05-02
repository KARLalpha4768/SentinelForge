# Model Card: contrastive_lightcurve_encoder

## Overview
- **Module:** `light_curve_analyzer.py`
- **Task:** Self-supervised contrastive embedding of photometric light curves
- **Architecture:** `Transformer(d=128, heads=4, layers=3) + ProjectionHead(128→64→128)`
- **Parameters:** 892,416
- **Framework:** PyTorch 2.3.0 + CUDA 12.4
- **Export:** ONNX opset 17

## Training Configuration
| Parameter | Value |
|-----------|-------|
| Dataset | SentinelForge Light Curve Library (12,400 objects × avg 45 passes) |
| Train samples | 558,000 |
| Val samples | 62,000 |
| Test samples | 31,000 |
| Epochs | 100 |
| Batch size | 128 |
| Learning rate | 0.0003 |
| Optimizer | AdamW (β1=0.9, β2=0.999, wd=1e-4) |
| Scheduler | OneCycleLR(max_lr=3e-4, pct_start=0.1) |
| Loss function | NT-Xent (τ=0.07) + SpinPeriodAux(λ=0.1) |

## Results
| Metric | Value |
|--------|-------|
| Final train loss | 0.312 |
| Retrieval mAP@10 | 0.934 |
| Anomaly AUC | 0.971 |
| Inference latency | 1.2 ms |
| ONNX size | 3.4 MB |
| Hardware | NVIDIA A100 80GB (training) / Jetson Orin (inference) |

## Training History
See `contrastive_lightcurve_encoder_training_log.json` for per-epoch metrics.

## Input/Output
- **Input:** `(batch, seq_len, 2) — [time, magnitude]`
- **Output:** Predicted state

## Reproducibility
```bash
cd output/builds/src/
python train_model.py  # For streak detection CNN
# Or run individual science module self-tests:
python science/light_curve_analyzer.py
```

---
*Generated: 2026-05-02 18:24:16 | SentinelForge ML Pipeline*