/**
 * HomePage — the `/` route module (task 14.1).
 *
 * Renders the homepage story:
 *   Hero → Problems → Philosophy → Portfolio-preview → Services →
 *   Why-Us → Team → CTA
 */
import type { SEOMeta } from '@app-types';

import { AnimatedCounter } from '@components/AnimatedCounter';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { FeaturedWork } from '@components/FeaturedWork';
import { CapabilitiesShowcase } from '@components/CapabilitiesShowcase';
import { CTA } from '@components/CTA';
import { Hero } from '@components/Hero';
import { MarqueeText } from '@components/MarqueeText';
import { SectionHeader } from '@components/SectionHeader';
import { ServiceCard } from '@components/ServiceCard';
import { SplitText } from '@components/SplitText';
import { TeamCard } from '@components/TeamCard';
import { SEOHead } from '@components/SEOHead';

import { caseStudies } from '@data/caseStudies';
import { services } from '@data/services';
import { team } from '@data/team';
import { testimonials } from '@data/testimonials';
import { siteMetadata } from '@data/siteMetadata';
import { studioMetrics } from '@data/metrics';

const homeMeta: SEOMeta = {
  title: siteMetadata.siteName,
  description: siteMetadata.defaultDescription,
  canonical: siteMetadata.baseUrl,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteMetadata.siteName,
  url: siteMetadata.baseUrl,
  description: siteMetadata.defaultDescription,
  email: siteMetadata.contactEmail,
  sameAs: siteMetadata.social.map((s) => s.url),
};

const PROBLEMS: ReadonlyArray<{ title: string; detail: string }> = [
  {
    title: 'Broken handoffs',
    detail:
      'Projects shipped by one team and abandoned by the next, until nobody knows how it works.',
  },
  {
    title: 'Abandoned codebases',
    detail:
      'Dependencies rot, builds stop working, and a small change becomes a rewrite.',
  },
  {
    title: 'Fragile automations',
    detail:
      'Scripts held together with duct tape that fail silently the moment reality shifts.',
  },
];

const METRICS = studioMetrics.slice(0, 3);

const DIFFERENTIATORS: ReadonlyArray<string> = [
  'We own outcomes end to end — strategy, design, and engineering under one roof.',
  'We build for real Indian conditions: patchy networks, low-end devices, high stakes.',
  'We write software that the next engineer can actually maintain.',
  'We stay after launch, because durable means supported.',
];

