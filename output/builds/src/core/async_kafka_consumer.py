"""
async_kafka_consumer.py - SentinelForge Cloud Pipeline
High-throughput async Kafka consumer with Dead Letter Queue (DLQ) support.

Resolves the GIL bottleneck by using asyncio to process batches of edge detections
concurrently. Malformed messages are routed to a DLQ topic instead of crashing
the consumer loop.
"""
import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from typing import List, Dict

logger = logging.getLogger("sentinelforge.kafka.async")

class AsyncTelemetryConsumer:
    """
    High-performance async consumer for edge node telemetry.
    Features:
    - AsyncIO batch processing to bypass GIL I/O bottlenecks.
    - Dead Letter Queue (DLQ) routing for poisoned payloads.
    - Manual offset committing for guaranteed at-least-once delivery.
    """

    def __init__(self, bootstrap_servers: str, group_id: str,
                 topic: str, dlq_topic: str):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.topic = topic
        self.dlq_topic = dlq_topic
        
        self.consumer = AIOKafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,
            enable_auto_commit=False, # Explicit commits for safety
            auto_offset_reset="earliest"
        )
        
        self.dlq_producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers
        )

    async def start(self):
        """Initialize connections to Kafka cluster."""
        await self.consumer.start()
        await self.dlq_producer.start()
        logger.info(f"Async consumer started. Listening on [{self.topic}], DLQ on [{self.dlq_topic}]")

    async def stop(self):
        """Gracefully shutdown connections."""
        await self.consumer.stop()
        await self.dlq_producer.stop()
        logger.info("Async consumer stopped.")

    async def process_message(self, message) -> bool:
        """
        Process a single message.
        Returns True if successful, False if it failed and was sent to DLQ.
        """
        try:
            # Decode payload
            payload = json.loads(message.value.decode('utf-8'))
            
            # Simulated fusion logic - this runs concurrently
            site_id = payload.get("site_id", "unknown")
            detections = payload.get("detections", [])
            
            # --- FUSION LOGIC GOES HERE ---
            # e.g. await fusion_engine.ingest_batch(site_id, detections)
            await asyncio.sleep(0.01) # Simulate DB/Fusion I/O wait
            
            return True
            
        except json.JSONDecodeError as e:
            logger.error(f"Malformed JSON at offset {message.offset}: {e}")
            await self._route_to_dlq(message, "JSONDecodeError")
            return False
            
        except Exception as e:
            logger.error(f"Processing error at offset {message.offset}: {e}")
            await self._route_to_dlq(message, str(e))
            return False

    async def _route_to_dlq(self, original_msg, error_reason: str):
        """Route failed messages to the Dead Letter Queue for later analysis."""
        dlq_payload = {
            "original_topic": original_msg.topic,
            "original_partition": original_msg.partition,
            "original_offset": original_msg.offset,
            "error": error_reason,
            "raw_value": original_msg.value.decode('utf-8', errors='replace')
        }
        await self.dlq_producer.send_and_wait(
            self.dlq_topic,
            json.dumps(dlq_payload).encode('utf-8')
        )
        logger.warning(f"Message offset {original_msg.offset} routed to DLQ.")

    async def consume_loop(self):
        """Main event loop fetching batches of messages."""
        try:
            while True:
                # Fetch a batch of messages (up to 1000 at a time)
                result = await self.consumer.getmany(timeout_ms=1000, max_records=1000)
                
                for tp, messages in result.items():
                    if not messages:
                        continue
                        
                    # Process the partition batch concurrently
                    tasks = [self.process_message(msg) for msg in messages]
                    await asyncio.gather(*tasks)
                    
                    # Commit offsets only AFTER the entire batch is processed (or DLQ'd)
                    last_offset = messages[-1].offset
                    await self.consumer.commit({tp: last_offset + 1})
                    
        except asyncio.CancelledError:
            logger.info("Consume loop cancelled.")


# --- Execution Hook ---
async def main():
    consumer = AsyncTelemetryConsumer(
        bootstrap_servers="kafka.sentinelforge.svc.cluster.local:9092",
        group_id="cloud-fusion-group",
        topic="edge.telemetry",
        dlq_topic="edge.telemetry.dlq"
    )
    
    await consumer.start()
    try:
        await consumer.consume_loop()
    except KeyboardInterrupt:
        pass
    finally:
        await consumer.stop()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
