/**
 * Dev-time data-integrity assertions for shipped content collections.
 *
 * These guards enforce the invariants that the routing and timeline UI depend
 * on, so bad content fails fast in dev/build/test rather than rendering broken
 * routes or gapped process timelines in production.
 *
 * Invariants enforced:
 * - Slug uniqueness within every shipped collection (Property 17; Requirements
 *   29.3, 42.6).
 * - Process-step index contiguity for every service: indices must be exactly
 *   `1..n`, contiguous and strictly increasing (Property 18; Requirements 29.4,
 *   42.6).
 *
 * The functions here are pure and side-effect-free except for throwing an
 * `Error` when an invariant is violated. They never mutate their inputs and
 * never touch I/O, so they are safe to call from a build step, a dev-server
 * bootstrap, or a test.
 *
 * Usage:
 * ```ts
 * import { assertDataIntegrity } from '@data/assertIntegrity';
 *
 * if (import.meta.env.DEV) {
 *   assertDataIntegrity(); // throws on duplicate slugs / non-contiguous steps
 * }
 * ```
 *
 * Requirements: 29.3, 29.4, 42.6
 */
import { uniqueSlugs } from '@lib/slug';

import { caseStudies } from './caseStudies';
import { services } from './services';
import { blogPosts } from './blogPosts';

/** The minimal shape every slug-bearing entity must satisfy. */
interface HasSlug {
  readonly slug: string;
}

/** The minimal shape of a process step for contiguity checking. */
interface HasIndex {
  readonly index: number;
}

/**
 * Determine whether a list of process steps has indices that are exactly
 * `1..n`, contiguous and strictly increasing in order.
 *
 * @param steps - The ordered process steps to check. Read-only; never mutated.
 * @returns `true` when, for every position `i` (0-based), `steps[i].index === i + 1`;
 *   `false` otherwise. An empty list is vacuously contiguous and returns `true`.
 *
 * This is the pure predicate behind Property 18 (Requirement 29.4). It checks
 * the steps exactly as authored (no sorting), so it also catches steps stored
 * out of order, not just gaps or duplicates.
 */
export function processStepsContiguous(steps: readonly HasIndex[]): boolean {
  return steps.every((step, position) => step.index === position + 1);
}

/**
 * Find the slug that first repeats within a collection, if any.
 *
 * @returns the duplicate slug, or `undefined` when all slugs are distinct.
 */
function findDuplicateSlug<T extends HasSlug>(items: readonly T[]): string | undefined {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      return item.slug;
    }
    seen.add(item.slug);
  }
  return undefined;
}

/**
 * Assert that every shipped content collection satisfies the data-integrity
 * invariants. Pure and side-effect-free except for throwing.
 *
 * @throws {Error} when any collection has duplicate slugs (Property 17) or when
 *   any service's process steps are not contiguous `1..n` (Property 18). The
 *   error message names the offending collection/service and the specific
 *   problem so the content can be fixed quickly.
 *
 * Safe to call from a build step, dev-server bootstrap, or test. Returns
 * `void` on success.
 */
export function assertDataIntegrity(): void {
  const collections: ReadonlyArray<{ name: string; items: readonly HasSlug[] }> = [
    { name: 'caseStudies', items: caseStudies },
    { name: 'services', items: services },
    { name: 'blogPosts', items: blogPosts },
  ];

  // Property 17 — slug uniqueness across every shipped collection.
  for (const { name, items } of collections) {
    if (!uniqueSlugs(items)) {
      const duplicate = findDuplicateSlug(items);
      throw new Error(
        `Data integrity violation (Property 17): collection "${name}" has a duplicate slug "${duplicate}".`,
      );
    }
  }

  // Property 18 — process-step contiguity for every service.
  for (const service of services) {
    if (!processStepsContiguous(service.process)) {
      const actual = service.process.map((step) => step.index).join(', ');
      throw new Error(
        `Data integrity violation (Property 18): service "${service.slug}" has non-contiguous process step indices [${actual}]; expected 1..${service.process.length}.`,
      );
    }
  }
}
