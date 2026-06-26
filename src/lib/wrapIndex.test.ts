/**
 * Property-based tests for the index-wrapping helper (Properties 32–34).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 33.2, 33.3, 33.4
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { wrapIndex } from './wrapIndex';

// Lengths are >= 1 per the property preconditions (∀ length >= 1).
const lengthArb = fc.integer({ min: 1, max: 1000 });

// Indices intentionally span far negative and far positive values to exercise
// multi-revolution wrapping in both directions.
const indexArb = fc.integer({ min: -10000, max: 10000 });

describe('wrapIndex', () => {
  // Feature: ryze-technology-website, Property 32: wrapIndex in-range
  // Validates: Requirements 33.2
  it('returns a value in [0, length - 1] for any integer index', () => {
    fc.assert(
      fc.property(indexArb, lengthArb, (index, length) => {
        const result = wrapIndex(index, length);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(length - 1);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 33: wrap continuity
  // Validates: Requirements 33.3
  it('wraps next-from-last to 0 and prev-from-first to length - 1', () => {
    fc.assert(
      fc.property(lengthArb, (length) => {
        expect(wrapIndex(length, length)).toBe(0);
        expect(wrapIndex(-1, length)).toBe(length - 1);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 34: identity in range
  // Validates: Requirements 33.4
  it('returns any in-range index unchanged', () => {
    fc.assert(
      fc.property(
        lengthArb.chain((length) =>
          fc.record({
            length: fc.constant(length),
            index: fc.integer({ min: 0, max: length - 1 }),
          }),
        ),
        ({ index, length }) => {
          expect(wrapIndex(index, length)).toBe(index);
        },
      ),
    );
  });
});
