/**
 * HomePage — the `/` route module.
 */
import { useEffect, useRef } from 'react';
import type { SEOMeta } from '@app-types';

import { AnimationWrapper } from '@components/AnimationWrapper';
import { FeaturedWork } from '@components/FeaturedWork';
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

// px of Problems section left visible above the Philosophy panel.
const PANEL_PEEK = 200;

export function HomePage(): JSX.Element {
  const featuredCaseStudies = caseStudies.filter((c) => c.featured);
  const marqueeItems = team.map((member) => `${member.name} — ${member.role}`);

  // Shared wrapper for the stacked-panels sequence.
  // Its paddingBottom controls how long both panels stay pinned (storytelling time).
  const panelsWrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = panelsWrapperRef.current;
    if (!el) return;
    const update = () => {
      // Give the philosophy panel ~2 viewport heights of storytelling scroll time.
      el.style.paddingBottom = reducedMotion ? '0px' : `${window.innerHeight * 2}px`;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [reducedMotion]);

  return (
    <>
      <SEOHead meta={homeMeta} jsonLd={organizationJsonLd} />

      <main>
        {/* ── Layer 1 — Hero (z:10) ─────────────────────────────────────────── */}
        <StackSection zIndex={10} isFirst overlap>
          <Hero headline="Design. Develop. Grow." />
          <PremiumMarquee />
        </StackSection>

        {/*
         * ── Stacked panels: Problems + Philosophy ──────────────────────────
         *
         * Both panels live in a single `position:relative` wrapper.
         * Problems: `position:sticky; top:0`          → sticks at the top
         * Philosophy: `position:sticky; top:PANEL_PEEK` → sticks PANEL_PEEK px
         *             below the top, leaving Problems content visible above.
         *
         * The wrapper's paddingBottom controls the storytelling duration.
         * Once the wrapper's bottom exits the viewport both panels unstick
         * and normal scroll resumes (Team becomes visible).
         *
         * `overflow:hidden` is deliberately on an INNER div, not on the
         * sticky element, to avoid the Safari sticky+overflow bug.
         */}
        <div ref={panelsWrapperRef} style={{ position: 'relative' }}>

          {/* Problems — sticks at top:0, z-index below Philosophy */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: 'var(--ink-900)',
            }}
          >
            <section aria-label="Problems" className="w-full bg-ink-900">
              <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10">
                <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
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
          </div>

          {/* Philosophy — sticks at top:PANEL_PEEK, ALWAYS above Problems (z:30) */}
          <div
            style={{
              position: 'sticky',
              top: PANEL_PEEK,
              zIndex: 30,
            }}
          >
            {/* Inner clip: overflow+radius on a non-sticky child (Safari safe) */}
            <div
              style={{
                borderRadius: '24px 24px 0 0',
                overflow: 'hidden',
                boxShadow: '0 -24px 80px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.08)',
              }}
            >
              <section aria-label="Philosophy" className="w-full bg-pulse-500 text-ink-900">
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
                      Anything worth building is worth building to last. We make
                      order that holds — structured, tested, and maintainable —
                      so the products we ship keep working long after launch day.
                    </p>
                  </AnimationWrapper>
                </div>
              </section>
            </div>
          </div>

        </div>{/* end stacked panels wrapper */}

        {/* ── Layer 4 — Services / CapabilitiesShowcase (z:40) ─────────────── */}
        <StackSection zIndex={40}>
          <CapabilitiesShowcase capabilities={[...CAPABILITIES]} />
        </StackSection>

        {/* ── Layer 5 — Work / FeaturedWork (z:50) ─────────────────────────── */}
        <StackSection zIndex={50}>
          <FeaturedWork caseStudies={featuredCaseStudies} />
        </StackSection>

        {/* ── Team ─────────────────────────────────────────────────────────── */}
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

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
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
