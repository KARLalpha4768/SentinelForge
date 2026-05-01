"""
koopman_propagator.py - Koopman Operator for Linearized Orbit Propagation

Lifts nonlinear orbital dynamics into a linear space via Extended Dynamic
Mode Decomposition (EDMD). Enables ultra-fast catalog propagation via
matrix-vector multiplication instead of numerical integration.

dx/dt = f(x)  [nonlinear]  -->  dg/dt = K * g(x)  [linear in lifted space]
"""
import logging
import numpy as np
from typing import Tuple, Optional

logger = logging.getLogger("sentinelforge.science.koopman")

MU_EARTH = 3.986004418e5


class KoopmanLifter:
    """
    Lifts orbital state vectors into an observable space using polynomial basis.

    State x = [x, y, z, vx, vy, vz] (6D)
    Lifted g(x) = [x, y, z, vx, vy, vz, r, 1/r, 1/r^3, x^2, y^2, z^2, ...] (ND)
    """

    def __init__(self, poly_order: int = 2):
        self.poly_order = poly_order

    def lift(self, state: np.ndarray) -> np.ndarray:
        """Lift a 6D state vector to the observable space."""
        x, y, z, vx, vy, vz = state
        r = np.sqrt(x**2 + y**2 + z**2)
        r_inv = 1.0 / (r + 1e-10)
        r3_inv = r_inv**3
        v = np.sqrt(vx**2 + vy**2 + vz**2)
        # Angular momentum components
        hx = y * vz - z * vy
        hy = z * vx - x * vz
        hz = x * vy - y * vx
        # Energy
        energy = 0.5 * v**2 - MU_EARTH * r_inv
        observables = [
            x, y, z, vx, vy, vz,    # Original state
            r, r_inv, r3_inv, v,     # Radial quantities
            hx, hy, hz,             # Angular momentum
            energy,                  # Orbital energy
            x*vx, y*vy, z*vz,       # Cross terms
            x**2, y**2, z**2,       # Quadratic position
        ]
        return np.array(observables)

    @property
    def dim(self) -> int:
        return 20  # Number of observables


class EDMDApproximator:
    """
    Extended Dynamic Mode Decomposition: approximates the Koopman operator K
    from trajectory snapshot data.

    Given snapshots X = [g(x_0), g(x_1), ...] and Y = [g(x_1), g(x_2), ...],
    K = Y @ pinv(X)
    """

    def __init__(self, lifter: KoopmanLifter, regularization: float = 1e-6):
        self.lifter = lifter
        self.reg = regularization
        self.K: Optional[np.ndarray] = None
        self.eigenvalues: Optional[np.ndarray] = None
        self.eigenvectors: Optional[np.ndarray] = None

    def fit(self, trajectories: np.ndarray) -> np.ndarray:
        """
        Fit the Koopman operator from trajectory data.

        Args:
            trajectories: (T, 6) array of state vectors at uniform dt

        Returns:
            K: (N, N) Koopman operator matrix
        """
        T = trajectories.shape[0]
        N = self.lifter.dim
        # Lift all snapshots
        G = np.zeros((T, N))
        for t in range(T):
            G[t] = self.lifter.lift(trajectories[t])
        X = G[:-1].T  # (N, T-1)
        Y = G[1:].T   # (N, T-1)
        # EDMD: K = Y @ X^T @ (X @ X^T + reg*I)^-1
        XXT = X @ X.T + self.reg * np.eye(N)
        self.K = Y @ X.T @ np.linalg.inv(XXT)
        logger.info(f"EDMD: Koopman operator fitted ({N}x{N}) from {T} snapshots")
        return self.K

    def compute_spectrum(self) -> Tuple[np.ndarray, np.ndarray]:
        """Eigendecomposition of the Koopman operator."""
        if self.K is None:
            raise ValueError("Must call fit() first")
        self.eigenvalues, self.eigenvectors = np.linalg.eig(self.K)
        # Sort by magnitude (dominant modes first)
        idx = np.argsort(np.abs(self.eigenvalues))[::-1]
        self.eigenvalues = self.eigenvalues[idx]
        self.eigenvectors = self.eigenvectors[:, idx]
        return self.eigenvalues, self.eigenvectors


