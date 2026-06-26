/**
 * Pure easing and interpolation helpers for the animation layer.
 *
 * Every function in this module is pure (no React, no DOM, no side effects) so
 * that it can be unit- and property-tested in isolation and shared between the
 * GSAP/Lenis imperative wrappers and the React hooks/components that drive
 * counters, reveals, parallax, and transitions.
 *
 * Easing functions conceptually map the unit interval [0, 1] -> [0, 1]. The
 * "out-back" easing intentionally overshoots that range (it dips below 0 near
 * the start and rises above 1 near the end) to produce a springy landing; this
 * is documented and expected, so it is excluded from monotonicity/range
 * guarantees that the other easings honor.
 *
 * _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 21.2_
 */
import type { EasingFn } from '@app-types';

/**
 * Exponential ease-out. Decelerates sharply from a fast start.
 *
 * `easeOutExpo(0) === 0` and `easeOutExpo(1) === 1`, and the function is
 * monotonically non-decreasing across [0, 1], so a counter driven by it never
 * appears to move backward. Stays within [0, 1] for inputs in [0, 1].
 */
export const easeOutExpo: EasingFn = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Quintic ease-in-out. Symmetric S-curve: slow start, fast middle, slow end.
 *
 * `easeInOutQuint(0) === 0` and `easeInOutQuint(1) === 1`, and the function is
 * monotonically non-decreasing across [0, 1], staying within [0, 1].
 */
export const easeInOutQuint: EasingFn = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

/**
 * Back ease-out. Overshoots its target before settling for a springy feel.
 *
 * NOTE: This easing intentionally leaves the [0, 1] range — it returns values
 * slightly greater than 1 just before `t = 1`. It satisfies the endpoint
 * conditions (`easeOutBack(0) === 0`, `easeOutBack(1) === 1`) but is NOT
 * monotonic and is therefore exempt from the range/monotonicity guarantees of
 * the other easings. Do not use it to drive counters that must never overshoot.
 */
export const easeOutBack: EasingFn = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const u = t - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
};

/**
 * Constrain `value` to the inclusive range [min, max].
 *
 * Returns `value` unchanged when it already lies within the range; otherwise
 * returns the nearest bound. Assumes `min <= max`.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolate between `a` and `b` by `t`, with `t` clamped to [0, 1].
 *
 * Guarantees `lerp(a, b, 0) === a` and `lerp(a, b, 1) === b`, and for any
 * `t` in [0, 1] the result lies within `[min(a, b), max(a, b)]`.
 */
export function lerp(a: number, b: number, t: number): number {
  const tc = clamp(t, 0, 1);
  if (tc === 0) return a;
  if (tc === 1) return b;
  return a + (b - a) * tc;
}

/**
 * Remap `v` from the input range [inMin, inMax] to the output range
 * [outMin, outMax].
 *
 * When `clampOut` is true, the result is constrained to the output range
 * (handling either ordering of `outMin`/`outMax`). When the input range is
 * degenerate (`inMin === inMax`) the mapping is undefined, so `outMin` is
 * returned to avoid division by zero.
 */
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clampOut = false,
): number {
  const inSpan = inMax - inMin;
  if (inSpan === 0) return outMin;
  const ratio = (v - inMin) / inSpan;
  const out = outMin + ratio * (outMax - outMin);
  if (!clampOut) return out;
  const lo = Math.min(outMin, outMax);
  const hi = Math.max(outMin, outMax);
  return clamp(out, lo, hi);
}

/**
 * Round `value` to exactly `decimals` decimal places (decimals >= 0).
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, Math.max(0, Math.trunc(decimals)));
  return Math.round(value * factor) / factor;
}

/**
 * Compute the displayed value of an animated counter at a given `progress`.
 *
 * `progress` is clamped to [0, 1]: at `progress <= 0` the result is `from`, and
 * at `progress >= 1` the result is `to` (both rounded to `decimals`). For
 * intermediate progress the value is eased and rounded, then clamped to the
 * `[from, to]` interval (in either order) so a rounded result can never escape
 * the source/target bounds. This keeps counters from ever displaying a value
 * outside the start..target range and lands them exactly on target.
 */
export function interpolateCounter(
  from: number,
  to: number,
  progress: number,
  easing: EasingFn,
  decimals: number,
): number {
  if (progress <= 0) return roundTo(from, decimals);
  if (progress >= 1) return roundTo(to, decimals);
  const eased = easing(clamp(progress, 0, 1));
  const value = from + (to - from) * eased;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return roundTo(clamp(value, lo, hi), decimals);
}
