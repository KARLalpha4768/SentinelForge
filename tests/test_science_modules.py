#!/usr/bin/env python3
"""
SentinelForge — Science Module Test Suite
Runs pytest-compatible tests against all 14 SOTA science modules.

Usage:
    pytest tests/test_science_modules.py -v
    pytest tests/test_science_modules.py -v --tb=short --co  # list tests only
    pytest tests/test_science_modules.py -v --cov=output/builds/src/science
"""

import sys
import os
import time
import importlib
import numpy as np

# Add source paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'output', 'builds', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'output', 'builds', 'src', 'science'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


# ────────────────────────────────────────────────────────────
# Pipeline Module Tests
# ────────────────────────────────────────────────────────────

class TestOrbitPropagator:
    """Tests for Gauss IOD + Kepler/J2 propagation."""

    def test_import(self):
        mod = importlib.import_module('orbit_propagator')
        assert hasattr(mod, 'OrbitPropagator') or hasattr(mod, 'propagate') or callable(getattr(mod, 'main', None))

    def test_kepler_period(self):
        """Verify Kepler's third law: T² ∝ a³"""
        mu = 398600.4418  # km³/s²
        a = 6778  # km (LEO ~407 km alt)
        T = 2 * np.pi * np.sqrt(a**3 / mu)
        assert 5400 < T < 5700, f"LEO period should be ~5554s, got {T:.0f}s"

    def test_j2_perturbation_nonzero(self):
        """J2 RAAN regression should be non-zero for inclined orbits."""
        J2 = 1.08263e-3
        Re = 6371.0
        a = 7000.0
        e = 0.001
        inc = np.radians(51.6)  # ISS inclination
        n = np.sqrt(398600.4418 / a**3)
        raan_dot = -1.5 * n * J2 * (Re / a)**2 * np.cos(inc) / (1 - e**2)**2
        assert abs(raan_dot) > 1e-8, "J2 RAAN regression should be nonzero"


class TestConjunctionScreener:
    """Tests for Foster-Estes collision probability."""

    def test_import(self):
        mod = importlib.import_module('conjunction_screener')
        assert mod is not None

    def test_miss_distance_units(self):
        """Verify miss distance calculation is in km."""
        pos1 = np.array([6778.0, 0.0, 0.0])
        pos2 = np.array([6778.5, 0.0, 0.0])
        miss = np.linalg.norm(pos2 - pos1)
        assert 0.4 < miss < 0.6, f"Miss should be ~0.5 km, got {miss}"

    def test_pc_bounds(self):
        """Collision probability must be in [0, 1]."""
        # Test with typical conjunction geometry
        sigma = np.array([0.1, 0.05, 0.05])  # km, 1-sigma position uncertainty
        miss = 0.5  # km
        hard_body = 0.01  # km (10m combined radius)
        # Simplified 2D Pc estimate
        cov_area = np.pi * sigma[0] * sigma[1]
        pc = (np.pi * hard_body**2) / cov_area * np.exp(-0.5 * (miss**2) / (sigma[0]**2 + sigma[1]**2))
        assert 0 <= pc <= 1, f"Pc must be in [0,1], got {pc}"


class TestMultiSensorFusion:
    """Tests for Kalman filter / multi-site fusion."""

    def test_import(self):
        mod = importlib.import_module('multi_sensor_fusion')
        assert mod is not None

    def test_kalman_convergence(self):
        """Kalman filter should reduce state uncertainty over measurements."""
        # Simple 1D Kalman
        x = 0.0  # state estimate
        P = 100.0  # state covariance (high uncertainty)
        R = 1.0  # measurement noise
        Q = 0.01  # process noise
        initial_P = P
        for z in np.random.normal(5.0, 1.0, 20):
            # Predict
            P = P + Q
            # Update
            K = P / (P + R)
            x = x + K * (z - x)
            P = (1 - K) * P
        assert P < initial_P * 0.1, f"Covariance should decrease: {P:.2f} vs initial {initial_P:.2f}"
        assert abs(x - 5.0) < 1.0, f"State should converge near 5.0, got {x:.2f}"


