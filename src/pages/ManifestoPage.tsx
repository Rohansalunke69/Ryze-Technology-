/**
 * ManifestoPage — `/manifesto` studio manifesto (task 14.13).
 *
 * Composition (design "7. /manifesto"):
 *   Hero (oversized type) → Core beliefs (a pinned sequential reveal where
 *   motion is allowed, each belief reading like a held statement) → "What we
 *   stand against" inverted/high-contrast band → "The Ryze promise" → CTA.
 *
 * This is the most type-forward, motion-restrained-but-bold page: oversized
 * display headings carry the weight, with copy in an "Engineered Permanence"
 * voice — software built to work forever (Requirement 12.1).
 *
 * Motion (Requirements 12.2, 37.2): WHERE motion is allowed, the core beliefs
 * are presented as a sequential reveal (each belief rises in turn, staggered).
 * The beliefs are authored as real, ordered DOM content (an `<ol>`), so they
 * are always present and readable. Under `prefers-reduced-motion`,
 * `AnimationWrapper` renders its children immediately in their final, fully
 * visible end state with NO IntersectionObserver gating, pinning, or scroll
 * dependency — so every belief is visible and the page is fully usable as a
 * flowing static document.
 *
 * _Requirements: 12.1, 12.2, 37.2_
 */
import type { SEOMeta } from '@app-types';
import { SectionHeader } from '@components/SectionHeader';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { siteMetadata } from '@data/siteMetadata';

/** Per-route metadata. Canonical resolves to `/manifesto` on the site origin. */
const seo: SEOMeta = {
  title: 'Manifesto',
  description:
    'What Ryze Technology believes and what we stand against — engineered permanence, software built to work for years, not weeks. Read the studio manifesto.',
  canonical: `${siteMetadata.baseUrl}/manifesto`,
};

/** A single core belief: a held statement plus its plain-language reasoning. */
interface Belief {
  /** The belief itself — short, declarative, oversized in the layout. */
  statement: string;
  /** A line or two grounding the belief in how we actually build. */
  detail: string;
}

/**
 * The core beliefs (Requirement 12.1). Six statements in the studio's
 * industrial/architectural "Engineered Permanence" voice — software treated as
 * infrastructure, built to outlast the trend that produced it.
 */
const BELIEFS: Belief[] = [
  {
    statement: 'Software should be built to last.',
    detail:
      'We engineer products like infrastructure, not fashion. The right system keeps working long after the launch announcement is forgotten.',
  },
  {
    statement: 'Permanence is a design decision.',
    detail:
      'Durability is not luck. It is chosen at every layer — boring dependencies, documented seams, and code a stranger can still read in five years.',
  },
  {
    statement: 'Simplicity is the hardest discipline.',
    detail:
      'Anyone can add. We earn our keep by removing — cutting the clever, the speculative, and the decorative until only what the work needs remains.',
  },
  {
    statement: 'Speed is a feature, not a sacrifice.',
    detail:
      'Fast software respects the people using it. We hold performance as a constraint from the first commit, never a thing we promise to fix later.',
  },
  {
    statement: 'We own what we ship.',
    detail:
      'Handing off a problem is not finishing it. We stand behind the systems we build, and we are still here when they need to grow.',
  },
  {
    statement: 'Craft compounds.',
    detail:
      'Every honest decision makes the next one cheaper. We invest in the unglamorous foundations because that is where lasting value accrues.',
  },
];

/**
 * Statements in the "What we stand against" band (Requirement 12.1). The
 * inverse of the beliefs — the habits that produce software that rots.
 */
const STAND_AGAINST: string[] = [
  'Disposable software that breaks the moment it leaves our hands.',
  'Complexity worn as a badge of seriousness.',
  'Trend-chasing that mistakes novelty for progress.',
  'Shipping fast by quietly shipping fragile.',
  'Walking away the day after launch.',
];

/** Pads a 1-based index to a two-digit ordinal (e.g. `01`, `02`). */
function ordinal(n: number): string {
  return String(n).padStart(2, '0');
}

export function ManifestoPage(): JSX.Element {
  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Hero — oversized type (Req 12.1) */}
        <section className="mx-auto w-full max-w-site px-6 pb-20 pt-[clamp(8.5rem,20vh,13rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <SectionHeader
              as="h1"
              eyebrow="Our manifesto"
              title="We build software to last."
            />
            <p className="mt-8 max-w-3xl font-sans text-body-l text-mist-300">
              Most software is built to be replaced. We build it to endure. This
              is what we believe, how we work, and what we refuse to do — our
              case for engineered permanence.
            </p>
          </AnimationWrapper>
        </section>

        {/* Core beliefs — pinned sequential reveal under motion; flowing,
            fully visible end-state under reduced motion (Req 12.2, 37.2). */}
        <section aria-label="Our core beliefs" className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <SectionHeader as="h2" eyebrow="What we believe" title="Core beliefs" />
          <AnimationWrapper variant="rise" stagger={0.12}>
            <ol
              aria-label="Our core beliefs"
              className="mt-16 flex flex-col gap-16 md:gap-24"
            >
              {BELIEFS.map((belief, index) => (
                <li
                  key={belief.statement}
                  className="group flex flex-col gap-4 border-t border-ink-600 pt-8 transition-colors duration-300 hover:border-pulse-500/30"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block font-mono text-mono-eyebrow tracking-widest text-pulse-500 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    {ordinal(index + 1)}
                  </span>
                  <h3 className="max-w-4xl font-display text-display-l text-mist-100 transition-colors duration-300 group-hover:text-pulse-500">
                    {belief.statement}
                  </h3>
                  <p className="max-w-2xl font-sans text-body-l text-mist-300">
                    {belief.detail}
                  </p>
                </li>
              ))}
            </ol>
          </AnimationWrapper>
        </section>

        {/* What we stand against — inverted / high-contrast band (Req 12.1). */}
        <section
          aria-label="What we stand against"
          className="bg-mist-100 text-ink-900"
        >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
            <AnimationWrapper variant="fade">
              <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
                The other side
              </p>
              <h2 className="mt-3 max-w-4xl font-display text-h2 text-ink-900">
                What we stand against
              </h2>
              <ul className="mt-12 flex max-w-4xl flex-col gap-6">
                {STAND_AGAINST.map((item) => (
                  <li
                    key={item}
                    className="group relative border-t border-ink-900/15 pt-6 font-display text-h3 text-ink-900"
                  >
                    <span className="relative inline-block">
                      {item}
                      <span
                        className="absolute left-0 top-1/2 h-[2px] w-0 bg-ember-500 transition-all duration-300 ease-out group-hover:w-full"
                        aria-hidden="true"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </AnimationWrapper>
          </div>
        </section>

        {/* The Ryze promise (Req 12.1) */}
        <section aria-label="The Ryze promise" className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <div className="mx-auto flex max-w-4xl flex-col gap-8 text-center">
              <SectionHeader
                as="h2"
                align="center"
                eyebrow="Our commitment"
                title="The Ryze promise"
              />
              <p className="mx-auto max-w-2xl font-sans text-body-l text-mist-300">
                We will build you software that works — and keeps working. No
                disposable shortcuts, no complexity for its own sake, no
                disappearing after launch. We treat your product as something
                worth maintaining for years, because that is the only kind of
                software worth making.
              </p>
            </div>
          </AnimationWrapper>
        </section>

        {/* Closing CTA */}
        <CTA
          heading="Build something that lasts."
          sub="If that's the kind of software you want, let's talk about what you're building."
        />
      </main>
    </>
  );
}

export default ManifestoPage;
