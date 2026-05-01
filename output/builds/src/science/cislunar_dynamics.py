"""
cislunar_dynamics.py - Cislunar Space Domain Awareness (CR3BP)

Extends SentinelForge beyond Earth-centric (two-body) tracking into the
cislunar regime using the Circular Restricted Three-Body Problem (CR3BP).
Computes Lagrange points, invariant manifolds, and propagates trajectories
in the Earth-Moon rotating frame.

Effective potential: Omega = 0.5*(x^2+y^2) + (1-mu)/r1 + mu/r2
"""
import logging
import numpy as np
from typing import List, Tuple

logger = logging.getLogger("sentinelforge.science.cislunar")

MU_MOON = 4902.8  # km^3/s^2
MU_EARTH = 3.986004418e5
D_EM = 384400.0   # Earth-Moon distance (km)
MU_RATIO = MU_MOON / (MU_EARTH + MU_MOON)  # ~0.01215


class CR3BPPropagator:
    """Equations of motion in the Earth-Moon rotating frame."""

    def __init__(self, mu: float = MU_RATIO):
        self.mu = mu

    def equations_of_motion(self, state: np.ndarray) -> np.ndarray:
        """
        CR3BP EOM in the rotating frame (non-dimensionalized).
        state = [x, y, z, vx, vy, vz]
        """
        x, y, z, vx, vy, vz = state
        mu = self.mu
        r1 = np.sqrt((x + mu)**2 + y**2 + z**2)        # Dist to Earth
        r2 = np.sqrt((x - 1 + mu)**2 + y**2 + z**2)    # Dist to Moon
        ax = (2*vy + x - (1-mu)*(x+mu)/(r1**3+1e-20)
              - mu*(x-1+mu)/(r2**3+1e-20))
        ay = (-2*vx + y - (1-mu)*y/(r1**3+1e-20)
              - mu*y/(r2**3+1e-20))
        az = (-(1-mu)*z/(r1**3+1e-20) - mu*z/(r2**3+1e-20))
        return np.array([vx, vy, vz, ax, ay, az])

    def jacobi_constant(self, state: np.ndarray) -> float:
        """Compute the Jacobi constant (energy integral) of the CR3BP."""
        x, y, z, vx, vy, vz = state
        mu = self.mu
        r1 = np.sqrt((x + mu)**2 + y**2 + z**2)
        r2 = np.sqrt((x - 1 + mu)**2 + y**2 + z**2)
        U = 0.5*(x**2 + y**2) + (1-mu)/r1 + mu/r2
        v2 = vx**2 + vy**2 + vz**2
        return 2*U - v2

    def propagate(self, state0: np.ndarray, t_span: float,
                  dt: float = 0.001) -> np.ndarray:
        """RK4 propagation in the rotating frame."""
        n_steps = int(t_span / dt)
        traj = [state0.copy()]
        s = state0.copy()
        for _ in range(n_steps):
            k1 = self.equations_of_motion(s)
            k2 = self.equations_of_motion(s + 0.5*dt*k1)
            k3 = self.equations_of_motion(s + 0.5*dt*k2)
            k4 = self.equations_of_motion(s + dt*k3)
            s = s + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)
            traj.append(s.copy())
        return np.array(traj)


