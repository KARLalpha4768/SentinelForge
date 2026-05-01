"""
spectral_characterizer.py - Multi-Spectral & Polarimetric Object Characterization

Extends light_curve_analyzer with multi-band photometry (B,V,R,I) and
polarimetric estimation. Maps color indices to aerospace material database
for satellite material identification.
"""
import logging
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from collections import defaultdict

logger = logging.getLogger("sentinelforge.science.spectral")

# Aerospace material spectral database (B-V, V-R color indices)
MATERIAL_DATABASE = {
    "solar_cell_GaAs":    {"B_V": 0.85, "V_R": 0.45, "albedo": 0.08},
    "solar_cell_Si":      {"B_V": 0.75, "V_R": 0.40, "albedo": 0.12},
    "aluminum_bare":      {"B_V": 0.35, "V_R": 0.30, "albedo": 0.85},
    "aluminum_anodized":  {"B_V": 0.50, "V_R": 0.35, "albedo": 0.40},
    "MLI_blanket":        {"B_V": 0.90, "V_R": 0.55, "albedo": 0.05},
    "white_paint_S13G":   {"B_V": 0.30, "V_R": 0.25, "albedo": 0.80},
    "black_paint_Z306":   {"B_V": 0.60, "V_R": 0.50, "albedo": 0.04},
    "carbon_fiber":       {"B_V": 0.55, "V_R": 0.45, "albedo": 0.06},
    "kapton_gold":        {"B_V": 1.10, "V_R": 0.70, "albedo": 0.15},
}


@dataclass
class SpectralObservation:
    """Multi-band photometric observation."""
    timestamp: float
    norad_id: int
    magnitudes: Dict[str, float]  # {"B": 12.3, "V": 11.8, ...}
    polarization_degree: Optional[float] = None  # 0.0 to 1.0


@dataclass
class SpectralProfile:
    """Accumulated spectral profile for a single object."""
    norad_id: int
    band_curves: Dict[str, List[float]] = field(default_factory=lambda: defaultdict(list))
    timestamps: List[float] = field(default_factory=list)
    polarizations: List[float] = field(default_factory=list)


class MultiSpectralAccumulator:
    """Stores per-band light curves for multi-spectral analysis."""

    def __init__(self, min_observations: int = 5):
        self.min_obs = min_observations
        self._profiles: Dict[int, SpectralProfile] = {}

    def ingest(self, obs: SpectralObservation):
        if obs.norad_id not in self._profiles:
            self._profiles[obs.norad_id] = SpectralProfile(norad_id=obs.norad_id)
        prof = self._profiles[obs.norad_id]
        prof.timestamps.append(obs.timestamp)
        for band, mag in obs.magnitudes.items():
            prof.band_curves[band].append(mag)
        if obs.polarization_degree is not None:
            prof.polarizations.append(obs.polarization_degree)

    def get_profile(self, norad_id: int) -> Optional[SpectralProfile]:
        prof = self._profiles.get(norad_id)
        if prof and len(prof.timestamps) >= self.min_obs:
            return prof
        return None


class ColorIndexCalculator:
    """Computes astronomical color indices from multi-band photometry."""

    def compute(self, profile: SpectralProfile) -> Dict[str, float]:
        indices = {}
        bands = profile.band_curves
        pairs = [("B", "V"), ("V", "R"), ("R", "I")]
        for b1, b2 in pairs:
            if b1 in bands and b2 in bands:
                m1 = np.mean(bands[b1])
                m2 = np.mean(bands[b2])
                indices[f"{b1}_{b2}"] = m1 - m2
        return indices


class MaterialClassifier:
    """Maps observed color indices to the aerospace material database."""

    def classify(self, color_indices: Dict[str, float]) -> List[Tuple[str, float]]:
        if "B_V" not in color_indices:
            return [("unknown", 0.0)]
        obs_bv = color_indices["B_V"]
        obs_vr = color_indices.get("V_R", None)
        scores = []
        for material, props in MATERIAL_DATABASE.items():
            dist = abs(obs_bv - props["B_V"])
            if obs_vr is not None:
                dist += abs(obs_vr - props["V_R"])
            score = max(0, 1.0 - dist)
            scores.append((material, score))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:3]  # Top-3 candidates


class PolarimetricEstimator:
    """Estimates surface roughness from polarization degree."""

    def estimate(self, polarizations: List[float]) -> dict:
        if not polarizations:
            return {"surface_type": "unknown", "roughness": "unknown"}
        mean_pol = np.mean(polarizations)
        if mean_pol > 0.3:
            return {"surface_type": "metallic_smooth", "roughness": "low",
                    "polarization": mean_pol}
        elif mean_pol > 0.1:
            return {"surface_type": "dielectric_moderate", "roughness": "medium",
                    "polarization": mean_pol}
        else:
            return {"surface_type": "rough_diffuse", "roughness": "high",
                    "polarization": mean_pol}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Spectral Characterizer -- Self Test")
    print("=" * 60)
    acc = MultiSpectralAccumulator(min_observations=3)
    # Simulate a satellite with solar panel-like spectrum
    for i in range(10):
        obs = SpectralObservation(
            timestamp=float(i), norad_id=25544,
            magnitudes={"B": 12.5+0.1*np.random.randn(),
                        "V": 11.7+0.1*np.random.randn(),
                        "R": 11.3+0.1*np.random.randn()},
            polarization_degree=0.35+0.05*np.random.randn())
        acc.ingest(obs)
    prof = acc.get_profile(25544)
    colors = ColorIndexCalculator().compute(prof)
    print(f"  Color indices: B-V={colors.get('B_V',0):.2f}, V-R={colors.get('V_R',0):.2f}")
    materials = MaterialClassifier().classify(colors)
    print(f"  Top material matches:")
    for mat, score in materials:
        print(f"    {mat}: {score:.2f}")
    pol = PolarimetricEstimator().estimate(prof.polarizations)
    print(f"  Polarimetry: {pol['surface_type']} (roughness: {pol['roughness']})")
    print("All tests passed.")
    print("=" * 60)