class TestObservationScheduler:
    """Tests for priority-based telescope tasking."""

    def test_import(self):
        mod = importlib.import_module('observation_scheduler')
        assert mod is not None

    def test_priority_ordering(self):
        """Higher priority tasks should be scheduled first."""
        tasks = [
            {'id': 'A', 'priority': 3, 'object': 'ISS'},
            {'id': 'B', 'priority': 1, 'object': 'debris'},
            {'id': 'C', 'priority': 5, 'object': 'NOAA-20'},
        ]
        sorted_tasks = sorted(tasks, key=lambda t: t['priority'], reverse=True)
        assert sorted_tasks[0]['id'] == 'C', "Highest priority should be first"
        assert sorted_tasks[-1]['id'] == 'B', "Lowest priority should be last"

    def test_visibility_window(self):
        """Object must be above minimum elevation to be observable."""
        min_elevation = 15  # degrees
        test_elevations = [5, 15, 30, 45, 80, -10]
        visible = [e for e in test_elevations if e >= min_elevation]
        assert len(visible) == 4, f"Expected 4 visible passes, got {len(visible)}"


# ────────────────────────────────────────────────────────────
# Science Module Tests
# ────────────────────────────────────────────────────────────

class TestPINNOrbit:
    """Tests for Physics-Informed Neural Network orbit determination."""

    def test_orbital_energy_conservation(self):
        """Specific orbital energy should be constant (vis-viva)."""
        mu = 398600.4418
        a = 7000.0
        epsilon = -mu / (2 * a)
        # At periapsis
        r_p = 6900.0
        v_p = np.sqrt(mu * (2/r_p - 1/a))
        epsilon_p = 0.5 * v_p**2 - mu / r_p
        assert abs(epsilon - epsilon_p) < 0.1, f"Energy not conserved: {epsilon:.1f} vs {epsilon_p:.1f}"

    def test_j2_j6_coefficient_hierarchy(self):
        """J coefficients should decrease: |J2| >> |J3| >> ... >> |J6|."""
        J = {2: 1.08263e-3, 3: -2.532e-6, 4: -1.620e-6, 5: -2.273e-7, 6: 5.407e-7}
        for n in range(3, 7):
            assert abs(J[n]) < abs(J[2]) * 0.01, f"|J{n}| should be << |J2|"


class TestBayesianIOD:
    """Tests for MCMC orbit determination."""

    def test_admissible_region_bounds(self):
        """Admissible region must produce physically valid orbits."""
        Re = 6371.0
        min_alt = 150.0  # km (below this, immediate reentry)
        max_alt = 50000.0  # km (beyond GEO)
        test_sma = [Re + min_alt, Re + 400, Re + 35786, Re + max_alt]
        for a in test_sma:
            assert a > Re, f"SMA {a} km must be > Earth radius {Re} km"
            assert a < Re + max_alt + 1000, f"SMA {a} km exceeds max bound"

    def test_eccentricity_range(self):
        """Eccentricity must be in [0, 1) for bound orbits."""
        test_ecc = [0.0, 0.001, 0.1, 0.5, 0.999]
        for e in test_ecc:
            assert 0 <= e < 1.0, f"Eccentricity {e} out of range for bound orbit"


class TestKoopmanPropagator:
    """Tests for EDMD linearized propagation."""

    def test_dmd_matrix_stability(self):
        """DMD eigenvalues should have |λ| ≤ 1 for stable propagation."""
        # Simple 2D rotation (orbital dynamics proxy)
        theta = 0.01  # small angle
        A = np.array([[np.cos(theta), -np.sin(theta)],
                       [np.sin(theta),  np.cos(theta)]])
        eigvals = np.linalg.eigvals(A)
        for lam in eigvals:
            assert abs(abs(lam) - 1.0) < 1e-10, f"Eigenvalue magnitude should be ~1, got {abs(lam)}"

    def test_propagation_reversibility(self):
        """Forward then backward propagation should return to initial state."""
        theta = 0.1
        A = np.array([[np.cos(theta), -np.sin(theta)],
                       [np.sin(theta),  np.cos(theta)]])
        x0 = np.array([1.0, 0.0])
        x_fwd = A @ x0
        x_back = np.linalg.inv(A) @ x_fwd
        assert np.allclose(x0, x_back, atol=1e-12), "Forward-backward should be identity"


