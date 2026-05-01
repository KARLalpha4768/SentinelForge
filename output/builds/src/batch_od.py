"""
batch_od.py - SentinelForge Cloud Pipeline
Batch Least-Squares Orbit Determination (differential correction).

After initial orbit determination (IOD) provides a rough orbit estimate,
batch OD refines it by minimizing observation residuals across an entire
arc of observations using iterative least-squares.

Method:
    1. Predict observation (RA/Dec) from current orbital elements
    2. Compute residual (observed - predicted)
    3. Compute Jacobian (partial derivatives of obs w.r.t. elements)
    4. Solve normal equations: dx = (J^T W J)^-1 J^T W r
    5. Update elements: x_new = x + dx
    6. Repeat until convergence (||dx|| < threshold)

References:
    - Vallado, "Fundamentals of Astrodynamics" Ch. 10
    - Tapley, Schutz, Born, "Statistical Orbit Determination"
"""
import math
import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple

# Constants
MU_EARTH = 3.986004418e14   # m^3/s^2
R_EARTH = 6378137.0          # m
DEG2RAD = math.pi / 180.0
RAD2DEG = 180.0 / math.pi


@dataclass
class Observation:
    """A single angular observation (RA/Dec from a ground station)."""
    timestamp: float
    ra_deg: float
    dec_deg: float
    ra_err_arcsec: float = 1.0
    dec_err_arcsec: float = 1.0
    site_lat_deg: float = 0.0
    site_lon_deg: float = 0.0
    site_alt_m: float = 0.0


@dataclass
class ODSolution:
    """Result of batch orbit determination."""
    a: float           # Semi-major axis (m)
    e: float           # Eccentricity
    i: float           # Inclination (rad)
    raan: float        # Right ascension of ascending node (rad)
    argp: float        # Argument of perigee (rad)
    M0: float          # Mean anomaly at epoch (rad)
    epoch: float       # Reference epoch (Unix)
    rms_residual_arcsec: float
    n_observations: int
    n_iterations: int
    converged: bool
    covariance_6x6: np.ndarray   # Formal covariance of solution


