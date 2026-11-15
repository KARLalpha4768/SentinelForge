import math

from output.builds.src import orbit_propagator


def test_orbit_regime_rate_handles_ra_wrap_and_declination_scale():
    observations = [
        {"timestamp": 0.0, "ra_deg": 359.4, "dec_deg": 60.0},
        {"timestamp": 1.0, "ra_deg": 0.0, "dec_deg": 60.0},
        {"timestamp": 2.0, "ra_deg": 0.6, "dec_deg": 60.0},
    ]

    orbit = orbit_propagator.OrbitPropagator().estimate_orbit_regime(observations)

    assert orbit is not None
    assert math.isclose(orbit.altitude_km, 1000.0, abs_tol=1e-9)


def test_state_vector_clamps_declination_roundoff():
    class RoundedState(orbit_propagator.StateVector):
        @property
        def r_mag(self):
            return abs(self.z) * (1.0 - 1e-15)

    _, declination = RoundedState(z=1.0).to_ra_dec()

    assert declination == 90.0


def test_kepler_solver_converges_for_high_eccentricity():
    mean_anomaly = 0.1
    eccentricity = 0.95

    eccentric_anomaly = orbit_propagator.OrbitPropagator()._solve_kepler(
        mean_anomaly, eccentricity
    )

    residual = eccentric_anomaly - eccentricity * math.sin(eccentric_anomaly) - mean_anomaly
    assert abs(residual) < 1e-12
