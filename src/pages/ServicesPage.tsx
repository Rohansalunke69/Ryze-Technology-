/**
 * ServicesPage — `/services` services overview (task 14.7).
 *
 * Composition (design "/services — Services Overview"):
 *   Editorial hero → "what we build" capability marquee → 4 service cards →
 *   "Our Process" (numbered steps) → inverted brand-blue "We Don't Stop at
 *   Launch" support/maintenance band → CTA.
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
import { Link } from 'react-router-dom';
import type { SEOMeta, ServiceKey } from '@app-types';
import { SectionHeader } from '@components/SectionHeader';
import { CapabilityScene, type CapabilityKind } from '@components/CapabilityScene';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { AnimatedCounter } from '@components/AnimatedCounter';
import { MarqueeText } from '@components/MarqueeText';
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

/** Capability keywords for the kinetic marquee under the hero. */
const CAPABILITIES: ReadonlyArray<string> = [
  'Web Platforms',
  'Mobile Apps',
  'Desktop Software',
  'Business Systems',
  'Design Systems',
  'APIs & Integrations',
];

/** Headline numbers for the "how we operate" strip. */
const APPROACH_STATS: ReadonlyArray<{
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
}> = [
  { value: 5, label: 'Service categories' },
  { value: 100, suffix: '%', label: 'In-house engineering' },
  { value: 2, suffix: ' wk', label: 'To first working slice' },
  { value: 99.9, suffix: '%', decimals: 1, label: 'Uptime we hold' },
];

/** Pads a 1-based index to a two-digit ordinal (e.g. `01`, `02`). */
function ordinal(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Maps each service category to one of the studio's animated capability scenes.
 * Service slugs are taxonomy keys; CapabilityScene speaks in visual scene names,
 * so we translate here to keep both layers independent.
 */
const SERVICE_SCENE: Record<ServiceKey, CapabilityKind> = {
  development: 'websites',
  design: 'mobile-apps',
  'digital-marketing': 'social-media-marketing',
  'sales-strategy': 'business-systems',
  'maintenance-support': 'desktop',
};

export function ServicesPage(): JSX.Element {
  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Editorial hero */}
        <section className="mx-auto w-full max-w-site px-6 pb-14 pt-[clamp(8.5rem,20vh,13rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              What we do
            </p>
            <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.75rem,9vw,8rem)] font-bold leading-[0.92] tracking-[-0.03em] text-mist-100">
              Our Expertise
            </h1>
            <p className="mt-8 max-w-2xl font-sans text-body-l text-mist-300">
              From first-of-its-kind products to the systems that quietly run a
              business, we design and engineer software built to last — across
              the web, mobile, desktop, and the back office.
            </p>
          </AnimationWrapper>
        </section>

        {/* Capability marquee */}
        <section
          aria-hidden="true"
          className="overflow-hidden border-y border-ink-600 py-[clamp(2rem,5vh,3.5rem)]"
        >
          <div className="font-display text-[clamp(1.5rem,4.5vw,3rem)] font-bold uppercase tracking-tight text-mist-100">
            <MarqueeText items={[...CAPABILITIES]} />
          </div>
        </section>

        {/* Service Alternating Layout (Req 9.1) */}
        <section
          aria-labelledby="services-heading"
          className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10"
        >
          <h2 id="services-heading" className="sr-only">
            Services
          </h2>
          <AnimationWrapper variant="rise" stagger={0.12}>
            <div className="flex flex-col gap-24">
              {services.map((service, index) => {
                const isEven = index % 2 === 0;
                return (
                  <article
                    key={service.slug}
                    className="grid grid-cols-1 gap-12 border-t border-ink-600 pt-16 md:grid-cols-2 md:items-center"
                  >
                    {/* Visual Section */}
                    <div
                      className={`flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-ink-600 bg-ink-900 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-ink-600/30 ${
                        isEven ? 'order-1 md:order-2' : 'order-1'
                      }`}
                    >
                      <div className="h-full w-full max-w-xs transition-transform duration-500 hover:scale-105">
                        <CapabilityScene kind={SERVICE_SCENE[service.slug]} />
                      </div>
                    </div>

                    {/* Text Section */}
                    <div
                      className={`flex flex-col gap-6 ${
                        isEven ? 'order-2 md:order-1' : 'order-2'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          aria-hidden="true"
                          className="ghost-numeral text-[clamp(2rem,4vw,3.5rem)]"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-pulse-500 font-semibold">
                          Capability
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-mist-100">
                          {service.name}
                        </h3>
                        <p className="font-sans text-body-l text-pulse-500 font-medium">
                          {service.tagline}
                        </p>
                      </div>

                      <p className="font-sans text-body text-mist-300 leading-relaxed">
                        {service.summary}
                      </p>

                      <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mist-300 font-semibold">
                          Core Technologies
                        </h4>
                        <ul className="flex flex-wrap gap-2">
                          {service.techStack.map((tech) => (
                            <li
                              key={tech}
                              className="rounded-full border border-ink-600 bg-ink-800 px-3.5 py-1 font-mono text-[0.75rem] text-mist-300 transition-colors hover:border-pulse-500/30 hover:text-mist-100"
                            >
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to={`/services/${service.slug}`}
                        data-cursor="link"
                        aria-label={`Learn more about ${service.name}`}
                        className="group mt-2 inline-flex min-h-[44px] items-center gap-2 self-start font-mono text-sm font-semibold tracking-wide text-pulse-500 transition-colors hover:text-pulse-700"
                      >
                        Explore Service
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </AnimationWrapper>
        </section>

        {/* How we operate — headline numbers */}
        <section
          aria-label="How we operate"
          className="border-y border-ink-600 bg-ink-800"
        >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(4rem,10vh,7rem)] sm:px-10">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              How we operate
            </p>
            <dl className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {APPROACH_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-2 border-t border-ink-600 pt-5"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.03em] text-mist-100">
                    <AnimatedCounter
                      value={stat.value}
                      decimals={stat.decimals ?? 0}
                      suffix={stat.suffix ?? ''}
                    />
                  </dd>
                  <p
                    aria-hidden="true"
                    className="font-mono text-mono-eyebrow uppercase tracking-[0.18em] text-mist-300"
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Our Process (Req 9.2) */}
        <section
          aria-label="Our Process"
          className="mx-auto w-full max-w-site px-6 py-[clamp(4.5rem,11vh,8rem)] sm:px-10"
        >
          <SectionHeader as="h2" eyebrow="How we work" title="Our Process" />
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
                    className="font-mono text-[clamp(2rem,4vw,3rem)] font-bold leading-none text-pulse-500/30"
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

        {/* Support / maintenance band — inverted brand blue (Req 9.2) */}
        <section
          aria-label="We Don't Stop at Launch"
          className="bg-pulse-700 text-ink-900"
        >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(4.5rem,12vh,8.5rem)] sm:px-10">
            <AnimationWrapper variant="fade">
              <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-ink-900/70">
                The long game
              </p>
              <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,6.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink-900">
                {"We Don't Stop at Launch"}
              </h2>
              <p className="mt-8 max-w-2xl font-sans text-body-l text-ink-900/80">
                Shipping is the start, not the finish. We stay on as a long-term
                partner — monitoring, maintaining, and improving your software so
                it keeps working, keeps fast, and keeps earning its place years
                after launch.
              </p>
            </AnimationWrapper>
          </div>
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
