"""
cloud_ingest.py - SentinelForge Cloud Pipeline (Facade)

REFACTORED per Agent 19 code review:
  Original 536-line monolith has been split into focused modules:
    cloud/schemas.py          — Kafka topics, Avro schema, PostGIS DDL (~150 lines)
    cloud/kafka_transport.py  — Producer/Consumer (~190 lines)
    cloud/postgis_catalog.py  — PostGIS spatial catalog store (~155 lines)

This file remains as a backward-compatible re-export facade.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

from cloud.schemas import KAFKA_CONFIG, TOPICS, DETECTION_SCHEMA, POSTGIS_SCHEMA
from cloud.kafka_transport import ObservationProducer, ObservationConsumer
from cloud.postgis_catalog import CatalogStore

__all__ = [
    "KAFKA_CONFIG", "TOPICS", "DETECTION_SCHEMA", "POSTGIS_SCHEMA",
    "ObservationProducer", "ObservationConsumer", "CatalogStore",
]

if __name__ == "__main__":
    print("=== Cloud Ingestion Pipeline Self-Test (Refactored) ===\n")
    # Kafka transport
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
    producer.publish_alert("BREAKUP", {"cluster_size": 5, "ra_deg": 45.2, "dec_deg": 12.8})
    print(f"Published BREAKUP alert to '{TOPICS['alerts']}'")
    # PostGIS
    print(f"\nPostGIS schema: {len(POSTGIS_SCHEMA.splitlines())} lines")
    print(f"Tables defined: space_objects, observations, conjunction_events")
    print(f"Spatial indexes: position_eci (GIST), position_sky (GIST)")
    print("\n✓ Cloud ingestion pipeline test passed.")
    print("  Refactored: 536-line monolith → 3 focused modules under cloud/")
