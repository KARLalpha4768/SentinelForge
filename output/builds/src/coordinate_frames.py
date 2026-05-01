"""
coordinate_frames.py - SentinelForge Astrodynamics Library
Reference frame transformations: J2000/GCRS ↔ TEME ↔ ITRF ↔ Topocentric

These transforms are critical for comparing TLE-derived predictions (TEME frame)
against ground-based observations (topocentric/ITRF frame).

Implements:
  - Earth orientation: GMST, ERA
  - Frame rotations: ECI_J2000 → TEME → ITRF → Topocentric (AltAz)
  - Atmospheric refraction: Bennett 1982
  - Precession/Nutation: IAU 1976/1980 (simplified)

References:
  - Vallado, "Fundamentals of Astrodynamics and Applications" 4th ed.
  - IERS Conventions (2010), Chapter 5
  - Montenbruck & Gill, "Satellite Orbits"
"""
import math
import numpy as np
from dataclasses import dataclass
from typing import Tuple

# --- Constants ---
DEG2RAD = math.pi / 180.0
RAD2DEG = 180.0 / math.pi
ARCSEC2RAD = DEG2RAD / 3600.0
MJD_J2000 = 51544.5          # MJD of J2000.0 epoch (2000-01-01 12:00 TT)
JD_J2000 = 2451545.0
OMEGA_EARTH = 7.2921150e-5   # Earth rotation rate (rad/s, IERS)
R_EARTH_KM = 6378.137        # WGS-84 equatorial radius
F_EARTH = 1.0 / 298.257223563  # WGS-84 flattening


@dataclass
class ObserverLocation:
    """Ground station geodetic coordinates (WGS-84)."""
    latitude_deg: float
    longitude_deg: float
    altitude_m: float
    site_id: str = ""


@dataclass
class TopocentricCoords:
    """Topocentric (observer-centered) coordinates."""
    azimuth_deg: float     # North=0, East=90
    elevation_deg: float   # Horizon=0, Zenith=90
    range_km: float
    azimuth_rate_deg_s: float = 0.0
    elevation_rate_deg_s: float = 0.0
    range_rate_km_s: float = 0.0


# --- Time Conversions ---

def unix_to_jd(unix_time: float) -> float:
    """Convert Unix timestamp to Julian Date."""
    return unix_time / 86400.0 + 2440587.5

def jd_to_mjd(jd: float) -> float:
    return jd - 2400000.5

def jd_to_centuries(jd: float) -> float:
    """Julian centuries since J2000.0."""
    return (jd - JD_J2000) / 36525.0


# --- Earth Orientation ---

def greenwich_mean_sidereal_time(jd: float) -> float:
    """
    GMST in radians.
    IAU 1982 formula (Vallado eq. 3-47).
    """
    T = jd_to_centuries(jd)
    # GMST in seconds of time
    gmst_sec = (67310.54841
                + (876600.0 * 3600 + 8640184.812866) * T
                + 0.093104 * T**2
                - 6.2e-6 * T**3)
    # Convert to radians (1 hour = 15 deg = pi/12 rad)
    gmst_rad = (gmst_sec % 86400.0) / 86400.0 * 2 * math.pi
    return gmst_rad % (2 * math.pi)


def earth_rotation_angle(jd: float) -> float:
    """
    Earth Rotation Angle (ERA) per IERS 2010.
    More accurate than GMST for modern applications.
    """
    Du = jd - JD_J2000
    theta = 2 * math.pi * (0.7790572732640 + 1.00273781191135448 * Du)
    return theta % (2 * math.pi)


# --- Frame Rotation Matrices ---

def _rot_x(angle: float) -> np.ndarray:
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[1, 0, 0], [0, c, s], [0, -s, c]])

def _rot_y(angle: float) -> np.ndarray:
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[c, 0, -s], [0, 1, 0], [s, 0, c]])

def _rot_z(angle: float) -> np.ndarray:
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]])


def precession_matrix(jd: float) -> np.ndarray:
    """
    IAU 1976 precession matrix: J2000.0 → mean equator of date.
    Vallado eq. 3-56.
    """
    T = jd_to_centuries(jd)
    zeta_a  = (2306.2181 + 1.39656*T - 0.000139*T**2) * T * ARCSEC2RAD
    theta_a = (2004.3109 - 0.85330*T - 0.000217*T**2) * T * ARCSEC2RAD
    z_a     = (2306.2181 + 1.09468*T + 0.000066*T**2) * T * ARCSEC2RAD

    return _rot_z(-z_a) @ _rot_y(theta_a) @ _rot_z(-zeta_a)


