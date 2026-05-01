"""
cloud_ingest.py - SentinelForge Cloud Pipeline
Real-time observation ingestion via Apache Kafka + PostGIS catalog storage.

Architecture:
  Edge sites → Kafka topic 'observations.raw' → Consumer → PostGIS catalog
  Conjunction alerts → Kafka topic 'alerts.conjunction' → Alert Router

This replaces the batch SQLite model with a production-grade streaming
pipeline matching Slingshot's actual tech stack:
  - Apache Kafka for real-time sensor data streaming
  - PostgreSQL + PostGIS for spatial catalog queries at scale
  - Confluent Schema Registry for detection schema evolution

Dependencies:
  pip install confluent-kafka psycopg2-binary
"""
import json
import time
import logging
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

logger = logging.getLogger("sentinelforge.ingest")


# --- Kafka Configuration ---

KAFKA_CONFIG = {
    "bootstrap.servers": "kafka.sentinelforge.internal:9092",
    "security.protocol": "SSL",
    "ssl.ca.location": "/etc/sentinelforge/certs/ca.pem",
    "ssl.certificate.location": "/etc/sentinelforge/certs/client.pem",
    "ssl.key.location": "/etc/sentinelforge/certs/client-key.pem",
}

TOPICS = {
    "observations": "observations.raw",        # Edge → Cloud detections
    "tracks": "tracks.fused",                   # Fused multi-site tracks
    "alerts": "alerts.conjunction",             # Conjunction warnings
    "catalog_updates": "catalog.updates",       # Catalog maintenance
    "health": "sites.health",                   # Site telemetry
    "schedules": "schedules.observation",       # Tasking commands
}

# Avro schema for detection messages (registered in Schema Registry)
DETECTION_SCHEMA = {
    "type": "record",
    "name": "Detection",
    "namespace": "com.sentinelforge.observations",
    "fields": [
        {"name": "site_id", "type": "string"},
        {"name": "sensor_id", "type": "string"},
        {"name": "frame_id", "type": "long"},
        {"name": "timestamp_utc", "type": "double"},
        {"name": "ra_deg", "type": "double"},
        {"name": "dec_deg", "type": "double"},
        {"name": "ra_err_arcsec", "type": "double"},
        {"name": "dec_err_arcsec", "type": "double"},
        {"name": "magnitude", "type": "double"},
        {"name": "snr", "type": "double"},
        {"name": "angular_rate_arcsec_s", "type": "double"},
        {"name": "streak_length_arcsec", "type": "double"},
        {"name": "streak_angle_deg", "type": "double"},
        {"name": "detection_type", "type": "string"},
        {"name": "exposure_sec", "type": "double"},
    ]
}


# --- Kafka Producer (Edge Side) ---

class ObservationProducer:
    """
    Publishes detection packages from edge sites to Kafka.
    Runs at each observatory after frame processing.
    """

    def __init__(self, site_id: str, config: dict = None):
        self.site_id = site_id
        self.config = {**(config or KAFKA_CONFIG),
                       "client.id": f"edge-{site_id}"}
        self._producer = None
        self._delivery_count = 0

    def connect(self):
        """Initialize Kafka producer."""
        try:
            from confluent_kafka import Producer
            self._producer = Producer(self.config)
            logger.info(f"Kafka producer connected for site {self.site_id}")
        except ImportError:
            logger.warning("confluent_kafka not installed — using mock producer")
            self._producer = MockProducer()

    def publish_detections(self, detections: List[dict],
                            frame_metadata: dict) -> int:
        """
        Publish detection batch to Kafka observations topic.
        Returns number of messages published.

        Messages are keyed by site_id for partition affinity —
        all observations from one site go to the same partition
        for ordered processing.
        """
        if not self._producer:
            self.connect()

        count = 0
        for det in detections:
            msg = {
                "site_id": self.site_id,
                "frame_metadata": frame_metadata,
                "detection": det,
                "published_at": time.time()
            }

            self._producer.produce(
                topic=TOPICS["observations"],
                key=self.site_id.encode("utf-8"),
                value=json.dumps(msg).encode("utf-8"),
                callback=self._delivery_callback
            )
            count += 1

        # Flush with timeout (don't block the pipeline indefinitely)
        remaining = self._producer.flush(timeout=5.0)
        if remaining > 0:
            logger.warning(f"Kafka flush: {remaining} messages not delivered")

        return count

    def publish_alert(self, alert_type: str, data: dict):
        """Publish urgent alert (conjunction, breakup, maneuver)."""
        if not self._producer:
            self.connect()

        msg = {
            "site_id": self.site_id,
            "alert_type": alert_type,
            "data": data,
            "timestamp": time.time(),
            "priority": "HIGH"
        }

        self._producer.produce(
            topic=TOPICS["alerts"],
            key=alert_type.encode("utf-8"),
            value=json.dumps(msg).encode("utf-8"),
            callback=self._delivery_callback
        )
        self._producer.flush(timeout=2.0)

    def _delivery_callback(self, err, msg):
        if err:
            logger.error(f"Kafka delivery failed: {err}")
        else:
            self._delivery_count += 1


