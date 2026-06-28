/**
 * Hero — capability-gated homepage hero (task 11.2).
 *
 * The Hero is the single decision point that chooses between the heavy animated
 * WebGL scene and the static fallback, following the "WebGL Capability Gating"
 * flow in design.md:
 *
 *   1. ALWAYS render {@link HeroFallback} first, before any WebGL is ready
 *      (Requirement 19.1). It is the persistent background layer and the poster
 *      the animated scene cross-fades in over.
 *   2. IF reduced motion is active → render ONLY the fallback and NEVER mount a
 *      WebGL canvas (Requirement 19.2).
 *   3. IF a WebGL2 context is unavailable or the capability gate fails (too few
 *      cores, too little memory, save-data) → render ONLY the fallback
 *      (Requirements 19.3, 19.4). Both are decided by `canRenderWebGL()`.
 *   4. WHEN motion is allowed, WebGL2 is available, the gate passes, AND the
 *      hero is scrolled into view → lazily import {@link HeroWebGL} via
 *      `React.lazy` + `<Suspense>` behind an IntersectionObserver and mount it
 *      behind the fallback (Requirement 19.5).
 *   5. WHEN the scene becomes ready → cross-fade from the fallback to the
 *      animated scene (Requirement 19.6).
 *
 * Chunking discipline: `three` / `@react-three/fiber` MUST NOT be imported by
 * this module or {@link HeroFallback}; they live only in the lazily-imported
 * {@link HeroWebGL} chunk (task 11.3) so the entry bundle stays clean.
 *
 * The headline/eyebrow/subheadline/CTA content is composed on top of whichever
 * background layer is active.
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
import { SplitText } from './SplitText';

/**
 * Lazily-imported animated scene. Declared at module scope so the chunk is only
 * fetched the first time the component is actually rendered — never in the
 * entry bundle (Requirement 19.5). Task 11.3 fills in the real R3F scene.
 */
const HeroWebGL = lazy(() => import('./HeroWebGL'));

export interface HeroProps {
  /** Oversized hero headline (revealed via SplitText). */
  headline: string;
  /** Optional mono eyebrow line above the headline. */
  eyebrow?: string;
}

const SUBHEADLINE =
  'We design and build durable digital products — websites, mobile apps, ' +
  'and business systems engineered to work forever.';

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

export function Hero({ headline, eyebrow }: HeroProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  // Watch the hero so the WebGL chunk is only requested once it scrolls in.
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    once: true,
  });

  // The capability gate touches the DOM (probes a WebGL2 context), so decide it
  // once on the client after mount rather than during render. Starts `false`
  // so the server/first paint always shows the fallback (Requirement 19.1).
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    // Reduced motion never probes WebGL at all (Requirement 19.2).
    if (reducedMotion) {
      setCapable(false);
      return;
    }
    setCapable(canRenderWebGL());
  }, [reducedMotion]);

  // Tracks when the animated scene has mounted, to drive the cross-fade.
  const [webglReady, setWebglReady] = useState(false);

  // Final gate: motion allowed + capable + in view (Requirements 19.2–19.5).
  const shouldMountWebGL = !reducedMotion && capable && inView;

  // Cross-fade: the fallback fades out only once the scene is ready; the scene
  // fades in as it becomes ready (Requirement 19.6).
  const fallbackLayerStyle: CSSProperties = {
    transition: reducedMotion ? undefined : 'opacity 800ms ease',
    opacity: webglReady ? 0 : 1,
  };
  const webglLayerStyle: CSSProperties = {
    transition: 'opacity 800ms ease',
    opacity: webglReady ? 1 : 0,
  };

  return (
    <section
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-900 [min-height:100vh]"
      aria-label="Intro"
    >
      {/* Background layers live inside the observed ref. */}
      <div ref={ref} className="absolute inset-0">
        {/* (1) Always-present static fallback (Requirement 19.1). */}
        <div className="absolute inset-0" style={fallbackLayerStyle}>
          <HeroFallback />
        </div>

        {/* (4/5) Animated scene — only mounted when fully gated on. */}
        {shouldMountWebGL ? (
          <div className="absolute inset-0" style={webglLayerStyle}>
            <Suspense fallback={null}>
              <HeroWebGLLayer
                paused={!inView}
                onReady={() => setWebglReady(true)}
              />
            </Suspense>
          </div>
        ) : null}

        {/* Living aurora energy field — atmosphere over the base layers. */}
        <div className="aurora" aria-hidden="true" />
        {/* Exposed blueprint grid hairlines for the "engineered" motif. */}
        <div className="grid-overlay absolute inset-0" aria-hidden="true" />
        {/* Bottom fade so the hero settles into the page below. */}
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-ink-900"
          aria-hidden="true"
        />
      </div>

      {/* Composed hero content on top of whichever background is active. */}
      <div className="relative z-10 mx-auto w-full max-w-site px-6 pb-28 pt-32 sm:px-10">
        {/* Kinetic eyebrow row: live status dot + label + coordinate. */}
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-mist-300">
          <span className="inline-flex items-center gap-2 text-pulse-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse-500" />
            </span>
            {eyebrow !== undefined && eyebrow.length > 0 ? eyebrow : 'Ryze Technology'}
          </span>
          <span aria-hidden="true" className="hidden h-px w-12 bg-ink-600 sm:block" />
          <span className="hidden sm:inline">Software studio · Nagpur, IN</span>
          <span aria-hidden="true" className="hidden h-px w-12 bg-ink-600 lg:block" />
          <span className="hidden lg:inline">21.15°N&nbsp;79.09°E</span>
        </div>

        {/* Oversized, constructed display headline. */}
        <SplitText
          as="h1"
          by="word"
          text={headline}
          trigger="mount"
          className="max-w-[16ch] font-display text-[clamp(3rem,9.5vw,9.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-mist-100"
        />

        <div className="mt-10 flex flex-col gap-10">
          <p className="max-w-xl font-sans text-body-l leading-relaxed text-mist-300">
            {SUBHEADLINE}
          </p>
        </div>

        {/* Hairline rule anchoring the hero to the grid. */}
        <div className="rule-pulse mt-16 w-full" aria-hidden="true" />
      </div>

      {/* Scroll affordance pinned to the bottom of the hero. */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </section>
  );
}

export default Hero;
