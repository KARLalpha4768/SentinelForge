"""
SentinelForge Cloud Pipeline
Split from cloud_ingest.py into focused modules:
  - kafka_transport.py   : Producer/Consumer for edge-cloud streaming
  - postgis_catalog.py   : PostGIS-backed spatial catalog store
  - schemas.py           : Avro schemas and DDL definitions
"""
