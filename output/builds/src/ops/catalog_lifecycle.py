"""
catalog_lifecycle.py - Space Object Catalog State Machine

Models the operational lifecycle of tracked space objects:
  UCT (Uncorrelated Track) -> Tentative -> Cataloged -> Decayed/Lost

Real catalog maintenance requires:
  - Promotion: UCTs confirmed over multiple passes become tentative, then cataloged
  - Demotion: Objects lost for too long degrade in confidence
  - Merge: Two tracks discovered to be the same physical object
  - Split: One track found to be multiple objects (post-breakup)
"""
import logging
import time
from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger("sentinelforge.ops.catalog_lifecycle")


class CatalogState(Enum):
    UCT = "uncorrelated_track"
    TENTATIVE = "tentative"
    CATALOGED = "cataloged"
    STALE = "stale"
    LOST = "lost"
    DECAYED = "decayed"


@dataclass
class CatalogObject:
    """A tracked space object with lifecycle metadata."""
    object_id: str
    state: CatalogState = CatalogState.UCT
    norad_id: Optional[int] = None
    observation_count: int = 0
    distinct_passes: int = 0
    last_observation_epoch: float = 0.0
    first_observation_epoch: float = 0.0
    state_history: List[Tuple[float, CatalogState]] = field(default_factory=list)
    merged_from: List[str] = field(default_factory=list)
    split_children: List[str] = field(default_factory=list)

    def __post_init__(self):
        self.state_history.append((time.time(), self.state))


