/**
 * Property-based tests for the pure easing and interpolation helpers.
 *
 * Each property is tagged with its design property number and validates the
 * matching acceptance criteria. fast-check is seeded globally via
 * `src/test/fastcheck.ts`; every property runs at a minimum of 100 iterations
 * (DEFAULT_NUM_RUNS), explicitly pinned here for clarity.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DEFAULT_NUM_RUNS } from '../test/fastcheck';
import {
  easeOutExpo,
  easeInOutQuint,
  clamp,
  lerp,
  mapRange,
  interpolateCounter,
} from './easing';

const RUNS = { numRuns: DEFAULT_NUM_RUNS } as const;
const EPS = 1e-9;

// A finite, bounded real used where extreme floats would only add float noise.
const reasonable = (): fc.Arbitrary<number> =>
  fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true });

const unit = (): fc.Arbitrary<number> =>
  fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true });

describe('easing & interpolation helpers', () => {
  // Feature: ryze-technology-website, Property 1: easing endpoints
  // Validates: Requirements 34.1
  it('Property 1: non-overshoot easings start at 0 and end at 1', () => {
    for (const f of [easeOutExpo, easeInOutQuint]) {
      expect(Math.abs(f(0) - 0)).toBeLessThanOrEqual(EPS);
      expect(Math.abs(f(1) - 1)).toBeLessThanOrEqual(EPS);
    }
  });

  // Feature: ryze-technology-website, Property 2: easing monotonicity
  // Validates: Requirements 34.2
  it('Property 2: easeOutExpo is non-decreasing across [0,1]', () => {
    fc.assert(
      fc.property(unit(), unit(), (a, b) => {
        const t1 = Math.min(a, b);
        const t2 = Math.max(a, b);
        // t1 <= t2  =>  easeOutExpo(t1) <= easeOutExpo(t2)
        expect(easeOutExpo(t1)).toBeLessThanOrEqual(easeOutExpo(t2) + EPS);
      }),
      RUNS,
    );
  });

  // Feature: ryze-technology-website, Property 3: clamp bounds
  // Validates: Requirements 34.3
  it('Property 3: clamp stays within bounds and is identity inside them', () => {
    fc.assert(
      fc.property(reasonable(), reasonable(), reasonable(), (value, m1, m2) => {
        const min = Math.min(m1, m2);
        const max = Math.max(m1, m2);
        const result = clamp(value, min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        if (value >= min && value <= max) {
          expect(result).toBe(value);
        }
      }),
      RUNS,
    );
  });

  // Feature: ryze-technology-website, Property 4: lerp endpoints & bounds
  // Validates: Requirements 34.4
  it('Property 4: lerp hits endpoints and stays within [min(a,b),max(a,b)]', () => {
    fc.assert(
      fc.property(reasonable(), reasonable(), unit(), (a, b, t) => {
        expect(lerp(a, b, 0)).toBe(a);
        expect(lerp(a, b, 1)).toBe(b);
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const r = lerp(a, b, t);
        const tol = (Math.abs(a) + Math.abs(b)) * 1e-9 + EPS;
        expect(r).toBeGreaterThanOrEqual(lo - tol);
        expect(r).toBeLessThanOrEqual(hi + tol);
      }),
      RUNS,
    );
  });

  // Feature: ryze-technology-website, Property 5: mapRange invertibility
  // Validates: Requirements 34.5
  it('Property 5: mapRange is invertible within epsilon', () => {
    // Constrain to non-degenerate ranges with a meaningful span so the inverse
    // mapping is well-defined and float error stays bounded.
    const range = fc
      .tuple(
        fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 1e4, noNaN: true, noDefaultInfinity: true }),
      )
      .map(([lo, span]): [number, number] => [lo, lo + span]);

    fc.assert(
      fc.property(
        range,
        range,
        fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
        ([inMin, inMax], [outMin, outMax], frac) => {
          const v = inMin + frac * (inMax - inMin);
          const mapped = mapRange(v, inMin, inMax, outMin, outMax);
          const back = mapRange(mapped, outMin, outMax, inMin, inMax);
          const tol = Math.abs(inMax - inMin) * 1e-6 + 1e-6;
          expect(Math.abs(back - v)).toBeLessThanOrEqual(tol);
        },
      ),
      RUNS,
    );
  });

  // Feature: ryze-technology-website, Property 6: interpolateCounter clamping & rounding
  // Validates: Requirements 34.6, 21.2
  it('Property 6: interpolateCounter clamps to [from,to] and rounds to decimals', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e5, max: 1e5, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -1e5, max: 1e5, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -0.5, max: 1.5, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 0, max: 6 }),
        (from, to, progress, decimals) => {
          const result = interpolateCounter(from, to, progress, easeOutExpo, decimals);
          const lo = Math.min(from, to);
          const hi = Math.max(from, to);

          // Within [from, to] (in either order).
          expect(result).toBeGreaterThanOrEqual(lo - EPS);
          expect(result).toBeLessThanOrEqual(hi + EPS);

          // Rounded to exactly `decimals` places.
          const factor = Math.pow(10, decimals);
          const scaled = result * factor;
          expect(Math.abs(scaled - Math.round(scaled))).toBeLessThanOrEqual(1e-6);

          // Endpoint clamping of progress.
          if (progress <= 0) {
            expect(result).toBe(Math.round(from * factor) / factor);
          }
          if (progress >= 1) {
            expect(result).toBe(Math.round(to * factor) / factor);
          }
        },
      ),
      RUNS,
    );
  });
});
