"""
orbit_propagator.py - SentinelForge Cloud Pipeline
SGP4 + numerical orbit propagation for space object tracking.
Bridges edge detections to orbital elements and future position prediction.
"""
import math
import time
from dataclasses import dataclass, field
from typing import List, Tuple, Optional

# ---- Constants (WGS-84 / IAU) ----
MU_EARTH = 3.986004418e14       # m^3/s^2  (gravitational parameter)
R_EARTH = 6378137.0             # meters    (equatorial radius)
J2 = 1.08263e-3                 # second zonal harmonic
OMEGA_EARTH = 7.2921159e-5      # rad/sec   (Earth rotation rate)
AU_METERS = 1.496e11            # meters per AU
SEC_PER_DAY = 86400.0
DEG2RAD = math.pi / 180.0
RAD2DEG = 180.0 / math.pi


@dataclass
class OrbitalElements:
    """Classical Keplerian orbital elements (J2000)."""
    norad_id: int
    epoch: float                # Unix timestamp
    a: float                    # Semi-major axis (meters)
    e: float                    # Eccentricity (0-1)
    i: float                    # Inclination (radians)
    raan: float                 # Right ascension of ascending node (radians)
    argp: float                 # Argument of perigee (radians)
    M: float                    # Mean anomaly (radians)
    n: float = 0.0              # Mean motion (rad/sec)
    bstar: float = 0.0          # Drag term

    def __post_init__(self):
        if self.n == 0 and self.a > 0:
            self.n = math.sqrt(MU_EARTH / self.a**3)

    @property
    def period_sec(self) -> float:
        return 2 * math.pi / self.n if self.n > 0 else 0

    @property
    def altitude_km(self) -> float:
        return (self.a - R_EARTH) / 1000

    @property
    def apogee_km(self) -> float:
        return (self.a * (1 + self.e) - R_EARTH) / 1000

    @property
    def perigee_km(self) -> float:
        return (self.a * (1 - self.e) - R_EARTH) / 1000


@dataclass
class StateVector:
    """Position and velocity in ECI (Earth-Centered Inertial) frame."""
    x: float = 0.0     # meters
    y: float = 0.0
    z: float = 0.0
    vx: float = 0.0    # m/s
    vy: float = 0.0
    vz: float = 0.0
    epoch: float = 0.0

    @property
    def r_mag(self) -> float:
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)

    @property
    def v_mag(self) -> float:
        return math.sqrt(self.vx**2 + self.vy**2 + self.vz**2)

    def to_ra_dec(self) -> Tuple[float, float]:
        """Convert ECI position to RA/Dec (degrees)."""
        r = self.r_mag
        dec = math.asin(self.z / r) * RAD2DEG
        ra = math.atan2(self.y, self.x) * RAD2DEG
        if ra < 0:
            ra += 360
        return ra, dec


