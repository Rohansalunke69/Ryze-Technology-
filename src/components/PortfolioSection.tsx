/**
 * PortfolioSection — the "Featured Work" section.
 *
 * Renders the authored case studies as large, premium {@link CaseStudyCard}s.
 * At least two case studies are authored (Requirement 2.1) and each card shows
 * its project name, industry, a key metric, and a preview image (Requirement
 * 2.2). Cards activate to their detail/live URL (Requirement 2.5).
 *
 * Layout: a single column on Mobile_Viewport (Requirement 2.7) that expands to
 * a two-column grid of large cards on larger viewports.
 *
 * Empty state: when no case studies are available the section renders at least
 * two structural placeholder cards rather than collapsing, keeping the layout
 * intact (Requirement 2.3). The `items` prop defaults to the authored content
 * and can be overridden (e.g. with an empty array) to exercise that path.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */
import { useRef } from 'react';
import type { CaseStudy } from '@apptypes';
import { caseStudies } from '@content/portfolio';
import { useSectionEntrance } from '@hooks/useSectionEntrance';
import { CaseStudyCard } from './CaseStudyCard';

/** Heading copy for the section. */
const SECTION_HEADING = 'Featured Work';

/** Number of placeholder cards rendered when no case studies are available. */
const PLACEHOLDER_COUNT = 2;

export interface PortfolioSectionProps {
  /** Case studies to display; defaults to the authored content array. */
  items?: readonly CaseStudy[];
}

/**
 * The "Featured Work" section rendering case study cards in a responsive grid,
 * falling back to placeholder cards when no case studies are available.
 */
export function PortfolioSection({
  items = caseStudies,
}: PortfolioSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasEntered = useSectionEntrance(sectionRef);

  const isEmpty = items.length === 0;

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="bg-navy-900 px-6 py-20 desktop:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <span
            aria-hidden="true"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
          >
            Selected projects
          </span>
          <h2
            id="portfolio-heading"
            className="mt-3 text-3xl font-bold text-body desktop:text-4xl"
          >
            {SECTION_HEADING}
          </h2>
        </header>

        {/* Single column on mobile (Req 2.7); two large cards across on desktop. */}
        <div className="mt-12 grid grid-cols-1 gap-8 desktop:mt-16 desktop:grid-cols-2 desktop:gap-10">
          {isEmpty
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
                <CaseStudyCard
                  key={`placeholder-${index}`}
                  caseStudy={null}
                  hasEntered={hasEntered}
                  index={index}
                />
              ))
            : items.map((caseStudy, index) => (
                <CaseStudyCard
                  key={caseStudy.id}
                  caseStudy={caseStudy}
                  hasEntered={hasEntered}
                  index={index}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

export default PortfolioSection;
