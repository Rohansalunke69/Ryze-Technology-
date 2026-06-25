/**
 * ServicesSection — the "What We Build" section.
 *
 * Renders exactly four {@link ServiceCard}s, one per fixed category, from the
 * authored content (Requirements 3.1, 3.2). Cards lay out responsively: one
 * column on mobile, two on tablet, and four on desktop (Requirements 9.2, 9.3,
 * 9.4) via Tailwind responsive grid classes.
 *
 * The section reveals on scroll entrance (gated by {@link useSectionEntrance},
 * which short-circuits under reduced motion).
 */
import { useRef } from 'react';
import { useSectionEntrance } from '@hooks';
import { services } from '@content/services';
import { ServiceCard } from './ServiceCard';

export function ServicesSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasEntered = useSectionEntrance(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className={[
        'mx-auto max-w-7xl px-6 py-24 transition-opacity duration-700 desktop:py-32',
        hasEntered ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    >
      <header className="mb-16 max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
          What We Build
        </p>
        <h2
          id="services-heading"
          className="text-3xl font-bold text-body desktop:text-4xl"
        >
          Products engineered end to end
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.category} service={service} />
        ))}
      </div>
    </section>
  );
}

export default ServicesSection;
