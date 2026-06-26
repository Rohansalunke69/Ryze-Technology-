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

export function ServiceDetailPage(): JSX.Element {
  const { slug } = useParams<{ slug: ServiceKey }>();
  const service = slug ? resolveBySlug(services, slug) : undefined;

  if (!service) {
    return <ServiceNotFound />;
  }

  const relatedCaseStudies = getCaseStudiesByService(caseStudies, service.slug);
  const processSteps = [...service.process].sort((a, b) => a.index - b.index);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-12">
      <SEOHead meta={service.seo} />

      <div className="flex flex-col gap-12">
        <Breadcrumb />

        {/* Hero */}
        <header className="flex flex-col gap-6">
          <span
            data-icon={service.icon}
            aria-hidden="true"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500"
          >
            {service.icon}
          </span>
          <h1 className="font-display text-display-l text-mist-100">
            {service.name}
          </h1>
          <p className="max-w-2xl font-sans text-body-l text-mist-300">
            {service.tagline}
          </p>
        </header>
      </div>

      {/* What we do */}
      <section className="flex flex-col gap-6">
        <SectionHeader eyebrow="What we do" title={`How we approach ${service.name}`} />
        <p className="max-w-3xl font-sans text-body-l text-mist-300">
          {service.whatWeDo}
        </p>
      </section>

      {/* Features (staggered grid) */}
      <section className="flex flex-col gap-8">
        <SectionHeader eyebrow="Capabilities" title="What you get" />
        <AnimationWrapper stagger={0.08}>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature) => (
              <li
                key={feature.title}
                className="flex flex-col gap-2 rounded-lg border border-ink-600/60 p-6"
              >
                <h3 className="font-display text-h3 text-mist-100">
                  {feature.title}
                </h3>
                <p className="font-sans text-body-m text-mist-300">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </AnimationWrapper>
      </section>

      {/* Related case studies */}
      {relatedCaseStudies.length > 0 ? (
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
      ) : null}

      {/* Tech stack */}
      <section className="flex flex-col gap-6">
        <SectionHeader eyebrow="Stack" title="Tools we reach for" />
        <ul className="flex flex-wrap gap-3">
          {service.techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-ink-600/60 px-4 py-1.5 font-mono text-sm text-mist-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      {/* Process timeline */}
      <section className="flex flex-col gap-8">
        <SectionHeader eyebrow="Process" title="How we work" />
        <ol className="flex flex-col gap-8">
          {processSteps.map((step) => (
            <li key={step.index} className="flex gap-6">
              <span
                aria-hidden="true"
                className="font-mono text-h3 text-pulse-500"
              >
                {String(step.index).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h3 text-mist-100">
                  {step.title}
                </h3>
                <p className="max-w-2xl font-sans text-body-m text-mist-300">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ accordion */}
      <section className="flex flex-col gap-8">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <FAQAccordion service={service} />
      </section>

      {/* CTA */}
      <CTA
        heading={`Ready to build your ${service.name.toLowerCase()} project?`}
        sub="Tell us what you're building and we'll map out the path together."
      />
    </main>
  );
}

export default ServiceDetailPage;
