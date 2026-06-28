/**
 * HeroForeground — two GSAP-animated DOM card layers that create true 3D
 * depth around the hero headline.
 *
 * Layer architecture (stacking within the hero <section>):
 *   z-0   WebGL canvas — ambient 3-card orbit (deep background)
 *   z-5   Mid layer    — 3 cards travel BEHIND the headline
 *   z-10  Headline     — "Design. Develop. Grow."
 *   z-20  Front layer  — 3 cards travel IN FRONT of the headline
 *
 * Each card enters from one off-screen edge, travels a diagonal path through
 * the hero area (crossing the headline zone), and exits at the opposite edge.
 * GSAP repeat:-1 with a `.set()` at timeline start causes an invisible
 * off-screen snap on each loop so the card re-enters continuously.
 *
 * Cards are hidden below `md` (768 px) to keep mobile uncluttered.
 * pointer-events: none ensures cards never swallow user interactions.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { heroMidCards, heroFrontCards } from '@data/heroCards';

// ---------------------------------------------------------------------------
// Card spec types
// ---------------------------------------------------------------------------

interface CardSpec {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Sets the element off-screen before the timeline begins. */
  initPos: (W: number, H: number) => gsap.TweenVars;
  /** Builds and returns a repeating GSAP timeline for this card. */
  buildTl: (el: HTMLElement, W: number, H: number) => gsap.core.Timeline;
}

// ---------------------------------------------------------------------------
// Mid-layer specs  (z = 5 → behind headline)
// ---------------------------------------------------------------------------

const MID_SPECS: CardSpec[] = [
  {
    // dev-design (square) — enters left, exits right diagonally
    src: heroMidCards[0]!.src,
    alt: heroMidCards[0]!.alt,
    width: 200,
    height: 200,
    initPos: (_W, H) => ({ x: -220, y: H * 0.30, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 0 })
        .set(el,  { x: -220,      y: H * 0.30, rotation:  0, scale: 1.00 })
        .to(el,   { x: W * 0.22,  y: H * 0.23, rotation:  8, scale: 1.02, duration: 7,  ease: 'none' })
        .to(el,   { x: W * 0.58,  y: H * 0.46, rotation: -6, scale: 0.96, duration: 8,  ease: 'none' })
        .to(el,   { x: W + 220,   y: H * 0.36, rotation: 10, scale: 1.00, duration: 7,  ease: 'none' }),
  },
  {
    // developers (landscape) — enters right, exits left diagonally
    src: heroMidCards[1]!.src,
    alt: heroMidCards[1]!.alt,
    width: 258,
    height: 194,
    initPos: (W, H) => ({ x: W + 280, y: H * 0.12, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 4 })
        .set(el,  { x: W + 280,  y: H * 0.12, rotation:  0, scale: 1.00 })
        .to(el,   { x: W * 0.72, y: H * 0.20, rotation: -8, scale: 1.03, duration: 8,  ease: 'none' })
        .to(el,   { x: W * 0.36, y: H * 0.44, rotation:  6, scale: 0.97, duration: 9,  ease: 'none' })
        .to(el,   { x: -280,     y: H * 0.60, rotation: -4, scale: 1.00, duration: 8,  ease: 'none' }),
  },
  {
    // social-marketing (portrait) — enters top, exits bottom
    src: heroMidCards[2]!.src,
    alt: heroMidCards[2]!.alt,
    width: 165,
    height: 220,
    initPos: (W, _H) => ({ x: W * 0.42, y: -240, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 8 })
        .set(el,  { x: W * 0.42,  y: -240,     rotation:  0, scale: 1.00 })
        .to(el,   { x: W * 0.55,  y: H * 0.20, rotation:  7, scale: 1.00, duration: 6,  ease: 'none' })
        .to(el,   { x: W * 0.28,  y: H * 0.52, rotation: -9, scale: 1.05, duration: 7,  ease: 'none' })
        .to(el,   { x: W * 0.46,  y: H + 240,  rotation:  4, scale: 0.98, duration: 6,  ease: 'none' }),
  },
];

// ---------------------------------------------------------------------------
// Front-layer specs  (z = 20 → in front of headline)
// ---------------------------------------------------------------------------

