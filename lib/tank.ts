// Shared math for the open-top water tank problem.
// Base x by y, height z, fixed volume V  →  z = V / (x·y)
// Steel area A = xy + 2z(x + y) = xy + 2V/x + 2V/y

export const DEFAULT_VOLUME = 32;

/** Bounds used by the optimizer (and the lab sliders). */
export const SIDE_MIN = 1;
export const SIDE_MAX = 10;

export function heightFor(V: number, x: number, y: number): number {
  return V / (x * y);
}

export function steelArea(V: number, x: number, y: number): number {
  return x * y + (2 * V) / x + (2 * V) / y;
}

export interface Optimum {
  x: number;
  y: number;
  z: number;
  A: number;
  lambda: number;
}

/** x = y = ∛(2V), z = x/2, A* = 3x², λ = 4/x. For V = 32: 4 × 4 × 2, A = 48, λ = 1. */
export function optimum(V: number): Optimum {
  const s = Math.cbrt(2 * V);
  return { x: s, y: s, z: s / 2, A: 3 * s * s, lambda: 4 / s };
}

/** Steel area of a closed-form comparison shape: an open-top cube of the same volume. */
export function cubeArea(V: number): number {
  const s = Math.cbrt(V);
  return 5 * s * s;
}

/** Percentage of steel above the optimum. */
export function excessPercent(V: number, x: number, y: number): number {
  const best = optimum(V).A;
  return ((steelArea(V, x, y) - best) / best) * 100;
}

/**
 * The three multipliers from ∇f = λ∇g, solved per equation:
 *   λ1 = (y + 2z) / (yz),  λ2 = (x + 2z) / (xz),  λ3 = 2(x + y) / (xy)
 * They agree only at the optimum.
 */
export function lambdas(x: number, y: number, z: number): [number, number, number] {
  return [(y + 2 * z) / (y * z), (x + 2 * z) / (x * z), (2 * (x + y)) / (x * y)];
}

/** True when the three λ values are within `tol` (relative spread) of each other. */
export function lambdasAgree(ls: readonly number[], tol = 0.005): boolean {
  const max = Math.max(...ls);
  const min = Math.min(...ls);
  const mean = ls.reduce((a, b) => a + b, 0) / ls.length;
  return (max - min) / mean <= tol;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const STEP_INTERVAL_MS = 70;
export const STOP_MOVEMENT = 0.0005;

/**
 * One gradient-descent step on A(x, y) = xy + 2V/x + 2V/y.
 *   gx = y − 2V/x²,  gy = x − 2V/y²
 *   step = 0.08·grad, clamped to ±0.5; x, y clamped to [1, 10].
 */
export function gradientStep(V: number, x: number, y: number) {
  const gx = y - (2 * V) / (x * x);
  const gy = x - (2 * V) / (y * y);
  const dx = clamp(0.08 * gx, -0.5, 0.5);
  const dy = clamp(0.08 * gy, -0.5, 0.5);
  const nx = clamp(x - dx, SIDE_MIN, SIDE_MAX);
  const ny = clamp(y - dy, SIDE_MIN, SIDE_MAX);
  const moved = Math.hypot(nx - x, ny - y);
  return { x: nx, y: ny, moved, converged: moved < STOP_MOVEMENT };
}

export type TankStatus = "idle" | "running" | "optimal";

export function tankStatus(running: boolean, V: number, x: number, y: number): TankStatus {
  if (running) return "running";
  return excessPercent(V, x, y) < 0.05 ? "optimal" : "idle";
}

export const STATUS_LABEL: Record<TankStatus, string> = {
  idle: "not optimal yet",
  running: "optimizing…",
  optimal: "optimum reached",
};

export const fmt = (n: number, d = 2) => n.toFixed(d);
