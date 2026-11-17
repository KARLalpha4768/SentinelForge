"""Frame-consistency tests for the non-Gaussian collision probability screener."""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "output", "builds", "src", "science"))

from non_gaussian_pc import (  # noqa: E402
    DifferentialAlgebraScreener,
    EncounterGeometry,
    StateTransitionTensor,
)

MU = StateTransitionTensor.MU_EARTH


def _circular_state(radius_km: float, phase_rad: float = 0.0, inc_rad: float = 0.0) -> np.ndarray:
    speed = math.sqrt(MU / radius_km)
    position = radius_km * np.array([math.cos(phase_rad), math.sin(phase_rad), 0.0])
    velocity = speed * np.array([-math.sin(phase_rad), math.cos(phase_rad) * math.cos(inc_rad),
                                 math.cos(phase_rad) * math.sin(inc_rad)])
    return np.concatenate((position, velocity))


def _rotate_about_z(state: np.ndarray, angle_rad: float) -> np.ndarray:
    c, s = math.cos(angle_rad), math.sin(angle_rad)
    rotation = np.array([[c, -s, 0.0], [s, c, 0.0], [0.0, 0.0, 1.0]])
    return np.concatenate((rotation @ state[:3], rotation @ state[3:]))


def _clohessy_wiltshire(n: float, t: float) -> np.ndarray:
    """Textbook CW STM; velocities are rates in the rotating Hill frame."""
    c, s = math.cos(n * t), math.sin(n * t)
    return np.array([
        [4 - 3 * c, 0, 0, s / n, 2 * (1 - c) / n, 0],
        [6 * (s - n * t), 1, 0, -2 * (1 - c) / n, (4 * s - 3 * n * t) / n, 0],
        [0, 0, c, 0, 0, s / n],
        [3 * n * s, 0, 0, c, 2 * s, 0],
        [-6 * n * (1 - c), 0, 0, -2 * s, 4 * c - 3, 0],
        [0, 0, -n * s, 0, 0, c],
    ])


ENCOUNTER = EncounterGeometry(
    miss_vector_rtn=np.array([0.5, 0.2, 0.0]),
    relative_velocity_km_s=14.1,
    hard_body_radius_km=0.01,
    tca_epoch_mjd=60400.5,
)
COV_PRI = np.diag([0.01, 1.0, 0.01, 1e-6, 1e-4, 1e-6])
COV_SEC = np.diag([0.02, 2.0, 0.02, 2e-6, 2e-4, 2e-6])


def test_local_stm_matches_clohessy_wiltshire_without_j2():
    """For a circular orbit the exact linearisation in the RTN frame is CW."""
    stt = StateTransitionTensor()
    stt.J2 = 0.0
    radius = 7000.0
    n = math.sqrt(MU / radius**3)
    dt = 1500.0

    _, phi_local = stt.local_stm(_circular_state(radius, phase_rad=0.7), dt)

    # local_stm uses inertial velocity components along R, T, N; CW uses rates
    # in the rotating frame. They differ by omega x r, with omega = n along N.
    omega_cross = np.array([[0.0, -n, 0.0], [n, 0.0, 0.0], [0.0, 0.0, 0.0]])
    to_inertial = np.eye(6)
    to_inertial[3:, :3] = omega_cross
    expected = to_inertial @ _clohessy_wiltshire(n, dt) @ np.linalg.inv(to_inertial)

    # Agreement is limited by the 60-second RK4 step (about 1e-6 relative).
    np.testing.assert_allclose(phi_local, expected, rtol=1e-5, atol=1e-6)


def test_propagated_mean_stays_on_the_orbit():
    screener = DifferentialAlgebraScreener(mc_samples=10)
    state = _circular_state(6778.0)
    moments = screener.propagate_moments(state, COV_PRI, 3600.0)
    radius = np.linalg.norm(moments.mean[:3])
    assert 6750.0 < radius < 6810.0