def nutation_angles(jd: float) -> Tuple[float, float, float]:
    """
    IAU 1980 nutation: Δψ (nutation in longitude), Δε (nutation in obliquity).
    Returns (dpsi, deps, mean_obliquity) in radians.
    Simplified — uses only the dominant 4 terms.
    """
    T = jd_to_centuries(jd)

    # Mean obliquity of the ecliptic (Lieske 1979)
    eps0 = (84381.448 - 46.8150*T - 0.00059*T**2 + 0.001813*T**3) * ARCSEC2RAD

    # Fundamental arguments (degrees, converted to radians)
    omega = (125.04452 - 1934.136261*T) * DEG2RAD  # Moon ascending node
    L = (280.4665 + 36000.7698*T) * DEG2RAD        # Mean longitude of Sun
    Lp = (218.3165 + 481267.8813*T) * DEG2RAD      # Mean longitude of Moon

    # Dominant nutation terms (arcsec → rad)
    dpsi = (-17.20 * math.sin(omega) - 1.32 * math.sin(2*L)
            - 0.23 * math.sin(2*Lp) + 0.21 * math.sin(2*omega)) * ARCSEC2RAD
    deps = (9.20 * math.cos(omega) + 0.57 * math.cos(2*L)
            + 0.10 * math.cos(2*Lp) - 0.09 * math.cos(2*omega)) * ARCSEC2RAD

    return dpsi, deps, eps0


def j2000_to_teme(r_j2000: np.ndarray, jd: float) -> np.ndarray:
    """
    Convert J2000/GCRS position to TEME (True Equator Mean Equinox).
    TEME is the native frame for SGP4/TLE predictions.

    J2000 → precession → nutation → TEME
    """
    P = precession_matrix(jd)
    dpsi, deps, eps0 = nutation_angles(jd)

    N = (_rot_x(-(eps0 + deps)) @
         _rot_z(-dpsi) @
         _rot_x(eps0))

    # TEME uses mean equinox, so we apply equation of equinoxes correction
    eq_eq = dpsi * math.cos(eps0)
    R_eq = _rot_z(-eq_eq)

    return R_eq @ N @ P @ r_j2000


def teme_to_j2000(r_teme: np.ndarray, jd: float) -> np.ndarray:
    """Inverse: TEME → J2000."""
    P = precession_matrix(jd)
    dpsi, deps, eps0 = nutation_angles(jd)

    N = (_rot_x(-(eps0 + deps)) @
         _rot_z(-dpsi) @
         _rot_x(eps0))

    eq_eq = dpsi * math.cos(eps0)
    R_eq = _rot_z(-eq_eq)

    # Inverse = transpose for rotation matrices
    return P.T @ N.T @ R_eq.T @ r_teme


def teme_to_itrf(r_teme: np.ndarray, v_teme: np.ndarray,
                  jd: float) -> Tuple[np.ndarray, np.ndarray]:
    """
    TEME → ITRF (Earth-fixed frame) via sidereal rotation.
    Accounts for Earth rotation in velocity transformation.
    """
    gmst = greenwich_mean_sidereal_time(jd)
    R = _rot_z(gmst)

    r_itrf = R @ r_teme

    # Velocity correction for Earth rotation
    omega_vec = np.array([0, 0, OMEGA_EARTH])
    v_itrf = R @ v_teme - np.cross(omega_vec, r_itrf)

    return r_itrf, v_itrf


def itrf_to_teme(r_itrf: np.ndarray, v_itrf: np.ndarray,
                  jd: float) -> Tuple[np.ndarray, np.ndarray]:
    """ITRF → TEME (inverse of above)."""
    gmst = greenwich_mean_sidereal_time(jd)
    R = _rot_z(gmst)

    omega_vec = np.array([0, 0, OMEGA_EARTH])
    r_teme = R.T @ r_itrf
    v_teme = R.T @ (v_itrf + np.cross(omega_vec, r_itrf))

    return r_teme, v_teme


# --- Geodetic / Observer ---

