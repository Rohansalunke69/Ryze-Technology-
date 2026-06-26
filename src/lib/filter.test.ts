/**
 * Property-based tests for filtering helpers (Properties 19–24).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 7.5, 14.3, 10.2
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import type {
  BlogCategory,
  BlogPost,
  CaseStudy,
  PortfolioCategory,
  ServiceKey,
} from '@app-types';

import {
  filterCaseStudies,
  filterPostsByCategory,
  getCaseStudiesByService,
} from './filter';

// ---------- Domain constants ----------
const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  'websites',
  'mobile',
  'systems',
];

const BLOG_CATEGORIES: readonly BlogCategory[] = [
  'engineering',
  'design',
  'process',
  'company',
];

const SERVICE_KEYS: readonly ServiceKey[] = [
  'websites',
  'mobile-apps',
  'desktop',
  'business-systems',
];

// ---------- Minimal arbitraries ----------
// We only need the fields the filters touch (category, services, slug). A unique
// `__idx` tag lets us assert reference identity and order without full objects.
type TaggedCaseStudy = CaseStudy & { __idx: number };
type TaggedBlogPost = BlogPost & { __idx: number };

const portfolioCategoryArb = fc.constantFrom(...PORTFOLIO_CATEGORIES);
const blogCategoryArb = fc.constantFrom(...BLOG_CATEGORIES);

/** A list of case-study stand-ins with unique indices for identity/order checks. */
const caseStudiesArb: fc.Arbitrary<TaggedCaseStudy[]> = fc
  .array(
    fc.record({
      slug: fc.string({ minLength: 1, maxLength: 12 }),
      category: portfolioCategoryArb,
      services: fc.uniqueArray(fc.constantFrom(...SERVICE_KEYS), {
        maxLength: SERVICE_KEYS.length,
      }),
    }),
    { maxLength: 40 },
  )
  .map((rows) =>
    rows.map((row, __idx) => ({ ...row, __idx }) as unknown as TaggedCaseStudy),
  );

/** A list of blog-post stand-ins with unique indices for identity/order checks. */
const blogPostsArb: fc.Arbitrary<TaggedBlogPost[]> = fc
  .array(
    fc.record({
      slug: fc.string({ minLength: 1, maxLength: 12 }),
      category: blogCategoryArb,
    }),
    { maxLength: 40 },
  )
  .map((rows) =>
    rows.map((row, __idx) => ({ ...row, __idx }) as unknown as TaggedBlogPost),
  );

const serviceArb = fc.constantFrom(...SERVICE_KEYS);

