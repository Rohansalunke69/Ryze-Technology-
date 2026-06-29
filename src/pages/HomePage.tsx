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
    title: 'Inefficient software',
    detail:
      'Applications become difficult to scale, maintain, and improve, slowing business growth.',
  },
  {
    title: 'Missed digital opportunities',
    detail:
      'Your business exists online, but the right customers never discover it.',
  },
  {
    title: 'Unsupported systems',
    detail:
      'Without ongoing maintenance and support, performance declines and risks increase.',
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

/** Philosophy section — tagline, heading, and intro paragraph. */
const PHILOSOPHY = {
  tagline: 'We Build. We Maintain. We Grow.',
  heading: 'Technology should create momentum, not maintenance headaches.',
  intro:
    'We believe software is only valuable when it continues delivering results long after launch. That’s why we don’t stop at development. We build reliable systems, maintain them proactively, and help businesses use technology to grow with confidence.',
};

/** The three philosophy pillars — equal visual weight, numbered 01–03. */
const PHILOSOPHY_PILLARS = [
  {
    title: 'We build with purpose, not just speed.',
    body:
      'Every product starts with a strong foundation—clean architecture, scalable systems, and thoughtful user experiences designed for long-term success.',
  },
  {
    title: 'We maintain what we create.',
    body:
      'Technology requires ongoing care. Through monitoring, updates, optimization, and support, we keep software secure, stable, and ready for what’s next.',
  },
  {
    title: 'We help businesses grow.',
    body:
      'Great software is only part of the equation. We help clients attract customers, improve operations, and unlock new opportunities through digital strategy and marketing.',
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
         * Card-overlap — pure CSS (sticky + z-index), no GSAP:
         *   Hero (sticky base)  ←  The Problem & Our Philosophy scroll up over it.
         *
         * ONLY the Hero is `sticky` (the backdrop). The Problem and Philosophy
         * cards are `relative` so they SCROLL fully through the viewport — this is
         * essential: a sticky card taller than the viewport hides its own lower
         * content (the next card covers it before you can reach it). Keeping them
         * relative guarantees every item (incl. challenge 03) is fully visible and
         * lets the section grow naturally with its content.
         */}
        <div className="relative">
          {/* Layer 1 — Hero (sticky base backdrop) */}
          <div className="sticky top-0 z-[1]">
            <Hero headline="Design. Develop. Grow." />
          </div>

          {/* Layer 2 — The Problem: sticky card. Its content is compact + fits one
              viewport (see ProblemSection min-h-screen), so all three challenges are
              visible while it is pinned — AND the Philosophy card slides up over it.
              PremiumMarquee is the card's top strip. */}
          <div className="sticky top-0 z-[2] overflow-hidden rounded-t-[28px] shadow-[0_-26px_70px_rgba(0,0,0,0.28)]">
            <PremiumMarquee />
            <ProblemSection problems={PROBLEMS} />
          </div>

          {/* Layer 3 — Our Philosophy: opaque card that slides up over The Problem. */}
          <div className="relative z-[3] overflow-hidden rounded-t-[28px] shadow-[0_-26px_70px_rgba(0,0,0,0.28)]">
            <section aria-label="Philosophy" className="min-h-screen bg-pulse-500 text-ink-900">
              <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,16vh,12rem)] sm:px-10">
                <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-ink-900/70">
                  {PHILOSOPHY.tagline}
                </p>
                <AnimationWrapper variant="rise">
                  <h2 className="mt-7 max-w-[22ch] font-display text-[clamp(2rem,4.6vw,4.25rem)] font-bold leading-[1.03] tracking-[-0.02em]">
                    {PHILOSOPHY.heading}
                  </h2>
                </AnimationWrapper>
                <AnimationWrapper variant="fade" delay={0.1}>
                  <p className="mt-8 max-w-2xl font-sans text-body-l leading-relaxed text-ink-900/80">
                    {PHILOSOPHY.intro}
                  </p>
                </AnimationWrapper>

                {/* Three pillars — equal visual weight; 1-col → 3-col grid. */}
                <AnimationWrapper variant="rise" stagger={0.1}>
                  <div className="mt-[clamp(3.5rem,7vh,5.5rem)] grid gap-x-10 gap-y-12 border-t border-ink-900/15 pt-[clamp(2.5rem,5vh,3.5rem)] md:grid-cols-3">
                    {PHILOSOPHY_PILLARS.map((pillar, index) => (
                      <div key={pillar.title} className="flex flex-col">
                        <span
                          aria-hidden="true"
                          className="font-mono text-mono-eyebrow font-medium tracking-[0.18em] text-ink-900/45"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="mt-4 font-display text-[clamp(1.3rem,2vw,1.7rem)] font-semibold leading-snug">
                          {pillar.title}
                        </h3>
                        <p className="mt-3 max-w-sm font-sans text-body leading-relaxed text-ink-900/75">
                          {pillar.body}
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
