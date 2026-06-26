/**
 * Property-based tests for viewport classification (Properties 35–36).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 35.1, 35.2
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { viewportCategory, VIEWPORT_BREAKPOINTS } from './viewport';
import type { ViewportCategory } from '@app-types';

/** The complete, closed set of categories the function may return. */
const ALL_CATEGORIES: readonly ViewportCategory[] = [
  'mobile',
  'tablet',
  'desktop',
  'wide',
];

/** Ascending rank used to assert monotonicity (mobile < tablet < ...). */
const RANK: Record<ViewportCategory, number> = {
  mobile: 0,
  tablet: 1,
  desktop: 2,
  wide: 3,
};

/**
 * Any non-negative width within the domain, including fractional pixels and
 * very large displays, so generated cases exercise every band and its edges.
 */
const widthArb = fc.double({
  min: 0,
  max: 10_000,
  noNaN: true,
  noDefaultInfinity: true,
});

describe('viewportCategory', () => {
  // Feature: ryze-technology-website, Property 35: viewport totality & determinism
  // Validates: Requirements 35.1
  it('returns exactly one defined category and is deterministic for any width >= 0', () => {
    fc.assert(
      fc.property(widthArb, (width) => {
        const result = viewportCategory(width);
        // Totality: the result is always one of the four defined categories.
        expect(ALL_CATEGORIES).toContain(result);
        // Determinism: calling again with the same input yields the same value.
        expect(viewportCategory(width)).toBe(result);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 36: viewport monotonic boundaries
  // Validates: Requirements 35.2
  it('never maps a larger width to a smaller category (ordered, no overlap/gap)', () => {
    fc.assert(
      fc.property(widthArb, widthArb, (a, b) => {
        const smaller = Math.min(a, b);
        const larger = Math.max(a, b);
        // Increasing width must not decrease the category rank.
        expect(RANK[viewportCategory(larger)]).toBeGreaterThanOrEqual(
          RANK[viewportCategory(smaller)],
        );
      }),
    );
  });
});

describe('viewportCategory boundaries (examples)', () => {
  it('classifies representative widths into the expected bands', () => {
    expect(viewportCategory(0)).toBe('mobile');
    expect(viewportCategory(767)).toBe('mobile');
    expect(viewportCategory(768)).toBe('tablet');
    expect(viewportCategory(1023)).toBe('tablet');
    expect(viewportCategory(1024)).toBe('desktop');
    expect(viewportCategory(1535)).toBe('desktop');
    expect(viewportCategory(1536)).toBe('wide');
    expect(viewportCategory(3840)).toBe('wide');
  });

  it('maps each breakpoint constant to the start of its own band', () => {
    expect(viewportCategory(VIEWPORT_BREAKPOINTS.mobile)).toBe('mobile');
    expect(viewportCategory(VIEWPORT_BREAKPOINTS.tablet)).toBe('tablet');
    expect(viewportCategory(VIEWPORT_BREAKPOINTS.desktop)).toBe('desktop');
    expect(viewportCategory(VIEWPORT_BREAKPOINTS.wide)).toBe('wide');
  });

  it('coerces out-of-domain inputs to the lowest band (total function)', () => {
    expect(viewportCategory(-1)).toBe('mobile');
    expect(viewportCategory(Number.NaN)).toBe('mobile');
  });
});
