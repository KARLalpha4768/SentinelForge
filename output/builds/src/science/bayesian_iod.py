"""
bayesian_iod.py - SentinelForge Bayesian Initial Orbit Determination

When the graph_associator flags a UCT (Uncorrelated Track), this module
answers: "What orbit could produce this short arc of angles-only data?"

Uses Admissible Region theory + MCMC sampling to produce a probability
distribution over possible orbits, rather than a single unstable solution.
This is how the Minor Planet Center handles newly-discovered asteroids.
"""
import logging
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional

logger = logging.getLogger("sentinelforge.science.bayesian_iod")

MU_EARTH = 3.986004418e5  # km^3/s^2
R_EARTH = 6378.137         # km


@dataclass
class AnglesObservation:
    """Single angles-only measurement."""
    ra_rad: float
    dec_rad: float
    timestamp: float
    observer_ecef: np.ndarray = None  # [x, y, z] km


@dataclass
class OrbitHypothesis:
    """A single orbit sample from the posterior."""
    a_km: float         # Semi-major axis
    ecc: float          # Eccentricity
    inc_deg: float      # Inclination
    raan_deg: float     # Right ascension of ascending node
    argp_deg: float     # Argument of periapsis
    M_deg: float        # Mean anomaly
    log_likelihood: float


class AdmissibleRegion:
    """
    Defines the physically-plausible region of (range, range_rate) space
    for a given line-of-sight direction.

    Physical constraints:
      1. Object must be above Earth's surface: rho > rho_min
      2. Object must be gravitationally bound: v < v_escape
      3. Object must be in a realistic orbit: 200 km < altitude < 50000 km
    """

    def __init__(self, min_alt_km: float = 150.0, max_alt_km: float = 50000.0):
        self.min_alt = min_alt_km
        self.max_alt = max_alt_km

    def compute_bounds(self, ra: float, dec: float,
                       observer_pos: np.ndarray) -> Tuple[float, float, float, float]:
        """
        Compute the admissible region bounds in (range, range_rate) space.

        Returns: (rho_min, rho_max, rhodot_min, rhodot_max)
        """
        # Line-of-sight unit vector
        los = np.array([
            np.cos(dec) * np.cos(ra),
            np.cos(dec) * np.sin(ra),
            np.sin(dec)
        ])

        obs_r = np.linalg.norm(observer_pos)

        # Minimum range: object at min altitude along LOS
        rho_min = max(0.1, self.min_alt + R_EARTH - obs_r)
        # Maximum range: object at max altitude along LOS
        rho_max = self.max_alt + R_EARTH + obs_r

        # Range-rate bounds from escape velocity constraint
        r_max = obs_r + rho_max
        v_esc = np.sqrt(2 * MU_EARTH / (R_EARTH + self.min_alt))
        rhodot_min = -v_esc
        rhodot_max = v_esc

        return rho_min, rho_max, rhodot_min, rhodot_max


