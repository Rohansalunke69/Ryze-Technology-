/**
 * PortfolioListPage — `/portfolio` portfolio listing (task 14.3).
 *
 * Composition (design "/portfolio — Portfolio Listing"):
 *   Hero (title + count, mono eyebrow) →
 *   Filter bar (All | Websites | Mobile | Systems, animated active indicator) →
 *   responsive `CaseStudyCard` grid → CTA.
 *
 * The page renders a grid of `CaseStudyCard`s for the case-study collection
 * (Requirement 7.1) and a filter bar with the options All, Websites, Mobile,
 * and Systems (Requirement 7.2). Selecting a concrete category shows only the
 * matching case studies (Requirement 7.3); selecting All shows every case study
 * (Requirement 7.4). Filtering is performed by the pure, order-preserving
 * `filterCaseStudies` helper so the relative order of the collection is always
 * preserved (Requirement 7.5).
 *
 * Motion: the active filter is marked with a Framer Motion shared-layout
 * indicator (`layoutId`), and the grid re-flows with `AnimatePresence` + layout
 * animation when the filter changes. Under `prefers-reduced-motion` Framer
 * Motion automatically reduces these transforms, and the content (cards, count,
 * filter buttons) is always real, accessible DOM regardless of motion.
 *
 * _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { PortfolioCategory, SEOMeta } from '@app-types';
import { CaseStudyCard } from '@components/CaseStudyCard';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { caseStudies } from '@data/caseStudies';
import { siteMetadata } from '@data/siteMetadata';
import { filterCaseStudies } from '@lib/filter';

/** Per-route metadata. Canonical resolves to `/portfolio` on the site origin. */
const seo: SEOMeta = {
  title: 'Our Work',
  description:
    'Browse the products Ryze Technology has shipped — websites, mobile apps, and business systems built to work for years, not weeks.',
  canonical: `${siteMetadata.baseUrl}/portfolio`,
};

/** Filter option: a portfolio category, or `'all'` for the everything view. */
type FilterValue = PortfolioCategory | 'all';

/** The filter-bar options, in display order (Requirement 7.2). */
const FILTERS: ReadonlyArray<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'websites', label: 'Websites' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'systems', label: 'Systems' },
];

export function PortfolioListPage(): JSX.Element {
  const [active, setActive] = useState<FilterValue>('all');

  // Pure, order-preserving filter (Requirements 7.3, 7.4, 7.5). Memoized so the
  // list only recomputes when the active category changes.
  const filtered = useMemo(
    () => filterCaseStudies(caseStudies, active),
    [active],
  );

  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Hero: eyebrow + oversized title + count + lead. */}
        <section className="mx-auto w-full max-w-site px-6 pb-14 pt-[clamp(8.5rem,20vh,13rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              Selected work
            </p>
            <h1 className="mt-5 max-w-[14ch] font-display text-[clamp(2.75rem,9vw,8rem)] font-bold leading-[0.92] tracking-[-0.03em] text-mist-100">
              Our Work
            </h1>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-xl font-sans text-body-l text-mist-300">
                A selection of products we've designed and engineered to last —
                across the web, mobile, desktop, and the systems that run a
                business.
              </p>
              <p className="font-mono text-mono-eyebrow uppercase tracking-[0.2em] text-mist-300">
                {String(caseStudies.length).padStart(2, '0')}{' '}
                {caseStudies.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
          </AnimationWrapper>
        </section>

        {/* Filter bar with animated active indicator (Req 7.2). */}
        <section className="mx-auto w-full max-w-site px-6 pb-12 sm:px-10">
          <div
            role="group"
            aria-label="Filter projects by category"
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
                  onClick={() => setActive(filter.value)}
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
                      layoutId="portfolio-filter-active"
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

        {/* Responsive case-study grid (Req 7.1). Reflows on filter change. */}
        <section aria-labelledby="portfolio-grid-heading" className="mx-auto w-full max-w-site px-6 pb-24 sm:px-10">
          <h2 id="portfolio-grid-heading" className="sr-only">
            Projects
          </h2>
          <motion.ul
            layout
            className="grid list-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((caseStudy, index) => (
                <motion.li
                  key={caseStudy.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CaseStudyCard caseStudy={caseStudy} index={index} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </section>

        {/* Closing CTA. */}
        <CTA
          heading="Have a project in mind?"
          sub="Tell us what you're building. We'll help you ship something that lasts."
        />
      </main>
    </>
  );
}

export default PortfolioListPage;
