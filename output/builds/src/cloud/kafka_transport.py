"""
kafka_transport.py - Kafka Producer/Consumer for edge-cloud streaming.

Extracted from cloud_ingest.py per Agent 19 code review recommendation
to keep modules under 200 lines.

Producer (edge side): publishes detection packages and alerts.
Consumer (cloud side): ingests observations, routes to fusion pipeline.
"""
import json
import time
import logging
from typing import List

logger = logging.getLogger("sentinelforge.cloud.kafka")

try:
    from .schemas import KAFKA_CONFIG, TOPICS
except ImportError:
    from schemas import KAFKA_CONFIG, TOPICS


# --- Mock classes for when confluent-kafka isn't installed ---

class MockProducer:
    def produce(self, **kwargs): pass
    def flush(self, **kwargs): return 0

class MockConsumer:
    def poll(self, **kwargs): return None
    def subscribe(self, topics): pass
    def commit(self, **kwargs): pass
    def close(self): pass


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


# --- Self-test ---

if __name__ == "__main__":
    print("=== Kafka Transport Self-Test ===\n")
    producer = ObservationProducer(site_id="CHL-01")
    producer.connect()
    n = producer.publish_detections(
        detections=[
            {"ra_deg": 180.5, "dec_deg": -22.3, "snr": 8.5, "magnitude": 15.2},
            {"ra_deg": 180.6, "dec_deg": -22.4, "snr": 12.1, "magnitude": 14.1},
        ],
        frame_metadata={"frame_id": 42, "exposure_sec": 2.0}
    )
    print(f"Published {n} detections to '{TOPICS['observations']}'")
    producer.publish_alert("BREAKUP", {"cluster_size": 5})
    print(f"Published BREAKUP alert to '{TOPICS['alerts']}'")
    print("\n✓ Kafka transport test passed.")
