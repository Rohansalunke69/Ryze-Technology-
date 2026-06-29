/**
 * PhilosophyStorytelling — a pinned, three-phase storytelling overlap.
 *
 * The sequence stacks the "Problem" panel and the blue "Philosophy" card so
 * they read like physical layered panels (Awwwards / Locomotive / Studio
 * Freight style), driven entirely by scroll position via GSAP ScrollTrigger.
 *
 *   PHASE 1 — Rise
 *     The Problem panel is fully visible.  The blue Philosophy card rises from
 *     the bottom of the viewport and parks `PANEL_PEEK` px below the top, so a
 *     slice of "Software that rots" stays visible above it the whole time.
 *
 *   PHASE 2 — Pinned storytelling
 *     The card stays pinned in place while its internal statements cross-fade
 *     through the philosophy slides.  The Problem panel remains visible above.
 *
 *   PHASE 3 — Release
 *     After the last slide, the pin releases and the whole sequence scrolls
 *     away normally — the next section (Team) flows in beneath it.
 *
 * Under `prefers-reduced-motion` the effect is skipped: Problem and each
 * Philosophy statement render as plain, sequential, fully-readable sections.
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface ProblemItem {
  title: string;
  detail: string;
}

export interface PhilosophySlide {
  heading: string;
  body: string;
}

export interface PhilosophyStorytellingProps {
  problems: ReadonlyArray<ProblemItem>;
  slides: ReadonlyArray<PhilosophySlide>;
  /** px of the Problem panel kept visible above the blue card. Default 220. */
  peek?: number;
}

const CARD_SHADOW =
  '0 -30px 90px rgba(0,0,0,0.28), 0 -12px 32px rgba(0,0,0,0.16), 0 -1px 0 rgba(0,0,0,0.1)';

/** The Problem panel content — shared between pinned + reduced-motion renders. */
function ProblemContent({
  problems,
}: {
  problems: ReadonlyArray<ProblemItem>;
}): JSX.Element {
  return (
    <>
      <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
        The problem
      </p>
      <h2 className="mt-5 max-w-[12ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-mist-100">
        Software that rots
      </h2>
      <ul className="mt-12 grid gap-x-12 gap-y-2 sm:grid-cols-3">
        {problems.map((problem, index) => (
          <li
            key={problem.title}
            className="flex flex-col gap-3 border-t border-ink-600 pt-6"
          >
            <span
              aria-hidden="true"
              className="ghost-numeral text-[clamp(2rem,5vw,3.5rem)]"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-h3 font-semibold text-mist-100">
              {problem.title}
            </h3>
            <p className="max-w-md font-sans text-body text-mist-300">
              {problem.detail}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

/** One philosophy statement — shared between pinned + reduced-motion renders. */
function SlideContent({ slide }: { slide: PhilosophySlide }): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-site px-6 sm:px-10">
      <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-ink-900/70">
        Our philosophy
      </p>
      <h2 className="mt-8 max-w-[18ch] font-display text-[clamp(2.25rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink-900">
        {slide.heading}
      </h2>
      <p className="mt-8 max-w-xl font-sans text-body-l leading-relaxed text-ink-900/80">
        {slide.body}
      </p>
    </div>
  );
}

export function PhilosophyStorytelling({
  problems,
  slides,
  peek = 220,
}: PhilosophyStorytellingProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  const trackRef  = useRef<HTMLDivElement>(null);  // tall outer scroll track
  const pinRef    = useRef<HTMLDivElement>(null);  // inner 100vh pinned stage
  const cardRef   = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const track = trackRef.current;
    const pin   = pinRef.current;
    const card  = cardRef.current;
    const slideEls = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (!track || !pin || !card || slideEls.length === 0) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Initial: card fully below the fold; only first slide visible.
      gsap.set(card, { yPercent: 100 });
      gsap.set(slideEls, { autoAlpha: 0, yPercent: 8 });
      gsap.set(slideEls[0]!, { autoAlpha: 1, yPercent: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          // The TRACK provides the scroll distance; the inner stage is pinned.
          // pinSpacing:false because the track itself already reserves the space
          // — this is what prevents the empty pin-spacer gap on release.
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: pin,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // PHASE 1 — card rises into its parked position.
      tl.to(card, { yPercent: 0, ease: 'power2.out', duration: 1.4 });

      // PHASE 2 — cross-fade through the philosophy statements.
      for (let i = 1; i < slideEls.length; i++) {
        tl.to(
          slideEls[i - 1]!,
          { autoAlpha: 0, yPercent: -8, ease: 'power1.in', duration: 0.5 },
          '+=0.9',
        );
        tl.to(
          slideEls[i]!,
          { autoAlpha: 1, yPercent: 0, ease: 'power1.out', duration: 0.5 },
          '<',
        );
      }

      // PHASE 3 — brief hold on the final statement before the pin releases.
      tl.to({}, { duration: 0.8 });
    }, trackRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  /* ── Reduced motion: plain, sequential, fully-readable sections ─────── */
  if (reducedMotion) {
    return (
      <>
        <section
          aria-label="Problems"
          className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10"
        >
          <ProblemContent problems={problems} />
        </section>
        <section aria-label="Philosophy" className="bg-pulse-500 text-ink-900">
          <div className="flex flex-col gap-16 py-[clamp(6rem,16vh,12rem)]">
            {slides.map((slide) => (
              <SlideContent key={slide.heading} slide={slide} />
            ))}
          </div>
        </section>
      </>
    );
  }

  /* ── Motion: pinned three-phase storytelling overlap ────────────────── */
  return (
    <section
      ref={pinRef}
      aria-label="Philosophy"
      className="relative h-screen overflow-hidden bg-ink-900"
    >
      {/* Problem panel — fills the pinned viewport; its top slice stays
          visible in the `peek` gap above the rising card. */}
      <div className="absolute inset-0">
        <div className="mx-auto w-full max-w-site px-6 pt-[max(96px,12vh)] sm:px-10">
          <ProblemContent problems={problems} />
        </div>
      </div>

      {/* Philosophy floating card — rises from the bottom, parks at `peek`. */}
      <div
        ref={cardRef}
        className="absolute inset-x-0"
        style={{ top: peek, bottom: 0, willChange: 'transform' }}
      >
        <div
          className="h-full overflow-hidden bg-pulse-500 text-ink-900"
          style={{ borderRadius: '24px 24px 0 0', boxShadow: CARD_SHADOW }}
        >
          {/* Slides stacked absolutely; the timeline cross-fades between them. */}
          <div className="relative h-full">
            {slides.map((slide, i) => (
              <div
                key={slide.heading}
                ref={(el) => {
                  slidesRef.current[i] = el;
                }}
                className="absolute inset-0 flex items-center"
              >
                <SlideContent slide={slide} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PhilosophyStorytelling;
