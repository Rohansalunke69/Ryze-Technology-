import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { ViewportCategory } from '@apptypes';
import {
  resolveViewportPrecedence,
  selectColumnCount,
  selectViewportCategory,
} from './viewport';

const CATEGORIES: ViewportCategory[] = ['mobile', 'tablet', 'desktop'];

/** Generator over the three viewport categories. */
const categoryArb = fc.constantFrom<ViewportCategory>(...CATEGORIES);

describe('selectColumnCount', () => {
  // Feature: ryze-portfolio-website, Property 1: selectColumnCount returns 1 for mobile, 2 for tablet, 4 for desktop and never any other value
  // Validates: Requirements 2.7, 9.2, 9.3, 9.4
  it('returns 1 for mobile, 2 for tablet, 4 for desktop and never any other value', () => {
    const expected: Record<ViewportCategory, number> = {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    };

    fc.assert(
      fc.property(categoryArb, (category) => {
        const count = selectColumnCount(category);
        expect(count).toBe(expected[category]);
        expect([1, 2, 4]).toContain(count);
      }),
      { numRuns: 100 },
    );
  });
});

describe('selectViewportCategory', () => {
  // Feature: ryze-portfolio-website, Property 2: selectViewportCategory returns mobile when width < 768, tablet when 768 <= width < 1024, desktop when width >= 1024, monotonic across boundaries
  // Validates: Requirements 9.5
  it('partitions the width axis and is monotonic across boundaries', () => {
    const rank: Record<ViewportCategory, number> = {
      mobile: 0,
      tablet: 1,
      desktop: 2,
    };

    // Widths spanning the boundaries plus arbitrary non-negative values.
    const widthArb = fc.oneof(
      fc.constantFrom(0, 767, 768, 1023, 1024),
      fc.nat({ max: 5000 }),
      fc.float({ min: 0, max: 5000, noNaN: true }),
    );

    fc.assert(
      fc.property(widthArb, (width) => {
        const category = selectViewportCategory(width);

        if (width < 768) {
          expect(category).toBe('mobile');
        } else if (width < 1024) {
          expect(category).toBe('tablet');
        } else {
          expect(category).toBe('desktop');
        }
      }),
      { numRuns: 100 },
    );

    // Monotonicity: increasing width never moves to a smaller category.
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5000, noNaN: true }),
        fc.float({ min: 0, max: 5000, noNaN: true }),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          expect(rank[selectViewportCategory(lo)]).toBeLessThanOrEqual(
            rank[selectViewportCategory(hi)],
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('resolveViewportPrecedence', () => {
  // Feature: ryze-portfolio-website, Property 3: resolveViewportPrecedence returns the smallest category present under mobile < tablet < desktop
  // Validates: Requirements 9.5
  it('returns the smallest category present under mobile < tablet < desktop', () => {
    const rank: Record<ViewportCategory, number> = {
      mobile: 0,
      tablet: 1,
      desktop: 2,
    };

    const matchesArb = fc.oneof(
      // Non-empty subsets of the category set.
      fc.subarray(CATEGORIES, { minLength: 1 }),
      // Arbitrary non-empty multisets with possible repeats and arbitrary order.
      fc.array(categoryArb, { minLength: 1, maxLength: 6 }),
    );

    fc.assert(
      fc.property(matchesArb, (matches) => {
        const result = resolveViewportPrecedence(matches);
        const expected = matches.reduce((smallest, current) =>
          rank[current] < rank[smallest] ? current : smallest,
        );
        expect(result).toBe(expected);
        // The result must be present in the input and be the minimum rank.
        expect(matches).toContain(result);
        const minRank = Math.min(...matches.map((c) => rank[c]));
        expect(rank[result]).toBe(minRank);
      }),
      { numRuns: 100 },
    );
  });
});
