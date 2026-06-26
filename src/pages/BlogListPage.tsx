/**
 * BlogListPage — `/blog` blog listing (task 14.17).
 *
 * Composition (design "9. /blog — Listing"):
 *   Hero (title + count, mono eyebrow) →
 *   Category filter (All | Engineering | Design | Process | Company, animated
 *   active indicator) → responsive `BlogCard` grid → Pagination → CTA.
 *
 * The page renders a grid of `BlogCard`s — each showing cover image, category,
 * title, excerpt, date, and reading time (Requirement 14.1) — and a category
 * filter offering every `BlogCategory` value plus an All option (Requirement
 * 14.2). Selecting a concrete category shows only the matching posts while
 * preserving input order, and All shows every post (Requirement 14.3); the
 * pure, order-preserving `filterPostsByCategory` helper performs the filtering.
 *
 * The filtered posts are paginated with the pure `paginate` helper (Requirement
 * 14.4). Changing the page renders that page's items and enables the
 * previous/next controls strictly according to the page's `hasPrev`/`hasNext`
 * flags (Requirement 14.5).
 *
 * Motion: the active filter is marked with a Framer Motion shared-layout
 * indicator (`layoutId`), and the grid re-flows with `AnimatePresence` + layout
 * animation when the filter or page changes. Under `prefers-reduced-motion`
 * Framer Motion reduces these transforms; the content is always real,
 * accessible DOM regardless of motion.
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { BlogCategory, SEOMeta } from '@app-types';
import { SectionHeader } from '@components/SectionHeader';
import { BlogCard } from '@components/BlogCard';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { blogPosts } from '@data/blogPosts';
import { siteMetadata } from '@data/siteMetadata';
import { filterPostsByCategory } from '@lib/filter';
import { paginate } from '@lib/paginate';

/** Per-route metadata. Canonical resolves to `/blog` on the site origin. */
const seo: SEOMeta = {
  title: 'Blog',
  description:
    'Field notes from the Ryze Technology studio — engineering, design, and process lessons from building products that work for years.',
  canonical: `${siteMetadata.baseUrl}/blog`,
};

/** Filter option: a blog category, or `'all'` for the everything view. */
type FilterValue = BlogCategory | 'all';

/** The filter-bar options, in display order (Requirement 14.2). */
const FILTERS: ReadonlyArray<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'process', label: 'Process' },
  { value: 'company', label: 'Company' },
];

/** Posts shown per page. Drives the pure `paginate` helper (Req 14.4). */
const POSTS_PER_PAGE = 6;

export function BlogListPage(): JSX.Element {
  const [active, setActive] = useState<FilterValue>('all');
  const [page, setPage] = useState(1);

  // Pure, order-preserving filter (Requirements 14.3). Memoized so the list
  // only recomputes when the active category changes.
  const filtered = useMemo(
    () => filterPostsByCategory(blogPosts, active),
    [active],
  );

  // Pure pagination of the filtered posts (Requirements 14.4, 14.5). `paginate`
  // clamps the requested page into range, so `result.page` is authoritative.
  const result = useMemo(
    () => paginate(filtered, page, POSTS_PER_PAGE),
    [filtered, page],
  );

  // Selecting a filter resets to the first page so the visitor never lands on
  // an out-of-range page for the newly filtered, possibly shorter, collection.
  function selectFilter(value: FilterValue): void {
    setActive(value);
    setPage(1);
  }

  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Hero: eyebrow + title + count (design "/blog" hero). */}
        <section className="px-6 pb-12 pt-32">
          <AnimationWrapper variant="rise">
            <SectionHeader as="h1" eyebrow="Blog" title="Blog" />
            <p className="mt-6 font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'article' : 'articles'}
            </p>
          </AnimationWrapper>
        </section>

        {/* Category filter with animated active indicator (Req 14.2). */}
        <section className="px-6 pb-12">
          <div
            role="group"
            aria-label="Filter posts by category"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const isActive = active === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  data-cursor="link"
                  aria-pressed={isActive}
                  onClick={() => selectFilter(filter.value)}
                  className={[
                    'relative rounded-full px-5 py-2',
                    'font-mono text-sm uppercase tracking-widest',
                    'transition-colors duration-200',
                    isActive
                      ? 'text-ink-900'
                      : 'text-mist-300 hover:text-mist-100',
                  ].join(' ')}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="blog-filter-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-pulse-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Responsive blog-post grid (Req 14.1). Reflows on filter/page change. */}
        <section aria-labelledby="blog-grid-heading" className="px-6 pb-12">
          <h2 id="blog-grid-heading" className="sr-only">
            Articles
          </h2>
          <motion.ul
            layout
            className="grid list-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {result.items.map((post, index) => (
                <motion.li
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BlogCard post={post} index={index} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </section>

        {/* Pagination controls (Req 14.4, 14.5). Prev/next reflect hasPrev/hasNext. */}
        <nav aria-label="Pagination" className="px-6 pb-24">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              data-cursor="link"
              onClick={() => setPage(result.page - 1)}
              disabled={!result.hasPrev}
              className={[
                'rounded-full px-5 py-2',
                'font-mono text-sm uppercase tracking-widest',
                'ring-1 ring-ink-600/60 transition-colors duration-200',
                result.hasPrev
                  ? 'text-mist-100 hover:text-pulse-500'
                  : 'cursor-not-allowed text-mist-300/40',
              ].join(' ')}
            >
              Previous
            </button>

            <p
              aria-live="polite"
              className="font-mono text-sm uppercase tracking-widest text-mist-300"
            >
              Page {result.page} of {result.totalPages}
            </p>

            <button
              type="button"
              data-cursor="link"
              onClick={() => setPage(result.page + 1)}
              disabled={!result.hasNext}
              className={[
                'rounded-full px-5 py-2',
                'font-mono text-sm uppercase tracking-widest',
                'ring-1 ring-ink-600/60 transition-colors duration-200',
                result.hasNext
                  ? 'text-mist-100 hover:text-pulse-500'
                  : 'cursor-not-allowed text-mist-300/40',
              ].join(' ')}
            >
              Next
            </button>
          </div>
        </nav>

        {/* Closing CTA. */}
        <CTA
          heading="Have a project in mind?"
          sub="Tell us what you're building. We'll help you ship something that lasts."
        />
      </main>
    </>
  );
}

export default BlogListPage;
