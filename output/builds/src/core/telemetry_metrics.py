"""
telemetry_metrics.py - SentinelForge Observability
Prometheus metrics exporter for K8s ServiceMonitors.

Instruments the pipeline to export critical operational metrics:
- Kafka consumer lag
- GPU inference latency
- Conjunction screening volume
- False positive rates
"""
from prometheus_client import start_http_server, Counter, Gauge, Histogram
import time
import threading

# --- Prometheus Metric Definitions ---

# Counters
DETECTIONS_PROCESSED = Counter('sf_detections_total', 'Total number of detections processed by edge nodes', ['site_id'])
ALERTS_GENERATED = Counter('sf_alerts_total', 'Total conjunction alerts generated', ['alert_level'])
PIPELINE_ERRORS = Counter('sf_pipeline_errors_total', 'Count of pipeline exceptions', ['component', 'error_type'])

# Gauges
ACTIVE_TRACKS = Gauge('sf_active_tracks', 'Current number of active tracks in the Kalman filter')
DB_CONNECTION_POOL = Gauge('sf_db_pool_active', 'Active connections to PostGIS')

# Histograms (Latency)
INFERENCE_LATENCY = Histogram(
    'sf_gpu_inference_seconds', 
    'Time spent in CUDA streak detection kernel',
    ['site_id'],
    buckets=[0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0]
)
SCREENING_LATENCY = Histogram(
    'sf_conjunction_screen_seconds', 
    'Time to run full catalog conjunction screen',
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0]
)

class MetricsServer:
    """Runs the Prometheus exporter on a background thread."""
    
    def __init__(self, port: int = 9090):
        self.port = port
        self._server_thread = None

    def start(self):
        """Start the Prometheus HTTP server."""
        start_http_server(self.port)
        print(f"[Telemetry] Prometheus metrics exported on port {self.port}")

    @staticmethod
    def record_inference(site_id: str, duration_sec: float):
        INFERENCE_LATENCY.labels(site_id=site_id).observe(duration_sec)

    @staticmethod
    def inc_detections(site_id: str, count: int = 1):
        DETECTIONS_PROCESSED.labels(site_id=site_id).inc(count)

    @staticmethod
    def update_tracks(count: int):
        ACTIVE_TRACKS.set(count)

# --- Usage Example ---
if __name__ == "__main__":
    metrics = MetricsServer(port=9090)
    metrics.start()
    
    # Simulate pipeline operation
    print("Simulating metrics emission...")
    for _ in range(10):
        metrics.record_inference("CHL-01", 0.045)
        metrics.inc_detections("CHL-01", 12)
        metrics.update_tracks(14502)
        time.sleep(1)
        
    print("Metrics simulation complete. Check http://localhost:9090/metrics")
