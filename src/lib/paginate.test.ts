/**
 * Property-based tests for the pagination helper (Properties 27–31).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 14.4, 14.5
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { paginate } from './paginate';

// A collection of items; values may repeat — pagination must not depend on
// uniqueness. Length 0..60 exercises empty and multi-page scenarios.
const itemsArb = fc.array(fc.integer(), { maxLength: 60 });

// Per-page sizes are >= 1 per the property preconditions (∀ perPage >= 1).
const perPageArb = fc.integer({ min: 1, max: 20 });

// Requested pages intentionally span out-of-range values (negative, zero, and
// beyond totalPages) to exercise clamping.
const pageArb = fc.integer({ min: -20, max: 200 });

const expectedTotalPages = (total: number, perPage: number): number =>
  Math.max(1, Math.ceil(total / perPage));

describe('paginate', () => {
  // Feature: ryze-technology-website, Property 27: pagination page bounds
  // Validates: Requirement 32.1
  it('clamps the returned page into [1, totalPages]', () => {
    fc.assert(
      fc.property(itemsArb, pageArb, perPageArb, (items, page, perPage) => {
        const result = paginate(items, page, perPage);
        expect(result.page).toBeGreaterThanOrEqual(1);
        expect(result.page).toBeLessThanOrEqual(result.totalPages);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 28: pagination coverage / no loss
  // Validates: Requirement 32.2
  it('reproduces all items in order across pages 1..totalPages (no dupes/omissions)', () => {
    fc.assert(
      fc.property(itemsArb, perPageArb, (items, perPage) => {
        const totalPages = expectedTotalPages(items.length, perPage);
        const reassembled: number[] = [];
        for (let p = 1; p <= totalPages; p += 1) {
          reassembled.push(...paginate(items, p, perPage).items);
        }
        expect(reassembled).toEqual([...items]);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 29: pagination page size
  // Validates: Requirement 32.3
  it('fills every page except the last with exactly perPage; last holds 1..perPage', () => {
    fc.assert(
      fc.property(itemsArb, perPageArb, (items, perPage) => {
        // The empty-collection case yields a single empty page (covered by P31).
        if (items.length === 0) return;

        const totalPages = expectedTotalPages(items.length, perPage);
        for (let p = 1; p <= totalPages; p += 1) {
          const { items: pageItems } = paginate(items, p, perPage);
          if (p < totalPages) {
            expect(pageItems.length).toBe(perPage);
          } else {
            expect(pageItems.length).toBeGreaterThanOrEqual(1);
            expect(pageItems.length).toBeLessThanOrEqual(perPage);
          }
        }
      }),
    );
  });

  // Feature: ryze-technology-website, Property 30: pagination flag correctness
  // Validates: Requirement 32.4
  it('sets hasPrev === (page > 1) and hasNext === (page < totalPages)', () => {
    fc.assert(
      fc.property(itemsArb, pageArb, perPageArb, (items, page, perPage) => {
        const result = paginate(items, page, perPage);
        expect(result.hasPrev).toBe(result.page > 1);
        expect(result.hasNext).toBe(result.page < result.totalPages);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 31: totalPages formula
  // Validates: Requirement 32.5
  it('computes totalPages === max(1, ceil(total / perPage))', () => {
    fc.assert(
      fc.property(itemsArb, pageArb, perPageArb, (items, page, perPage) => {
        const result = paginate(items, page, perPage);
        expect(result.total).toBe(items.length);
        expect(result.totalPages).toBe(
          expectedTotalPages(items.length, perPage),
        );
      }),
    );
  });
});
