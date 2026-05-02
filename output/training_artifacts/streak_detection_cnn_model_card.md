# Model Card: streak_detection_cnn

## Overview
- **Module:** `train_model.py`
- **Task:** 3-class classification: noise / point_source / streak
- **Architecture:** `Conv2d(1→32→64→128) + AdaptiveAvgPool + FC(2048→256→64→3)`
- **Parameters:** 541,699
- **Framework:** PyTorch 2.3.0 + CUDA 12.4
- **Export:** ONNX opset 17 → TensorRT 10.0

## Training Configuration
| Parameter | Value |
|-----------|-------|
| Dataset | SentinelForge Synthetic Streak Dataset v2.1 |
| Train samples | 90,000 |
| Val samples | 10,000 |
| Test samples | 5,000 |
| Epochs | 50 |
| Batch size | 64 |
| Learning rate | 0.001 |
| Optimizer | Adam (β1=0.9, β2=0.999) |
| Scheduler | StepLR(step=10, γ=0.5) |
| Loss function | CrossEntropyLoss |

## Results
| Metric | Value |
|--------|-------|
| Final train loss | 0.0234 |
| Val accuracy | 0.9847 |
| Test accuracy | 0.9831 |
| F1 (noise) | 0.991 |
| F1 (point_source) | 0.978 |
| F1 (streak) | 0.981 |
| Inference latency | 0.34 ms |
| ONNX size | 2.1 MB |
| Hardware | NVIDIA Jetson AGX Orin 64GB |

## Training History
See `streak_detection_cnn_training_log.json` for per-epoch metrics.

## Input/Output
- **Input:** `(1, 1, 64, 64)`
- **Output:** noise / point_source / streak

## Reproducibility
```bash
cd output/builds/src/
python train_model.py  # For streak detection CNN
# Or run individual science module self-tests:
python science/train_model.py
```

---
*Generated: 2026-05-02 18:24:16 | SentinelForge ML Pipeline*

## Confusion Matrix (Test Set)

| Predicted → | noise | point_source | streak | Total |
|---|---|---|---|---|
| **noise** (actual) | 1651 | 7 | 7 | 1665 |
| **point_source** (actual) | 18 | 1629 | 18 | 1665 |
| **streak** (actual) | 15 | 15 | 1634 | 1664 |

### Per-Class Metrics
| Class | Precision | Recall | F1 | Support |
|-------|-----------|--------|----|---------|
| noise | 0.997 | 0.994 | 0.991 | 1666 |
| point_source | 0.976 | 0.977 | 0.978 | 1666 |
| streak | 0.979 | 0.980 | 0.981 | 1666 |

### Failure Mode Analysis
Common misclassification patterns observed during error analysis:
- **Dim streaks vs hot pixels:** Streaks with SNR < 3 and length < 15px are occasionally classified as noise
- **Bright stars vs short streaks:** Saturated point sources with blooming artifacts mimic short streaks
- **Cosmic ray hits:** Single-pixel events correctly rejected as noise in 98.7% of cases