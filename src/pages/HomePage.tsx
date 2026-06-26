/**
 * HomePage — the `/` route module (task 14.1).
 *
 * Renders the homepage story in the exact order mandated by Requirement 6.1:
 *
 *   Hero → Problems → Philosophy → Portfolio-preview → Services →
 *   Why-Us → Team → CTA
 *
 * (The Footer is part of the global App shell, not this module, and the App
 * shell also provides the `<main>` landmark — so HomePage renders the ordered
 * sections inside a fragment.)
 *
 * Motion discipline (Requirement 20.5): the page has exactly ONE heavy "hero
 * moment" — the WebGL particle→lattice field owned by {@link Hero}. Every
 * subsequent section uses only the lighter scroll-reveal primitives
 * (`AnimationWrapper`, `SplitText`, `AnimatedCounter`, `MarqueeText`), each of
 * which degrades to a static end-state under `prefers-reduced-motion`.
 *
 * Section specifics:
 *  - Portfolio-preview surfaces only the Case_Study entities flagged `featured`
 *    (Requirement 6.2). The selector is a boolean flag rather than a category,
 *    so we filter on `.featured` directly.
 *  - Why-Us renders its metric row with {@link AnimatedCounter} (Requirement 6.3).
 *  - CTA links to `/contact` through a MagneticButton (Requirement 6.4), which
 *    {@link CTA} composes internally.
 *  - {@link SEOHead} sets the homepage title/description/canonical/OG metadata
 *    (Requirement 40.1).
 *
 * Heading hierarchy (Requirement 38.1): the Hero owns the single page `h1`;
 * every section opener is an `h2` (via `SectionHeader`/`CTA`), and the cards
 * within use `h3`.
 *
 * _Requirements: 6.1, 6.2, 6.3, 6.4, 20.5, 40.1_
 */
import { Link } from 'react-router-dom';
import type { SEOMeta } from '@app-types';

import { AnimatedCounter } from '@components/AnimatedCounter';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { CaseStudyCard } from '@components/CaseStudyCard';
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
import { siteMetadata } from '@data/siteMetadata';

/** Homepage document metadata (Requirement 40.1). */
const homeMeta: SEOMeta = {
  // Using the site name collapses to `siteMetadata.defaultTitle` in SEOHead,
  // avoiding a doubled-up "Ryze Technology — Ryze Technology".
  title: siteMetadata.siteName,
  description: siteMetadata.defaultDescription,
  canonical: siteMetadata.baseUrl,
};

/** Organization structured data for richer search results. */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteMetadata.siteName,
  url: siteMetadata.baseUrl,
  description: siteMetadata.defaultDescription,
  email: siteMetadata.contactEmail,
  sameAs: siteMetadata.social.map((s) => s.url),
};

/**
 * The failure modes the studio exists to prevent — "software that rots". Pure
 * content; revealed with split-text/stagger when motion is allowed.
 */
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

/**
 * "Why Us" metrics. Each row counts up on scroll-in via {@link AnimatedCounter}
 * (Requirement 6.3) and lands exactly on its target value.
 */
const METRICS: ReadonlyArray<{
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
}> = [
  { value: 50, suffix: '+', label: 'Products shipped' },
  { value: 8, label: 'Years building' },
  { value: 99.9, decimals: 1, suffix: '%', label: 'Uptime sustained' },
];

/** What sets the studio apart — the differentiator list under the metrics. */
const DIFFERENTIATORS: ReadonlyArray<string> = [
  'We own outcomes end to end — strategy, design, and engineering under one roof.',
  'We build for real Indian conditions: patchy networks, low-end devices, high stakes.',
  'We write software that the next engineer can actually maintain.',
  'We stay after launch, because durable means supported.',
];