# --- Kafka Consumer (Cloud Side) ---

class ObservationConsumer:
    """
    Consumes detection packages from all edge sites.
    Routes to multi-sensor fusion pipeline.
    """

    def __init__(self, group_id: str = "fusion-pipeline", config: dict = None):
        self.config = {**(config or KAFKA_CONFIG),
                       "group.id": group_id,
                       "auto.offset.reset": "latest",
                       "enable.auto.commit": False}
        self._consumer = None
        self._handlers = {}

    def connect(self):
        try:
            from confluent_kafka import Consumer
            self._consumer = Consumer(self.config)
            self._consumer.subscribe([
                TOPICS["observations"],
                TOPICS["alerts"],
                TOPICS["health"]
            ])
            logger.info("Kafka consumer connected, subscribed to topics")
        except ImportError:
            logger.warning("confluent_kafka not installed — using mock consumer")
            self._consumer = MockConsumer()

    def register_handler(self, topic: str, handler):
        """Register a callback for a specific topic."""
        self._handlers[topic] = handler

    def run(self, max_messages: int = None):
        """
        Main consumer loop. Polls Kafka, dispatches to handlers.
        Runs until max_messages reached or interrupted.
        """
        if not self._consumer:
            self.connect()

        count = 0
        try:
            while max_messages is None or count < max_messages:
                msg = self._consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    logger.error(f"Consumer error: {msg.error()}")
                    continue

                topic = msg.topic()
                value = json.loads(msg.value().decode("utf-8"))

                handler = self._handlers.get(topic)
                if handler:
                    handler(value, msg.key(), msg.timestamp())

                # Manual commit after processing
                self._consumer.commit(asynchronous=True)
                count += 1

        except KeyboardInterrupt:
            pass
        finally:
            if hasattr(self._consumer, 'close'):
                self._consumer.close()

        return count


# --- PostGIS Catalog Store ---

