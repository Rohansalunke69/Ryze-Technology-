/**
 * Property-based tests for related-entity helpers (Properties 25–26).
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 31.1, 31.2
 *
 * Arbitraries are intentionally minimal: they generate only the fields the
 * helpers actually read (slug, category, services/tags, optional relatedSlugs)
 * with small token pools so that overlap between entities occurs frequently.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import type { BlogPost, CaseStudy } from '@app-types';

import { getRelatedCaseStudies, getRelatedPosts } from './related';

// ---------- Minimal entity shapes ----------

interface MiniCase {
  slug: string;
  category: string;
  services: string[];
  relatedSlugs?: string[];
}

interface MiniPost {
  slug: string;
  category: string;
  tags: string[];
  relatedSlugs?: string[];
}

const CATEGORIES = ['web', 'mobile', 'brand', 'desktop'] as const;
const SERVICES = ['development', 'design', 'digital-marketing', 'sales-strategy', 'maintenance-support'] as const;
const TAGS = ['react', 'perf', 'design', 'webgl', 'a11y'] as const;

const slugArb = fc.string({ minLength: 1, maxLength: 8 });

const caseEntityArb: fc.Arbitrary<MiniCase> = fc.record({
  slug: slugArb,
  category: fc.constantFrom(...CATEGORIES),
  services: fc.uniqueArray(fc.constantFrom(...SERVICES), { maxLength: SERVICES.length }),
});

const postEntityArb: fc.Arbitrary<MiniPost> = fc.record({
  slug: slugArb,
  category: fc.constantFrom(...CATEGORIES),
  tags: fc.uniqueArray(fc.constantFrom(...TAGS), { maxLength: TAGS.length }),
});

/**
 * Build a scenario arbitrary for a given entity arbitrary: a collection with
 * unique slugs, a `current` chosen from it (optionally carrying relatedSlugs
 * that reference other members), and a limit.
 */
function scenarioArb<T extends { slug: string }>(
  entityArb: fc.Arbitrary<T>,
): fc.Arbitrary<{ items: T[]; current: T; limit: number }> {
  return fc
    .uniqueArray(entityArb, { minLength: 1, maxLength: 10, selector: (e) => e.slug })
    .chain((list) =>
      fc
        .record({
          currentIndex: fc.nat({ max: list.length - 1 }),
          limit: fc.integer({ min: 0, max: 6 }),
        })
        .chain(({ currentIndex, limit }) => {
          const otherSlugs = list
            .filter((_, i) => i !== currentIndex)
            .map((e) => e.slug);
          const relatedArb =
            otherSlugs.length > 0
              ? fc.option(
                  fc.uniqueArray(fc.constantFrom(...otherSlugs), {
                    maxLength: otherSlugs.length,
                  }),
                  { nil: undefined },
                )
              : fc.constant<string[] | undefined>(undefined);
          return relatedArb.map((relatedSlugs) => {
            const items = list.map((e, i) =>
              i === currentIndex ? { ...e, relatedSlugs } : e,
            );
            return { items, current: items[currentIndex]!, limit };
          });
        }),
    );
}

const caseScenario = scenarioArb(caseEntityArb);
const postScenario = scenarioArb(postEntityArb);

/** True when two case studies share ≥1 service or the same category. */
function caseShares(a: MiniCase, b: MiniCase): boolean {
  return a.category === b.category || a.services.some((s) => b.services.includes(s));
}

/** True when two posts share ≥1 tag or the same category. */
function postShares(a: MiniPost, b: MiniPost): boolean {
  return a.category === b.category || a.tags.some((t) => b.tags.includes(t));
}

describe('getRelatedCaseStudies / getRelatedPosts', () => {
  // Feature: ryze-technology-website, Property 25: related excludes self & respects limit
  // Validates: Requirements 31.1
  it('never includes the current entity and never exceeds the limit', () => {
    fc.assert(
      fc.property(caseScenario, ({ items, current, limit }) => {
        const result = getRelatedCaseStudies(items as unknown as CaseStudy[], current as unknown as CaseStudy, limit);
        expect(result.length).toBeLessThanOrEqual(limit);
        expect(result.every((r) => r.slug !== current.slug)).toBe(true);
      }),
    );

    fc.assert(
      fc.property(postScenario, ({ items, current, limit }) => {
        const result = getRelatedPosts(items as unknown as BlogPost[], current as unknown as BlogPost, limit);
        expect(result.length).toBeLessThanOrEqual(limit);
        expect(result.every((r) => r.slug !== current.slug)).toBe(true);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 26: related relevance
  // Validates: Requirements 31.2
  it('returns only entities sharing a service/category when any candidate does', () => {
    fc.assert(
      fc.property(caseScenario, ({ items, current, limit }) => {
        const result = getRelatedCaseStudies(items as unknown as CaseStudy[], current as unknown as CaseStudy, limit);
        const anyCandidateShares = items.some(
          (e) => e.slug !== current.slug && caseShares(e, current),
        );
        if (anyCandidateShares) {
          expect(result.every((r) => caseShares(r as unknown as MiniCase, current))).toBe(true);
        }
      }),
    );

    fc.assert(
      fc.property(postScenario, ({ items, current, limit }) => {
        const result = getRelatedPosts(items as unknown as BlogPost[], current as unknown as BlogPost, limit);
        const anyCandidateShares = items.some(
          (e) => e.slug !== current.slug && postShares(e, current),
        );
        if (anyCandidateShares) {
          expect(result.every((r) => postShares(r as unknown as MiniPost, current))).toBe(true);
        }
      }),
    );
  });
});
