"""
multi_sensor_fusion.py - SentinelForge Cloud Pipeline
Fuses observations from 20+ sites into unified tracks.
Converts "20 sites saw something" into "this is one object."
"""
import math
import time
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional


@dataclass
class Observation:
    """Single observation from one sensor at one time."""
    site_id: str
    sensor_id: str
    ra_deg: float
    dec_deg: float
    ra_err_arcsec: float
    dec_err_arcsec: float
    magnitude: float
    angular_rate_arcsec_s: float
    timestamp: float
    frame_id: int


@dataclass
class Track:
    """A fused track of observations believed to be the same object."""
    track_id: int
    norad_id: Optional[int] = None      # None = uncorrelated
    observations: List[Observation] = field(default_factory=list)
    ra_estimate_deg: float = 0.0
    dec_estimate_deg: float = 0.0
    ra_velocity_deg_s: float = 0.0
    dec_velocity_deg_s: float = 0.0
    covariance: List[float] = field(default_factory=lambda: [1.0]*4)
    confidence: float = 0.0
    last_updated: float = 0.0

    @property
    def n_sites(self) -> int:
        return len(set(o.site_id for o in self.observations))

    @property
    def arc_length_sec(self) -> float:
        if len(self.observations) < 2:
            return 0
        times = [o.timestamp for o in self.observations]
        return max(times) - min(times)

    @property
    def status(self) -> str:
        if self.norad_id:
            return "CORRELATED"
        elif self.n_sites >= 3:
            return "HIGH_CONFIDENCE_UCT"  # Uncorrelated track, multi-site
        elif self.n_sites >= 2:
            return "MODERATE_UCT"
        else:
            return "TENTATIVE_UCT"


class KalmanFilter2D:
    """
    Simple 2D Kalman filter for RA/Dec tracking.
    State: [ra, dec, ra_rate, dec_rate]
    Production would use Unscented KF or Extended KF in 3D ECI.
    """

    def __init__(self):
        # State: [ra, dec, ra_rate, dec_rate]
        self.x = [0.0, 0.0, 0.0, 0.0]
        # Covariance (4x4 diagonal)
        self.P = [10.0, 10.0, 1.0, 1.0]
        # Process noise
        self.Q = [0.001, 0.001, 0.0001, 0.0001]
        self.initialized = False

    def initialize(self, ra: float, dec: float,
                   ra_err: float, dec_err: float):
        self.x = [ra, dec, 0.0, 0.0]
        self.P = [ra_err**2, dec_err**2, 1.0, 1.0]
        self.initialized = True

    def predict(self, dt: float):
        """Predict state forward by dt seconds."""
        # State transition: position += velocity * dt
        self.x[0] += self.x[2] * dt
        self.x[1] += self.x[3] * dt
        # Covariance growth
        for i in range(4):
            self.P[i] += self.Q[i] * dt

    def update(self, ra_obs: float, dec_obs: float,
               ra_err: float, dec_err: float,
               dt: float = 1.0) -> Tuple[float, float]:
        """
        Kalman update with new observation.
        Returns innovation (residual) in arcsec.
        """
        # Innovation (measurement - prediction)
        innov_ra = (ra_obs - self.x[0]) * 3600  # arcsec
        innov_dec = (dec_obs - self.x[1]) * 3600

        # Kalman gains (simplified diagonal)
        R_ra = (ra_err / 3600)**2   # Measurement noise (deg^2)
        R_dec = (dec_err / 3600)**2

        K_ra = self.P[0] / (self.P[0] + R_ra)
        K_dec = self.P[1] / (self.P[1] + R_dec)

        # Position innovation in degrees
        pos_innov_ra = ra_obs - self.x[0]
        pos_innov_dec = dec_obs - self.x[1]

        # Update position state
        self.x[0] += K_ra * pos_innov_ra
        self.x[1] += K_dec * pos_innov_dec

        # Update velocity estimate from position innovation
        # Velocity gain is lower (more damped) to avoid noise amplification
        K_rate_ra = self.P[2] / (self.P[2] + R_ra * 10)
        K_rate_dec = self.P[3] / (self.P[3] + R_dec * 10)

        if dt > 0.01:
            self.x[2] += K_rate_ra * (pos_innov_ra / dt)
            self.x[3] += K_rate_dec * (pos_innov_dec / dt)

        # Update covariance
        self.P[0] *= (1 - K_ra)
        self.P[1] *= (1 - K_dec)
        self.P[2] *= (1 - K_rate_ra)
        self.P[3] *= (1 - K_rate_dec)

        return innov_ra, innov_dec

    @property
    def state(self) -> dict:
        return {
            "ra_deg": self.x[0], "dec_deg": self.x[1],
            "ra_rate_deg_s": self.x[2], "dec_rate_deg_s": self.x[3],
            "sigma_ra_arcsec": math.sqrt(self.P[0]) * 3600,
            "sigma_dec_arcsec": math.sqrt(self.P[1]) * 3600
        }