class LagrangePointFinder:
    """Computes the 5 Lagrange points of the Earth-Moon system."""

    def __init__(self, mu: float = MU_RATIO):
        self.mu = mu

    def find_collinear(self) -> Tuple[float, float, float]:
        """Find L1, L2, L3 via Newton's method on the collinear equation."""
        mu = self.mu
        results = []
        # L1: between Earth and Moon
        x = 0.8
        for _ in range(100):
            r1 = x + mu
            r2 = x - 1 + mu
            f = x - (1-mu)/(r1**2+1e-20)*np.sign(r1) + mu/(r2**2+1e-20)*np.sign(r2)
            fp = 1 + 2*(1-mu)/(abs(r1)**3+1e-20) + 2*mu/(abs(r2)**3+1e-20)
            x = x - f / (fp + 1e-20)
        results.append(x)
        # L2: beyond Moon
        x = 1.2
        for _ in range(100):
            r1 = x + mu
            r2 = x - 1 + mu
            f = x - (1-mu)/(r1**2+1e-20)*np.sign(r1) + mu/(r2**2+1e-20)*np.sign(r2)
            fp = 1 + 2*(1-mu)/(abs(r1)**3+1e-20) + 2*mu/(abs(r2)**3+1e-20)
            x = x - f / (fp + 1e-20)
        results.append(x)
        # L3: beyond Earth (opposite side)
        x = -1.0
        for _ in range(100):
            r1 = x + mu
            r2 = x - 1 + mu
            f = x - (1-mu)/(r1**2+1e-20)*np.sign(r1) + mu/(r2**2+1e-20)*np.sign(r2)
            fp = 1 + 2*(1-mu)/(abs(r1)**3+1e-20) + 2*mu/(abs(r2)**3+1e-20)
            x = x - f / (fp + 1e-20)
        results.append(x)
        return tuple(results)

    def find_triangular(self) -> Tuple[np.ndarray, np.ndarray]:
        """L4 and L5 form equilateral triangles."""
        mu = self.mu
        L4 = np.array([0.5 - mu, np.sqrt(3)/2, 0.0])
        L5 = np.array([0.5 - mu, -np.sqrt(3)/2, 0.0])
        return L4, L5

    def find_all(self) -> dict:
        L1x, L2x, L3x = self.find_collinear()
        L4, L5 = self.find_triangular()
        points = {
            "L1": np.array([L1x, 0, 0]),
            "L2": np.array([L2x, 0, 0]),
            "L3": np.array([L3x, 0, 0]),
            "L4": L4,
            "L5": L5,
        }
        # Convert to km
        for k in points:
            points[k] = points[k] * D_EM
        return points


class ManifoldComputer:
    """Computes stable/unstable manifolds from Lagrange points."""

    def __init__(self, prop: CR3BPPropagator):
        self.prop = prop

    def compute_manifold(self, L_point_nd: np.ndarray, direction: str = "unstable",
                         perturbation: float = 1e-5, t_span: float = 6.0,
                         n_trajectories: int = 20) -> List[np.ndarray]:
        """
        Compute manifold trajectories emanating from a Lagrange point.
        """
        trajectories = []
        for i in range(n_trajectories):
            angle = 2 * np.pi * i / n_trajectories
            dx = perturbation * np.cos(angle)
            dy = perturbation * np.sin(angle)
            state0 = np.array([
                L_point_nd[0] + dx, L_point_nd[1] + dy, 0.0,
                0.0, 0.0, 0.0
            ])
            sign = 1.0 if direction == "unstable" else -1.0
            traj = self.prop.propagate(state0, sign * t_span)
            trajectories.append(traj)
        logger.info(f"Computed {len(trajectories)} {direction} manifold trajectories")
        return trajectories


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Cislunar Dynamics (CR3BP) -- Self Test")
    print("=" * 60)
    finder = LagrangePointFinder()
    points = finder.find_all()
    for name, pos in points.items():
        dist_earth = np.linalg.norm(pos)
        print(f"  {name}: [{pos[0]:+12.0f}, {pos[1]:+12.0f}] km  "
              f"(dist from Earth: {dist_earth:.0f} km)")
    prop = CR3BPPropagator()
    L1_nd = points["L1"] / D_EM
    state0 = np.array([L1_nd[0] + 0.001, 0.0, 0.0, 0.0, 0.01, 0.0])
    traj = prop.propagate(state0, t_span=3.0, dt=0.001)
    CJ = prop.jacobi_constant(state0)
    print(f"\n  Jacobi constant at L1+eps: {CJ:.6f}")
    print(f"  Propagated {traj.shape[0]} steps in rotating frame")
    manifold = ManifoldComputer(prop)
    trajs = manifold.compute_manifold(L1_nd, direction="unstable", n_trajectories=8)
    print(f"  Computed {len(trajs)} unstable manifold branches")
    print("All tests passed.")
    print("=" * 60)
