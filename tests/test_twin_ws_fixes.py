import asyncio
import math

from output.builds.src.api import twin_ws


class _Client:
    def __init__(self):
        self.messages = []

    async def send_json(self, payload):
        self.messages.append(payload)


def test_twin_broadcast_propagates_catalog_once_for_all_clients(monkeypatch):
    calls = 0
    real_propagate = twin_ws.propagate_kepler_simple

    def counted_propagate(*args, **kwargs):
        nonlocal calls
        calls += 1
        return real_propagate(*args, **kwargs)

    monkeypatch.setattr(twin_ws, "propagate_kepler_simple", counted_propagate)
    broadcaster = twin_ws.TwinBroadcaster()
    first = _Client()
    second = _Client()
    broadcaster.clients.update((first, second))

    asyncio.run(broadcaster.broadcast_once(now=100.0))

    assert calls == len(twin_ws.DEMO_CATALOG)
    assert first.messages == second.messages


def test_twin_clients_share_one_background_task():
    async def connect_clients():
        broadcaster = twin_ws.TwinBroadcaster(catalog=[], interval_sec=3600.0)
        first = _Client()
        second = _Client()
        await broadcaster.connect(first)
        task = broadcaster._task
        await broadcaster.connect(second)
        assert broadcaster._task is task
        await broadcaster.disconnect(first)
        await broadcaster.disconnect(second)
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    asyncio.run(connect_clients())


def test_twin_longitude_is_rotated_from_eci_to_earth_fixed():
    position = twin_ws.propagate_kepler_simple(
        a_km=7000.0, ecc=0.0, inc_deg=0.0, raan_deg=0.0,
        argp_deg=0.0, mean_anom_deg=0.0, dt_sec=0.0,
    )

    assert math.isclose(position["lon"], 79.5394, abs_tol=1e-6)
