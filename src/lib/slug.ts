/**
 * Slug resolution and data-integrity helpers.
 *
 * Pure, generic logic over any collection of slug-bearing entities. Targets of
 * property-based tests (Properties 15–17).
 * Requirements: 29.1, 29.2, 29.3
 */

/** The minimal shape every slug-bearing entity must satisfy. */
interface HasSlug {
  readonly slug: string;
}

/**
 * Resolve the entity in `items` whose `slug` exactly matches `slug`.
 *
 * @param items - The collection to search. Read-only; never mutated.
 * @param slug - The slug to look up (exact, case-sensitive match).
 * @returns The matching entity, or `undefined` when no entity matches.
 *
 * Behavior:
 * - For a collection with unique slugs, looking up an entity's own slug returns
 *   that exact entity (Property 15 — round-trip resolution; Requirement 29.1).
 * - For a slug not present in the collection, returns `undefined` without
 *   throwing and without returning a different entity (Property 16 — unknown
 *   slug; Requirement 29.2).
 *
 * When duplicate slugs exist, the first match in iteration order is returned;
 * collections are expected to satisfy {@link uniqueSlugs}, which guards against
 * this ambiguity.
 */
export function resolveBySlug<T extends HasSlug>(
  items: readonly T[],
  slug: string,
): T | undefined {
  return items.find((item) => item.slug === slug);
}

/**
 * Determine whether every entity in `items` has a distinct `slug`.
 *
 * @param items - The collection to check. Read-only; never mutated.
 * @returns `true` if all slugs are unique (including the empty collection),
 *   `false` if any slug appears more than once.
 *
 * Used as a data-integrity invariant on every shipped collection (Property 17;
 * Requirement 29.3) so ambiguous routes are caught before they ship.
 */
export function uniqueSlugs<T extends HasSlug>(items: readonly T[]): boolean {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      return false;
    }
    seen.add(item.slug);
  }
  return seen.size === items.length;
}