class MultiSensorFusion:
    """
    Fuse detections from multiple observatory sites into unified tracks.

    Pipeline:
    1. Receive detection packages from all edge sites
    2. Associate detections to existing tracks (gating)
    3. Initialize new tracks for unassociated detections
    4. Update track state via Kalman filter
    5. Promote/retire tracks based on confidence
    """

    def __init__(self):
        self.tracks: Dict[int, Track] = {}
        self.filters: Dict[int, KalmanFilter2D] = {}
        self.next_track_id = 1
        self.association_gate_arcsec = 30.0  # Max residual for association

    def ingest(self, detections: List[dict], site_id: str) -> dict:
        """
        Ingest a batch of detections from one site.
        Returns: {associated, new_tracks, dropped}
        """
        associated = 0
        new_tracks = 0
        dropped = 0

        for det in detections:
            obs = Observation(
                site_id=site_id,
                sensor_id=det.get("sensor_id", ""),
                ra_deg=det["ra_deg"],
                dec_deg=det["dec_deg"],
                ra_err_arcsec=det.get("ra_err_arcsec", 1.0),
                dec_err_arcsec=det.get("dec_err_arcsec", 1.0),
                magnitude=det.get("magnitude", 99),
                angular_rate_arcsec_s=det.get("angular_rate_arcsec_s", 0),
                timestamp=det.get("timestamp_utc", time.time()),
                frame_id=det.get("frame_id", 0)
            )

            # Try to associate with existing track
            best_track_id, best_residual = self._find_best_track(obs)

            if best_track_id is not None:
                # Associate
                self._associate(best_track_id, obs)
                associated += 1
            else:
                # New track
                self._create_track(obs)
                new_tracks += 1

        # Retire stale tracks
        dropped = self._retire_stale_tracks()

        return {
            "site": site_id,
            "detections": len(detections),
            "associated": associated,
            "new_tracks": new_tracks,
            "dropped": dropped,
            "active_tracks": len(self.tracks)
        }

    def _find_best_track(self, obs: Observation) -> Tuple[Optional[int], float]:
        """Find track with smallest residual within gate."""
        best_id = None
        best_res = float("inf")

        for track_id, track in self.tracks.items():
            kf = self.filters.get(track_id)
            if kf is None or not kf.initialized:
                continue

            # Predict track to observation time
            dt = obs.timestamp - track.last_updated
            if dt < 0 or dt > 600:  # Max 10 min gap
                continue

            # Predicted position
            pred_ra = kf.x[0] + kf.x[2] * dt
            pred_dec = kf.x[1] + kf.x[3] * dt

            # Residual
            dra = (obs.ra_deg - pred_ra) * 3600 * math.cos(math.radians(obs.dec_deg))
            ddec = (obs.dec_deg - pred_dec) * 3600
            residual = math.sqrt(dra**2 + ddec**2)

            if residual < self.association_gate_arcsec and residual < best_res:
                best_res = residual
                best_id = track_id

        return best_id, best_res

    def _associate(self, track_id: int, obs: Observation):
        """Add observation to existing track and update Kalman filter."""
        track = self.tracks[track_id]
        kf = self.filters[track_id]

        dt = obs.timestamp - track.last_updated
        kf.predict(dt)
        innov_ra, innov_dec = kf.update(
            obs.ra_deg, obs.dec_deg,
            obs.ra_err_arcsec, obs.dec_err_arcsec,
            dt=max(dt, 0.01)
        )

        track.observations.append(obs)
        track.ra_estimate_deg = kf.x[0]
        track.dec_estimate_deg = kf.x[1]
        track.last_updated = obs.timestamp
        track.confidence = min(1.0, track.confidence + 0.1)

    def _create_track(self, obs: Observation):
        """Initialize new track from single observation."""
        track_id = self.next_track_id
        self.next_track_id += 1

        track = Track(
            track_id=track_id,
            observations=[obs],
            ra_estimate_deg=obs.ra_deg,
            dec_estimate_deg=obs.dec_deg,
            last_updated=obs.timestamp,
            confidence=0.3
        )
        self.tracks[track_id] = track

        kf = KalmanFilter2D()
        kf.initialize(obs.ra_deg, obs.dec_deg,
                      obs.ra_err_arcsec, obs.dec_err_arcsec)
        self.filters[track_id] = kf

    def _retire_stale_tracks(self, max_age_sec: float = 3600) -> int:
        """Remove tracks not updated in max_age seconds."""
        now = time.time()
        stale = [tid for tid, t in self.tracks.items()
                 if (now - t.last_updated) > max_age_sec and t.confidence < 0.5]
        for tid in stale:
            del self.tracks[tid]
            del self.filters[tid]
        return len(stale)

    def get_high_confidence_tracks(self) -> List[Track]:
        """Return tracks confirmed by multiple sites."""
        return [t for t in self.tracks.values() if t.n_sites >= 2]

    def summary(self) -> dict:
        return {
            "total_tracks": len(self.tracks),
            "correlated": sum(1 for t in self.tracks.values() if t.norad_id),
            "uncorrelated": sum(1 for t in self.tracks.values() if not t.norad_id),
            "multi_site": sum(1 for t in self.tracks.values() if t.n_sites >= 2),
            "high_confidence": len(self.get_high_confidence_tracks())
        }
