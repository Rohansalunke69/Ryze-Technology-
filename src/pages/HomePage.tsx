/**
 * HomePage — the `/` route module.
 */
import type { SEOMeta } from '@app-types';

import { AnimationWrapper } from '@components/AnimationWrapper';
import { FeaturedWork } from '@components/FeaturedWork';
import { CapabilitiesShowcase, type Capability } from '@components/CapabilitiesShowcase';
import { CTA } from '@components/CTA';
import { Hero } from '@components/Hero';
import { MarqueeText } from '@components/MarqueeText';
import { PremiumMarquee } from '@components/PremiumMarquee';
import { ProblemSection } from '@components/ProblemSection';
import { SectionHeader } from '@components/SectionHeader';
import { TeamCard } from '@components/TeamCard';
import { SEOHead } from '@components/SEOHead';

import { caseStudies } from '@data/caseStudies';
import { team } from '@data/team';
import { siteMetadata } from '@data/siteMetadata';

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

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    kind: 'development',
    name: 'Web Platforms',
    tagline: 'Fast, accessible websites, storefronts, and web apps that convert.',
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    kind: 'design',
    name: 'Mobile Apps',
    tagline: 'Native-quality iOS and Android apps from one codebase.',
    techStack: ['React Native', 'Expo', 'TypeScript', 'SQLite'],
  },
  {
    kind: 'digital-marketing',
    name: 'Dashboards & Systems',
    tagline: 'Admin panels, dashboards, and the back-end systems that run a business.',
    techStack: ['Node.js', 'PostgreSQL', 'Prisma', 'Redis'],
  },
  {
    kind: 'sales-strategy',
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

/** Philosophy statements — shown together in one normal section (no pin). */
const PHILOSOPHY_POINTS = [
  {
    heading: 'Most software is built to ship. We build it to last.',
    body:
      'Anything worth building is worth building to last. We make order that holds — structured, tested, and maintainable.',
  },
  {
    heading: 'We engineer for the decade, not the demo.',
    body:
      'Clean architecture and real test coverage mean the next change is a small one — not a rewrite that starts from zero.',
  },
  {
    heading: 'Durable means supported, long after launch day.',
    body:
      'We stay on after release: monitoring, hardening, and evolving the product so it keeps earning its place in your business.',
  },
];

export function HomePage(): JSX.Element {
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);
  const marqueeItems = team.map((member) => `${member.name} — ${member.role}`);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      {/*
       * Linear scroll flow — every section appears once, in order:
       *   Hero → [Problem card overlaps Hero] → Philosophy → Services → Work → Team → CTA
       *
       * The ONLY overlap is Hero ← Problem, done with pure CSS (sticky + z-index),
       * so there is no GSAP pin to fight the other ScrollTriggers. Philosophy is a
       * plain section (single scroll, no pin, no 3-step storytelling).
       */}
      <main>
        {/*
         * Stacked-card overlap — pure CSS (sticky + z-index), no GSAP, so nothing
         * fights the other ScrollTriggers:
         *   Hero (base)  ←  The Problem slides over it  ←  Our Philosophy slides over that.
         *
         * Each panel is `sticky top-0` with an increasing z-index, so every new
         * panel rises over the previous and covers it. The container wraps ONLY
         * these three panels (Services is its sibling, outside), so the whole
         * stack releases before Services — nothing can reappear later.
         */}
        <div className="relative">
          {/* Layer 1 — Hero (base backdrop) */}
          <div className="sticky top-0 z-[1]">
            <Hero headline="Design. Develop. Grow." />
          </div>

          {/* Layer 2 — The Problem: opaque card that slides up over the Hero.
              PremiumMarquee is the card's top strip. */}
          <div className="sticky top-0 z-[2] overflow-hidden rounded-t-[28px] shadow-[0_-26px_70px_rgba(0,0,0,0.28)]">
            <PremiumMarquee />
            <ProblemSection problems={PROBLEMS} />
          </div>

          {/* Layer 3 — Our Philosophy: opaque card that slides up over The Problem.
              Single scroll, no pin, no 3-step storytelling. */}
          <div className="sticky top-0 z-[3] overflow-hidden rounded-t-[28px] shadow-[0_-26px_70px_rgba(0,0,0,0.28)]">
            <section aria-label="Philosophy" className="min-h-screen bg-pulse-500 text-ink-900">
              <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,16vh,12rem)] sm:px-10">
                <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-ink-900/70">
                  Our philosophy
                </p>
                <AnimationWrapper variant="rise">
                  <h2 className="mt-8 max-w-[18ch] font-display text-[clamp(2.25rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.02em]">
                    {PHILOSOPHY_POINTS[0]!.heading}
                  </h2>
                </AnimationWrapper>
                <AnimationWrapper variant="fade" delay={0.1}>
                  <p className="mt-8 max-w-xl font-sans text-body-l leading-relaxed text-ink-900/80">
                    {PHILOSOPHY_POINTS[0]!.body}
                  </p>
                </AnimationWrapper>

                <AnimationWrapper variant="rise" stagger={0.1}>
                  <div className="mt-16 grid gap-x-12 gap-y-10 border-t border-ink-900/20 pt-12 md:grid-cols-2">
                    {PHILOSOPHY_POINTS.slice(1).map((point) => (
                      <div key={point.heading}>
                        <h3 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight">
                          {point.heading}
                        </h3>
                        <p className="mt-4 font-sans text-body leading-relaxed text-ink-900/80">
                          {point.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </AnimationWrapper>
              </div>
            </section>
          </div>
        </div>

        {/* 3 — Services (pinned horizontal showcase, reserves its own space) */}
        <CapabilitiesShowcase capabilities={[...CAPABILITIES]} />

        {/* 4 — Case studies (scrubbed parallax, no pin) */}
        <FeaturedWork caseStudies={featuredCaseStudies} />

        {/* 5 — Team */}
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

        {/* 6 — CTA */}
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