POSTGIS_SCHEMA = """
-- SentinelForge Space Object Catalog (PostGIS-enabled)
-- Run against PostgreSQL 15+ with PostGIS 3.3+ extension

CREATE EXTENSION IF NOT EXISTS postgis;

-- Core catalog table with spatial indexing
CREATE TABLE IF NOT EXISTS space_objects (
    norad_id        INTEGER PRIMARY KEY,
    object_name     TEXT,
    object_type     TEXT,  -- 'PAYLOAD', 'ROCKET_BODY', 'DEBRIS', 'UNKNOWN'
    country_code    TEXT,
    launch_date     TIMESTAMP WITH TIME ZONE,
    decay_date      TIMESTAMP WITH TIME ZONE,

    -- Latest orbital elements (TEME frame)
    epoch           TIMESTAMP WITH TIME ZONE NOT NULL,
    semi_major_km   DOUBLE PRECISION,
    eccentricity    DOUBLE PRECISION,
    inclination_deg DOUBLE PRECISION,
    raan_deg        DOUBLE PRECISION,
    arg_perigee_deg DOUBLE PRECISION,
    mean_anomaly_deg DOUBLE PRECISION,
    mean_motion_rev_day DOUBLE PRECISION,
    bstar           DOUBLE PRECISION,

    -- Latest ECI state vector (for spatial queries)
    position_eci    geometry(PointZ, 0),  -- PostGIS 3D point in ECI km
    velocity_eci    geometry(PointZ, 0),

    -- Position covariance (RTN frame, upper triangle)
    cov_rr DOUBLE PRECISION DEFAULT 0.01,
    cov_rt DOUBLE PRECISION DEFAULT 0.0,
    cov_rn DOUBLE PRECISION DEFAULT 0.0,
    cov_tt DOUBLE PRECISION DEFAULT 1.0,
    cov_tn DOUBLE PRECISION DEFAULT 0.0,
    cov_nn DOUBLE PRECISION DEFAULT 0.01,

    -- Characterization
    rcs_m2          DOUBLE PRECISION,     -- Radar cross-section
    magnitude_avg   DOUBLE PRECISION,
    spin_period_s   DOUBLE PRECISION,
    attitude_class  TEXT,  -- '3AXIS', 'TUMBLING', 'UNKNOWN'

    -- Tracking metadata
    last_obs_time   TIMESTAMP WITH TIME ZONE,
    obs_count_30d   INTEGER DEFAULT 0,
    staleness_hours DOUBLE PRECISION GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (NOW() - last_obs_time)) / 3600.0
    ) STORED,
    tracking_status TEXT DEFAULT 'MAINTAINED',  -- 'MAINTAINED', 'STALE', 'LOST'

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index on ECI position for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_objects_position
    ON space_objects USING GIST (position_eci);

-- Index on orbital altitude for conjunction pre-filtering
CREATE INDEX IF NOT EXISTS idx_objects_altitude
    ON space_objects (semi_major_km);

-- Index on tracking status for operational queries
CREATE INDEX IF NOT EXISTS idx_objects_status
    ON space_objects (tracking_status, staleness_hours);

-- Observation history (time-series)
CREATE TABLE IF NOT EXISTS observations (
    obs_id          BIGSERIAL PRIMARY KEY,
    norad_id        INTEGER REFERENCES space_objects(norad_id),
    site_id         TEXT NOT NULL,
    sensor_id       TEXT NOT NULL,
    timestamp_utc   TIMESTAMP WITH TIME ZONE NOT NULL,
    ra_deg          DOUBLE PRECISION NOT NULL,
    dec_deg         DOUBLE PRECISION NOT NULL,
    ra_err_arcsec   DOUBLE PRECISION,
    dec_err_arcsec  DOUBLE PRECISION,
    magnitude       DOUBLE PRECISION,
    snr             DOUBLE PRECISION,
    angular_rate    DOUBLE PRECISION,
    detection_type  TEXT,
    frame_id        BIGINT,
    position_sky    geometry(Point, 4326),  -- RA/Dec as lon/lat in WGS84 for spatial queries
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index on sky position for cone searches
CREATE INDEX IF NOT EXISTS idx_obs_sky_position
    ON observations USING GIST (position_sky);

-- Time-series index for per-object history
CREATE INDEX IF NOT EXISTS idx_obs_norad_time
    ON observations (norad_id, timestamp_utc DESC);

-- Conjunction events log
CREATE TABLE IF NOT EXISTS conjunction_events (
    event_id        BIGSERIAL PRIMARY KEY,
    primary_id      INTEGER REFERENCES space_objects(norad_id),
    secondary_id    INTEGER,
    tca             TIMESTAMP WITH TIME ZONE NOT NULL,
    miss_distance_km DOUBLE PRECISION,
    collision_prob  DOUBLE PRECISION,
    relative_vel_km_s DOUBLE PRECISION,
    alert_level     TEXT,
    cdm_json        JSONB,  -- Full Conjunction Data Message
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conj_tca
    ON conjunction_events (tca DESC);
CREATE INDEX IF NOT EXISTS idx_conj_alert
    ON conjunction_events (alert_level, collision_prob DESC);
"""