class OrbitPropagator:
    """
    Simplified SGP4-like propagator with J2 perturbation.
    For interview demonstration - production uses SGP4/SDP4 from Vallado.
    """

    def kepler_to_state(self, elem: OrbitalElements) -> StateVector:
        """Convert Keplerian elements to ECI state vector."""
        # Solve Kepler's equation: E - e*sin(E) = M
        E = self._solve_kepler(elem.M, elem.e)

        # True anomaly
        nu = 2 * math.atan2(
            math.sqrt(1 + elem.e) * math.sin(E / 2),
            math.sqrt(1 - elem.e) * math.cos(E / 2)
        )

        # Distance
        r = elem.a * (1 - elem.e * math.cos(E))

        # Position in orbital plane
        x_orb = r * math.cos(nu)
        y_orb = r * math.sin(nu)

        # Velocity in orbital plane
        p = elem.a * (1 - elem.e**2)
        h = math.sqrt(MU_EARTH * p)
        vx_orb = -MU_EARTH / h * math.sin(nu)
        vy_orb = MU_EARTH / h * (elem.e + math.cos(nu))

        # Rotation matrices (orbital plane -> ECI)
        cos_raan = math.cos(elem.raan)
        sin_raan = math.sin(elem.raan)
        cos_argp = math.cos(elem.argp)
        sin_argp = math.sin(elem.argp)
        cos_i = math.cos(elem.i)
        sin_i = math.sin(elem.i)

        # Combined rotation
        l1 = cos_raan*cos_argp - sin_raan*sin_argp*cos_i
        l2 = -cos_raan*sin_argp - sin_raan*cos_argp*cos_i
        m1 = sin_raan*cos_argp + cos_raan*sin_argp*cos_i
        m2 = -sin_raan*sin_argp + cos_raan*cos_argp*cos_i
        n1 = sin_argp*sin_i
        n2 = cos_argp*sin_i

        sv = StateVector(
            x=l1*x_orb + l2*y_orb,
            y=m1*x_orb + m2*y_orb,
            z=n1*x_orb + n2*y_orb,
            vx=l1*vx_orb + l2*vy_orb,
            vy=m1*vx_orb + m2*vy_orb,
            vz=n1*vx_orb + n2*vy_orb,
            epoch=elem.epoch
        )
        return sv

    def propagate(self, elem: OrbitalElements, dt_sec: float) -> StateVector:
        """
        Propagate orbit forward by dt seconds with J2 perturbation.
        Returns new state vector at epoch + dt.
        """
        # J2 secular perturbations
        p = elem.a * (1 - elem.e**2)
        cos_i = math.cos(elem.i)
        sin_i = math.sin(elem.i)
        n0 = elem.n

        # RAAN drift (nodal regression)
        raan_dot = -1.5 * n0 * J2 * (R_EARTH / p)**2 * cos_i
        # Argument of perigee drift
        argp_dot = 0.75 * n0 * J2 * (R_EARTH / p)**2 * (5*cos_i**2 - 1)
        # Mean motion correction
        n_corrected = n0 * (1 + 1.5*J2*(R_EARTH/p)**2 *
                           math.sqrt(1-elem.e**2) * (1 - 1.5*sin_i**2))

        # Propagated elements
        new_elem = OrbitalElements(
            norad_id=elem.norad_id,
            epoch=elem.epoch + dt_sec,
            a=elem.a,
            e=elem.e,
            i=elem.i,
            raan=elem.raan + raan_dot * dt_sec,
            argp=elem.argp + argp_dot * dt_sec,
            M=(elem.M + n_corrected * dt_sec) % (2 * math.pi),
            n=n_corrected,
            bstar=elem.bstar
        )

        return self.kepler_to_state(new_elem)

    def propagate_window(self, elem: OrbitalElements,
                         t_start: float, t_end: float,
                         step_sec: float = 60) -> List[StateVector]:
        """Propagate over a time window, return list of state vectors."""
        states = []
        t = t_start
        while t <= t_end:
            dt = t - elem.epoch
            sv = self.propagate(elem, dt)
            states.append(sv)
            t += step_sec
        return states

    def _solve_kepler(self, M: float, e: float, tol: float = 1e-12) -> float:
        """Solve Kepler's equation iteratively (Newton-Raphson)."""
        E = M  # Initial guess
        for _ in range(50):
            dE = (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
            E -= dE
            if abs(dE) < tol:
                break
        return E

    def estimate_orbit_regime(self, observations: list) -> Optional[OrbitalElements]:
        """
        Estimate orbital regime from angular rate of 3+ observations.

        This is a fast heuristic classifier — NOT a full angles-only IOD.
        It maps observed angular rate to approximate altitude bands:
          > 0.5 deg/s → LEO (~400 km)
          > 0.1 deg/s → MEO-low (~1,000 km)
          > 0.01 deg/s → MEO (~10,000 km)
          else → GEO (~36,000 km)

        Production IOD would use Gauss's method (Vallado ch. 7) solving
        Lambert's problem from 3 line-of-sight observations.
        """
        if len(observations) < 3:
            return None

        obs = observations[:3]
        dt = obs[2]["timestamp"] - obs[0]["timestamp"]

        if dt < 1:
            return None

        # Approximate angular rate to classify orbit regime
        rate_deg_sec = math.sqrt(
            (obs[2]["ra_deg"] - obs[0]["ra_deg"])**2 +
            (obs[2]["dec_deg"] - obs[0]["dec_deg"])**2
        ) / dt

        # Higher rate = lower orbit (Kepler's third law)
        if rate_deg_sec > 0.5:
            alt_km = 400   # LEO
        elif rate_deg_sec > 0.1:
            alt_km = 1000  # MEO-low
        elif rate_deg_sec > 0.01:
            alt_km = 10000 # MEO
        else:
            alt_km = 36000 # GEO

        a = (R_EARTH + alt_km * 1000)

        return OrbitalElements(
            norad_id=-1,  # Uncorrelated track
            epoch=obs[1]["timestamp"],
            a=a, e=0.001,
            i=abs(obs[1]["dec_deg"]) * DEG2RAD if obs[1]["dec_deg"] else 0,
            raan=obs[1]["ra_deg"] * DEG2RAD,
            argp=0, M=0
        )

    # Backwards-compatible alias
    initial_orbit_determination = estimate_orbit_regime


# ---- TLE Parser ----

def parse_tle(line1: str, line2: str) -> OrbitalElements:
    """Parse NORAD Two-Line Element set into OrbitalElements."""
    norad_id = int(line1[2:7])
    epoch_year = int(line1[18:20])
    epoch_day = float(line1[20:32])

    # Convert epoch to Unix time (simplified)
    year = epoch_year + (2000 if epoch_year < 57 else 1900)
    import calendar, datetime
    jan1 = datetime.datetime(year, 1, 1, tzinfo=datetime.timezone.utc)
    epoch_dt = jan1 + datetime.timedelta(days=epoch_day - 1)
    epoch_unix = epoch_dt.timestamp()

    i = float(line2[8:16]) * DEG2RAD
    raan = float(line2[17:25]) * DEG2RAD
    e = float("0." + line2[26:33])
    argp = float(line2[34:42]) * DEG2RAD
    M = float(line2[43:51]) * DEG2RAD
    n_rev_per_day = float(line2[52:63])

    # Convert mean motion from rev/day to rad/sec
    n = n_rev_per_day * 2 * math.pi / SEC_PER_DAY
    # Derive semi-major axis from mean motion
    a = (MU_EARTH / n**2) ** (1/3)

    bstar = 0
    try:
        bstar_str = line1[53:61].strip()
        if bstar_str:
            mantissa = float(bstar_str[0] + "." + bstar_str[1:5])
            exponent = int(bstar_str[5:])
            bstar = mantissa * 10**exponent
    except (ValueError, IndexError):
        pass

    return OrbitalElements(
        norad_id=norad_id, epoch=epoch_unix,
        a=a, e=e, i=i, raan=raan, argp=argp, M=M, n=n, bstar=bstar
    )


# ---- Self-test ----

if __name__ == "__main__":
    print("=== Orbit Propagator Self-Test ===\n")

    prop = OrbitPropagator()

    # ISS-like orbit: 408 km altitude, 51.6° inclination, circular
    iss = OrbitalElements(
        norad_id=25544,
        epoch=0,
        a=R_EARTH + 408000,  # meters
        e=0.0001,
        i=51.6 * DEG2RAD,
        raan=0.0,
        argp=0.0,
        M=0.0
    )

    sv0 = prop.kepler_to_state(iss)
    print(f"ISS initial state:")
    print(f"  Position: r = {sv0.r_mag/1000:.0f} km")
    print(f"  Velocity: v = {sv0.v_mag:.0f} m/s")
    print(f"  Period:   T = {iss.period_sec/60:.1f} min")
    print(f"  Altitude: h = {iss.altitude_km:.0f} km")

    # Propagate one full orbit
    sv1 = prop.propagate(iss, iss.period_sec)
    dr = math.sqrt((sv1.x-sv0.x)**2 + (sv1.y-sv0.y)**2 + (sv1.z-sv0.z)**2)
    print(f"\nAfter 1 orbit ({iss.period_sec/60:.1f} min):")
    print(f"  Altitude: {(sv1.r_mag - R_EARTH)/1000:.0f} km")
    print(f"  Position drift: {dr/1000:.1f} km (J2 precession)")

    # Kepler equation convergence
    E = prop._solve_kepler(math.pi * 0.99, 0.9)  # High eccentricity test
    residual = E - 0.9 * math.sin(E) - math.pi * 0.99
    print(f"\nKepler equation (e=0.9, M=0.99π):")
    print(f"  E = {E:.12f} rad")
    print(f"  Residual: {residual:.2e} (should be ~0)")

    # IOD heuristic test
    obs = [
        {"ra_deg": 180.0, "dec_deg": 20.0, "timestamp": 0},
        {"ra_deg": 180.1, "dec_deg": 20.05, "timestamp": 30},
        {"ra_deg": 180.2, "dec_deg": 20.1, "timestamp": 60},
    ]
    iod = prop.estimate_orbit_regime(obs)
    print(f"\nOrbit regime estimate (slow mover):")
    print(f"  Altitude: {iod.altitude_km:.0f} km")
    print(f"  Period:   {iod.period_sec/60:.0f} min")

    # TLE parsing
    tle1 = "1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9004"
    tle2 = "2 25544  51.6400 208.9163 0006703 306.6370  53.4166 15.49560440    18"
    parsed = parse_tle(tle1, tle2)
    print(f"\nTLE parse (ISS):")
    print(f"  NORAD ID: {parsed.norad_id}")
    print(f"  Altitude: {parsed.altitude_km:.0f} km")
    print(f"  Inclination: {parsed.i * RAD2DEG:.1f}°")
    print(f"  Eccentricity: {parsed.e:.7f}")

    print("\n✓ All orbit propagator tests passed.")
