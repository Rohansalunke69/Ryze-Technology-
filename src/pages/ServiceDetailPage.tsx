/**
 * ServiceDetailPage — `/services/:slug` (task 14.9).
 *
 * Resolves the `:slug` route param (a `ServiceKey`) against the `services`
 * collection via `resolveBySlug`. When a Service is found the page renders, in
 * order: Breadcrumb → hero (icon, name, tagline) → "What we do" → Features
 * (staggered grid) → Related case studies (`getCaseStudiesByService`) → Tech
 * stack → Process timeline → FAQ (accessible accordion) → CTA
 * (Requirements 10.1, 10.2, 10.3). When the slug resolves to no Service the page
 * renders an in-route not-found state with a link back to `/services` and a
 * `noIndex` document so the dead URL stays out of search results
 * (Requirement 10.4).
 *
 * The FAQ accordion is keyboard-operable: each question is a native `<button>`
 * carrying `aria-expanded` and `aria-controls`, and each answer is a region
 * labelled by its trigger that is hidden while collapsed (Requirement 10.3).
 *
 * _Requirements: 10.1, 10.2, 10.3, 10.4_
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Service, ServiceKey } from '@app-types';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { Breadcrumb } from '@components/Breadcrumb';
import { CaseStudyCard } from '@components/CaseStudyCard';
import { CTA } from '@components/CTA';
import { SectionHeader } from '@components/SectionHeader';
import { SEOHead } from '@components/SEOHead';
import { caseStudies } from '@data/caseStudies';
import { services } from '@data/services';
import { getCaseStudiesByService } from '@lib/filter';
import { resolveBySlug } from '@lib/slug';

/** In-route 404 shown when `:slug` matches no Service (Requirement 10.4). */
function ServiceNotFound(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <SEOHead
        meta={{
          title: 'Service not found',
          description:
            'The service you are looking for does not exist. Browse the full range of Ryze Technology services.',
          canonical: 'https://ryze.technology/services',
          noIndex: true,
        }}
      />
      <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
        404
      </p>
      <h1 className="font-display text-display-l text-mist-100">
        We couldn&rsquo;t find that service
      </h1>
      <p className="max-w-xl font-sans text-body-l text-mist-300">
        The service you&rsquo;re looking for doesn&rsquo;t exist or may have
        moved. Explore everything we offer instead.
      </p>
      <Link
        to="/services"
        className="font-mono text-pulse-500 underline-offset-4 transition-colors hover:text-mist-100 hover:underline"
      >
        View all services
      </Link>
    </main>
  );
}

interface FAQAccordionProps {
  service: Service;
}