const FRONT_SPECS: CardSpec[] = [
  {
    // strategic-ads (square) — enters right-top, exits left-bottom
    src: heroFrontCards[0]!.src,
    alt: heroFrontCards[0]!.alt,
    width: 228,
    height: 228,
    initPos: (W, H) => ({ x: W + 250, y: H * 0.08, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 2 })
        .set(el,  { x: W + 250,  y: H * 0.08, rotation:  0, scale: 1.00 })
        .to(el,   { x: W * 0.66, y: H * 0.14, rotation: -7, scale: 1.04, duration: 7,  ease: 'none' })
        .to(el,   { x: W * 0.26, y: H * 0.40, rotation:  9, scale: 0.96, duration: 9,  ease: 'none' })
        .to(el,   { x: -250,     y: H * 0.58, rotation: -5, scale: 1.00, duration: 7,  ease: 'none' }),
  },
  {
    // brand-glowup (portrait) — enters left-bottom, rises to right-top
    src: heroFrontCards[1]!.src,
    alt: heroFrontCards[1]!.alt,
    width: 170,
    height: 227,
    initPos: (_W, H) => ({ x: -200, y: H * 0.74, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 6 })
        .set(el,  { x: -200,     y: H * 0.74, rotation:   0, scale: 1.00 })
        .to(el,   { x: W * 0.18, y: H * 0.50, rotation: -11, scale: 1.02, duration: 9,  ease: 'none' })
        .to(el,   { x: W * 0.50, y: H * 0.26, rotation:   7, scale: 0.95, duration: 10, ease: 'none' })
        .to(el,   { x: W * 0.80, y: -240,     rotation:  -5, scale: 1.08, duration: 8,  ease: 'none' }),
  },
  {
    // stopwatch (square) — enters bottom-center, exits top-left
    src: heroFrontCards[2]!.src,
    alt: heroFrontCards[2]!.alt,
    width: 210,
    height: 210,
    initPos: (W, H) => ({ x: W * 0.60, y: H + 230, rotation: 0, scale: 1 }),
    buildTl: (el, W, H) =>
      gsap.timeline({ repeat: -1, delay: 10 })
        .set(el,  { x: W * 0.60,  y: H + 230,  rotation:  0, scale: 1.00 })
        .to(el,   { x: W * 0.46,  y: H * 0.64, rotation: -6, scale: 1.00, duration: 6,  ease: 'none' })
        .to(el,   { x: W * 0.33,  y: H * 0.34, rotation: 11, scale: 1.04, duration: 8,  ease: 'none' })
        .to(el,   { x: W * 0.14,  y: -230,     rotation: -4, scale: 0.98, duration: 6,  ease: 'none' }),
  },
];

// ---------------------------------------------------------------------------
// Card DOM element — shared style
// ---------------------------------------------------------------------------

const CORNER_RADIUS = 14;

const cardStyle = (width: number, height: number): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width,
  height,
  borderRadius: CORNER_RADIUS,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '4px -5px 40px rgba(0,0,0,0.52)',
  willChange: 'transform',
  pointerEvents: 'none',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroForeground(): JSX.Element {
  const midRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const frontRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const ctx = gsap.context(() => {
      MID_SPECS.forEach((spec, i) => {
        const el = midRefs.current[i];
        if (!el) return;
        gsap.set(el, spec.initPos(W, H));
        spec.buildTl(el, W, H);
      });

      FRONT_SPECS.forEach((spec, i) => {
        const el = frontRefs.current[i];
        if (!el) return;
        gsap.set(el, spec.initPos(W, H));
        spec.buildTl(el, W, H);
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Mid layer — travels BEHIND the z-10 headline */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ zIndex: 5 }}
        aria-hidden="true"
      >
        {MID_SPECS.map((spec, i) => (
          <div
            key={i}
            ref={(el) => { midRefs.current[i] = el; }}
            style={cardStyle(spec.width, spec.height)}
          >
            <img
              src={spec.src}
              alt={spec.alt}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
            />
          </div>
        ))}
      </div>

      {/* Front layer — travels IN FRONT of the z-10 headline */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ zIndex: 20 }}
        aria-hidden="true"
      >
        {FRONT_SPECS.map((spec, i) => (
          <div
            key={i}
            ref={(el) => { frontRefs.current[i] = el; }}
            style={cardStyle(spec.width, spec.height)}
          >
            <img
              src={spec.src}
              alt={spec.alt}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
