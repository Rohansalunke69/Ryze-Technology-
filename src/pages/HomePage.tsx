/**
 * HomePage — the `/` route module (task 14.1).
 *
 * Renders the homepage story in the exact order mandated by Requirement 6.1:
 *
 *   Hero → Problems → Philosophy → Portfolio-preview → Services →
 *   Why-Us → Team → CTA
 *
 * (The Footer and Navigation are part of the global App shell, not this
 * module. HomePage renders its own single `<main>` landmark wrapping the
 * ordered sections, matching every other page — the shell deliberately does
 * not add a `<main>` so there is exactly one per page.)
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
import { useEffect, useRef } from 'react';
import type { SEOMeta } from '@app-types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AnimatedCounter } from '@components/AnimatedCounter';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { FeaturedWork } from '@components/FeaturedWork';
import { ProcessTimeline } from '@components/ProcessTimeline';
import { CapabilitiesShowcase, type Capability } from '@components/CapabilitiesShowcase';
import { CTA } from '@components/CTA';
import { Hero } from '@components/Hero';
import { MarqueeText } from '@components/MarqueeText';
import { PremiumMarquee } from '@components/PremiumMarquee';
import { StackSection } from '@components/StackSection';
import { SectionHeader } from '@components/SectionHeader';
import { SplitText } from '@components/SplitText';
import { TeamCard } from '@components/TeamCard';
import { SEOHead } from '@components/SEOHead';
import { useReducedMotion } from '@hooks/useReducedMotion';

import { caseStudies } from '@data/caseStudies';
import { team } from '@data/team';
import { testimonials } from '@data/testimonials';
import { siteMetadata } from '@data/siteMetadata';
import { studioMetrics } from '@data/metrics';

/** Four-step delivery process shown in the "How we work" band. */
const PROCESS_STEPS: { title: string; detail: string }[] = [
  {
    title: 'Discover',
    detail:
      'We map your goals, users, and constraints, then pressure-test the idea before a line of code is written.',
  },
  {
    title: 'Design',
    detail:
      'We shape the system and the key flows early, so you react to something real — not a slide deck.',
  },
  {
    title: 'Build',
    detail:
      'We engineer in vertical slices, shipping working software continuously with tests baked in from day one.',
  },
  {
    title: 'Sustain',
    detail:
      'We stay on after launch — monitoring, hardening, and evolving the product so it keeps earning its place.',
  },
];

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

/** "Why Us" metrics — sourced from the shared studio metrics (single source of truth). */
const METRICS = studioMetrics.slice(0, 3);

/**
 * The disciplines shown in the pinned "What we build" showcase. These are the
 * technical capabilities (each with its own animated scene), authored
 * independently of the service catalogue so the showcase scenes stay stable.
 */
const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    kind: 'websites',
    name: 'Web Platforms',
    tagline: 'Fast, accessible websites, storefronts, and web apps that convert.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    kind: 'mobile-apps',
    name: 'Mobile Apps',
    tagline: 'Native-quality iOS and Android apps from one codebase.',
    techStack: ['React Native', 'Expo', 'TypeScript', 'SQLite'],
  },
  {
    kind: 'desktop',
    name: 'Dashboards & Systems',
    tagline: 'Admin panels, dashboards, and the back-end systems that run a business.',
    techStack: ['Node.js', 'PostgreSQL', 'Prisma', 'Redis'],
  },
  {
    kind: 'business-systems',
    name: 'Automation & APIs',
    tagline: 'Workflow automation and integrations that remove manual busywork.',
    techStack: ['APIs', 'Webhooks', 'Automation', 'Integrations'],
  },
  {
    kind: 'social-media-marketing',
    name: 'Digital Marketing',
    tagline: 'SEO, social, ads, and campaigns that turn attention into customers.',
    techStack: ['SEO', 'Social', 'Ads', 'Analytics'],
  },
];

/** What sets the studio apart — the differentiator list under the metrics. */
const DIFFERENTIATORS: ReadonlyArray<string> = [
  'We own outcomes end to end — strategy, design, and engineering under one roof.',
  'We build for real Indian conditions: patchy networks, low-end devices, high stakes.',
  'We write software that the next engineer can actually maintain.',
  'We stay after launch, because durable means supported.',
];

// How many px of the Problems section to leave visible above the Philosophy panel.
const PHILOSOPHY_PEEK = 160;

