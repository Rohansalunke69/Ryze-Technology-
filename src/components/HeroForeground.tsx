/**
 * HeroForeground — True orbital card system.
 *
 * Architecture (the only correct way to make cards orbit):
 *
 *   orbit-center  (0×0 div anchored at headline centre, never moves)
 *     └── orbit-ring  (rotates 360° infinitely via GSAP)
 *           ├── card-arm-A  (static: translateX(+radius) → right side)
 *           │     └── card-shell-A  (counter-rotates so card stays upright)
 *           └── card-arm-B  (static: translateX(-radius) → left side, 180° apart)
 *                 └── card-shell-B  (counter-rotates)
 *
 * When the ring rotates by +θ, the card arm travels along the orbit circle.
 * The shell counter-rotates by -θ so the card image remains readable.
 *
 * Three rings with different radii and speeds produce the "solar system" look.
 * All rings + cards live below the z-10 headline (wrapper has no z-index →
 * z-index:auto, which stacks below any element with an explicit z-index).
 */
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { heroMidCards, heroFrontCards } from '@data/heroCards';

// ---------------------------------------------------------------------------
// Orbit ring config
// ---------------------------------------------------------------------------

const RINGS = [
  { radius: 350, duration: 28, startDeg:   0 },  // inner ring — fastest
  { radius: 500, duration: 44, startDeg:  60 },  // middle ring
  { radius: 660, duration: 62, startDeg:  30 },  // outer ring — slowest
] as const;

// ---------------------------------------------------------------------------
// Card layout — 2 cards per ring, always 180° apart
// armSide:  1 = right (0°)   –1 = left (180°)
// ---------------------------------------------------------------------------

interface CardDef {
  src: string; alt: string;
  w: number;   h: number;
  ringIdx: 0 | 1 | 2;
  armSide: 1 | -1;
}

const CARDS: CardDef[] = [
  // Inner ring
  { src: heroMidCards[2]!.src,   alt: heroMidCards[2]!.alt,   w: 165, h: 220, ringIdx: 0, armSide:  1 },
  { src: heroFrontCards[2]!.src, alt: heroFrontCards[2]!.alt, w: 210, h: 210, ringIdx: 0, armSide: -1 },
  // Middle ring
  { src: heroMidCards[0]!.src,   alt: heroMidCards[0]!.alt,   w: 200, h: 200, ringIdx: 1, armSide:  1 },
  { src: heroFrontCards[0]!.src, alt: heroFrontCards[0]!.alt, w: 228, h: 228, ringIdx: 1, armSide: -1 },
  // Outer ring
  { src: heroMidCards[1]!.src,   alt: heroMidCards[1]!.alt,   w: 258, h: 194, ringIdx: 2, armSide:  1 },
  { src: heroFrontCards[1]!.src, alt: heroFrontCards[1]!.alt, w: 170, h: 227, ringIdx: 2, armSide: -1 },
];

// ---------------------------------------------------------------------------
// Static styles
// ---------------------------------------------------------------------------

const shellStyle = (w: number, h: number): CSSProperties => ({
  width:         w,
  height:        h,
  borderRadius:  14,
  overflow:      'hidden',
  border:        '1px solid rgba(255,255,255,0.18)',
  boxShadow:     '6px -4px 44px rgba(0,0,0,0.52)',
  pointerEvents: 'none',
  userSelect:    'none',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroForeground(): JSX.Element {
  // One ref per ring (3 rings)
  const ringRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  // One ref per card shell (6 shells)
  const shellRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      RINGS.forEach((ring, ringIdx) => {
        const ringEl = ringRefs.current[ringIdx];
        if (!ringEl) return;

        // Collect shell elements for this ring's cards
        const shells = CARDS
          .map((_, i) => shellRefs.current[i])
          .filter((el, i): el is HTMLDivElement => el !== null && CARDS[i]!.ringIdx === ringIdx);

        // ── Set initial rotation offset so rings start at different angles ──
        gsap.set(ringEl,  { rotation: ring.startDeg  });
        gsap.set(shells,  { rotation: -ring.startDeg });

        // ── Ring rotates clockwise ───────────────────────────────────────────
        gsap.to(ringEl, {
          rotation: ring.startDeg + 360,
          duration: ring.duration,
          repeat:   -1,
          ease:     'none',
        });

        // ── Shells counter-rotate to keep cards upright ──────────────────────
        // Same duration, opposite direction → net absolute rotation = 0
        gsap.to(shells, {
          rotation: -ring.startDeg - 360,
          duration: ring.duration,
          repeat:   -1,
          ease:     'none',
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // Group cards by ring for rendering
  const cardsByRing = RINGS.map((_, ri) => CARDS.map((c, i) => ({ ...c, globalIdx: i })).filter(c => c.ringIdx === ri));

  return (
    /*
     * NO z-index on this wrapper.
     * z-index: auto → does NOT create a stacking context.
     * All internal elements stack below the z-10 headline div.
     */
    <div
      className="pointer-events-none absolute inset-0 hidden md:block"
      aria-hidden="true"
    >
      {/*
       * Orbit centre — a 0×0 anchor pinned to the headline centre.
       * left:50% / top:42% ≈ where "Design. Develop. Grow." sits.
       */}
      <div style={{ position: 'absolute', left: '50%', top: '42%', width: 0, height: 0 }}>

        {RINGS.map((ring, ringIdx) => (
          /*
           * Orbit ring — 0×0 div that rotates around its own centre (0,0).
           * Because the ring is 0×0, its 50%/50% transform-origin = (0,0)
           * which is exactly the orbit-centre / headline position.
           */
          <div
            key={ringIdx}
            ref={(el) => { ringRefs.current[ringIdx] = el; }}
            style={{ position: 'absolute', width: 0, height: 0 }}
          >
            {cardsByRing[ringIdx]!.map((card) => (
              /*
               * Card arm — static translateX places the card on the orbit
               * circumference at 0° (right, armSide=1) or 180° (left, armSide=-1).
               * left/top centre the card ON the orbit point.
               * When the parent ring rotates, this arm sweeps the full circle.
               */
              <div
                key={card.globalIdx}
                style={{
                  position:  'absolute',
                  left:      -card.w / 2,
                  top:       -card.h / 2,
                  transform: `translateX(${ring.radius * card.armSide}px)`,
                }}
              >
                {/*
                 * Card shell — counter-rotated by GSAP so the image stays
                 * upright while the arm sweeps the circle.
                 */}
                <div
                  ref={(el) => { shellRefs.current[card.globalIdx] = el; }}
                  style={shellStyle(card.w, card.h)}
                >
                  <img
                    src={card.src}
                    alt={card.alt}
                    draggable={false}
                    style={{
                      width:      '100%',
                      height:     '100%',
                      objectFit:  'cover',
                      display:    'block',
                      userSelect: 'none',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