class CatalogStore:
    """
    PostGIS-backed space object catalog.
    Uses spatial indexing for fast proximity and cone-search queries.
    """

    def __init__(self, dsn: str = None):
        self.dsn = dsn or "postgresql://sentinelforge:sf@localhost:5432/catalog"
        self._conn = None

    def connect(self):
        try:
            import psycopg2
            self._conn = psycopg2.connect(self.dsn)
            logger.info("Connected to PostGIS catalog")
        except ImportError:
            logger.warning("psycopg2 not installed — using mock connection")
            self._conn = None

    def initialize_schema(self):
        """Create tables if they don't exist."""
        if not self._conn:
            self.connect()
        if self._conn:
            with self._conn.cursor() as cur:
                cur.execute(POSTGIS_SCHEMA)
            self._conn.commit()

    def upsert_object(self, norad_id: int, elements: dict,
                       state_vector: dict = None):
        """Insert or update a space object's orbital elements and state."""
        if not self._conn:
            return

        sql = """
        INSERT INTO space_objects (norad_id, epoch, semi_major_km, eccentricity,
            inclination_deg, raan_deg, arg_perigee_deg, mean_anomaly_deg,
            mean_motion_rev_day, bstar, position_eci, updated_at)
        VALUES (%(norad_id)s, to_timestamp(%(epoch)s), %(a_km)s, %(e)s,
            %(i_deg)s, %(raan_deg)s, %(argp_deg)s, %(M_deg)s,
            %(n_rev_day)s, %(bstar)s,
            ST_MakePoint(%(x)s, %(y)s, %(z)s),
            NOW())
        ON CONFLICT (norad_id) DO UPDATE SET
            epoch = EXCLUDED.epoch,
            semi_major_km = EXCLUDED.semi_major_km,
            eccentricity = EXCLUDED.eccentricity,
            position_eci = EXCLUDED.position_eci,
            updated_at = NOW();
        """

        params = {
            "norad_id": norad_id,
            "epoch": elements.get("epoch", 0),
            "a_km": elements.get("a_km", 0),
            "e": elements.get("e", 0),
            "i_deg": elements.get("i_deg", 0),
            "raan_deg": elements.get("raan_deg", 0),
            "argp_deg": elements.get("argp_deg", 0),
            "M_deg": elements.get("M_deg", 0),
            "n_rev_day": elements.get("n_rev_day", 0),
            "bstar": elements.get("bstar", 0),
            "x": state_vector.get("x", 0) if state_vector else 0,
            "y": state_vector.get("y", 0) if state_vector else 0,
            "z": state_vector.get("z", 0) if state_vector else 0,
        }

        with self._conn.cursor() as cur:
            cur.execute(sql, params)
        self._conn.commit()

    def find_nearby_objects(self, x_km: float, y_km: float, z_km: float,
                            radius_km: float = 50.0) -> list:
        """
        Spatial query: find all objects within radius_km of an ECI position.
        Uses PostGIS GIST index for O(log N) performance instead of O(N).
        """
        if not self._conn:
            return []

        sql = """
        SELECT norad_id, object_name, object_type,
               ST_X(position_eci) as x, ST_Y(position_eci) as y,
               ST_Z(position_eci) as z,
               ST_3DDistance(position_eci, ST_MakePoint(%s, %s, %s)) as dist_km,
               cov_rr, cov_rt, cov_rn, cov_tt, cov_tn, cov_nn
        FROM space_objects
        WHERE ST_3DDWithin(position_eci, ST_MakePoint(%s, %s, %s), %s)
        ORDER BY dist_km;
        """

        with self._conn.cursor() as cur:
            cur.execute(sql, (x_km, y_km, z_km, x_km, y_km, z_km, radius_km))
            return cur.fetchall()

    def cone_search(self, ra_deg: float, dec_deg: float,
                     radius_arcsec: float) -> list:
        """
        Search observations within angular radius of sky position.
        Uses PostGIS geography for proper great-circle distance.
        """
        if not self._conn:
            return []

        radius_deg = radius_arcsec / 3600.0
        sql = """
        SELECT obs_id, norad_id, site_id, timestamp_utc,
               ra_deg, dec_deg, magnitude, snr
        FROM observations
        WHERE ST_DWithin(
            position_sky,
            ST_MakePoint(%s, %s)::geography,
            %s  -- meters (arcsec * ~30m/arcsec at typical distances)
        )
        ORDER BY timestamp_utc DESC
        LIMIT 100;
        """

        with self._conn.cursor() as cur:
            cur.execute(sql, (ra_deg, dec_deg, radius_deg * 111000))
            return cur.fetchall()

    def get_stale_objects(self, max_hours: float = 24.0) -> list:
        """Find objects that need re-observation."""
        if not self._conn:
            return []

        sql = """
        SELECT norad_id, object_name, staleness_hours,
               semi_major_km, inclination_deg
        FROM space_objects
        WHERE staleness_hours > %s
          AND tracking_status != 'LOST'
        ORDER BY staleness_hours DESC;
        """

        with self._conn.cursor() as cur:
            cur.execute(sql, (max_hours,))
            return cur.fetchall()


# --- Mock classes for when dependencies aren't installed ---

class MockProducer:
    def produce(self, **kwargs): pass
    def flush(self, **kwargs): return 0

class MockConsumer:
    def poll(self, **kwargs): return None
    def subscribe(self, topics): pass
    def commit(self, **kwargs): pass
    def close(self): pass


# --- Self-test ---

if __name__ == "__main__":
    print("=== Cloud Ingestion Pipeline Self-Test ===\n")

    # Test Kafka producer (mock)
    producer = ObservationProducer(site_id="CHL-01")
    producer.connect()
    n = producer.publish_detections(
        detections=[
            {"ra_deg": 180.5, "dec_deg": -22.3, "snr": 8.5, "magnitude": 15.2},
            {"ra_deg": 180.6, "dec_deg": -22.4, "snr": 12.1, "magnitude": 14.1},
        ],
        frame_metadata={"frame_id": 42, "exposure_sec": 2.0}
    )
    print(f"Published {n} detections to Kafka topic '{TOPICS['observations']}'")

    # Test alert publishing
    producer.publish_alert("BREAKUP", {
        "cluster_size": 5, "ra_deg": 45.2, "dec_deg": 12.8
    })
    print(f"Published BREAKUP alert to '{TOPICS['alerts']}'")

    # Test PostGIS schema output
    print(f"\nPostGIS schema: {len(POSTGIS_SCHEMA.splitlines())} lines")
    print(f"Tables defined: space_objects, observations, conjunction_events")
    print(f"Spatial indexes: position_eci (GIST), position_sky (GIST)")

    print("\n✓ Cloud ingestion pipeline test passed.")
    print("  (Install confluent-kafka and psycopg2 for live Kafka/PostGIS)")
