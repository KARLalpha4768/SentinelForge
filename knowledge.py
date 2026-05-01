"""
SentinelForge Knowledge Base
Literature search, algorithm reference, and domain knowledge for all agents.
Agents query this module for equations, patterns, and best practices
before generating code.
"""
import json
import os
from pathlib import Path

KB_DIR = Path(__file__).parent / "data" / "knowledge"


def init_knowledge_base():
    """Populate the knowledge base with space surveillance domain knowledge."""
    KB_DIR.mkdir(parents=True, exist_ok=True)

    # ---- Equations Reference ----
    equations = {
        "snr": {
            "name": "Signal-to-Noise Ratio",
            "formula": "SNR = (S*t) / sqrt(S*t + n_pix*(B*t + D*t + R^2))",
            "variables": {
                "S": "Source signal (photons/sec)",
                "t": "Exposure time (sec)",
                "n_pix": "Number of pixels object covers",
                "B": "Sky background (photons/sec/pixel)",
                "D": "Dark current (electrons/sec/pixel)",
                "R": "Read noise (electrons/pixel)"
            },
            "threshold": 5.0,
            "used_by": ["streak_detect", "photometry", "simulate_frames"]
        },
        "magnitude": {
            "name": "Apparent Magnitude",
            "formula": "m = m_sun - 2.5 * log10(a * A * F(phi) / (R_obj^2 * R_obs^2))",
            "variables": {
                "m_sun": "Sun apparent magnitude (-26.74)",
                "a": "Albedo (0-1)",
                "A": "Cross-sectional area (m^2)",
                "F_phi": "Phase function",
                "R_obj": "Sun-to-object distance (AU)",
                "R_obs": "Observer-to-object distance (km)"
            },
            "used_by": ["photometry", "characterize", "simulate_frames"]
        },
        "streak_length": {
            "name": "Streak Length",
            "formula": "L_streak = (omega * t * f) / p",
            "variables": {
                "omega": "Angular rate (arcsec/sec)",
                "t": "Exposure time (sec)",
                "f": "Focal length (mm)",
                "p": "Pixel size (microns)"
            },
            "used_by": ["streak_detect", "source_extract"]
        },
        "plate_solution": {
            "name": "Astrometric Plate Solution",
            "formula": "RA = a1 + a2*x + a3*y + a4*x^2 + a5*x*y + a6*y^2",
            "method": "Least-squares fit matching detected stars to Gaia DR3 catalog",
            "min_stars": 6,
            "max_residual_arcsec": 0.5,
            "used_by": ["plate_solver", "source_extract"]
        },
        "psf_gaussian": {
            "name": "Point Spread Function",
            "formula": "I(x,y) = A * exp(-((x-x0)^2/(2*sx^2) + (y-y0)^2/(2*sy^2))) + B",
            "purpose": "Sub-pixel centroid via least-squares Gaussian fit",
            "typical_fwhm_px": 2.5,
            "used_by": ["photometry", "plate_solver"]
        },
        "mahalanobis": {
            "name": "Mahalanobis Distance",
            "formula": "d = sqrt((dRA/sigma_RA)^2 + (dDec/sigma_Dec)^2)",
            "threshold": 4.0,
            "purpose": "Match detections to catalog accounting for position uncertainty",
            "used_by": ["correlator"]
        },
        "collision_probability": {
            "name": "Conjunction Probability",
            "formula": "Pc = (A_combined / (2*pi*sigma_r*sigma_t)) * exp(-d_miss^2 / (2*(sigma_r^2 + sigma_t^2)))",
            "alert_threshold": 1e-4,
            "used_by": ["anomaly_detect"]
        },
        "background_estimation": {
            "name": "Sigma-Clipped Median Background",
            "formula": "B_local = median(pixels, reject > 3*sigma); sigma = 1.4826 * MAD",
            "tile_size": 64,
            "clip_sigma": 3.0,
            "clip_iterations": 3,
            "used_by": ["calibration", "background"]
        },
        "lomb_scargle": {
            "name": "Lomb-Scargle Periodogram",
            "formula": "Power(omega) = periodogram of unevenly sampled magnitude time series",
            "purpose": "Extract spin period from light curve",
            "used_by": ["characterize"]
        },
        "optimal_exposure": {
            "name": "Optimal Exposure Time",
            "formula": "t = min(R^2/(B+D), L_max*p/(omega*f))",
            "purpose": "Balance read noise floor vs. streak smearing",
            "used_by": ["autonomous", "scheduler"]
        }
    }

    # ---- Algorithm Patterns ----
    algorithms = {
        "background_subtraction": {
            "name": "Background Subtraction Pipeline",
            "steps": [
                "1. Subtract master dark frame (thermal noise pattern)",
                "2. Divide by master flat field (pixel sensitivity normalization)",
                "3. Tile image into 64x64 blocks",
                "4. Compute sigma-clipped median of each tile (3 iterations, 3-sigma)",
                "5. Bicubic interpolate tile medians to full resolution",
                "6. Subtract smooth background from frame"
            ],
            "gpu_kernels": ["dark_subtract_kernel", "flat_divide_kernel",
                           "tile_median_kernel", "upsample_background_kernel",
                           "subtract_background_kernel"],
            "latency_target_ms": 40
        },
        "streak_detection": {
            "name": "Streak Detection Pipeline",
            "steps": [
                "1. Estimate local noise in 32x32 windows (MAD-based)",
                "2. Run matched filter bank: 180 angles x 5 lengths",
                "3. For each angle/length combo, convolve along line direction",
                "4. Compute SNR map = response / local_noise",
                "5. Find peaks above threshold (5-sigma)",
                "6. Non-maximum suppression (5x5 window)",
                "7. Extract streak endpoints, brightness, angle"
            ],
            "gpu_kernels": ["estimate_noise_kernel", "matched_filter_kernel",
                           "peak_detect_kernel"],
            "latency_target_ms": 50
        },
        "plate_solving": {
            "name": "Astrometric Plate Solving",
            "steps": [
                "1. Extract bright point sources (SNR > 10)",
                "2. Compute sub-pixel centroids via PSF fitting",
                "3. Build triangle patterns from brightest 30 sources",
                "4. Match triangle patterns to Gaia DR3 catalog",
                "5. Use RANSAC to find consensus star matches",
                "6. Fit 2nd-order WCS polynomial (6 coefficients per axis)",
                "7. Verify: residuals < 0.5 arcsec"
            ],
            "catalog": "Gaia DR3",
            "min_match_stars": 6,
            "latency_target_ms": 200
        },
        "object_correlation": {
            "name": "Known Object Correlation",
            "steps": [
                "1. Propagate all catalog objects to observation epoch (SGP4)",
                "2. Compute predicted (RA, Dec) with uncertainty ellipsoid",
                "3. For each detection, compute Mahalanobis distance to all predictions",
                "4. Single match (d < 4): CORRELATED",
                "5. Multiple matches: AMBIGUOUS (take closest)",
                "6. No matches: UNCORRELATED (potential new object)"
            ],
            "propagator": "SGP4 (simplified) or numerical (high-accuracy)",
            "threshold": 4.0
        },
        "autonomous_observatory": {
            "name": "Observatory State Machine",
            "states": ["BOOT", "IDLE", "CALIBRATING", "OPENING_DOME",
                      "OBSERVING", "WEATHER_HOLD", "CLOSING",
                      "DAWN_SHUTDOWN", "FAULTED", "EMERGENCY"],
            "triggers": {
                "IDLE->CALIBRATING": "sun_altitude < -12 degrees",
                "CALIBRATING->OPENING": "calibration complete",
                "OPENING->OBSERVING": "dome open + weather safe",
                "OBSERVING->WEATHER_HOLD": "humidity>85 OR wind>40mph OR rain",
                "WEATHER_HOLD->OBSERVING": "conditions improve within 30min",
                "WEATHER_HOLD->CLOSING": "30min timeout",
                "OBSERVING->CLOSING": "sun_altitude > -12 degrees",
                "ANY->FAULTED": "hardware exception",
                "ANY->EMERGENCY": "power failure"
            }
        }
    }

    # ---- Sensor Hardware Reference ----
    hardware = {
        "ccd_cameras": {
            "typical_specs": {
                "resolution": "4096x4096",
                "bit_depth": 16,
                "pixel_size_um": 9.0,
                "dark_current_e_per_s": 0.001,
                "read_noise_e": 3.5,
                "cooling": "Peltier, -40C to -60C delta",
                "interface": "USB3 or CameraLink",
                "readout_time_ms": 200
            },
            "manufacturers": ["Andor (iKon-L)", "FLI (ProLine)", "QHY", "ZWO"]
        },
        "telescope_mounts": {
            "protocols": ["LX200 (serial ASCII)", "ASCOM (Windows COM)",
                         "INDI (Linux)", "Alpaca (HTTP REST)"],
            "specs": {
                "tracking_accuracy_arcsec": 0.5,
                "slew_speed_deg_per_sec": 5.0,
                "settle_time_sec": 3,
                "pointing_accuracy_arcmin": 1.0
            }
        },
        "dome_controllers": {
            "interfaces": ["RS-485", "Ethernet", "USB-serial"],
            "operations": ["open_shutter", "close_shutter", "rotate_to_azimuth",
                          "park", "status_query"]
        }
    }

    # ---- Save knowledge base ----
    (KB_DIR / "equations.json").write_text(
        json.dumps(equations, indent=2), encoding="utf-8")
    (KB_DIR / "algorithms.json").write_text(
        json.dumps(algorithms, indent=2), encoding="utf-8")
    (KB_DIR / "hardware.json").write_text(
        json.dumps(hardware, indent=2), encoding="utf-8")

    print(f"[KB] Initialized knowledge base at {KB_DIR}")
    print(f"     {len(equations)} equations, {len(algorithms)} algorithms, "
          f"{len(hardware)} hardware refs")
    return True


