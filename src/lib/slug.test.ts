/**
 * Property-based tests for slug resolution (Properties 15–17).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 29.1, 29.2, 29.3
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { resolveBySlug, uniqueSlugs } from './slug';

/** A non-empty slug string (any characters, exact-match semantics). */
const slugArb = fc.string({ minLength: 1, maxLength: 24 });

/** An entity with a slug plus a payload field to verify identity, not equality. */
interface Entity {
  readonly slug: string;
  readonly id: number;
}

/**
 * A collection of entities with guaranteed-unique slugs.
 *
 * We generate a set of distinct slug strings, then attach a unique `id` to each
 * so that two entities are never structurally equal — this lets the round-trip
 * property assert reference identity meaningfully.
 */
const uniqueCollectionArb: fc.Arbitrary<Entity[]> = fc
  .uniqueArray(slugArb, { minLength: 1, maxLength: 50 })
  .map((slugs) => slugs.map((slug, id) => ({ slug, id })));

describe('resolveBySlug', () => {
  // Feature: ryze-technology-website, Property 15: slug round-trip resolution
  // Validates: Requirements 29.1
  it('resolves each entity in a unique-slug collection to itself', () => {
    fc.assert(
      fc.property(uniqueCollectionArb, (items) => {
        for (const expected of items) {
          // Must return the exact same reference, not merely an equal value.
          expect(resolveBySlug(items, expected.slug)).toBe(expected);
        }
      }),
    );
  });

  // Feature: ryze-technology-website, Property 16: unknown slug
  // Validates: Requirements 29.2
  it('returns undefined for an absent slug without throwing', () => {
    fc.assert(
      fc.property(uniqueCollectionArb, slugArb, (items, candidate) => {
        // Constrain to slugs that are genuinely absent from the collection.
        fc.pre(!items.some((item) => item.slug === candidate));
        expect(resolveBySlug(items, candidate)).toBeUndefined();
      }),
    );
  });
});

describe('uniqueSlugs', () => {
  // Feature: ryze-technology-website, Property 17: slug uniqueness invariant
  // Validates: Requirements 29.3
  it('reports uniqueness correctly for generated collections', () => {
    fc.assert(
      fc.property(fc.array(slugArb, { maxLength: 50 }), (slugs) => {
        const items = slugs.map((slug, id) => ({ slug, id }));
        const expected = new Set(slugs).size === slugs.length;
        expect(uniqueSlugs(items)).toBe(expected);
      }),
    );
  });
});