export function HomePage(): JSX.Element {
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);
  const marqueeItems = team.map((member) => `${member.name} — ${member.role}`);

  // Refs forwarded from the StackSection wrappers so we can set up cross-section pins.
  const problemsRef   = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const problems   = problemsRef.current;
    const philosophy = philosophyRef.current;
    if (!problems || !philosophy) return;

    gsap.registerPlugin(ScrollTrigger);

    /*
     * Co-pin: Problems stays visible at the top of the viewport during the
     * entire Philosophy storytelling sequence.  pinSpacing:false means no
     * extra scroll space is added — Problems just holds in place while
     * Philosophy (at PHILOSOPHY_PEEK px below the top) is readable.
     *
     * endTrigger: philosophy / end: 'bottom PEEK' — the pin releases at
     * exactly the same moment the Philosophy pin releases, so both panels
     * scroll away together and Team becomes visible cleanly.
     */
    const problemsPin = ScrollTrigger.create({
      trigger:            problems,
      endTrigger:         philosophy,
      start:              'top top',
      end:                `bottom ${PHILOSOPHY_PEEK}px`,
      pin:                true,
      pinSpacing:         false,
      anticipatePin:      1,
      invalidateOnRefresh: true,
    });

    /*
     * Philosophy storytelling pin: panel parks at PHILOSOPHY_PEEK px from
     * the viewport top so Problems content remains visible in the gap above.
     * pinSpacing:true adds a correctly-sized spacer so every section after
     * Philosophy (Team, Testimonials, CTA) is fully reachable.
     */
    const philosophyPin = ScrollTrigger.create({
      trigger:            philosophy,
      start:              `top ${PHILOSOPHY_PEEK}px`,
      end:                `bottom ${PHILOSOPHY_PEEK}px`,
      pin:                true,
      pinSpacing:         true,
      anticipatePin:      1,
      invalidateOnRefresh: true,
    });

    return () => {
      problemsPin.kill();
      philosophyPin.kill();
    };
  }, [reducedMotion]);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      <main>
        {/* ── Layer 1 — Hero (z:10) — overlap pin so Problems slides over it ── */}
        <StackSection zIndex={10} isFirst overlap>
          <Hero headline="Design. Develop. Grow." />
          <PremiumMarquee />
        </StackSection>

        {/* ── Layer 2 — Problems (z:20) — co-pinned externally via problemsRef */}
        <StackSection ref={problemsRef} zIndex={20}>
          <section
            aria-label="Problems"
            className="w-full bg-ink-900"
          >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10">
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[0.85fr_1.15fr]">
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
              </div>

              <AnimationWrapper variant="rise" stagger={0.12}>
                <ul className="flex flex-col">
                  {PROBLEMS.map((problem, index) => (
                    <li
                      key={problem.title}
                      className="grid grid-cols-[auto_1fr] items-start gap-6 border-t border-ink-600 py-8"
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
                        <p className="max-w-md font-sans text-body text-mist-300">
                          {problem.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AnimationWrapper>
            </div>
          </div>
          </section>
        </StackSection>

        {/* ── Layer 3 — Philosophy (z:30) — storytelling pin managed externally */}
        <StackSection ref={philosophyRef} zIndex={30}>
          <section aria-label="Philosophy" className="bg-pulse-500 text-ink-900">
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
              </AnimationWrapper>
            </div>
          </section>
        </StackSection>

        {/* ── Layer 4 — Services / CapabilitiesShowcase (z:40) ─────────────── */}
        <StackSection zIndex={40}>
          <CapabilitiesShowcase capabilities={[...CAPABILITIES]} />
        </StackSection>

        {/* ── Layer 5 — Work / FeaturedWork (z:50) ─────────────────────────── */}
        <StackSection zIndex={50}>
          <FeaturedWork caseStudies={featuredCaseStudies} />
        </StackSection>

        {/* ── Remaining sections — normal scroll, no stacking ───────────────── */}
        <ProcessTimeline steps={PROCESS_STEPS} />

        <section
          aria-label="Why Ryze"
          className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
        >
          <SectionHeader eyebrow="Why Ryze" title="Durability, by the numbers" />
          <dl className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-3 border-t border-ink-600 pt-6">
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
                  className="flex gap-4 border-t border-ink-600 pt-5 font-sans text-body-l text-mist-300"
                >
                  <span aria-hidden="true" className="font-mono text-pulse-500">
                    ↗
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AnimationWrapper>
        </section>

        <section
          aria-label="Team"
          className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
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

        {testimonials[0] !== undefined ? (
          <section
            aria-label="Client testimonial"
            className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
          >
            <AnimationWrapper variant="rise">
              <figure className="mx-auto max-w-5xl">
                <p
                  aria-hidden="true"
                  className="font-display text-[clamp(3rem,9vw,7rem)] font-bold leading-none text-pulse-500"
                >
                  &ldquo;
                </p>
                <blockquote className="-mt-6 font-display text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.01em] text-mist-100">
                  {testimonials[0].quote}
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-mono-eyebrow uppercase tracking-[0.18em] text-mist-300">
                  <span className="text-mist-100">{testimonials[0].author}</span>
                  <span aria-hidden="true" className="text-pulse-500">
                    /
                  </span>
                  <span>
                    {testimonials[0].authorRole}, {testimonials[0].company}
                  </span>
                </figcaption>
              </figure>
            </AnimationWrapper>
          </section>
        ) : null}

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