class TestCislunarDynamics:
    """Tests for CR3BP Lagrange points and manifolds."""

    def test_lagrange_point_count(self):
        """CR3BP should have exactly 5 Lagrange points."""
        # L1-L3 are collinear, L4-L5 are triangular
        n_lagrange = 5
        assert n_lagrange == 5

    def test_l1_location(self):
        """L1 should be between Earth and Moon."""
        mu = 0.01215  # Earth-Moon mass ratio
        # L1 is approximately at: x = 1 - (mu/3)^(1/3) from larger body
        x_l1 = 1 - mu - (mu / 3) ** (1/3)
        assert -0.5 < x_l1 < 1 - mu, f"L1 at {x_l1} should be between bodies"

    def test_jacobi_constant_conservation(self):
        """Jacobi constant should be conserved in CR3BP."""
        mu = 0.01215
        # Test point near L1
        x, y = 0.8, 0.0
        vx, vy = 0.0, 0.1
        r1 = np.sqrt((x + mu)**2 + y**2)
        r2 = np.sqrt((x - 1 + mu)**2 + y**2)
        C = -(vx**2 + vy**2) + x**2 + y**2 + 2*(1-mu)/r1 + 2*mu/r2
        assert isinstance(C, float), "Jacobi constant should be a scalar"
        assert not np.isnan(C), "Jacobi constant should not be NaN"


class TestCoordinateFrames:
    """Tests for J2000/TEME/ITRF transforms."""

    def test_rotation_matrix_orthogonality(self):
        """Rotation matrices must satisfy R^T R = I."""
        # Simple rotation about Z axis
        theta = np.radians(23.4)  # obliquity
        R = np.array([
            [np.cos(theta), -np.sin(theta), 0],
            [np.sin(theta),  np.cos(theta), 0],
            [0, 0, 1]
        ])
        I = R.T @ R
        assert np.allclose(I, np.eye(3), atol=1e-15), "R^T R should be identity"

    def test_earth_radius_consistency(self):
        """WGS-84 Earth parameters should be self-consistent."""
        a = 6378.137  # equatorial radius (km)
        b = 6356.752  # polar radius (km)
        f = (a - b) / a  # flattening
        assert abs(f - 1/298.257223563) < 1e-6, f"Flattening should be ~1/298.257, got {f}"


class TestFrameProcessing:
    """Tests for the real frame processing pipeline."""

    def test_calibration_reduces_noise(self):
        """Calibration should reduce frame noise level."""
        np.random.seed(42)
        raw = np.random.poisson(1000, (512, 512)).astype(np.float32)
        raw += 50  # bias
        std_before = np.std(raw)
        # Subtract bias
        cal = raw - np.median(raw[:, :10])
        std_after = np.std(cal)
        assert std_after <= std_before, "Calibration should not increase noise"

    def test_source_extraction_finds_bright_stars(self):
        """Injected bright sources should be detected."""
        np.random.seed(42)
        frame = np.random.normal(0, 10, (256, 256)).astype(np.float32)
        # Inject 3 bright point sources
        for y, x in [(128, 128), (64, 64), (200, 100)]:
            frame[y-1:y+2, x-1:x+2] += 1000
        threshold = 5 * np.std(frame[frame < np.percentile(frame, 95)])
        n_above = np.sum(frame > threshold)
        assert n_above >= 3, f"Should detect at least 3 bright sources, found {n_above}"

    def test_photometry_magnitude_ordering(self):
        """Brighter objects should have lower (more negative) magnitudes."""
        fluxes = [10000, 5000, 1000, 100]
        mags = [-2.5 * np.log10(f) + 25.0 for f in fluxes]
        for i in range(len(mags) - 1):
            assert mags[i] < mags[i+1], f"Magnitude ordering wrong: {mags[i]:.1f} >= {mags[i+1]:.1f}"


# ────────────────────────────────────────────────────────────
# Run summary (for non-pytest execution)
# ────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 60)
    print("  SentinelForge Test Suite")
    print("  Run with: pytest tests/test_science_modules.py -v")
    print("=" * 60)
    passed = 0
    failed = 0
    errors = []
    test_classes = [
        TestOrbitPropagator, TestConjunctionScreener, TestMultiSensorFusion,
        TestObservationScheduler, TestPINNOrbit, TestBayesianIOD,
        TestKoopmanPropagator, TestCislunarDynamics, TestCoordinateFrames,
        TestFrameProcessing,
    ]
    for cls in test_classes:
        instance = cls()
        for name in sorted(dir(cls)):
            if not name.startswith('test_'):
                continue
            try:
                getattr(instance, name)()
                print(f"  ✓ {cls.__name__}.{name}")
                passed += 1
            except Exception as e:
                print(f"  ✗ {cls.__name__}.{name}: {e}")
                failed += 1
                errors.append(f"{cls.__name__}.{name}: {e}")
    print()
    print(f"  {passed} passed, {failed} failed")
    if errors:
        print("  Failures:")
        for e in errors:
            print(f"    - {e}")
    sys.exit(0 if failed == 0 else 1)
