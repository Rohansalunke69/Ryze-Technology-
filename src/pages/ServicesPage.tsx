/**
 * ServicesPage — `/services` services overview (task 14.7).
 *
 * Composition (design "/services — Services Overview"):
 *   Hero → 4 service cards → "Our Process" (numbered steps) →
 *   "We Don't Stop at Launch" support/maintenance band → CTA.
 *
 * The page renders the four `Service` entities as `ServiceCard`s (Requirement
 * 9.1), a numbered four-step process section together with a support/maintenance
 * band (Requirement 9.2), and a closing `CTA` section (Requirement 9.3).
 *
 * Motion: section reveals use `AnimationWrapper`, which renders content in its
 * final visible state immediately under `prefers-reduced-motion` — so the
 * process sequence and bands stay fully readable with no scroll dependency
 * (Requirements 25.1, 37.2). The numbered steps are real, ordered DOM content
 * (an ordered list), so they are present and accessible regardless of motion.
 *
 * _Requirements: 9.1, 9.2, 9.3_
 */
import type { SEOMeta } from '@app-types';
import { SectionHeader } from '@components/SectionHeader';
import { ServiceCard } from '@components/ServiceCard';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { services } from '@data/services';
import { siteMetadata } from '@data/siteMetadata';

/** Per-route metadata. Canonical resolves to `/services` on the site origin. */
const seo: SEOMeta = {
  title: 'Our Expertise',
  description:
    'Explore what Ryze Technology builds — websites, mobile apps, desktop software, and business systems — and how we partner with you from discovery through long-term support.',
  canonical: `${siteMetadata.baseUrl}/services`,
};

/** The four-stage delivery process shown in the "Our Process" section (Req 9.2). */
interface ProcessStep {
  title: string;
  description: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Discovery & Design',
    description:
      'We map your goals, audience, and constraints, then shape a design system and the key flows you can react to early.',
  },
  {
    title: 'Development',
    description:
      'We engineer in vertical slices, shipping working software continuously so progress is always visible and testable.',
  },
  {
    title: 'Launch & Deploy',
    description:
      'We test, optimize, and ship to production with monitoring, rollback, and a smooth handover in place.',
  },
  {
    title: 'Scale & Support',
    description:
      'We measure real usage, harden what matters, and keep evolving the product as your needs grow.',
  },
];

/** Pads a 1-based index to a two-digit ordinal (e.g. `01`, `02`). */
function ordinal(n: number): string {
  return String(n).padStart(2, '0');
}

export function ServicesPage(): JSX.Element {
  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Hero */}
        <section className="px-6 pb-16 pt-32">
          <AnimationWrapper variant="rise">
            <SectionHeader
              as="h1"
              eyebrow="What we do"
              title="Our Expertise"
            />
            <p className="mt-6 max-w-2xl font-sans text-body-l text-mist-300">
              From first-of-its-kind products to the systems that quietly run a
              business, we design and engineer software built to last — across
              the web, mobile, desktop, and the back office.
            </p>
          </AnimationWrapper>
        </section>

        {/* Service cards (Req 9.1) */}
        <section aria-labelledby="services-heading" className="px-6 py-16">
          <h2 id="services-heading" className="sr-only">
            Services
          </h2>
          <AnimationWrapper variant="rise" stagger={0.08}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.slug}
                  service={service}
                  index={index}
                />
              ))}
            </div>
          </AnimationWrapper>
        </section>

        {/* Our Process (Req 9.2) */}
        <section aria-label="Our Process" className="px-6 py-24">
          <SectionHeader
            as="h2"
            eyebrow="How we work"
            title="Our Process"
          />
          <AnimationWrapper variant="rise" stagger={0.1}>
            <ol
              aria-label="Our Process"
              className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
            >
              {PROCESS_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col gap-3 border-t border-ink-600 pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-mono-eyebrow tracking-widest text-pulse-500"
                  >
                    {ordinal(index + 1)}
                  </span>
                  <h3 className="font-display text-h3 text-mist-100">
                    {step.title}
                  </h3>
                  <p className="font-sans text-body text-mist-300">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </AnimationWrapper>
        </section>

        {/* Support / maintenance band (Req 9.2) */}
        <section
          aria-label="We Don't Stop at Launch"
          className="px-6 py-24"
        >
          <AnimationWrapper variant="fade">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-lg border border-ink-600 bg-ink-800 p-10 text-center">
              <SectionHeader
                as="h2"
                align="center"
                eyebrow="The long game"
                title="We Don't Stop at Launch"
              />
              <p className="mx-auto max-w-2xl font-sans text-body-l text-mist-300">
                Shipping is the start, not the finish. We stay on as a long-term
                partner — monitoring, maintaining, and improving your software so
                it keeps working, keeps fast, and keeps earning its place years
                after launch.
              </p>
            </div>
          </AnimationWrapper>
        </section>

        {/* Closing CTA (Req 9.3) */}
        <CTA
          heading="Have something to build?"
          sub="Tell us what you're working on. We'll help you figure out the right way to build it."
        />
      </main>
    </>
  );
}

export default ServicesPage;
