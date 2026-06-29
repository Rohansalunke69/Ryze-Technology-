/**
 * Hero — capability-gated homepage hero (task 11.2).
 *
 * The Hero is the single decision point that chooses between the heavy animated
 * WebGL floating-cards scene and the static fallback, following the "WebGL
 * Capability Gating" flow in design.md:
 *
 *   1. ALWAYS render {@link HeroFallback} first, before any WebGL is ready
 *      (Requirement 19.1). It is the persistent background layer and the poster
 *      the animated scene cross-fades in over.
 *   2. IF reduced motion is active → render ONLY the fallback and NEVER mount a
 *      WebGL canvas (Requirement 19.2).
 *   3. IF a WebGL2 context is unavailable or the capability gate fails →
 *      render ONLY the fallback (Requirements 19.3, 19.4).
 *   4. WHEN motion is allowed, WebGL2 is available, the gate passes, AND the
 *      hero is scrolled into view → lazily import {@link HeroWebGL} via
 *      `React.lazy` + `<Suspense>` behind an IntersectionObserver (Req 19.5).
 *   5. WHEN the scene becomes ready → cross-fade from the fallback to the
 *      animated scene (Requirement 19.6).
 *
 * Chunking discipline: `three` / `@react-three/fiber` MUST NOT be imported by
 * this module or {@link HeroFallback}; they live only in the lazily-imported
 * {@link HeroWebGL} chunk (task 11.3).
 *
 * _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
 */
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type CSSProperties,
} from 'react';

import { useReducedMotion } from '@hooks/useReducedMotion';
import { useInView } from '@hooks/useInView';
import { canRenderWebGL } from '@lib/canRenderWebGL';

import { HeroFallback } from './HeroFallback';
import { ScrollIndicator } from './ScrollIndicator';

/**
 * Lazily-imported animated scene. Declared at module scope so the chunk is only
 * fetched the first time the component is actually rendered — never in the
 * entry bundle (Requirement 19.5).
 */
const HeroWebGL = lazy(() => import('./HeroWebGL'));

export interface HeroProps {
  /** Primary display headline rendered as the page `<h1>`. */
  headline: string;
  /** Optional mono eyebrow line (kept for API compatibility; not displayed). */
  eyebrow?: string;
}

/** Subtitle line beneath the headline. */
const SUBTITLE = 'Ryze Technology — software that means business.';

/**
 * Notifies the parent once the lazily-loaded scene has actually mounted, which
 * is the signal to begin the cross-fade (Requirement 19.6). Rendering this as a
 * child of `<Suspense>` means its mount effect only runs after the lazy chunk
 * resolved and committed.
 */
function HeroWebGLLayer({
  paused,
  onReady,
}: {
  paused: boolean;
  onReady: () => void;
}): JSX.Element {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return <HeroWebGL paused={paused} />;
}

export function Hero({ headline }: HeroProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1, once: true });

  const [capable, setCapable] = useState(false);
  useEffect(() => {
    if (reducedMotion) { setCapable(false); return; }
    setCapable(canRenderWebGL());
  }, [reducedMotion]);

  const [webglReady, setWebglReady] = useState(false);

  // Pause the WebGL render loop once the Hero is scrolled past (~one viewport),
  // i.e. when the next section has covered it. `useInView` here latches `true`
  // (once:true) and never detects the sticky-overlap occlusion, so without this
  // the Three.js loop would keep rendering for the entire page — a constant GPU
  // cost that makes the whole scroll feel heavy. Resumes when scrolled back up.
  const [scrolledPast, setScrolledPast] = useState(false);
  useEffect(() => {
    if (reducedMotion) return undefined;
    let past = false;
    const check = (): void => {
      const now = window.scrollY > window.innerHeight * 0.85;
      if (now !== past) {
        past = now;
        setScrolledPast(now);
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [reducedMotion]);

  const shouldMountWebGL = !reducedMotion && capable && inView;

  const fallbackLayerStyle: CSSProperties = {
    transition: reducedMotion ? undefined : 'opacity 800ms ease',
    opacity:    webglReady ? 0 : 1,
  };
  const webglLayerStyle: CSSProperties = {
    transition: 'opacity 800ms ease',
    opacity:    webglReady ? 1 : 0,
  };

  return (
    <section
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden [min-height:100vh]"
      style={{ backgroundColor: '#060607' }}
      aria-label="Intro"
    >
      {/* Background layers inside the observed ref. */}
      <div ref={ref} className="absolute inset-0">
        {/* (1) Always-present static fallback (Requirement 19.1). */}
        <div className="absolute inset-0" style={fallbackLayerStyle}>
          <HeroFallback reducedMotion={reducedMotion} />
        </div>

        {/* (4/5) Animated scene — only mounted when fully gated on. */}
        {shouldMountWebGL ? (
          <div className="absolute inset-0" style={webglLayerStyle}>
            <Suspense fallback={null}>
              <HeroWebGLLayer
                paused={!inView || scrolledPast}
                onReady={() => setWebglReady(true)}
              />
            </Suspense>
          </div>
        ) : null}

        {/* Bottom fade into the page below. */}
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-40"
          aria-hidden="true"
          style={{ backgroundImage: 'linear-gradient(to bottom, transparent, #060607)' }}
        />
      </div>


      {/* Hero content — always DOM, always sharp, always on top of canvas. */}
      <div className="relative z-10 mx-auto w-full max-w-site px-6 pb-28 pt-32 text-center sm:px-10">
        {/*
         * Center vignette behind the text block — a subtle dark oval so the
         * headline reads over any card that drifts behind it.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 55% 42% at 50% 45%, rgba(0,0,0,0.55) 0%, transparent 100%)',
          }}
        />

        <h1
          className="relative font-display font-bold leading-none tracking-[-0.03em] text-white sm:whitespace-nowrap"
          style={{ fontSize: 'clamp(1.8rem, 5.2vw, 6.2rem)' }}
        >
          {headline}
        </h1>

        {/* Subtitle — muted gray. Contrast vs #060607: ≥ 4.5:1 (WCAG AA). */}
        <p
          className="relative mx-auto mt-6 max-w-lg font-sans leading-relaxed text-white/60"
          style={{ fontSize: 'clamp(1rem, 1.4vw, 1.25rem)' }}
        >
          {SUBTITLE}
        </p>

      </div>

      {/* Scroll affordance pinned to the bottom. */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </section>
  );
}

export default Hero;
