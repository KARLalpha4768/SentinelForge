"""
schemas.py - Message schemas and database DDL for the SentinelForge cloud pipeline.

Contains:
  - Kafka topic configuration
  - Avro detection schema for Schema Registry
  - PostGIS DDL for the space object catalog
"""

# --- Kafka Topic Configuration ---

KAFKA_CONFIG = {
    "bootstrap.servers": "kafka.sentinelforge.internal:9092",
    "security.protocol": "SSL",
    "ssl.ca.location": "/etc/sentinelforge/certs/ca.pem",
    "ssl.certificate.location": "/etc/sentinelforge/certs/client.pem",
    "ssl.key.location": "/etc/sentinelforge/certs/client-key.pem",
}

TOPICS = {
    "observations": "observations.raw",
    "tracks": "tracks.fused",
    "alerts": "alerts.conjunction",
    "catalog_updates": "catalog.updates",
    "health": "sites.health",
    "schedules": "schedules.observation",
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

# --- PostGIS Database Schema ---

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
    position_sky    geometry(Point, 4326),
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
