/**
 * HeroSection
 *
 * The first viewport section. It renders the fixed value-proposition headline
 * and subheadline, exactly one primary visual element (an animated gradient via
 * {@link HeroVisual}), and exactly one Primary CTA.
 *
 * Behaviour:
 *  - Displays the fixed headline "We build products that work forever" as the
 *    page `<h1>` (Requirement 1.1) and the subheadline as supporting text
 *    (Requirement 1.2).
 *  - Renders exactly one primary visual — an animated gradient (Requirement
 *    1.3) — which is rendered statically (no motion) under reduced motion
 *    (Requirement 1.8).
 *  - Renders exactly one Primary CTA (Requirement 1.4) that smooth-scrolls to
 *    its target section: "See our work" -> Portfolio (Requirement 1.5) and
 *    "Let's talk" -> Contact (Requirement 1.6), driven generically by the
 *    content's `cta.targetSection`.
 *  - Fills at least 90% of the viewport height on desktop (Requirement 1.7).
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

import { smoothScrollToSection, useReducedMotionContext } from '@hooks';
import { heroContent } from '../content/hero';
import { HeroVisual } from './HeroVisual';

/** Split a headline into its leading text and the final accented word. */
function splitHeadline(headline: string): { lead: string; accent: string } {
  const trimmed = headline.trimEnd();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) {
    return { lead: '', accent: trimmed };
  }
  return {
    lead: trimmed.slice(0, lastSpace),
    accent: trimmed.slice(lastSpace + 1),
  };
}

export function HeroSection(): JSX.Element {
  const reducedMotion = useReducedMotionContext();
  const { headline, subheadline, cta } = heroContent;
  const { lead, accent } = splitHeadline(headline);

  const handleCtaActivate = (): void => {
    smoothScrollToSection(cta.targetSection, reducedMotion);
  };

  // Entrance polish: a subtle fade/rise that is skipped under reduced motion so
  // the final visual state is shown immediately (Requirement 1.8 / 11.2).
  const entranceClass = reducedMotion
    ? 'opacity-100'
    : 'animate-[ryze-hero-rise_700ms_ease-out_both]';

  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative isolate flex min-h-[90vh] w-full items-center overflow-hidden bg-navy"
    >
      {/* Exactly one primary visual element (Requirement 1.3). */}
      <HeroVisual animate={!reducedMotion} />

      {!reducedMotion ? (
        <style>{`
@keyframes ryze-hero-rise {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}`}</style>
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 tablet:px-10 desktop:py-32">
        <div className={`flex flex-col gap-8 ${entranceClass}`}>
          <h1
            id="hero-headline"
            className="max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight text-body tablet:text-6xl desktop:text-7xl"
          >
            {lead}{' '}
            <span className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              {accent}
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-body-muted tablet:text-xl desktop:text-2xl">
            {subheadline}
          </p>

          <div className="mt-4">
            {/* Exactly one Primary CTA (Requirement 1.4). */}
            <button
              type="button"
              onClick={handleCtaActivate}
              className="inline-flex min-h-tap-target min-w-tap-target items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-navy-900 shadow-lg shadow-accent/20 transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-accent-500 hover:shadow-accent/40 focus-visible:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {cta.label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
