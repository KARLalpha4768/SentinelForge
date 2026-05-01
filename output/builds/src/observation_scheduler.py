"""
observation_scheduler.py - SentinelForge Cloud Pipeline
Tasking optimization: decides which telescope looks where tonight.
Maximizes catalog maintenance while prioritizing high-value targets.
"""
import math
import time
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum


class TaskPriority(Enum):
    EMERGENCY = 0       # Conjunction < 24hrs
    CRITICAL = 1        # New uncorrelated track
    HIGH = 2            # Stale catalog object (> 3 days)
    MEDIUM = 3          # Routine maintenance
    LOW = 4             # Survey/search
    BACKGROUND = 5      # Fill time


@dataclass
class ObservationTask:
    """A single telescope tasking request."""
    task_id: int
    target_ra_deg: float
    target_dec_deg: float
    norad_id: Optional[int]
    priority: TaskPriority
    reason: str
    required_snr: float = 5.0
    min_elevation_deg: float = 30.0
    preferred_sensor: str = "varda"
    exposure_sec: float = 1.0
    n_frames: int = 3
    deadline: float = 0.0       # Must observe before this time
    assigned_site: Optional[str] = None
    completed: bool = False


@dataclass
class SiteCapability:
    """What a telescope site can observe tonight."""
    site_id: str
    latitude_deg: float
    longitude_deg: float
    sensors: List[str]
    available_hours: float      # Hours of darkness remaining
    weather_ok: bool
    current_task: Optional[int] = None
    tasks_completed: int = 0


class ObservationScheduler:
    """
    Assigns observation tasks to telescope sites.

    Strategy:
    1. Build priority queue of targets
    2. For each target, find best available site
    3. Assign considering: visibility, priority, slew time, weather
    4. Re-plan every 30 minutes for dynamic response
    """

    def __init__(self):
        self.tasks: List[ObservationTask] = []
        self.sites: Dict[str, SiteCapability] = {}
        self.schedule: List[dict] = []
        self.next_task_id = 1

    def add_conjunction_task(self, event) -> int:
        """Emergency task: observe conjunction object."""
        task = ObservationTask(
            task_id=self.next_task_id,
            target_ra_deg=event.get("ra_deg", 0),
            target_dec_deg=event.get("dec_deg", 0),
            norad_id=event.get("primary_id"),
            priority=TaskPriority.EMERGENCY,
            reason=f"Conjunction Pc={event.get('collision_probability', 0):.2e}",
            required_snr=10.0,
            n_frames=10,
            deadline=event.get("tca", time.time() + 3600)
        )
        self.tasks.append(task)
        self.next_task_id += 1
        return task.task_id

    def add_catalog_maintenance(self, stale_objects: list) -> int:
        """Routine: re-observe objects with aging predictions."""
        count = 0
        for obj in stale_objects:
            age_days = obj.get("age_days", 0)
            if age_days > 7:
                priority = TaskPriority.HIGH
            elif age_days > 3:
                priority = TaskPriority.MEDIUM
            else:
                priority = TaskPriority.LOW

            task = ObservationTask(
                task_id=self.next_task_id,
                target_ra_deg=obj.get("ra_predicted_deg", 0),
                target_dec_deg=obj.get("dec_predicted_deg", 0),
                norad_id=obj.get("norad_id"),
                priority=priority,
                reason=f"Catalog maintenance ({age_days:.0f} days stale)",
                n_frames=3
            )
            self.tasks.append(task)
            self.next_task_id += 1
            count += 1
        return count

    def add_uct_followup(self, track) -> int:
        """Critical: follow up on uncorrelated track."""
        task = ObservationTask(
            task_id=self.next_task_id,
            target_ra_deg=track.get("ra_deg", 0),
            target_dec_deg=track.get("dec_deg", 0),
            norad_id=None,
            priority=TaskPriority.CRITICAL,
            reason="UCT follow-up: confirm and determine orbit",
            required_snr=7.0,
            n_frames=5
        )
        self.tasks.append(task)
        self.next_task_id += 1
        return task.task_id

    def register_site(self, site_id: str, lat: float, lon: float,
                      sensors: list, hours: float, weather: bool):
        """Register an available telescope site for tasking."""
        self.sites[site_id] = SiteCapability(
            site_id=site_id, latitude_deg=lat, longitude_deg=lon,
            sensors=sensors, available_hours=hours, weather_ok=weather
        )

    def is_visible(self, site: SiteCapability,
                   ra_deg: float, dec_deg: float) -> Tuple[bool, float]:
        """
        Check if target is above minimum elevation from site.
        Simplified: uses declination vs latitude constraint.
        Full implementation would use sidereal time and hour angle.
        """
        # Maximum elevation = 90 - |dec - lat|
        max_elev = 90 - abs(dec_deg - site.latitude_deg)
        visible = max_elev > 30  # Min 30 degrees
        return visible, max(0, max_elev)

    def generate_schedule(self) -> List[dict]:
        """
        Assign tasks to sites using greedy priority scheduling.

        For each task (by priority):
          Find best available site (visible + weather + capacity)
          Assign task to site
          Update site availability
        """
        # Sort tasks by priority
        sorted_tasks = sorted(self.tasks, key=lambda t: t.priority.value)
        available_sites = {sid: s for sid, s in self.sites.items() if s.weather_ok}

        self.schedule = []

        for task in sorted_tasks:
            if task.completed:
                continue

            # Find best site
            best_site = None
            best_elev = 0

            for site_id, site in available_sites.items():
                if site.available_hours <= 0:
                    continue
                if task.preferred_sensor not in site.sensors and len(site.sensors) > 0:
                    if task.priority.value > 1:  # Only enforce for non-critical
                        continue

                visible, elev = self.is_visible(site, task.target_ra_deg, task.target_dec_deg)
                if visible and elev > best_elev:
                    best_elev = elev
                    best_site = site

            if best_site:
                task.assigned_site = best_site.site_id
                # Estimate time cost
                time_cost_hrs = (task.n_frames * task.exposure_sec + 30) / 3600  # +30s slew
                best_site.available_hours -= time_cost_hrs
                best_site.tasks_completed += 1

                self.schedule.append({
                    "task_id": task.task_id,
                    "site": best_site.site_id,
                    "target_ra": task.target_ra_deg,
                    "target_dec": task.target_dec_deg,
                    "norad_id": task.norad_id,
                    "priority": task.priority.name,
                    "reason": task.reason,
                    "elevation_deg": best_elev,
                    "n_frames": task.n_frames,
                    "exposure_sec": task.exposure_sec
                })

        return self.schedule

    def summary(self) -> dict:
        """Schedule summary for dashboard."""
        by_priority = {}
        for s in self.schedule:
            p = s["priority"]
            by_priority[p] = by_priority.get(p, 0) + 1

        by_site = {}
        for s in self.schedule:
            site = s["site"]
            by_site[site] = by_site.get(site, 0) + 1

        return {
            "total_tasks": len(self.tasks),
            "scheduled": len(self.schedule),
            "unscheduled": len(self.tasks) - len(self.schedule),
            "by_priority": by_priority,
            "by_site": by_site
        }