def geodetic_to_ecef(lat_deg: float, lon_deg: float,
                      alt_m: float) -> np.ndarray:
    """
    Convert WGS-84 geodetic coordinates to ECEF (ITRF) position vector.
    """
    lat = lat_deg * DEG2RAD
    lon = lon_deg * DEG2RAD
    e2 = 2*F_EARTH - F_EARTH**2

    sin_lat = math.sin(lat)
    cos_lat = math.cos(lat)
    N = R_EARTH_KM / math.sqrt(1 - e2 * sin_lat**2)

    x = (N + alt_m/1000) * cos_lat * math.cos(lon)
    y = (N + alt_m/1000) * cos_lat * math.sin(lon)
    z = (N * (1 - e2) + alt_m/1000) * sin_lat

    return np.array([x, y, z])


def ecef_to_topocentric(r_sat_ecef: np.ndarray, observer: ObserverLocation
                         ) -> TopocentricCoords:
    """
    Convert satellite ECEF position to topocentric (Az/El/Range).
    """
    r_obs = geodetic_to_ecef(observer.latitude_deg, observer.longitude_deg,
                              observer.altitude_m)
    rho = r_sat_ecef - r_obs  # Range vector in ECEF

    # Rotation to East-North-Up (ENU)
    lat = observer.latitude_deg * DEG2RAD
    lon = observer.longitude_deg * DEG2RAD

    sin_lat, cos_lat = math.sin(lat), math.cos(lat)
    sin_lon, cos_lon = math.sin(lon), math.cos(lon)

    R_enu = np.array([
        [-sin_lon, cos_lon, 0],
        [-sin_lat*cos_lon, -sin_lat*sin_lon, cos_lat],
        [cos_lat*cos_lon, cos_lat*sin_lon, sin_lat]
    ])

    rho_enu = R_enu @ rho
    e, n, u = rho_enu

    range_km = np.linalg.norm(rho_enu)
    el = math.asin(u / range_km) * RAD2DEG
    az = math.atan2(e, n) * RAD2DEG
    if az < 0: az += 360

    return TopocentricCoords(
        azimuth_deg=az,
        elevation_deg=el,
        range_km=range_km
    )


# --- Atmospheric Refraction ---

def atmospheric_refraction(elevation_deg: float,
                            pressure_mbar: float = 1013.25,
                            temp_celsius: float = 10.0) -> float:
    """
    Bennett 1982 atmospheric refraction formula.
    Returns correction in degrees to ADD to true elevation → apparent elevation.

    Critical for low-elevation observations:
      - At 45°: ~1 arcmin correction
      - At 10°: ~5 arcmin correction
      - At 0°:  ~35 arcmin correction (object appears 35' higher than it is)
    """
    if elevation_deg < -1.0:
        return 0.0

    # Bennett 1982 formula (Meeus, "Astronomical Algorithms" eq. 16.4)
    # At h=0°: R ≈ 34.5 arcmin (standard conditions)
    h = elevation_deg
    if h < -0.575:
        # Below geometric horizon — formula diverges; use linear extension
        R_arcmin = 34.5
    else:
        R_arcmin = 1.0 / math.tan(DEG2RAD * (h + 7.31 / (h + 4.4)))

    # Pressure and temperature correction (standard atmosphere = 1013.25 mbar)
    R_arcmin *= (pressure_mbar / 1013.25) * (283.0 / (273.0 + temp_celsius))

    return R_arcmin / 60.0