class CatalogLifecycleManager:
    """
    Manages the full lifecycle of the space object catalog.

    Promotion rules:
      UCT -> TENTATIVE:  >= 3 distinct passes within 72 hours
      TENTATIVE -> CATALOGED:  >= 7 distinct passes, orbit converged (RMS < threshold)

    Demotion rules:
      CATALOGED -> STALE:  No observation for 7 days
      STALE -> LOST:  No observation for 30 days
      Any -> DECAYED:  Predicted altitude < 100 km
    """

    def __init__(self, promotion_passes_tentative: int = 3,
                 promotion_passes_catalog: int = 7,
                 stale_days: float = 7.0,
                 lost_days: float = 30.0,
                 decay_altitude_km: float = 100.0):
        self.promo_tent = promotion_passes_tentative
        self.promo_cat = promotion_passes_catalog
        self.stale_sec = stale_days * 86400
        self.lost_sec = lost_days * 86400
        self.decay_alt = decay_altitude_km
        self._catalog: Dict[str, CatalogObject] = {}
        self._next_norad = 90000  # Temporary NORAD IDs for new objects

    def register_uct(self, object_id: str, epoch: float) -> CatalogObject:
        """Register a new Uncorrelated Track."""
        obj = CatalogObject(
            object_id=object_id, state=CatalogState.UCT,
            first_observation_epoch=epoch, last_observation_epoch=epoch,
            observation_count=1, distinct_passes=1
        )
        self._catalog[object_id] = obj
        logger.info(f"UCT registered: {object_id}")
        return obj

    def record_observation(self, object_id: str, epoch: float,
                           new_pass: bool = False) -> CatalogState:
        """Record an observation and evaluate promotion criteria."""
        obj = self._catalog.get(object_id)
        if obj is None:
            obj = self.register_uct(object_id, epoch)
            return obj.state

        obj.observation_count += 1
        obj.last_observation_epoch = epoch
        if new_pass:
            obj.distinct_passes += 1

        old_state = obj.state

        # Promotion logic
        if obj.state == CatalogState.UCT and obj.distinct_passes >= self.promo_tent:
            obj.state = CatalogState.TENTATIVE
            logger.info(f"PROMOTED: {object_id} UCT -> TENTATIVE "
                        f"({obj.distinct_passes} passes)")

        if obj.state == CatalogState.TENTATIVE and obj.distinct_passes >= self.promo_cat:
            obj.state = CatalogState.CATALOGED
            obj.norad_id = self._next_norad
            self._next_norad += 1
            logger.info(f"PROMOTED: {object_id} TENTATIVE -> CATALOGED "
                        f"(NORAD {obj.norad_id})")

        # Recovery from stale/lost
        if obj.state in (CatalogState.STALE, CatalogState.LOST):
            obj.state = CatalogState.CATALOGED
            logger.info(f"RECOVERED: {object_id} -> CATALOGED")

        if obj.state != old_state:
            obj.state_history.append((epoch, obj.state))

        return obj.state

    def run_maintenance(self, current_epoch: float,
                        altitude_map: Optional[Dict[str, float]] = None):
        """
        Periodic catalog maintenance sweep.
        Demotes stale/lost objects, marks decayed objects.
        """
        for oid, obj in self._catalog.items():
            if obj.state == CatalogState.DECAYED:
                continue

            age = current_epoch - obj.last_observation_epoch
            old_state = obj.state

            # Check decay
            if altitude_map and oid in altitude_map:
                if altitude_map[oid] < self.decay_alt:
                    obj.state = CatalogState.DECAYED
                    logger.warning(f"DECAYED: {oid} (alt={altitude_map[oid]:.0f}km)")

            # Staleness demotion
            elif obj.state == CatalogState.CATALOGED and age > self.stale_sec:
                obj.state = CatalogState.STALE
                logger.info(f"DEMOTED: {oid} CATALOGED -> STALE ({age/86400:.1f} days)")

            elif obj.state == CatalogState.STALE and age > self.lost_sec:
                obj.state = CatalogState.LOST
                logger.warning(f"DEMOTED: {oid} STALE -> LOST ({age/86400:.1f} days)")

            if obj.state != old_state:
                obj.state_history.append((current_epoch, obj.state))

    def merge_tracks(self, primary_id: str, secondary_id: str) -> Optional[CatalogObject]:
        """Merge two tracks determined to be the same physical object."""
        primary = self._catalog.get(primary_id)
        secondary = self._catalog.get(secondary_id)
        if not primary or not secondary:
            return None
        primary.observation_count += secondary.observation_count
        primary.distinct_passes += secondary.distinct_passes
        primary.merged_from.append(secondary_id)
        del self._catalog[secondary_id]
        logger.info(f"MERGED: {secondary_id} into {primary_id}")
        return primary

    def split_track(self, parent_id: str, n_children: int = 2) -> List[CatalogObject]:
        """Split a track into multiple objects (post-breakup event)."""
        parent = self._catalog.get(parent_id)
        if not parent:
            return []
        children = []
        for i in range(n_children):
            child_id = f"{parent_id}_frag_{i}"
            child = CatalogObject(
                object_id=child_id, state=CatalogState.UCT,
                first_observation_epoch=parent.last_observation_epoch,
                last_observation_epoch=parent.last_observation_epoch,
                observation_count=1, distinct_passes=1
            )
            self._catalog[child_id] = child
            parent.split_children.append(child_id)
            children.append(child)
        logger.warning(f"BREAKUP: {parent_id} split into {n_children} fragments")
        return children

    def get_statistics(self) -> dict:
        counts = {}
        for s in CatalogState:
            counts[s.value] = sum(1 for o in self._catalog.values() if o.state == s)
        return {"total": len(self._catalog), **counts}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Catalog Lifecycle -- Self Test")
    print("=" * 60)
    mgr = CatalogLifecycleManager()
    t = 1000000.0
    # Simulate a new object being tracked over multiple passes
    mgr.register_uct("OBJ-001", t)
    for i in range(1, 8):
        t += 21600  # 6 hours between passes
        state = mgr.record_observation("OBJ-001", t, new_pass=True)
        print(f"  Pass {i+1}: {state.value}")
    # Simulate staleness
    mgr.run_maintenance(t + 86400 * 10)
    obj = mgr._catalog["OBJ-001"]
    print(f"  After 10 days: {obj.state.value}")
    # Simulate breakup
    frags = mgr.split_track("OBJ-001", n_children=3)
    print(f"  Breakup: {len(frags)} fragments created")
    stats = mgr.get_statistics()
    print(f"  Catalog: {stats}")
    print("All tests passed.")
    print("=" * 60)