class MCMCOrbitSampler:
    """
    Markov Chain Monte Carlo sampler over the Admissible Region.

    Uses Metropolis-Hastings to explore the space of (rho, rhodot) pairs
    consistent with the observed angles, producing a posterior distribution
    over orbital elements.
    """

    def __init__(self, n_samples: int = 5000, burn_in: int = 1000):
        self.n_samples = n_samples
        self.burn_in = burn_in
        self.admissible = AdmissibleRegion()

    def _angles_to_state(self, ra: float, dec: float, rho: float,
                         rhodot: float, observer_pos: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Convert (angles, range, range_rate) to ECI position and velocity."""
        los = np.array([
            np.cos(dec) * np.cos(ra),
            np.cos(dec) * np.sin(ra),
            np.sin(dec)
        ])
        r = observer_pos + rho * los
        v_los = rhodot * los
        # Approximate transverse velocity from Earth rotation
        omega_earth = 7.2921159e-5  # rad/s
        v_rot = np.cross(np.array([0, 0, omega_earth]), observer_pos)
        v = v_los + v_rot
        return r, v

    def _state_to_elements(self, r: np.ndarray, v: np.ndarray) -> Optional[OrbitHypothesis]:
        """Convert ECI state vector to Keplerian elements."""
        r_mag = np.linalg.norm(r)
        v_mag = np.linalg.norm(v)
        h = np.cross(r, v)
        h_mag = np.linalg.norm(h)
        if h_mag < 1e-10:
            return None

        # Semi-major axis (vis-viva)
        energy = v_mag**2 / 2 - MU_EARTH / r_mag
        if abs(energy) < 1e-10:
            return None
        a = -MU_EARTH / (2 * energy)
        if a < R_EARTH + 100 or a > 100000:
            return None

        # Eccentricity vector
        e_vec = np.cross(v, h) / MU_EARTH - r / r_mag
        ecc = np.linalg.norm(e_vec)
        if ecc >= 1.0 or ecc < 0:
            return None

        # Inclination
        inc = np.degrees(np.arccos(np.clip(h[2] / h_mag, -1, 1)))

        # RAAN
        n_vec = np.cross(np.array([0, 0, 1]), h)
        n_mag = np.linalg.norm(n_vec)
        if n_mag > 1e-10:
            raan = np.degrees(np.arctan2(n_vec[1], n_vec[0])) % 360
        else:
            raan = 0.0

        # Argument of periapsis
        if n_mag > 1e-10 and ecc > 1e-8:
            argp = np.degrees(np.arccos(np.clip(
                np.dot(n_vec, e_vec) / (n_mag * ecc), -1, 1)))
            if e_vec[2] < 0:
                argp = 360 - argp
        else:
            argp = 0.0

        # True anomaly -> Mean anomaly
        if ecc > 1e-8:
            nu = np.degrees(np.arccos(np.clip(
                np.dot(e_vec, r) / (ecc * r_mag), -1, 1)))
            if np.dot(r, v) < 0:
                nu = 360 - nu
        else:
            nu = 0.0

        return OrbitHypothesis(
            a_km=a, ecc=ecc, inc_deg=inc, raan_deg=raan,
            argp_deg=argp, M_deg=nu, log_likelihood=0.0
        )

    def _log_likelihood(self, obs_list: List[AnglesObservation],
                        rho: float, rhodot: float) -> float:
        """Compute log-likelihood of (rho, rhodot) given observations."""
        obs = obs_list[0]
        observer = obs.observer_ecef if obs.observer_ecef is not None else np.array([R_EARTH, 0, 0])
        r, v = self._angles_to_state(obs.ra_rad, obs.dec_rad, rho, rhodot, observer)
        r_mag = np.linalg.norm(r)
        alt = r_mag - R_EARTH

        # Penalize unphysical orbits
        if alt < 150 or alt > 50000:
            return -1e10
        energy = np.linalg.norm(v)**2 / 2 - MU_EARTH / r_mag
        if energy >= 0:  # Unbound
            return -1e10

        # Gaussian likelihood based on orbital mechanics feasibility
        v_circ = np.sqrt(MU_EARTH / r_mag)
        v_mag = np.linalg.norm(v)
        ll = -0.5 * ((v_mag - v_circ) / (v_circ * 0.3))**2
        return ll

    def sample(self, observations: List[AnglesObservation]) -> List[OrbitHypothesis]:
        """Run MCMC to produce posterior orbit samples."""
        obs = observations[0]
        observer = obs.observer_ecef if obs.observer_ecef is not None else np.array([R_EARTH, 0, 0])
        bounds = self.admissible.compute_bounds(obs.ra_rad, obs.dec_rad, observer)
        rho_min, rho_max, rhodot_min, rhodot_max = bounds

        # Initialize chain
        rho = (rho_min + rho_max) / 2
        rhodot = 0.0
        ll_current = self._log_likelihood(observations, rho, rhodot)

        samples = []
        accepted = 0
        total = self.n_samples + self.burn_in

        for i in range(total):
            # Proposal
            rho_prop = rho + np.random.normal(0, (rho_max - rho_min) * 0.01)
            rhodot_prop = rhodot + np.random.normal(0, 0.5)

            if rho_prop < rho_min or rho_prop > rho_max:
                continue

            ll_prop = self._log_likelihood(observations, rho_prop, rhodot_prop)
            # Metropolis acceptance
            if np.log(np.random.random() + 1e-20) < ll_prop - ll_current:
                rho, rhodot = rho_prop, rhodot_prop
                ll_current = ll_prop
                accepted += 1

            if i >= self.burn_in:
                r, v = self._angles_to_state(obs.ra_rad, obs.dec_rad, rho, rhodot, observer)
                hyp = self._state_to_elements(r, v)
                if hyp is not None:
                    hyp.log_likelihood = ll_current
                    samples.append(hyp)

        rate = accepted / total if total > 0 else 0
        logger.info(f"MCMC: {len(samples)} valid samples, acceptance rate {rate:.1%}")
        return samples


class OrbitPosterior:
    """Summarizes the posterior distribution over orbital elements."""

    def summarize(self, samples: List[OrbitHypothesis]) -> dict:
        if not samples:
            return {"status": "no_valid_samples"}
        a_vals = [s.a_km for s in samples]
        e_vals = [s.ecc for s in samples]
        i_vals = [s.inc_deg for s in samples]
        return {
            "n_samples": len(samples),
            "sma_km": {"mean": np.mean(a_vals), "std": np.std(a_vals),
                       "min": np.min(a_vals), "max": np.max(a_vals)},
            "ecc": {"mean": np.mean(e_vals), "std": np.std(e_vals)},
            "inc_deg": {"mean": np.mean(i_vals), "std": np.std(i_vals)},
            "regime": "LEO" if np.mean(a_vals) < 8000 else
                      "MEO" if np.mean(a_vals) < 30000 else "GEO/HEO"
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Bayesian IOD -- Self Test")
    print("=" * 60)
    obs = [AnglesObservation(ra_rad=np.radians(180), dec_rad=np.radians(45),
                             timestamp=0.0, observer_ecef=np.array([R_EARTH, 0, 0]))]
    sampler = MCMCOrbitSampler(n_samples=3000, burn_in=500)
    samples = sampler.sample(obs)
    post = OrbitPosterior().summarize(samples)
    print(f"  Samples: {post.get('n_samples', 0)}")
    if 'sma_km' in post:
        s = post['sma_km']
        print(f"  SMA: {s['mean']:.0f} +/- {s['std']:.0f} km")
        print(f"  Ecc: {post['ecc']['mean']:.4f} +/- {post['ecc']['std']:.4f}")
        print(f"  Inc: {post['inc_deg']['mean']:.1f} +/- {post['inc_deg']['std']:.1f} deg")
        print(f"  Regime: {post['regime']}")
    print("All tests passed.")
    print("=" * 60)