def test_screen_does_not_depend_on_orbital_position():
    """Rotating both objects about the polar axis leaves the RTN problem unchanged."""
    screener = DifferentialAlgebraScreener(mc_samples=10)
    state_pri = _circular_state(6778.0, inc_rad=math.radians(51.6))
    state_sec = _circular_state(6778.5, inc_rad=math.radians(97.0))

    base = screener.screen(ENCOUNTER, state_pri, COV_PRI, state_sec, COV_SEC, dt=1800.0)
    for angle in (0.4, 1.9, 4.0):
        rotated = screener.screen(
            ENCOUNTER,
            _rotate_about_z(state_pri, angle), COV_PRI,
            _rotate_about_z(state_sec, angle), COV_SEC,
            dt=1800.0,
        )
        assert math.isclose(rotated["pc_gaussian"], base["pc_gaussian"], rel_tol=1e-6)
        assert math.isclose(rotated["pc_edgeworth"], base["pc_edgeworth"], rel_tol=1e-6)
        assert math.isclose(rotated["skewness_metric"], base["skewness_metric"],
                            rel_tol=1e-6, abs_tol=1e-12)


def test_propagated_covariance_in_rtn_matches_clohessy_wiltshire():
    """Rotated back to RTN, the propagated covariance is the CW covariance (J2 off)."""
    screener = DifferentialAlgebraScreener(mc_samples=10)
    screener.stt.J2 = 0.0
    radius = 6778.0
    n = math.sqrt(MU / radius**3)
    state = _circular_state(radius, inc_rad=math.radians(51.6))
    to_inertial = np.eye(6)
    to_inertial[3:, :3] = np.array([[0.0, -n, 0.0], [n, 0.0, 0.0], [0.0, 0.0, 0.0]])
    period = 2 * math.pi / n

    from non_gaussian_pc import rtn_to_eci_matrix
    for dt in (0.25 * period, 0.65 * period, 3.0 * period):
        moments = screener.propagate_moments(state, COV_PRI, dt)
        to_rtn = rtn_to_eci_matrix(moments.mean).T
        cov_rtn = to_rtn @ moments.covariance[:3, :3] @ to_rtn.T

        phi = to_inertial @ _clohessy_wiltshire(n, dt) @ np.linalg.inv(to_inertial)
        expected = (phi @ COV_PRI @ phi.T)[:3, :3]
        # The second-order term adds a little extra spread; the linear part dominates.
        np.testing.assert_allclose(np.diag(cov_rtn), np.diag(expected), rtol=0.02)


def test_monte_carlo_matches_the_projected_gaussian():
    """With little curvature, the sampled Pc must match the 2D Gaussian it samples."""
    screener = DifferentialAlgebraScreener(mc_samples=200_000, seed=7)
    state_pri = _circular_state(6778.0, inc_rad=math.radians(51.6))
    state_sec = _circular_state(6778.5, inc_rad=math.radians(97.0))
    cov = np.diag([0.0004, 0.0016, 0.0004, 1e-10, 1e-10, 1e-10])
    encounter = EncounterGeometry(
        miss_vector_rtn=np.array([0.02, 0.01, 0.0]),
        relative_velocity_km_s=14.1,
        hard_body_radius_km=0.03,
        tca_epoch_mjd=60400.5,
    )
    dt = 600.0

    moments_pri = screener.propagate_moments(state_pri, cov, dt)
    moments_sec = screener.propagate_moments(state_sec, cov, dt)
    from non_gaussian_pc import _state_rotation
    to_rtn = _state_rotation(moments_pri.mean).T
    combined = to_rtn @ (moments_pri.covariance + moments_sec.covariance) @ to_rtn.T
    plane = screener._encounter_plane_basis(encounter)
    cov_2d = plane @ combined[:3, :3] @ plane.T
    miss_2d = plane @ encounter.miss_vector_rtn

    # Integrate the 2D Gaussian over the hard-body disk on a polar grid.
    inv = np.linalg.inv(cov_2d)
    norm = 1.0 / (2 * math.pi * math.sqrt(np.linalg.det(cov_2d)))
    radii = (np.arange(400) + 0.5) / 400 * encounter.hard_body_radius_km
    angles = (np.arange(720) + 0.5) / 720 * 2 * math.pi
    rr, aa = np.meshgrid(radii, angles, indexing="ij")
    points = np.stack((rr * np.cos(aa), rr * np.sin(aa)), axis=-1) - miss_2d
    density = norm * np.exp(-0.5 * np.einsum("...i,ij,...j->...", points, inv, points))
    expected = float(np.sum(density * rr) * (radii[1] - radii[0]) * (angles[1] - angles[0]))

    sampled = screener.monte_carlo_pc(state_pri, cov, state_sec, cov,
                                      encounter.hard_body_radius_km, dt, encounter)

    assert expected > 0.05
    standard_error = math.sqrt(expected * (1 - expected) / screener.mc_samples)
    assert abs(sampled - expected) < 5 * standard_error