export function HomePage(): JSX.Element {
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);
  const orderedTeam = [...team].sort((a, b) => a.order - b.order);
  const marqueeItems = orderedTeam.map((member) => `${member.name} — ${member.role}`);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      <main>
        {/* 1 — Hero */}
        <Hero headline="We build products that work forever" />

        {/* Kinetic marquee brand strip */}
        <div className="marquee-band overflow-hidden py-5">
          <div className="font-display text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase tracking-tight text-mist-100">
            <MarqueeText
              items={[
                'Built to last',
                'Engineered permanence',
                'Web — Mobile — Systems',
                'Ryze Technology',
                'Nagpur → Worldwide',
              ]}
            />
          </div>
        </div>

        {/* 2 — Problems */}
        <section
          aria-label="Problems"
          className="section-glow mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
        >
          <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
                The problem
              </p>
              <SplitText
                as="h2"
                by="word"
                text="Software that rots"
                className="mt-6 max-w-[12ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-mist-100"
              />
              <p className="mt-6 max-w-xs font-sans text-body text-mist-300 leading-relaxed">
                Most software is built for the demo, not for the decade. We fix that.
              </p>
            </div>

            <AnimationWrapper variant="rise" stagger={0.12}>
              <ul className="flex flex-col">
                {PROBLEMS.map((problem, index) => (
                  <li
                    key={problem.title}
                    className="glow-card grid grid-cols-[auto_1fr] items-start gap-6 border-t border-ink-600 py-8 transition-all duration-300 hover:border-pulse-500/30"
                  >
                    <span
                      aria-hidden="true"
                      className="ghost-numeral text-[clamp(2.5rem,6vw,4.5rem)]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-3 pt-1">
                      <h3 className="font-display text-h3 font-semibold text-mist-100">
                        {problem.title}
                      </h3>
                      <p className="max-w-md font-sans text-body text-mist-300 leading-relaxed">
                        {problem.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </AnimationWrapper>
          </div>
        </section>

        {/* 3 — Philosophy: full-bleed inverted brand-blue statement */}
        <section
          aria-label="Philosophy"
          className="bg-pulse-500 text-ink-900"
        >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,16vh,12rem)] sm:px-10">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-ink-900/70">
              Our philosophy
            </p>
            <AnimationWrapper variant="rise">
              <SplitText
                as="h2"
                by="word"
                text="Most software is built to ship. We build it to last."
                className="mt-8 max-w-[18ch] font-display text-[clamp(2.5rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-ink-900"
              />
            </AnimationWrapper>
            <AnimationWrapper variant="fade" delay={0.1}>
              <p className="mt-10 max-w-xl font-sans text-body-l leading-relaxed text-ink-900/80">
                Anything worth building is worth building to last. We make order
                that holds — structured, tested, and maintainable — so the
                products we ship keep working long after launch day.
              </p>
              <div className="mt-10">
                <a
                  href="/manifesto"
                  data-cursor="link"
                  className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-ink-900 transition-opacity hover:opacity-70"
                >
                  Read our manifesto
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </div>
            </AnimationWrapper>
          </div>
        </section>

        {/* What we build — capabilities showcase */}
        <CapabilitiesShowcase services={services} />

        {/* 4 — Portfolio preview */}
        <FeaturedWork caseStudies={featuredCaseStudies} />

        {/* 5 — Services */}
        <section
          aria-label="Services"
          className="section-glow mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
        >
          <SectionHeader eyebrow="What we do" title="Four ways we build" />
          <AnimationWrapper variant="rise" stagger={0.08}>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>
          </AnimationWrapper>
        </section>

        {/* 6 — Why Us */}
        <section
          aria-label="Why Ryze"
          className="border-t border-ink-600 bg-ink-800 py-[clamp(6rem,14vh,11rem)]"
        >
          <div className="mx-auto w-full max-w-site px-6 sm:px-10">
            <SectionHeader eyebrow="Why Ryze" title="Durability, by the numbers" />
            <dl className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
              {METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col gap-3 border-t border-ink-600 pt-6"
                >
                  <dt className="sr-only">{metric.label}</dt>
                  <dd className="font-display text-[clamp(3.5rem,10vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.03em] text-mist-100">
                    <AnimatedCounter
                      value={metric.value}
                      decimals={metric.decimals ?? 0}
                      suffix={metric.suffix}
                    />
                  </dd>
                  <p
                    aria-hidden="true"
                    className="font-mono text-mono-eyebrow uppercase tracking-[0.2em] text-pulse-500"
                  >
                    {metric.label}
                  </p>
                </div>
              ))}
            </dl>

            <AnimationWrapper variant="rise" stagger={0.08}>
              <ul className="mt-16 grid gap-x-10 gap-y-5 md:grid-cols-2">
                {DIFFERENTIATORS.map((item) => (
                  <li
                    key={item}
                    className="group flex gap-4 border-t border-ink-600 pt-5 font-sans text-body-l text-mist-300 transition-colors duration-200 hover:text-mist-100"
                  >
                    <span aria-hidden="true" className="font-mono text-pulse-500 transition-transform duration-200 group-hover:translate-x-0.5">
                      ↗
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AnimationWrapper>
          </div>
        </section>

        {/* 7 — Team */}
        <section
          aria-label="Team"
          className="section-glow mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
        >
          <SectionHeader eyebrow="The studio" title="The people who build it" />
          <AnimationWrapper variant="rise" stagger={0.1}>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {orderedTeam.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </AnimationWrapper>
          <div className="mt-16 font-display text-h3 text-mist-100">
            <MarqueeText items={marqueeItems} />
          </div>
        </section>

        {/* Testimonial pull-quote */}
        {testimonials[0] !== undefined ? (
          <section
            aria-label="Client testimonial"
            className="relative overflow-hidden border-t border-ink-600 bg-ink-800"
          >
            {/* Ambient */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(37,99,235,0.08) 0%, transparent 70%)',
              }}
            />
            <div className="relative mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10">
              <AnimationWrapper variant="rise">
                <figure className="mx-auto max-w-5xl">
                  <p
                    aria-hidden="true"
                    className="font-display text-[clamp(3rem,9vw,7rem)] font-bold leading-none glow-text"
                  >
                    &ldquo;
                  </p>
                  <blockquote className="-mt-6 font-display text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-mist-100">
                    {testimonials[0].quote}
                  </blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-mono-eyebrow uppercase tracking-[0.18em] text-mist-300">
                    <span className="text-mist-100">{testimonials[0].author}</span>
                    <span aria-hidden="true" className="text-pulse-500">/</span>
                    <span>
                      {testimonials[0].authorRole}, {testimonials[0].company}
                    </span>
                  </figcaption>
                </figure>
              </AnimationWrapper>
            </div>
          </section>
        ) : null}

        {/* 8 — CTA */}
        <CTA
          heading="Let's build something permanent"
          sub="Tell us what you're building. We'll help you make it last."
          href="/contact"
          label="Start a project"
        />
      </main>
    </>
  );
}

export default HomePage;