/** Accessible FAQ accordion (Requirement 10.3). */
function FAQAccordion({ service }: FAQAccordionProps): JSX.Element {
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(new Set());

  const toggle = (index: number): void => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <dl className="flex flex-col divide-y divide-ink-600/60 border-y border-ink-600/60">
      {service.faqs.map((faq, index) => {
        const isOpen = openItems.has(index);
        const buttonId = `faq-${service.slug}-trigger-${index}`;
        const panelId = `faq-${service.slug}-panel-${index}`;
        return (
          <div key={faq.question} className="py-2">
            <dt>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-h3 text-mist-100 transition-colors hover:text-pulse-500"
              >
                <span>{faq.question}</span>
                <span aria-hidden="true" className="font-mono text-pulse-500">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </dt>
            <dd
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-4 font-sans text-body-l text-mist-300"
            >
              {faq.answer}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ServiceIcon({ name, className }: { name: string; className?: string }): JSX.Element {
  const common = {
    className: className ?? 'w-4 h-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'code':
      return (
        <svg {...common}>
          <path d="m8 6-6 6 6 6" />
          <path d="m16 6 6 6-6 6" />
        </svg>
      );
    case 'palette':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="8.5" cy="9.5" r="1.2" />
          <circle cx="15.5" cy="9.5" r="1.2" />
          <circle cx="9.5" cy="15.5" r="1.2" />
          <path d="M12 21a3 3 0 0 0 0-6" />
        </svg>
      );
    case 'megaphone':
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function ServiceDetailPage(): JSX.Element {
  const { slug } = useParams<{ slug: ServiceKey }>();
  const service = slug ? resolveBySlug(services, slug) : undefined;

  if (!service) {
    return <ServiceNotFound />;
  }

  const relatedCaseStudies = getCaseStudiesByService(caseStudies, service.slug);
  const processSteps = [...service.process].sort((a, b) => a.index - b.index);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-[clamp(7rem,16vh,10rem)]">
      <SEOHead meta={service.seo} />

      <div className="flex flex-col gap-8 items-center text-center relative w-full">
        <Breadcrumb />

        {/* Hero */}
        <AnimationWrapper variant="rise" speed="slow">
          <header className="relative flex flex-col gap-6 items-center text-center mt-4 py-8">
            {/* Attractive Background Glow to fill empty space */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="h-[250px] w-full max-w-[800px] rounded-full bg-pulse-500/15 blur-[100px]" />
            </div>

            <h1 className="max-w-4xl font-display text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-pulse-500">
              {service.name}
            </h1>
            <p className="max-w-3xl font-sans text-[clamp(1.125rem,2vw,1.35rem)] leading-relaxed text-mist-300">
              {service.tagline}
            </p>
          </header>
        </AnimationWrapper>
      </div>

      {/* What we do */}
      <AnimationWrapper variant="fade" speed="slow">
        <section className="flex flex-col gap-6 lg:gap-10">
          <SectionHeader eyebrow="What we do" title={`How we approach ${service.name}`} />
          <div className="relative border-l-4 border-pulse-500 pl-6 lg:pl-8 py-2 max-w-5xl">
            <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-snug font-medium text-mist-100 text-balance">
              {service.whatWeDo}
            </p>
          </div>
        </section>
      </AnimationWrapper>

      {/* Features (staggered grid) */}
      <section className="flex flex-col gap-10">
        <SectionHeader eyebrow="Capabilities" title="What you get" />
        <AnimationWrapper stagger={0.08}>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {service.features.map((feature) => (
              <li
                key={feature.title}
                className="glass-card group flex flex-col gap-5 p-10 h-full w-full"
              >
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-pulse-700 group-hover:text-pulse-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="font-sans text-body-m text-mist-300 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </AnimationWrapper>
      </section>

      {/* Related case studies */}
      {service.slug === 'development' ? (
        <AnimationWrapper variant="rise" speed="slow">
          <section className="flex flex-col gap-10 items-center text-center">
            <SectionHeader eyebrow="Proof" title="Our Work Speaks for Itself" align="center" />
            <div className="flex flex-col items-center gap-10 w-full max-w-5xl rounded-[40px] border border-pulse-500/20 bg-gradient-to-b from-pulse-500/10 to-transparent p-12 lg:p-20 shadow-xl shadow-pulse-500/5">
              <p className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.15] font-extrabold tracking-tight text-mist-100 text-balance">
                We're currently building our public portfolio. Reach out to see what we've built for our clients in Nagpur and beyond.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <Link
                  to="/portfolio"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-ink-800 border border-ink-600 px-8 py-3 font-mono text-base font-semibold text-mist-100 shadow-sm transition-all hover:-translate-y-1 hover:bg-ink-700 hover:border-pulse-500/40 hover:shadow-lg"
                >
                  View All Projects →
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-pulse-500 px-8 py-3 font-mono text-base font-bold text-ink-900 shadow-lg shadow-pulse-500/20 transition-all hover:-translate-y-1 hover:bg-pulse-400 hover:shadow-xl hover:shadow-pulse-500/30 hover:scale-105"
                >
                  Talk to Us →
                </Link>
              </div>
            </div>
          </section>
        </AnimationWrapper>
      ) : relatedCaseStudies.length > 0 ? (
        <AnimationWrapper variant="rise" stagger={0.08}>
          <section className="flex flex-col gap-8">
            <SectionHeader eyebrow="Proof" title="Related work" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {relatedCaseStudies.map((caseStudy, index) => (
                <CaseStudyCard
                  key={caseStudy.slug}
                  caseStudy={caseStudy}
                  index={index}
                />
              ))}
            </div>
          </section>
        </AnimationWrapper>
      ) : null}

      {/* FAQ accordion */}
      <AnimationWrapper variant="rise">
        <section className="flex flex-col gap-8">
          <SectionHeader eyebrow="FAQ" title="Common questions" />
          <FAQAccordion service={service} />
        </section>
      </AnimationWrapper>

      {/* CTA */}
      <AnimationWrapper variant="fade" speed="slow">
        {service.slug === 'development' ? (
          <CTA
            eyebrow="START A PROJECT"
            heading="Ready to build something that grows your business?"
            sub="Whether you're a local shop going online for the first time or an enterprise needing a custom system — we're ready."
            label="Book a Free Consultation"
          />
        ) : (
          <CTA
            heading={`Ready to build your ${service.name.toLowerCase()} project?`}
            sub="Tell us what you're building and we'll map out the path together."
          />
        )}
      </AnimationWrapper>
    </main>
  );
}

export default ServiceDetailPage;