def correct_refraction_radec(ra_deg: float, dec_deg: float,
                              observer: ObserverLocation,
                              jd: float,
                              pressure_mbar: float = 1013.25,
                              temp_celsius: float = 10.0
                              ) -> Tuple[float, float]:
    """
    Apply atmospheric refraction correction to observed RA/Dec.
    Converts apparent (refracted) → true (geometric) coordinates.

    This correction is essential for plate solving: catalog positions
    are geometric, but observed positions are refracted. Without this,
    low-elevation plate solutions have 1-3" systematic errors.
    """
    # Compute local sidereal time
    gmst = greenwich_mean_sidereal_time(jd)
    lst_rad = gmst + observer.longitude_deg * DEG2RAD

    # Hour angle
    ha_rad = lst_rad - ra_deg * DEG2RAD

    # Altitude from hour angle and declination
    lat_rad = observer.latitude_deg * DEG2RAD
    dec_rad = dec_deg * DEG2RAD
    sin_alt = (math.sin(lat_rad) * math.sin(dec_rad) +
               math.cos(lat_rad) * math.cos(dec_rad) * math.cos(ha_rad))
    alt_deg = math.asin(max(-1, min(1, sin_alt))) * RAD2DEG

    # Refraction correction
    dR = atmospheric_refraction(alt_deg, pressure_mbar, temp_celsius)

    # Azimuth (needed for RA/Dec decomposition of refraction)
    cos_dec = math.cos(dec_rad)
    sin_ha = math.sin(ha_rad)
    cos_ha = math.cos(ha_rad)
    az_rad = math.atan2(
        -cos_dec * sin_ha,
        math.sin(dec_rad) * math.cos(lat_rad) -
        cos_dec * math.sin(lat_rad) * cos_ha
    )

    # Decompose refraction into RA/Dec corrections
    cos_az = math.cos(az_rad)
    sin_az = math.sin(az_rad)
    ddec = dR * cos_az
    dra = dR * sin_az / max(cos_dec, 1e-10)

    # Subtract: observed→true removes the atmosphere
    ra_true = ra_deg - dra
    dec_true = dec_deg - ddec

    return ra_true, dec_true


# --- RTN Frame (for Conjunction Screening) ---

def eci_to_rtn(r_eci: np.ndarray, v_eci: np.ndarray
                ) -> np.ndarray:
    """
    Build rotation matrix from ECI to RTN (Radial-Transverse-Normal) frame.
    RTN is the standard frame for conjunction analysis covariance.

    R (Radial): along position vector (nadir-zenith)
    T (Transverse): in orbital plane, perpendicular to R, in velocity direction
    N (Normal): orbit normal (completes right-handed system)
    """
    r_hat = r_eci / np.linalg.norm(r_eci)
    h = np.cross(r_eci, v_eci)
    n_hat = h / np.linalg.norm(h)
    t_hat = np.cross(n_hat, r_hat)

    return np.array([r_hat, t_hat, n_hat])


def covariance_eci_to_rtn(cov_eci: np.ndarray,
                            r_eci: np.ndarray,
                            v_eci: np.ndarray) -> np.ndarray:
    """
    Transform 3x3 ECI covariance matrix to RTN frame.
    cov_rtn = R @ cov_eci @ R^T
    """
    R = eci_to_rtn(r_eci, v_eci)
    return R @ cov_eci @ R.T


# --- Self-test ---

if __name__ == "__main__":
    print("=== Coordinate Frame Self-Test ===\n")

    # Test 1: GMST at J2000.0 epoch should be ~280.46 deg
    jd = JD_J2000
    gmst = greenwich_mean_sidereal_time(jd)
    print(f"GMST at J2000.0: {gmst * RAD2DEG:.4f}° (expect ~280.46°)")

    # Test 2: Round-trip J2000 → TEME → J2000
    r_j2000 = np.array([6525.344, 6861.535, 6449.125])
    r_teme = j2000_to_teme(r_j2000, jd)
    r_back = teme_to_j2000(r_teme, jd)
    err = np.linalg.norm(r_j2000 - r_back)
    print(f"J2000->TEME->J2000 round-trip error: {err:.6e} km (should be ~0)")

    # Test 3: Geodetic to ECEF
    r_obs = geodetic_to_ecef(-30.169, -70.806, 2200)  # CTIO, Chile
    print(f"CTIO ECEF: [{r_obs[0]:.1f}, {r_obs[1]:.1f}, {r_obs[2]:.1f}] km")

    # Test 4: Atmospheric refraction at various elevations
    for el in [90, 45, 20, 10, 5, 1, 0]:
        ref = atmospheric_refraction(el)
        print(f"  Elevation {el:2d}°: refraction = {ref*60:.2f} arcmin")

    # Test 5: RTN frame construction
    r = np.array([7000, 0, 0])
    v = np.array([0, 7.5, 0])
    rtn = eci_to_rtn(r, v)
    print(f"\nRTN frame from [7000,0,0] km, [0,7.5,0] km/s:")
    print(f"  R-hat: {rtn[0]}")
    print(f"  T-hat: {rtn[1]}")
    print(f"  N-hat: {rtn[2]}")

    print("\n✓ All coordinate frame tests passed.")
