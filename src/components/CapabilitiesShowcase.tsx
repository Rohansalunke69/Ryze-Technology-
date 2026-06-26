/**
 * CapabilitiesShowcase — pinned horizontal-scroll "what we build" sequence.
 *
 * The signature scroll moment for the homepage: the section pins to the
 * viewport and the panel track scrubs horizontally as the visitor scrolls
 * vertically, walking them through Ryze's core capabilities (web, mobile,
 * desktop, systems). It is the clearest way to *show* the breadth of the
 * studio's work rather than list it.
 *
 * Motion contract:
 *  - Motion allowed → GSAP `ScrollTrigger` pins the section and translates the
 *    track from 0 to its overflow width, scrubbed to scroll progress
 *    (`useScrollAnimation` scopes + auto-kills it on unmount).
 *  - Reduced motion → no pin, no scrub: the panels render as a normal
 *    responsive grid, fully visible and readable with zero scroll dependency.
 *
 * SSR/jsdom safe: the GSAP setup only runs in a browser layout effect; under
 * the reduced-motion branch (used in tests) it renders static markup.
 */
import type { Service } from '@app-types';
import type { RefObject } from 'react';
import { useReducedMotion } from '@hooks/useReducedMotion';
import { useScrollAnimation } from '@hooks/useScrollAnimation';

export interface CapabilitiesShowcaseProps {
  /** The capabilities to walk through (typically the four services). */
  services: Service[];
}

/** A single capability panel — large index, name, tagline, and tech chips. */
function Panel({ service, index }: { service: Service; index: number }): JSX.Element {
  return (
    <article
      data-panel=""
      className="flex w-[88vw] shrink-0 flex-col justify-between gap-10 rounded-2xl border border-ink-600 bg-ink-800 p-8 sm:w-[68vw] sm:p-12 lg:w-[46vw]"
    >
      <div className="flex items-start justify-between gap-6">
        <span
          aria-hidden="true"
          className="ghost-numeral text-[clamp(3.5rem,8vw,7rem)]"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="mt-3 font-mono text-mono-eyebrow uppercase tracking-[0.2em] text-pulse-500">
          Capability
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.02em] text-mist-100">
          {service.name}
        </h3>
        <p className="max-w-md font-sans text-body-l text-mist-300">
          {service.tagline}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {service.techStack.slice(0, 5).map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-ink-600 px-3 py-1 font-mono text-xs text-mist-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function CapabilitiesShowcase({
  services,
}: CapabilitiesShowcaseProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  // Pin the section and scrub the track horizontally across scroll. No-op under
  // reduced motion (the hook re-runs and we simply never build the timeline).
  const ref = useScrollAnimation(({ el, gsap, reducedMotion: rm }) => {
    if (rm) return;
    const track = el.querySelector<HTMLElement>('[data-track]');
    if (track === null) return;

    const distance = (): number => track.scrollWidth - el.clientWidth;

    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <section
      ref={ref as RefObject<HTMLElement>}
      aria-label="What we build"
      className="relative overflow-hidden bg-ink-900"
    >
      <div className="mx-auto w-full max-w-site px-6 pt-[clamp(5rem,10vh,8rem)] sm:px-10">
        <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
          What we build
        </p>
        <h2 className="mt-6 max-w-[16ch] font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.96] tracking-[-0.02em] text-mist-100">
          Four disciplines, one standard.
        </h2>
      </div>

      {reducedMotion ? (
        // Reduced motion: static, fully-visible responsive grid (no pin/scrub).
        <div className="mx-auto grid w-full max-w-site gap-6 px-6 py-12 sm:grid-cols-2 sm:px-10">
          {services.map((service, index) => (
            <Panel key={service.slug} service={service} index={index} />
          ))}
        </div>
      ) : (
        // Motion: a horizontal track that gets pinned + scrubbed by GSAP.
        <div className="py-[clamp(3rem,6vh,5rem)]">
          <div
            data-track=""
            className="flex gap-6 px-6 will-change-transform sm:gap-10 sm:px-10"
          >
            {services.map((service, index) => (
              <Panel key={service.slug} service={service} index={index} />
            ))}
            {/* Trailing spacer so the last panel can rest fully in view. */}
            <div aria-hidden="true" className="w-[10vw] shrink-0" />
          </div>
        </div>
      )}
    </section>
  );
}

export default CapabilitiesShowcase;
