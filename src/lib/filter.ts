/**
 * Pure, order-preserving filtering helpers for Portfolio (case studies) and Blog.
 *
 * Design: design.md "Animation Utility Signatures" + Correctness Properties P19–P24.
 * Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 7.5, 14.3, 10.2
 *
 * All functions are pure and never mutate their inputs. The relative order of
 * matching items always mirrors the input order ("order stability").
 */
import type {
  BlogCategory,
  BlogPost,
  CaseStudy,
  PortfolioCategory,
  ServiceKey,
} from '@app-types';

/**
 * Filter case studies by portfolio category.
 *
 * - `'all'` returns a shallow copy containing every input item (set identity).
 * - Otherwise returns only items whose `category === category`.
 *
 * Relative input order is preserved. The input is never mutated.
 */
export function filterCaseStudies(
  items: readonly CaseStudy[],
  category: PortfolioCategory | 'all',
): CaseStudy[] {
  if (category === 'all') {
    return items.slice();
  }
  return items.filter((item) => item.category === category);
}

/**
 * Filter blog posts by blog category.
 *
 * - `'all'` returns a shallow copy containing every input post (set identity).
 * - Otherwise returns only posts whose `category === category`.
 *
 * Relative input order is preserved. The input is never mutated.
 */
export function filterPostsByCategory(
  posts: readonly BlogPost[],
  category: BlogCategory | 'all',
): BlogPost[] {
  if (category === 'all') {
    return posts.slice();
  }
  return posts.filter((post) => post.category === category);
}

/**
 * Select case studies that used a given service (membership in `services[]`).
 *
 * Relative input order is preserved. The input is never mutated.
 */
export function getCaseStudiesByService(
  items: readonly CaseStudy[],
  service: ServiceKey,
): CaseStudy[] {
  return items.filter((item) => item.services.includes(service));
}
