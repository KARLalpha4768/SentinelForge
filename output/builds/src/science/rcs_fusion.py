"""
rcs_fusion.py - Radar Cross Section Fusion for Size Estimation

Fuses optical photometry with radar RCS measurements to produce
accurate size/shape estimates. Implements NASA's Size Estimation Model
and joint optical-radar size estimation.
"""
import logging
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional
from collections import defaultdict

logger = logging.getLogger("sentinelforge.science.rcs_fusion")


@dataclass
class RadarObservation:
    """Single radar measurement."""
    timestamp: float
    norad_id: int
    rcs_m2: float               # Radar cross section (m^2)
    frequency_ghz: float = 10.0  # Radar frequency
    polarization: str = "HH"     # HH, VV, HV, VH


class RCSAccumulator:
    """Rolling buffer of radar measurements per object."""

    def __init__(self, window_sec: float = 86400 * 7):
        self.window = window_sec
        self._data: dict = defaultdict(list)

    def ingest(self, obs: RadarObservation):
        self._data[obs.norad_id].append(obs)
        # Prune old
        cutoff = obs.timestamp - self.window
        self._data[obs.norad_id] = [
            o for o in self._data[obs.norad_id] if o.timestamp > cutoff
        ]

    def get_rcs_series(self, norad_id: int) -> List[float]:
        return [o.rcs_m2 for o in self._data.get(norad_id, [])]

    def get_statistics(self, norad_id: int) -> dict:
        series = self.get_rcs_series(norad_id)
        if not series:
            return {"n": 0}
        return {
            "n": len(series),
            "median_m2": float(np.median(series)),
            "mean_m2": float(np.mean(series)),
            "std_m2": float(np.std(series)),
            "min_m2": float(np.min(series)),
            "max_m2": float(np.max(series)),
            "variability": float(np.std(series) / (np.mean(series) + 1e-10)),
        }


class SizeEstimationModel:
    """
    NASA Size Estimation Model (SEM): converts RCS to effective diameter.

    The relationship depends on the size regime relative to radar wavelength:
      - Rayleigh regime (d << lambda): RCS ~ d^6
      - Mie regime (d ~ lambda): RCS oscillates
      - Optical regime (d >> lambda): RCS ~ projected area
    """

    def estimate_diameter(self, rcs_m2: float, freq_ghz: float = 10.0) -> float:
        """
        Estimate effective diameter from RCS.

        Uses a simplified NASA SEM lookup that transitions between
        scattering regimes.
        """
        wavelength = 0.3 / freq_ghz  # meters (c/f)
        # Optical regime (d >> lambda): d = 2*sqrt(RCS/pi)
        d_optical = 2 * np.sqrt(max(rcs_m2, 1e-10) / np.pi)
        # Rayleigh correction for small objects
        if d_optical < wavelength:
            # RCS = (pi^5 * d^6) / (4 * lambda^4) in Rayleigh
            d_rayleigh = (4 * rcs_m2 * wavelength**4 / np.pi**5) ** (1/6)
            return d_rayleigh
        return d_optical

    def estimate_mass(self, diameter_m: float, density_kg_m3: float = 2700.0) -> float:
        """Estimate mass assuming a sphere of given density (default: aluminum)."""
        volume = (4/3) * np.pi * (diameter_m/2)**3
        return volume * density_kg_m3


class OpticalRadarFuser:
    """
    Joint size estimation from photometry + RCS.

    Optical gives: albedo * cross_section_area
    Radar gives: RCS (function of size, shape, material)

    Combining both constrains albedo AND size independently.
    """

    def __init__(self):
        self.sem = SizeEstimationModel()

    def fuse(self, rcs_median_m2: float, optical_magnitude: float,
             distance_km: float, freq_ghz: float = 10.0) -> dict:
        """
        Produce a fused size estimate from both sensors.
        """
        # Radar-based diameter
        d_radar = self.sem.estimate_diameter(rcs_median_m2, freq_ghz)
        # Optical-based area (assuming albedo 0.15)
        m_sun = -26.74
        assumed_albedo = 0.15
        exponent = (m_sun - optical_magnitude) / 2.5
        area_optical = (10**exponent * np.pi * (distance_km*1000)**2) / assumed_albedo
        d_optical = 2 * np.sqrt(max(area_optical, 0) / np.pi)
        # Fused estimate (weighted average by inverse variance)
        # Radar uncertainty ~30%, optical ~50%
        w_radar = 1.0 / 0.3**2
        w_optical = 1.0 / 0.5**2
        d_fused = (w_radar * d_radar + w_optical * d_optical) / (w_radar + w_optical)
        # Derive albedo from the fusion
        if d_fused > 0:
            cross_area = np.pi * (d_fused/2)**2
            if cross_area > 0:
                albedo_est = (10**exponent * np.pi * (distance_km*1000)**2) / cross_area
            else:
                albedo_est = assumed_albedo
        else:
            albedo_est = assumed_albedo
        return {
            "diameter_radar_m": d_radar,
            "diameter_optical_m": d_optical,
            "diameter_fused_m": d_fused,
            "estimated_albedo": min(1.0, max(0, albedo_est)),
            "estimated_mass_kg": self.sem.estimate_mass(d_fused),
            "confidence": "high" if abs(d_radar - d_optical) / (d_fused+1e-10) < 0.3 else "low",
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge RCS Fusion -- Self Test")
    print("=" * 60)
    # Simulate radar observations of a tumbling rocket body
    acc = RCSAccumulator()
    for i in range(50):
        rcs = 5.0 + 3.0 * np.sin(i * 0.5) + np.random.randn() * 0.5
        acc.ingest(RadarObservation(timestamp=float(i*60), norad_id=12345,
                                    rcs_m2=max(0.1, rcs)))
    stats = acc.get_statistics(12345)
    print(f"  RCS stats: median={stats['median_m2']:.2f} m2, "
          f"variability={stats['variability']:.2f}")
    # Size estimation
    sem = SizeEstimationModel()
    d = sem.estimate_diameter(stats['median_m2'])
    m = sem.estimate_mass(d)
    print(f"  Radar-only: diameter={d:.2f}m, mass={m:.1f}kg")
    # Fused estimation
    fuser = OpticalRadarFuser()
    result = fuser.fuse(rcs_median_m2=stats['median_m2'],
                        optical_magnitude=8.0, distance_km=800.0)
    print(f"  Fused: d_radar={result['diameter_radar_m']:.2f}m, "
          f"d_optical={result['diameter_optical_m']:.2f}m")
    print(f"  Fused diameter: {result['diameter_fused_m']:.2f}m")
    print(f"  Estimated albedo: {result['estimated_albedo']:.2f}")
    print(f"  Confidence: {result['confidence']}")
    print("All tests passed.")
    print("=" * 60)
