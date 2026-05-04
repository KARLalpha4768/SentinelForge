"""
run_benchmarks.py — SentinelForge Performance Benchmarks
Measures latency for all core science modules.
"""
import sys, os, time, math, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "builds", "src"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np

results = []

def bench(name, fn, iterations=1):
    times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        fn()
        t1 = time.perf_counter()
        times.append((t1 - t0) * 1000)
    avg = sum(times) / len(times)
    results.append({'module': name, 'latency_ms': round(avg, 2), 'iterations': iterations, 'status': 'PASS'})
    return avg

# 1. Orbit Propagator
from orbit_propagator import OrbitPropagator, OrbitalElements
prop = OrbitPropagator()
iss = OrbitalElements(norad_id=25544, epoch=0, a=6_778_000, e=0.0001, i=51.6*math.pi/180, raan=0, argp=0, M=0)
bench('Orbit Propagator (J2-J6, 1 orbit)', lambda: prop.propagate(iss, iss.period_sec))
bench('Orbit Propagator (100 objects)', lambda: [prop.propagate(iss, 3600) for _ in range(100)])

# 2. Conjunction Screener
from conjunction_screener import ConjunctionScreener, CovarianceRTN
cs = ConjunctionScreener()
bench('Conjunction Screener (Foster-Estes)', lambda: cs.screen_pair(
    pos1=np.array([6778.0,0,0]), vel1=np.array([0,7.7,0]),
    cov1=CovarianceRTN(rr=0.1,tt=1.0,nn=0.1),
    pos2=np.array([6778.5,0.1,0.1]), vel2=np.array([0,-7.7,0]),
    cov2=CovarianceRTN(rr=0.1,tt=1.0,nn=0.1),
    id1=25544, id2=99999, epoch=0
), iterations=100)

# 3. Multi-Sensor Fusion
from multi_sensor_fusion import MultiSensorFusion
now = time.time()
bench('Multi-Sensor Fusion (EKF ingest)', lambda: (
    MultiSensorFusion().ingest([{
        "ra_deg": 180.0, "dec_deg": 45.0, "ra_err_arcsec": 1.0,
        "dec_err_arcsec": 1.0, "magnitude": 14.5, "angular_rate_arcsec_s": 0.5,
        "timestamp_utc": now, "sensor_id": "varda-CHL-01"
    }], "CHL-01")
), iterations=50)

# 4. Observation Scheduler
from observation_scheduler import ObservationScheduler
def run_scheduler():
    s = ObservationScheduler()
    s.register_site("CHL-01", -30.2, -70.7, ["varda"], 8.0, True)
    s.register_site("AUS-01", -31.3, 149.1, ["horus"], 7.5, True)
    s.add_conjunction_task({"ra_deg": 120, "dec_deg": -25, "collision_probability": 5e-4, "primary_id": 25544})
    s.add_uct_followup({"ra_deg": 200, "dec_deg": -35})
    s.add_catalog_maintenance([{"ra_predicted_deg": 150, "dec_predicted_deg": -40, "norad_id": 12345, "age_days": 5}])
    return s.generate_schedule()
bench('Observation Scheduler (5 tasks)', run_scheduler, iterations=50)

# 5. Coordinate Transforms
import coordinate_frames as cf
bench('J2000->TEME->ITRF (1000x)', lambda: [
    cf.teme_to_itrf(
        cf.j2000_to_teme(np.array([6778,0,0]), cf.JD_J2000),
        np.array([0,7.7,0]),
        cf.JD_J2000
    ) for _ in range(1000)
])

# 6. Atmospheric Refraction (10K corrections)
bench('Atmospheric Refraction (10Kx)', lambda: [cf.atmospheric_refraction(el) for el in range(0,90) for _ in range(112)])

# 7. IOD
bench('Initial Orbit Determination', lambda: prop.initial_orbit_determination([
    {"ra_deg": 180.0, "dec_deg": 45.0, "timestamp": now},
    {"ra_deg": 180.05, "dec_deg": 45.01, "timestamp": now+30},
    {"ra_deg": 180.10, "dec_deg": 45.02, "timestamp": now+60},
]), iterations=20)

# 8. Knowledge Base
from knowledge import init_knowledge_base, search_knowledge
init_knowledge_base()
bench('Knowledge Base Search (100x)', lambda: [search_knowledge("Mahalanobis") for _ in range(100)])

# Print results
print("")
print("=" * 72)
print("  SENTINELFORGE PERFORMANCE BENCHMARKS")
print("=" * 72)
hdr = f"  {'Module':<44} {'Latency':>10} {'Iters':>6}  St"
print(hdr)
print("-" * 72)
for r in results:
    name = r['module'][:44]
    print(f"  {name:<44} {r['latency_ms']:>8.2f}ms {r['iterations']:>5}x  OK")
print("=" * 72)
print(f"  Platform: Python {sys.version.split()[0]} | NumPy {np.__version__}")
print(f"  All {len(results)} benchmarks PASSED")
print("=" * 72)
