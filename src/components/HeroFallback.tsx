/**
 * HeroFallback — dark static hero background (task 11.2).
 *
 * The always-painted hero background layer. Rendered first by {@link Hero}
 * (Requirement 19.1) and remains the sole visual when the WebGL scene is gated
 * off: under reduced motion (19.2), without WebGL2 (19.3), or when the
 * capability gate fails (19.4). When WebGL is allowed it doubles as the
 * pre-WebGL poster that the animated scene cross-fades in over (19.6).
 *
 * The background treatment is near-black (#060607) with subtle radial glows and
 * a soft vignette. Under reduced motion, a few static card thumbnails are
 * rendered as `<img>` elements to preserve the visual concept without motion.
 *
 * No `<canvas>`, no Three.js — this module stays in the entry chunk.
 *
 * _Requirements: 19.1, 19.2, 19.3, 19.4, 19.6_
 */
import type { CSSProperties } from 'react';
import type { ImageAsset } from '@app-types';

export interface HeroFallbackProps {
  /** Optional poster image painted beneath the CSS treatment. */
  poster?: ImageAsset;
  /** When true, renders static card thumbnails for reduced-motion users. */
  reducedMotion?: boolean;
}

/** Static card images shown for reduced-motion users (4 picks, no animation). */
const STATIC_CARDS = [
  { src: '/images/hero/search-ai.jpg',       alt: 'AI-powered search interface',          style: { top: '12%',    left: '6%',   width: '18%', transform: 'rotate(-4deg)' } },
  { src: '/images/hero/brand-glowup.jpg',    alt: 'Brand glow-up poster',                 style: { top: '28%',    right: '8%',  width: '14%', transform: 'rotate(3deg)'  } },
  { src: '/images/hero/dev-design.jpg',      alt: 'Development and design work',          style: { bottom: '18%', left: '10%',  width: '15%', transform: 'rotate(2deg)'  } },
  { src: '/images/hero/team-collab.webp',    alt: 'Team collaboration session',           style: { top: '8%',     right: '14%', width: '13%', transform: 'rotate(-3deg)' } },
] as const;

export function HeroFallback({ poster, reducedMotion = false }: HeroFallbackProps): JSX.Element {
  const posterStyle: CSSProperties | undefined =
    poster === undefined
      ? undefined
      : {
          backgroundImage:    `url(${poster.src})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          aspectRatio:        `${poster.width} / ${poster.height}`,
        };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#060607' }}
      data-testid="hero-fallback"
    >
      {posterStyle !== undefined ? (
        <div className="absolute inset-0 h-full w-full" style={posterStyle} />
      ) : null}

      {/* Subtle brand-blue radial glow — top-left bloom. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(55% 45% at 15% 20%, rgba(33, 86, 201, 0.18), transparent 70%)',
            'radial-gradient(45% 40% at 85% 28%, rgba(41, 184, 229, 0.10), transparent 72%)',
            'radial-gradient(60% 50% at 50% 100%, rgba(21, 37, 97, 0.20), transparent 75%)',
          ].join(', '),
        }}
      />

      {/* Soft vignette behind the center text for headline legibility. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 50% 48%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Static card thumbnails for reduced-motion users. */}
      {reducedMotion
        ? STATIC_CARDS.map(({ src, alt, style }) => (
            <img
              key={src}
              src={src}
              alt={alt}
              className="absolute rounded-lg object-cover shadow-xl"
              style={{
                ...style,
                border: '1px solid rgba(255,255,255,0.15)',
                aspectRatio: '4/3',
              }}
            />
          ))
        : null}

      {/* Bottom gradient to blend into the page below the hero. */}
      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-32"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent, #060607)',
        }}
      />
    </div>
  );
}

export default HeroFallback;
