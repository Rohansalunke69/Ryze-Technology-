/**
 * DifferentiatorsSection — the "Why Choose Ryze" section.
 *
 * Renders exactly four `DifferentiatorItem` entries sourced from the content
 * layer, each showing its fixed title and supporting description
 * (Requirements 4.1, 4.2, 4.3). The section uses a premium 2x2 grid on desktop
 * that collapses to a single column on mobile, with generous whitespace, a
 * cyan accent marker per item, and a subtle scroll-gated entrance animation
 * driven by `useSectionEntrance`.
 */
import { useRef } from 'react';
import type { Differentiator } from '@apptypes';
import { differentiators } from '@content/differentiators';
import { useSectionEntrance } from '@hooks/useSectionEntrance';

/** Heading copy for the section. */
const SECTION_HEADING = 'Why Choose Ryze';

export interface DifferentiatorItemProps {
  /** The differentiator to render. */
  differentiator: Differentiator;
  /** Whether the parent section has entered the viewport (gates the animation). */
  hasEntered: boolean;
  /** Stagger index used to offset the entrance transition. */
  index: number;
}

/**
 * A single differentiator card: a cyan accent marker, the title (`h3`), and the
 * supporting description.
 */
export function DifferentiatorItem({
  differentiator,
  hasEntered,
  index,
}: DifferentiatorItemProps): JSX.Element {
  const { title, description } = differentiator;

  return (
    <article
      data-testid="differentiator-item"
      className={[
        'group relative rounded-2xl border border-white/5 bg-navy-800/60 p-8 desktop:p-10',
        'transition-all duration-700 ease-out will-change-transform',
        'hover:-translate-y-1 hover:border-accent/30 hover:bg-navy-700/60',
        hasEntered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
      ].join(' ')}
      style={{ transitionDelay: hasEntered ? `${index * 90}ms` : '0ms' }}
    >
      {/* Cyan accent marker */}
      <span
        aria-hidden="true"
        className="mb-6 block h-1 w-10 rounded-full bg-accent transition-all duration-300 group-hover:w-16"
      />
      <h3 className="text-xl font-semibold text-accent desktop:text-2xl">
        {title}
      </h3>
      <p className="mt-4 text-body-mobile text-body-muted desktop:text-body-desktop">
        {description}
      </p>
    </article>
  );
}

/**
 * The "Why Choose Ryze" section rendering exactly four differentiators in a
 * responsive grid.
 */
export function DifferentiatorsSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasEntered = useSectionEntrance(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="differentiators"
      aria-labelledby="differentiators-heading"
      className="bg-navy-900 px-6 py-20 desktop:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <span
            aria-hidden="true"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
          >
            Why Ryze
          </span>
          <h2
            id="differentiators-heading"
            className="mt-3 text-3xl font-bold text-body desktop:text-4xl"
          >
            {SECTION_HEADING}
          </h2>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 desktop:mt-16 desktop:grid-cols-2 desktop:gap-8">
          {differentiators.map((differentiator, index) => (
            <DifferentiatorItem
              key={differentiator.title}
              differentiator={differentiator}
              hasEntered={hasEntered}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DifferentiatorsSection;