def query_equation(name: str) -> dict:
    """Retrieve an equation by name."""
    path = KB_DIR / "equations.json"
    if not path.exists():
        init_knowledge_base()
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get(name, {})


def query_algorithm(name: str) -> dict:
    """Retrieve an algorithm pattern by name."""
    path = KB_DIR / "algorithms.json"
    if not path.exists():
        init_knowledge_base()
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get(name, {})


def query_hardware(component: str) -> dict:
    """Retrieve hardware reference by component type."""
    path = KB_DIR / "hardware.json"
    if not path.exists():
        init_knowledge_base()
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get(component, {})


def get_equations_for_module(module_name: str) -> list:
    """Find all equations relevant to a given code module."""
    path = KB_DIR / "equations.json"
    if not path.exists():
        init_knowledge_base()
    data = json.loads(path.read_text(encoding="utf-8"))
    results = []
    for key, eq in data.items():
        if module_name in eq.get("used_by", []):
            results.append({"key": key, **eq})
    return results


def search_knowledge(query: str) -> list:
    """Full-text search across all knowledge base files."""
    results = []
    if not KB_DIR.exists():
        init_knowledge_base()
    query_lower = query.lower()
    for kb_file in KB_DIR.glob("*.json"):
        data = json.loads(kb_file.read_text(encoding="utf-8"))
        for key, item in data.items():
            text = json.dumps(item).lower()
            if query_lower in text:
                results.append({
                    "source": kb_file.stem,
                    "key": key,
                    "name": item.get("name", key),
                    "data": item
                })
    return results


if __name__ == "__main__":
    init_knowledge_base()
    print("\nTest: equations for 'streak_detect':")
    for eq in get_equations_for_module("streak_detect"):
        print(f"  {eq['name']}: {eq['formula']}")
    print("\nTest: search 'Mahalanobis':")
    for r in search_knowledge("mahalanobis"):
        print(f"  [{r['source']}] {r['name']}")