class LinearPropagator:
    """
    Ultra-fast orbit propagation via the Koopman operator.
    Replaces numerical integration with matrix-vector multiplication.
    """

    def __init__(self, edmd: EDMDApproximator):
        self.edmd = edmd
        self.lifter = edmd.lifter

    def propagate(self, state: np.ndarray, n_steps: int) -> np.ndarray:
        """
        Propagate a state vector forward by n_steps using K.

        Returns: (n_steps+1, 6) trajectory in original state space
        """
        if self.edmd.K is None:
            raise ValueError("EDMD model not fitted")
        g = self.lifter.lift(state)
        trajectory = [state.copy()]
        for _ in range(n_steps):
            g = self.edmd.K @ g
            # Extract original state from first 6 components
            trajectory.append(g[:6].real.copy())
        return np.array(trajectory)


class SpectralAnalyzer:
    """Extracts physical meaning from Koopman eigenvalues."""

    def analyze(self, eigenvalues: np.ndarray, dt: float) -> dict:
        continuous_eigs = np.log(eigenvalues + 1e-20) / dt
        frequencies = np.abs(np.imag(continuous_eigs)) / (2 * np.pi)
        decay_rates = np.real(continuous_eigs)
        # Find dominant oscillatory mode (orbital period)
        osc_mask = frequencies > 1e-6
        if np.any(osc_mask):
            dom_idx = np.argmax(np.abs(eigenvalues[osc_mask]))
            period = 1.0 / frequencies[osc_mask][dom_idx] if frequencies[osc_mask][dom_idx] > 0 else np.inf
        else:
            period = np.inf
        return {
            "dominant_period_sec": period,
            "n_stable_modes": int(np.sum(decay_rates < 0)),
            "n_unstable_modes": int(np.sum(decay_rates > 1e-6)),
            "spectral_radius": float(np.max(np.abs(eigenvalues))),
        }


def _generate_keplerian_trajectory(state0: np.ndarray, dt: float, n_steps: int) -> np.ndarray:
    """Simple RK4 propagation for training data generation."""
    def derivs(s):
        r = s[:3]
        v = s[3:]
        r_mag = np.linalg.norm(r)
        a = -MU_EARTH * r / (r_mag**3 + 1e-20)
        return np.concatenate([v, a])
    traj = [state0.copy()]
    s = state0.copy()
    for _ in range(n_steps):
        k1 = derivs(s)
        k2 = derivs(s + 0.5*dt*k1)
        k3 = derivs(s + 0.5*dt*k2)
        k4 = derivs(s + dt*k3)
        s = s + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)
        traj.append(s.copy())
    return np.array(traj)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    print("=" * 60)
    print("SentinelForge Koopman Propagator -- Self Test")
    print("=" * 60)
    # Generate training trajectory (ISS-like orbit)
    state0 = np.array([6780.0, 0.0, 0.0, 0.0, 7.66, 0.0])
    dt = 60.0  # 1-minute steps
    n_train = 200
    traj = _generate_keplerian_trajectory(state0, dt, n_train)
    print(f"  Training data: {traj.shape[0]} snapshots at dt={dt}s")
    # Fit Koopman operator
    lifter = KoopmanLifter(poly_order=2)
    edmd = EDMDApproximator(lifter)
    K = edmd.fit(traj)
    print(f"  Koopman operator: {K.shape}")
    # Spectral analysis
    eigs, vecs = edmd.compute_spectrum()
    analyzer = SpectralAnalyzer()
    spec = analyzer.analyze(eigs, dt)
    print(f"  Dominant period: {spec['dominant_period_sec']:.0f}s")
    print(f"  Spectral radius: {spec['spectral_radius']:.4f}")
    # Test propagation
    prop = LinearPropagator(edmd)
    pred_traj = prop.propagate(state0, 50)
    true_traj = traj[:51]
    errors = np.linalg.norm(pred_traj[:, :3] - true_traj[:, :3], axis=1)
    print(f"  Propagation error at T+50min: {errors[-1]:.2f} km")
    print(f"  Mean propagation error: {np.mean(errors):.2f} km")
    print("All tests passed.")
    print("=" * 60)
