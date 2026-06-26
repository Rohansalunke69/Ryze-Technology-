/**
 * Pure related-entity helpers for case studies and blog posts.
 *
 * Design: design.md "Related Entities" + Correctness Properties P25–P26.
 * Requirements: 31.1, 31.2, 8.3, 15.3
 *
 * Both functions are pure and never mutate their inputs. Selection rules:
 * - The current entity is never included (matched by `slug`).
 * - When `current.relatedSlugs` is set, those slugs are preferred (resolved
 *   against the candidate pool, in the given order, de-duplicated).
 * - Otherwise candidates are ranked by overlap with `current` (shared services
 *   or tags plus a category match), highest overlap first, with input order as
 *   a stable tiebreak.
 * - When at least one candidate shares a service or category (P26 / Req 31.2),
 *   only entities sharing ≥1 service/category are returned.
 * - At most `limit` items are returned (P25 / Req 31.1).
 */
import type { BlogPost, CaseStudy, Slug } from '@app-types';

import { resolveBySlug } from './slug';

/** The minimal shape the related-entity engine needs from any entity. */
interface Relatable {
  readonly slug: Slug;
  readonly relatedSlugs?: readonly Slug[];
}

/**
 * Build the set of similarity tokens for an entity. Two entities "share"
 * something when their token sets intersect; the size of the intersection is
 * used to rank candidates. Namespacing tokens (e.g. `svc:`, `cat:`) keeps
 * services/tags from colliding with categories.
 */
type TokenizeFn<T> = (entity: T) => ReadonlySet<string>;

/**
 * Core, type-agnostic related-entity computation shared by the case-study and
 * blog-post helpers. Pure; never mutates `all`.
 */
function computeRelated<T extends Relatable>(
  all: readonly T[],
  current: T,
  limit: number,
  tokenize: TokenizeFn<T>,
): T[] {
  // Candidate pool: everything except the current entity (by slug).
  const candidates = all.filter((item) => item.slug !== current.slug);

  const currentTokens = tokenize(current);
  const overlapWith = (item: T): number => {
    const tokens = tokenize(item);
    let count = 0;
    for (const token of tokens) {
      if (currentTokens.has(token)) count += 1;
    }
    return count;
  };

  // Does any candidate share ≥1 service/category with current? (Req 31.2)
  const anyShares = candidates.some((item) => overlapWith(item) > 0);

  let ordered: T[];
  if (current.relatedSlugs && current.relatedSlugs.length > 0) {
    // Explicit overrides: resolve in declared order, skipping unknown slugs and
    // de-duplicating repeated references.
    const seen = new Set<Slug>();
    ordered = [];
    for (const slug of current.relatedSlugs) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      const match = resolveBySlug(candidates, slug);
      if (match) ordered.push(match);
    }
  } else {
    // Rank by overlap (descending) with input order as a stable tiebreak.
    ordered = candidates
      .map((item, index) => ({ item, index, score: overlapWith(item) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((entry) => entry.item);
  }

  // When any candidate is relevant, only relevant entities may be returned.
  const relevant = anyShares
    ? ordered.filter((item) => overlapWith(item) > 0)
    : ordered;

  return relevant.slice(0, Math.max(0, limit));
}

/** Similarity tokens for a case study: its services and its category. */
function caseStudyTokens(item: CaseStudy): ReadonlySet<string> {
  const tokens = new Set<string>();
  for (const service of item.services) tokens.add(`svc:${service}`);
  tokens.add(`cat:${item.category}`);
  return tokens;
}

/** Similarity tokens for a blog post: its tags and its category. */
function blogPostTokens(item: BlogPost): ReadonlySet<string> {
  const tokens = new Set<string>();
  for (const tag of item.tags) tokens.add(`tag:${tag}`);
  tokens.add(`cat:${item.category}`);
  return tokens;
}

/**
 * Select case studies related to `current`.
 *
 * Prefers `current.relatedSlugs` when present; otherwise ranks the remaining
 * case studies by shared services / category overlap. Excludes `current` and
 * returns at most `limit` items. When any candidate shares ≥1 service or
 * category, only sharing case studies are returned.
 *
 * @param all - The full collection. Read-only; never mutated.
 * @param current - The case study to find relations for.
 * @param limit - Maximum number of results (default 3).
 */
export function getRelatedCaseStudies(
  all: readonly CaseStudy[],
  current: CaseStudy,
  limit = 3,
): CaseStudy[] {
  return computeRelated(all, current, limit, caseStudyTokens);
}

/**
 * Select blog posts related to `current`.
 *
 * Prefers `current.relatedSlugs` when present; otherwise ranks the remaining
 * posts by shared category / tags overlap. Excludes `current` and returns at
 * most `limit` items. When any candidate shares ≥1 category or tag, only
 * sharing posts are returned.
 *
 * @param all - The full collection. Read-only; never mutated.
 * @param current - The post to find relations for.
 * @param limit - Maximum number of results (default 3).
 */
export function getRelatedPosts(
  all: readonly BlogPost[],
  current: BlogPost,
  limit = 3,
): BlogPost[] {
  return computeRelated(all, current, limit, blogPostTokens);
}