describe('filterCaseStudies', () => {
  // Feature: ryze-technology-website, Property 19: filter subset
  // Validates: Requirements 30.1
  it('returns only items drawn from the input (never invents items)', () => {
    fc.assert(
      fc.property(
        caseStudiesArb,
        fc.constantFrom<'all' | PortfolioCategory>('all', ...PORTFOLIO_CATEGORIES),
        (items, category) => {
          const result = filterCaseStudies(items, category);
          for (const item of result) {
            // Reference identity: each result element is an actual input element.
            expect(items).toContain(item);
          }
        },
      ),
    );
  });

  // Feature: ryze-technology-website, Property 20: filter predicate soundness
  // Validates: Requirements 30.2
  it('includes exactly the items whose category matches (c != all)', () => {
    fc.assert(
      fc.property(caseStudiesArb, portfolioCategoryArb, (items, category) => {
        const result = filterCaseStudies(items, category);
        // Every result item matches the requested category.
        for (const item of result) {
          expect(item.category).toBe(category);
        }
        // No item left outside the result matches the requested category.
        const resultSet = new Set(result);
        for (const item of items) {
          if (!resultSet.has(item)) {
            expect(item.category).not.toBe(category);
          }
        }
      }),
    );
  });

  // Feature: ryze-technology-website, Property 21: filter 'all' identity
  // Validates: Requirements 30.3
  it("'all' returns exactly the same elements as the input", () => {
    fc.assert(
      fc.property(caseStudiesArb, (items) => {
        const result = filterCaseStudies(items, 'all');
        // Same elements, same multiplicity, and not the same array reference.
        expect(result).not.toBe(items);
        expect(result).toEqual(items);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 22: filter order stability
  // Validates: Requirements 30.4, 7.5
  it('preserves the relative order of the input (result is a subsequence)', () => {
    fc.assert(
      fc.property(
        caseStudiesArb,
        fc.constantFrom<'all' | PortfolioCategory>('all', ...PORTFOLIO_CATEGORIES),
        (items, category) => {
          const result = filterCaseStudies(items, category);
          const indices = result.map((item) => item.__idx);
          const sorted = [...indices].sort((a, b) => a - b);
          expect(indices).toEqual(sorted);
        },
      ),
    );
  });

  // Feature: ryze-technology-website, Property 23: filter partition completeness
  // Validates: Requirements 30.5
  it('partitions all items across the concrete categories exactly once', () => {
    fc.assert(
      fc.property(caseStudiesArb, (items) => {
        const seen = new Set<TaggedCaseStudy>();
        let total = 0;
        for (const category of PORTFOLIO_CATEGORIES) {
          for (const item of filterCaseStudies(items, category)) {
            // Each item appears in exactly one concrete category's result.
            expect(seen.has(item)).toBe(false);
            seen.add(item);
            total += 1;
          }
        }
        expect(total).toBe(items.length);
        expect(seen.size).toBe(items.length);
        for (const item of items) {
          expect(seen.has(item)).toBe(true);
        }
      }),
    );
  });
});

describe('getCaseStudiesByService', () => {
  // Feature: ryze-technology-website, Property 19: filter subset
  // Validates: Requirements 10.2
  it('returns only items that include the service, preserving order', () => {
    fc.assert(
      fc.property(caseStudiesArb, serviceArb, (items, service) => {
        const result = getCaseStudiesByService(items, service);
        const resultSet = new Set(result);
        // Subset + predicate soundness.
        for (const item of result) {
          expect(items).toContain(item);
          expect(item.services.includes(service)).toBe(true);
        }
        // Nothing matching is omitted.
        for (const item of items) {
          if (!resultSet.has(item)) {
            expect(item.services.includes(service)).toBe(false);
          }
        }
        // Order stability.
        const indices = result.map((item) => item.__idx);
        expect(indices).toEqual([...indices].sort((a, b) => a - b));
      }),
    );
  });
});

describe('filterPostsByCategory', () => {
  // Feature: ryze-technology-website, Property 24: blog filter parity
  // Validates: Requirements 14.3
  it('satisfies Properties 19–23 analogously for blog posts', () => {
    fc.assert(
      fc.property(
        blogPostsArb,
        fc.constantFrom<'all' | BlogCategory>('all', ...BLOG_CATEGORIES),
        (posts, category) => {
          const result = filterPostsByCategory(posts, category);

          // P19 subset.
          for (const post of result) {
            expect(posts).toContain(post);
          }

          // P22 order stability.
          const indices = result.map((post) => post.__idx);
          expect(indices).toEqual([...indices].sort((a, b) => a - b));

          if (category === 'all') {
            // P21 'all' identity.
            expect(result).not.toBe(posts);
            expect(result).toEqual(posts);
          } else {
            // P20 predicate soundness.
            const resultSet = new Set(result);
            for (const post of result) {
              expect(post.category).toBe(category);
            }
            for (const post of posts) {
              if (!resultSet.has(post)) {
                expect(post.category).not.toBe(category);
              }
            }
          }
        },
      ),
    );

    // P23 partition completeness for blog posts.
    fc.assert(
      fc.property(blogPostsArb, (posts) => {
        const seen = new Set<TaggedBlogPost>();
        let total = 0;
        for (const category of BLOG_CATEGORIES) {
          for (const post of filterPostsByCategory(posts, category)) {
            expect(seen.has(post)).toBe(false);
            seen.add(post);
            total += 1;
          }
        }
        expect(total).toBe(posts.length);
        expect(seen.size).toBe(posts.length);
      }),
    );
  });
});
