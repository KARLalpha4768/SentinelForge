# ADR-001: Edge GPU Processing Architecture

## Status: ACCEPTED

## Context
Slingshot's observatory network generates 32MB frames at each of 20+ sites.
Uploading raw frames requires ~50Mbps per site, impossible over satellite links.
Cloud-only processing adds 500ms+ latency, unacceptable for real-time tracking.

## Decision
Deploy NVIDIA Jetson AGX Orin edge GPU boxes at each site.
Process frames locally: calibrate -> detect -> correlate -> upload detections only.

## Consequences
### Positive
- Bandwidth reduction: 32MB raw -> 60KB detections (99.8% reduction)
- Latency: <500ms end-to-end (vs 2-5s cloud-only)
- Satellite sites become viable for real-time operations
- Offline capability: sites continue observing during network outages

### Negative
- Hardware cost: ~$5K per site ($100K for 20 sites)
- Maintenance: remote GPU troubleshooting is harder than cloud
- Code complexity: must maintain both edge and cloud pipelines
- Power: 300W per edge box requires reliable power at remote sites

### Mitigations
- Docker containerization for consistent deployment
- OTA updater for remote software updates
- Watchdog service for automatic restart
- UPS + generator for power resilience

## Alternatives Considered
1. **Cloud-only**: Rejected (bandwidth, latency)
2. **FPGA**: Rejected (development cost, flexibility)
3. **CPU-only edge**: Rejected (insufficient throughput)
