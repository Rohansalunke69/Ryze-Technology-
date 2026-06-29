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
       * Single linear scroll flow — every section appears exactly once, in order:
       *   Hero → Marquee → Problem/Philosophy → Services → Work → Team → CTA
       *
       * No z-index stacking, no overlap pins. The ONLY pinned sections are
       * PhilosophyStorytelling and CapabilitiesShowcase, and both reserve their
       * own scroll space (pinSpacing:true) so nothing overlaps or reappears.
       */}
      <main>
        {/* 1 — Hero */}
        <Hero headline="Design. Develop. Grow." />

        {/* Marquee strip */}
        <PremiumMarquee />

        {/* 2 — Problem → Philosophy (one pinned storytelling timeline) */}
        <PhilosophyStorytelling problems={PROBLEMS} slides={PHILOSOPHY_SLIDES} />

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
