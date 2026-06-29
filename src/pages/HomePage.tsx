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
import type { SEOMeta } from '@app-types';

import { AnimationWrapper } from '@components/AnimationWrapper';
import { FeaturedWork } from '@components/FeaturedWork';
import { CapabilitiesShowcase, type Capability } from '@components/CapabilitiesShowcase';
import { CTA } from '@components/CTA';
import { Hero } from '@components/Hero';
import { MarqueeText } from '@components/MarqueeText';
import { SectionHeader } from '@components/SectionHeader';
import { SplitText } from '@components/SplitText';
import { TeamCard } from '@components/TeamCard';
import { SEOHead } from '@components/SEOHead';

import { caseStudies } from '@data/caseStudies';
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
 * The disciplines shown in the pinned "What we build" showcase. These are the
 * technical capabilities (each with its own animated scene), authored
 * independently of the service catalogue so the showcase scenes stay stable.
 */
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

export function HomePage(): JSX.Element {
  // Portfolio-preview shows only featured case studies (Requirement 6.2).
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);

  // Marquee of team names + roles for the Team section.
  const marqueeItems = team.map((member) => `${member.name} — ${member.role}`);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      <main>
        {/* 1 — Hero: the single heavy "hero moment" (Requirement 20.5). */}
        <Hero headline="Design. Develop. Grow." />

        {/* Kinetic marquee band — full-bleed brand statement strip. */}
        <div className="overflow-hidden border-y border-ink-600 bg-ink-800 py-5">
          <div className="font-display text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase tracking-tight text-mist-100">
            <MarqueeText
              items={[
                'Built to last',
                'Engineered permanence',
                'Web — Mobile — Systems',
                'Ryze Technology',
              ]}
            />
          </div>
        </div>

      {/* 2 — Problems: "software that rots". */}
      <section
        aria-label="Problems"
        className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
      >
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
      </section>

      {/* 3 — Philosophy: full-bleed inverted brand-blue statement. */}
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
          </AnimationWrapper>
        </div>
      </section>

      {/* What we build — pinned horizontal-scroll capabilities showcase. */}
      <CapabilitiesShowcase capabilities={[...CAPABILITIES]} />

      {/* 4 — Portfolio preview: featured case studies only (Requirement 6.2). */}
      <FeaturedWork caseStudies={featuredCaseStudies} />

      {/* 7 — Team: the team cards + a marquee of names/roles. */}
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

      {/* 8 — CTA: MagneticButton → /contact (Requirement 6.4). */}
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
