# SentinelForge ML Training Summary

Generated: 2026-05-02 18:24:16

| Model | Module | Params | Train Samples | Key Metric | Inference |
|-------|--------|--------|---------------|------------|----------|
| streak_detection_cnn | `train_model.py` | 541,699 | 90,000 | Test acc: 0.9831 | 0.34ms |
| pinn_orbit_j2drag | `pinn_orbit.py` | 201,734 | 450,000 | Test RMSE: 0.48 km | 0.12ms |
| contrastive_lightcurve_encoder | `light_curve_analyzer.py` | 892,416 | 558,000 | AUC: 0.971 | 1.2ms |
| fno_propagator | `fourier_neural_operator.py` | 1,245,190 | 700,000 | Test RMSE: 0.19 km | 0.08ms |
| thermospheric_density_corrector | `thermospheric_model.py` | 25,601 | 2,400,000 | RMSE: 42.3%→18.7% | 0.02ms |

Total parameters across all models: 2,906,640

All models exported to ONNX (opset 17). TensorRT compilation targets NVIDIA Jetson AGX Orin (sm_87).