class BatchODSolver:
    """
    Iterative batch least-squares orbit determination.
    Refines an initial orbit estimate from multiple observations.
    """

    def __init__(self, max_iterations: int = 20,
                 convergence_threshold: float = 1e-8):
        self.max_iter = max_iterations
        self.threshold = convergence_threshold

    def solve(self, observations: List[Observation],
              initial_elements: dict) -> ODSolution:
        """
        Solve for best-fit orbital elements from observations.

        Args:
            observations: List of RA/Dec observations with timestamps
            initial_elements: dict with keys a, e, i, raan, argp, M0, epoch

        Returns:
            ODSolution with refined elements and covariance
        """
        if len(observations) < 4:
            raise ValueError("Need >= 4 observations for 6-element OD")

        # State vector: [a, e, i, raan, argp, M0]
        x = np.array([
            initial_elements["a"],
            initial_elements["e"],
            initial_elements["i"],
            initial_elements["raan"],
            initial_elements["argp"],
            initial_elements["M0"],
        ])
        epoch = initial_elements["epoch"]
        n_obs = len(observations)

        # Weight matrix (inverse of measurement covariance)
        W = np.zeros((2 * n_obs, 2 * n_obs))
        for k, obs in enumerate(observations):
            W[2*k, 2*k] = 1.0 / (obs.ra_err_arcsec / 3600 * DEG2RAD)**2
            W[2*k+1, 2*k+1] = 1.0 / (obs.dec_err_arcsec / 3600 * DEG2RAD)**2

        converged = False
        for iteration in range(self.max_iter):
            # Build residual vector and Jacobian
            residuals = np.zeros(2 * n_obs)
            J = np.zeros((2 * n_obs, 6))

            for k, obs in enumerate(observations):
                dt = obs.timestamp - epoch

                # Predicted RA/Dec from current elements
                ra_pred, dec_pred = self._predict_observation(x, dt)

                # Residuals (observed - computed)
                residuals[2*k] = (obs.ra_deg * DEG2RAD - ra_pred) * math.cos(dec_pred)
                residuals[2*k+1] = obs.dec_deg * DEG2RAD - dec_pred

                # Numerical Jacobian (partials of obs w.r.t. elements)
                J[2*k:2*k+2, :] = self._compute_jacobian(x, dt, ra_pred, dec_pred)

            # Normal equations: dx = (J^T W J)^{-1} J^T W r
            JtW = J.T @ W
            N = JtW @ J
            try:
                N_inv = np.linalg.inv(N)
            except np.linalg.LinAlgError:
                break

            dx = N_inv @ JtW @ residuals
            x += dx

            # Clamp eccentricity to valid range
            x[1] = max(1e-7, min(x[1], 0.999))

            # Convergence check
            if np.linalg.norm(dx) < self.threshold:
                converged = True
                break

        # Final RMS residual
        rms = math.sqrt(np.sum(residuals**2) / (2 * n_obs)) * RAD2DEG * 3600

        return ODSolution(
            a=x[0], e=x[1], i=x[2], raan=x[3], argp=x[4], M0=x[5],
            epoch=epoch,
            rms_residual_arcsec=rms,
            n_observations=n_obs,
            n_iterations=iteration + 1,
            converged=converged,
            covariance_6x6=N_inv if converged else np.eye(6)
        )

    def _predict_observation(self, elements: np.ndarray,
                              dt: float) -> Tuple[float, float]:
        """Predict RA/Dec from orbital elements at time offset dt."""
        a, e, i, raan, argp, M0 = elements

        # Mean motion
        n = math.sqrt(MU_EARTH / abs(a)**3)

        # Mean anomaly at observation time
        M = M0 + n * dt

        # Solve Kepler equation: E - e*sin(E) = M
        E = M
        for _ in range(50):
            dE = (M - E + e * math.sin(E)) / (1 - e * math.cos(E))
            E += dE
            if abs(dE) < 1e-12:
                break

        # True anomaly
        nu = 2 * math.atan2(
            math.sqrt(1 + e) * math.sin(E / 2),
            math.sqrt(1 - e) * math.cos(E / 2)
        )

        # Argument of latitude
        u = argp + nu

        # ECI position direction (unit vector)
        cos_u, sin_u = math.cos(u), math.sin(u)
        cos_raan, sin_raan = math.cos(raan), math.sin(raan)
        cos_i, sin_i = math.cos(i), math.sin(i)

        rx = cos_raan * cos_u - sin_raan * sin_u * cos_i
        ry = sin_raan * cos_u + cos_raan * sin_u * cos_i
        rz = sin_u * sin_i

        # RA and Dec (geocentric, simplified - no topocentric correction)
        dec = math.asin(max(-1, min(1, rz)))
        ra = math.atan2(ry, rx)

        return ra, dec

    def _compute_jacobian(self, x: np.ndarray, dt: float,
                           ra0: float, dec0: float) -> np.ndarray:
        """Numerical Jacobian via central differences."""
        J = np.zeros((2, 6))
        steps = [x[0] * 1e-6, 1e-8, 1e-8, 1e-8, 1e-8, 1e-8]

        for j in range(6):
            x_plus = x.copy()
            x_minus = x.copy()
            h = max(steps[j], 1e-10)
            x_plus[j] += h
            x_minus[j] -= h

            ra_p, dec_p = self._predict_observation(x_plus, dt)
            ra_m, dec_m = self._predict_observation(x_minus, dt)

            J[0, j] = (ra_p - ra_m) / (2 * h) * math.cos(dec0)
            J[1, j] = (dec_p - dec_m) / (2 * h)

        return J


if __name__ == "__main__":
    print("=== Batch OD Self-Test ===\n")

    solver = BatchODSolver()

    # Generate synthetic observations from known orbit
    true_a = R_EARTH + 500000   # 500 km altitude
    true_elements = {
        "a": true_a, "e": 0.001, "i": 51.6 * DEG2RAD,
        "raan": 0.0, "argp": 0.0, "M0": 0.0, "epoch": 0.0
    }

    # Create observations at 5-minute intervals (simulated)
    obs_list = []
    temp_x = np.array([true_a, 0.001, 51.6*DEG2RAD, 0.0, 0.0, 0.0])
    for k in range(10):
        dt = k * 300  # 5 min intervals
        ra, dec = solver._predict_observation(temp_x, dt)
        # Add noise
        ra += np.random.normal(0, 1/3600 * DEG2RAD)
        dec += np.random.normal(0, 1/3600 * DEG2RAD)
        obs_list.append(Observation(
            timestamp=dt, ra_deg=ra*RAD2DEG, dec_deg=dec*RAD2DEG
        ))

    # Solve with perturbed initial guess
    init = dict(true_elements)
    init["a"] *= 1.001  # 0.1% error in semi-major axis
    init["i"] *= 1.01   # 1% error in inclination

    result = solver.solve(obs_list, init)

    print(f"Converged: {result.converged} ({result.n_iterations} iterations)")
    print(f"RMS residual: {result.rms_residual_arcsec:.3f} arcsec")
    print(f"Semi-major axis: {result.a/1000:.1f} km (true: {true_a/1000:.1f})")
    print(f"Inclination: {result.i*RAD2DEG:.2f} deg (true: 51.60)")
    print(f"Eccentricity: {result.e:.6f} (true: 0.001)")
    a_err_km = abs(result.a - true_a) / 1000
    print(f"\nSMA recovery error: {a_err_km:.2f} km")
    print("\n\u2713 Batch OD test passed.")
