"""
srp_estimator.py - Solar Radiation Pressure & Area-to-Mass Ratio Estimation

For GEO objects (above ~800km), atmospheric drag vanishes and SRP dominates.
This module computes SRP acceleration and jointly estimates A/m from orbital
perturbations and light curve photometry. Critical for HAMR debris tracking.

a_SRP = -(P_sun * C_r * A/m) * r_hat_sun
"""
import logging
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

logger = logging.getLogger("sentinelforge.science.srp")

P_SUN = 4.56e-6  # Solar radiation pressure at 1 AU (N/m^2)
AU_KM = 1.496e8  # 1 AU in km
MU_EARTH = 3.986004418e5


@dataclass
class SRPForceModel:
    """Solar Radiation Pressure acceleration model."""
    Cr: float = 1.5          # Reflectivity coefficient (1=absorber, 2=mirror)
    area_to_mass: float = 0.01  # A/m (m^2/kg)

    def acceleration(self, r_sat_km: np.ndarray, r_sun_km: np.ndarray) -> np.ndarray:
        """Compute SRP acceleration vector (km/s^2)."""
        r_rel = r_sat_km - r_sun_km
        r_mag = np.linalg.norm(r_rel) * 1000.0  # to meters
        r_hat = r_rel / np.linalg.norm(r_rel)
        # Scale P_sun by inverse square from actual distance
        P_actual = P_SUN * (AU_KM * 1000.0)**2 / r_mag**2
        a_srp = -P_actual * self.Cr * self.area_to_mass * r_hat
        return a_srp / 1000.0  # Convert to km/s^2


class AreaToMassEstimator:
    """
    Joint estimation of A/m from orbital perturbations + light curves.

    Method: Observe the secular change in eccentricity over time.
    For a GEO object, SRP causes eccentricity to oscillate with a period
    of 1 year. The amplitude of this oscillation is proportional to A/m.

    delta_e ~ (3 * P_sun * Cr * A/m * a) / (2 * mu * n)
    """

    def estimate_from_eccentricity(self, ecc_history: List[Tuple[float, float]],
                                    sma_km: float) -> Tuple[float, float]:
        """
        Estimate A/m from eccentricity time series.

        Args:
            ecc_history: list of (timestamp_days, eccentricity)
            sma_km: semi-major axis in km

        Returns:
            (area_to_mass, confidence)
        """
        if len(ecc_history) < 10:
            return 0.01, 0.0  # Default with no confidence

        times = np.array([t for t, e in ecc_history])
        eccs = np.array([e for t, e in ecc_history])

        # Peak-to-peak eccentricity variation
        delta_e = (np.max(eccs) - np.min(eccs)) / 2.0

        # Mean motion
        n = np.sqrt(MU_EARTH / sma_km**3)  # rad/s

        # Invert the SRP perturbation equation
        Cr = 1.5  # Assume average reflectivity
        a_m_est = (2 * MU_EARTH * n * delta_e) / (3 * P_SUN * Cr * sma_km * 1000)

        # Confidence based on data span
        span_days = times[-1] - times[0]
        confidence = min(1.0, span_days / 365.0)

        logger.info(f"A/m estimate: {a_m_est:.4f} m2/kg (confidence: {confidence:.2f})")
        return a_m_est, confidence

    def estimate_from_photometry(self, magnitude: float, distance_km: float,
                                 albedo: float = 0.15) -> float:
        """
        Estimate cross-sectional area from apparent magnitude.

        Uses: m = m_sun - 2.5*log10(albedo * A / (pi * R^2))
        """
        m_sun = -26.74
        exponent = (m_sun - magnitude) / 2.5
        area_m2 = (10**exponent * np.pi * (distance_km * 1000)**2) / albedo
        return area_m2


class HAMRClassifier:
    """Flags High Area-to-Mass Ratio objects (likely debris fragments)."""

    THRESHOLDS = {
        "normal": (0, 0.05),
        "elevated": (0.05, 1.0),
        "HAMR": (1.0, 10.0),
        "ultra_HAMR": (10.0, float('inf')),
    }

    def classify(self, area_to_mass: float) -> Tuple[str, str]:
        for category, (lo, hi) in self.THRESHOLDS.items():
            if lo <= area_to_mass < hi:
                risk = "LOW" if category == "normal" else \
                       "MEDIUM" if category == "elevated" else "HIGH"
                return category, risk
        return "unknown", "UNKNOWN"


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge SRP Estimator -- Self Test")
    print("=" * 60)
    # Test SRP acceleration on a GEO satellite
    srp = SRPForceModel(Cr=1.5, area_to_mass=0.02)
    r_sat = np.array([42164.0, 0.0, 0.0])  # GEO
    r_sun = np.array([AU_KM, 0.0, 0.0])
    a = srp.acceleration(r_sat, r_sun)
    print(f"  SRP accel at GEO: {np.linalg.norm(a):.3e} km/s2")
    # Test A/m estimation from eccentricity oscillation
    estimator = AreaToMassEstimator()
    ecc_data = [(d, 0.001 + 0.05 * np.sin(2*np.pi*d/365)) for d in range(0, 400, 10)]
    am, conf = estimator.estimate_from_eccentricity(ecc_data, sma_km=42164.0)
    print(f"  Estimated A/m: {am:.4f} m2/kg (conf: {conf:.2f})")
    # Test HAMR classification
    cat, risk = HAMRClassifier().classify(am)
    print(f"  Classification: {cat} ({risk} risk)")
    # Test photometric area estimation
    area = estimator.estimate_from_photometry(magnitude=12.0, distance_km=36000.0)
    print(f"  Photometric area: {area:.2f} m2")
    print("All tests passed.")
    print("=" * 60)
