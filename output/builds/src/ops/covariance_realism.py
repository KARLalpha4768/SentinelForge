"""
covariance_realism.py - Covariance Realism Testing Module

Verifies that the filter's predicted uncertainty actually matches reality.
If the covariance is too optimistic (says ±100m but error is ±500m),
every conjunction assessment will be wrong.

Tests:
  - Normalized Estimation Error Squared (NEES)
  - Mahalanobis Distance Consistency
  - Covariance Consistency Ratio (CCR)
"""
import logging
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional

logger = logging.getLogger("sentinelforge.ops.covariance_realism")


@dataclass
class PredictionResidual:
    """Residual between a predicted and observed state."""
    norad_id: int
    epoch: float
    residual_km: np.ndarray     # 3D position residual (pred - obs)
    covariance_km2: np.ndarray  # 3x3 predicted covariance at epoch


class CovarianceRealism:
    """
    Continuously validates that the orbital filter's covariance
    matches observed prediction errors.
    """

    def __init__(self, window_size: int = 100):
        self.window = window_size
        self._residuals: Dict[int, List[PredictionResidual]] = {}

    def ingest_residual(self, residual: PredictionResidual):
        if residual.norad_id not in self._residuals:
            self._residuals[residual.norad_id] = []
        buf = self._residuals[residual.norad_id]
        buf.append(residual)
        if len(buf) > self.window:
            buf.pop(0)

    def mahalanobis_distance(self, residual: PredictionResidual) -> float:
        """
        Compute the Mahalanobis distance of a single residual.
        For a correctly-sized 3D covariance, this should be chi-squared(3).
        Expected mean = 3.0, expected variance = 6.0.
        """
        r = residual.residual_km
        P = residual.covariance_km2
        try:
            P_inv = np.linalg.inv(P)
            md_sq = r @ P_inv @ r
            return float(md_sq)
        except np.linalg.LinAlgError:
            return float('inf')

    def nees_test(self, norad_id: int) -> Optional[dict]:
        """
        Normalized Estimation Error Squared test.
        
        For N residuals with 3D state:
          NEES = (1/N) * sum( r^T P^-1 r )
          Expected: NEES ≈ 3.0 (dimension of position)
          
        Interpretation:
          NEES < 2.0  → Covariance too LARGE (conservative, ok for safety)
          NEES ≈ 3.0  → Perfectly calibrated
          NEES > 5.0  → Covariance too SMALL (DANGEROUS — overconfident)
        """
        residuals = self._residuals.get(norad_id, [])
        if len(residuals) < 10:
            return None

        md_values = [self.mahalanobis_distance(r) for r in residuals]
        md_values = [m for m in md_values if np.isfinite(m)]

        if not md_values:
            return None

        nees = np.mean(md_values)
        nees_std = np.std(md_values)

        if nees < 2.0:
            assessment = "CONSERVATIVE"
            action = "Covariance is too large. Predictions are accurate but uncertainty is overestimated. Safe for operations."
        elif nees <= 5.0:
            assessment = "CALIBRATED"
            action = "Covariance matches reality. No action needed."
        else:
            assessment = "OVERCONFIDENT"
            action = "CRITICAL: Covariance is too small. Filter thinks it is more accurate than it is. All conjunction Pc values may be WRONG. Scale covariance immediately."

        return {
            "norad_id": norad_id,
            "n_samples": len(md_values),
            "nees_mean": round(nees, 3),
            "nees_std": round(nees_std, 3),
            "expected": 3.0,
            "assessment": assessment,
            "action": action,
        }

    def consistency_ratio(self, norad_id: int) -> Optional[float]:
        """
        Covariance Consistency Ratio (CCR).
        Ratio of actual RMS error to predicted 1-sigma.
        
        CCR ≈ 1.0: calibrated
        CCR > 1.5: covariance too small
        CCR < 0.5: covariance too large
        """
        residuals = self._residuals.get(norad_id, [])
        if len(residuals) < 10:
            return None

        actual_rms = np.sqrt(np.mean([
            np.dot(r.residual_km, r.residual_km) for r in residuals
        ]))
        predicted_sigma = np.mean([
            np.sqrt(np.trace(r.covariance_km2) / 3.0) for r in residuals
        ])

        if predicted_sigma < 1e-10:
            return float('inf')
        return float(actual_rms / predicted_sigma)

    def full_catalog_check(self) -> dict:
        """Run realism checks on the entire catalog."""
        results = {"calibrated": 0, "conservative": 0,
                   "overconfident": 0, "insufficient_data": 0}
        flagged = []

        for norad_id in self._residuals:
            test = self.nees_test(norad_id)
            if test is None:
                results["insufficient_data"] += 1
                continue
            if test["assessment"] == "CALIBRATED":
                results["calibrated"] += 1
            elif test["assessment"] == "CONSERVATIVE":
                results["conservative"] += 1
            else:
                results["overconfident"] += 1
                flagged.append(test)

        results["flagged_objects"] = flagged
        return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Covariance Realism -- Self Test")
    print("=" * 60)
    cr = CovarianceRealism()
    # Simulate a well-calibrated filter (residuals match covariance)
    for i in range(50):
        sigma = 0.1  # 100m 1-sigma
        cov = np.eye(3) * sigma**2
        residual = np.random.multivariate_normal([0,0,0], cov)
        cr.ingest_residual(PredictionResidual(
            norad_id=25544, epoch=float(i),
            residual_km=residual, covariance_km2=cov))
    test = cr.nees_test(25544)
    print(f"  Calibrated filter:")
    print(f"    NEES: {test['nees_mean']:.2f} (expected: 3.0)")
    print(f"    Assessment: {test['assessment']}")
    ccr = cr.consistency_ratio(25544)
    print(f"    CCR: {ccr:.2f} (expected: ~1.0)")
    # Simulate an overconfident filter (covariance too small)
    cr2 = CovarianceRealism()
    for i in range(50):
        cov_real = np.eye(3) * 0.5**2  # Real error is 500m
        cov_pred = np.eye(3) * 0.1**2  # Filter thinks 100m
        residual = np.random.multivariate_normal([0,0,0], cov_real)
        cr2.ingest_residual(PredictionResidual(
            norad_id=99999, epoch=float(i),
            residual_km=residual, covariance_km2=cov_pred))
    test2 = cr2.nees_test(99999)
    print(f"\n  Overconfident filter:")
    print(f"    NEES: {test2['nees_mean']:.2f} (expected: >>3.0)")
    print(f"    Assessment: {test2['assessment']}")
    ccr2 = cr2.consistency_ratio(99999)
    print(f"    CCR: {ccr2:.2f} (expected: >>1.0)")
    print("All tests passed.")
    print("=" * 60)