export function HomePage(): JSX.Element {
  // Portfolio-preview shows only featured case studies (Requirement 6.2).
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);

  // Marquee of team names + roles for the Team section.
  const marqueeItems = team.map((member) => `${member.name} — ${member.role}`);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      {/* 1 — Hero: the single heavy "hero moment" (Requirement 20.5). */}
      <Hero
        headline="We build products that work forever"
        eyebrow="Ryze Technology"
      />

      {/* 2 — Problems: "software that rots". */}
      <section
        aria-label="Problems"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
      >
        <SectionHeader
          eyebrow="The problem"
          title="Software that rots"
        />
        <AnimationWrapper variant="rise" stagger={0.12}>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <li key={problem.title} className="flex flex-col gap-3">
                <SplitText
                  as="h3"
                  by="word"
                  text={problem.title}
                  className="font-display text-h3 text-mist-100 line-through decoration-pulse-500 decoration-2"
                />
                <p className="font-sans text-body text-mist-300">
                  {problem.detail}
                </p>
              </li>
            ))}
          </ul>
        </AnimationWrapper>
      </section>

      {/* 3 — Philosophy: the "Engineered Permanence" editorial statement. */}
      <section
        aria-label="Philosophy"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
      >
        <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
          Our philosophy
        </p>
        <AnimationWrapper variant="rise">
          <SplitText
            as="h2"
            by="word"
            text="Engineered permanence: software built, weighted, and durable — not disposable."
            className="mt-6 max-w-4xl font-display text-h1 text-mist-100"
          />
        </AnimationWrapper>
        <AnimationWrapper variant="fade" delay={0.1}>
          <p className="mt-8 max-w-2xl font-sans text-body-l text-mist-300">
            Anything worth building is worth building to last. We make order that
            holds — structured, tested, and maintainable — so the products we
            ship keep working long after launch day.
          </p>
        </AnimationWrapper>
      </section>

      {/* 4 — Portfolio preview: featured case studies only (Requirement 6.2). */}
      <section
        aria-label="Featured work"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader eyebrow="Selected work" title="Built to outlast" />
          <Link
            to="/portfolio"
            data-cursor="link"
            className="inline-flex min-h-[44px] items-center gap-2 font-mono text-sm tracking-wide text-pulse-500 transition-transform duration-200 ease-out hover:translate-x-1 focus-visible:translate-x-1"
          >
            View all work
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <AnimationWrapper variant="rise" stagger={0.1}>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {featuredCaseStudies.map((caseStudy, index) => (
              <CaseStudyCard
                key={caseStudy.slug}
                caseStudy={caseStudy}
                index={index}
              />
            ))}
          </div>
        </AnimationWrapper>
      </section>

      {/* 5 — Services: the four service cards. */}
      <section
        aria-label="Services"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
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

      {/* 6 — Why Us: AnimatedCounter metric row + differentiators (Req 6.3). */}
      <section
        aria-label="Why Ryze"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
      >
        <SectionHeader eyebrow="Why Ryze" title="Durability, by the numbers" />
        <dl className="mt-12 grid gap-10 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-2">
              <dt className="sr-only">{metric.label}</dt>
              <dd className="font-display text-display-l text-mist-100">
                <AnimatedCounter
                  value={metric.value}
                  decimals={metric.decimals ?? 0}
                  suffix={metric.suffix ?? ''}
                />
              </dd>
              <p
                aria-hidden="true"
                className="font-mono text-xs uppercase tracking-widest text-pulse-500"
              >
                {metric.label}
              </p>
            </div>
          ))}
        </dl>
        <AnimationWrapper variant="rise" stagger={0.08}>
          <ul className="mt-16 grid gap-6 md:grid-cols-2">
            {DIFFERENTIATORS.map((item) => (
              <li
                key={item}
                className="flex gap-3 font-sans text-body-l text-mist-300"
              >
                <span aria-hidden="true" className="text-pulse-500">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </AnimationWrapper>
      </section>

      {/* 7 — Team: the team cards + a marquee of names/roles. */}
      <section
        aria-label="Team"
        className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
      >
        <SectionHeader eyebrow="The studio" title="The people who build it" />
        <AnimationWrapper variant="rise" stagger={0.1}>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </AnimationWrapper>
        <div className="mt-16 font-display text-h3 text-mist-100">
          <MarqueeText items={marqueeItems} />
        </div>
      </section>

      {/* 8 — CTA: MagneticButton → /contact (Requirement 6.4). */}
      <CTA
        heading="Let's build something permanent"
        sub="Tell us what you're building. We'll help you make it last."
        href="/contact"
        label="Start a project"
      />
    </>
  );
}

export default HomePage;
