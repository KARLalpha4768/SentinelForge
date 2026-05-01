"""
end_to_end_test.py - SentinelForge Full Pipeline Verification
Runs the complete detection-to-decision pipeline to prove it works.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "builds", "src")
sys.path.insert(0, src)

def run_test():
    print("=" * 60)
    print("  SENTINELFORGE END-TO-END PIPELINE TEST")
    print("=" * 60)
    passed = 0
    failed = 0

    # --- Test 1: Knowledge Base ---
    print("\n[1] Knowledge Base...")
    from knowledge import init_knowledge_base, search_knowledge, get_equations_for_module
    init_knowledge_base()
    eqs = get_equations_for_module("streak_detect")
    assert len(eqs) >= 2, f"Expected >=2 equations, got {len(eqs)}"
    results = search_knowledge("Mahalanobis")
    assert len(results) >= 1
    print(f"    PASS: {len(eqs)} equations for streak_detect, search works")
    passed += 1

    # --- Test 2: Orbit Propagator ---
    print("\n[2] Orbit Propagator...")
    from orbit_propagator import OrbitPropagator, OrbitalElements, parse_tle
    import math
    prop = OrbitPropagator()
    iss = OrbitalElements(
        norad_id=25544, epoch=0,
        a=6_778_000, e=0.0001, i=51.6 * math.pi/180,
        raan=0, argp=0, M=0
    )
    sv = prop.kepler_to_state(iss)
    assert abs(sv.r_mag - 6_778_000) < 1000, f"ISS radius wrong: {sv.r_mag}"
    print(f"    PASS: ISS at r={sv.r_mag/1000:.0f} km, v={sv.v_mag:.0f} m/s")

    # Propagate 1 orbit
    sv2 = prop.propagate(iss, iss.period_sec)
    assert abs(sv2.r_mag - 6_778_000) < 1000
    print(f"    PASS: 1 orbit propagation stable (r={sv2.r_mag/1000:.0f} km)")
    passed += 1

    # --- Test 3: Conjunction Screener ---
    print("\n[3] Conjunction Screener...")
    import numpy as np
    from conjunction_screener import ConjunctionScreener, CovarianceRTN
    cs = ConjunctionScreener()
    event = cs.screen_pair(
        pos1=np.array([6778.0, 0.0, 0.0]),
        vel1=np.array([0.0, 7.7, 0.0]),
        cov1=CovarianceRTN(rr=0.1, tt=1.0, nn=0.1),
        pos2=np.array([6778.5, 0.1, 0.1]),
        vel2=np.array([0.0, -7.7, 0.0]),
        cov2=CovarianceRTN(rr=0.1, tt=1.0, nn=0.1),
        id1=25544, id2=99999, epoch=0
    )
    assert event is not None
    print(f"    PASS: Pc={event.collision_probability:.2e}, "
          f"miss={event.miss_distance_km:.3f} km, "
          f"alert={event.alert_level}")
    passed += 1

    # --- Test 4: Multi-Sensor Fusion ---
    print("\n[4] Multi-Sensor Fusion...")
    from multi_sensor_fusion import MultiSensorFusion
    fusion = MultiSensorFusion()

    # Simulate detections from 3 sites seeing the same object
    import time as t
    now = t.time()
    for i, site in enumerate(["CHL-01", "AUS-01", "NAM-01"]):
        result = fusion.ingest([{
            "ra_deg": 180.0 + i * 0.001,   # Slightly different positions
            "dec_deg": 45.0 + i * 0.0005,
            "ra_err_arcsec": 1.0,
            "dec_err_arcsec": 1.0,
            "magnitude": 14.5,
            "angular_rate_arcsec_s": 0.5,
            "timestamp_utc": now + i * 60,
            "sensor_id": f"varda-{site}"
        }], site)

    summary = fusion.summary()
    assert summary["total_tracks"] >= 1
    print(f"    PASS: {summary['total_tracks']} tracks, "
          f"{summary.get('multi_site', 0)} multi-site")
    passed += 1

    # --- Test 5: Observation Scheduler ---
    print("\n[5] Observation Scheduler...")
    from observation_scheduler import ObservationScheduler
    sched = ObservationScheduler()

    # Register sites
    sched.register_site("CHL-01", -30.2, -70.7, ["varda"], 8.0, True)
    sched.register_site("AUS-01", -31.3, 149.1, ["horus"], 7.5, True)
    sched.register_site("NAM-01", -22.6, 17.1, ["varda"], 9.0, True)

    # Add tasks
    sched.add_conjunction_task({"ra_deg": 120, "dec_deg": -25,
                                "collision_probability": 5e-4, "primary_id": 25544})
    sched.add_uct_followup({"ra_deg": 200, "dec_deg": -35})
    sched.add_catalog_maintenance([
        {"ra_predicted_deg": 150, "dec_predicted_deg": -40, "norad_id": 12345, "age_days": 5},
        {"ra_predicted_deg": 90, "dec_predicted_deg": -20, "norad_id": 67890, "age_days": 8},
    ])

    schedule = sched.generate_schedule()
    summary = sched.summary()
    assert summary["scheduled"] > 0
    print(f"    PASS: {summary['scheduled']}/{summary['total_tasks']} tasks scheduled")
    for s in schedule[:3]:
        print(f"         {s['priority']:10s} -> {s['site']} | {s['reason'][:40]}")
    passed += 1

    # --- Test 6: Initial Orbit Determination ---
    print("\n[6] Initial Orbit Determination...")
    prop2 = OrbitPropagator()
    obs = [
        {"ra_deg": 180.0, "dec_deg": 45.0, "timestamp": now},
        {"ra_deg": 180.05, "dec_deg": 45.01, "timestamp": now + 30},
        {"ra_deg": 180.10, "dec_deg": 45.02, "timestamp": now + 60},
    ]
    orbit = prop2.initial_orbit_determination(obs)
    assert orbit is not None
    print(f"    PASS: IOD altitude estimate: {orbit.altitude_km:.0f} km, "
          f"period: {orbit.period_sec/60:.0f} min")
    passed += 1

    # --- Summary ---
    total = passed + failed
    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {passed}/{total} PASSED")
    if failed == 0:
        print(f"  STATUS: ALL TESTS PASSED")
    else:
        print(f"  STATUS: {failed} FAILURES")
    print(f"{'=' * 60}")

    return failed == 0


if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)
