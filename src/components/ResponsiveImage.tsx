/**
 * ResponsiveImage
 *
 * Renders a `<picture>` element that serves next-generation image formats
 * (AVIF, then WebP) with a raster fallback `<img>` carrying explicit
 * width/height (to prevent layout shift) and a required `alt` attribute.
 *
 * It implements a graceful degradation chain on load failure:
 *   1. Primary `<picture>` (AVIF -> WebP -> fallback raster).
 *   2. On `<img>` error -> a styled initials placeholder graphic.
 *   3. If the placeholder also fails -> a reserved, aspect-ratio-stable empty
 *      box that shows no visual element (preventing layout shift).
 *
 * Requirements: 5.5, 5.6, 12.3, 12.4, 12.5, 13.3
 */
import { useState } from 'react';
import type { CaseStudyImage, TeamMemberImage } from '@apptypes';

/**
 * The shared responsive image model. `CaseStudyImage` and `TeamMemberImage`
 * are structurally identical; either may be supplied.
 */
export type ResponsiveImageModel = CaseStudyImage | TeamMemberImage;

/** Tracks which stage of the fallback chain is currently rendered. */
type FallbackStage = 'picture' | 'initials' | 'reserved';

export interface ResponsiveImageProps {
  /** The responsive image model (avifSrc, webpSrc, fallbackSrc, width, height, alt). */
  image: ResponsiveImageModel;
  /**
   * When true the image is treated as above-the-fold (e.g. the hero): it loads
   * eagerly with a high fetch priority. Otherwise it lazy-loads and decodes
   * asynchronously (Requirement 12.4).
   */
  priority?: boolean;
  /** Initials shown by the placeholder graphic when the photo fails (Requirement 5.5). */
  initials?: string;
  /** Optional class names applied to the rendered element. */
  className?: string;
}

export function ResponsiveImage({
  image,
  priority = false,
  initials,
  className,
}: ResponsiveImageProps): JSX.Element {
  const [stage, setStage] = useState<FallbackStage>('picture');

  const { avifSrc, webpSrc, fallbackSrc, width, height, alt } = image;
  // Reserve layout space via the intrinsic aspect ratio so all stages occupy
  // the same footprint and never shift surrounding content (Req 12.3, 5.6).
  const aspectRatio = `${width} / ${height}`;

  // The placeholder graphic: an inline SVG avatar rendering the member's
  // initials. Backing the placeholder with a real image element means a render
  // failure of the graphic itself is observable and advances to the reserved
  // stage (Req 5.6).
  const initialsGraphicSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
        `<rect width="100%" height="100%" fill="#1e293b"/>` +
        `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" ` +
        `fill="#22d3ee" font-family="sans-serif" font-weight="600" ` +
        `font-size="${Math.round(Math.min(width, height) / 2)}">${initials ?? ''}</text>` +
        `</svg>`,
    );

  // Stage 3: both the photo and the initials placeholder failed. Reserve the
  // layout space with a fixed aspect-ratio box and show no visual element.
  if (stage === 'reserved') {
    return (
      <div
        className={className}
        style={{ aspectRatio }}
        data-testid="responsive-image-reserved"
        aria-hidden="true"
      />
    );
  }

  // Stage 2: the photo failed to load; show a styled initials placeholder.
  // The visible initials are rendered as text in a styled box, backed by a
  // graphic image element whose own failure advances to the reserved stage.
  if (stage === 'initials') {
    return (
      <div
        className={[
          'relative flex items-center justify-center bg-slate-800 font-semibold uppercase text-cyan-400',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
        data-testid="responsive-image-initials"
      >
        <span aria-hidden="true">{initials ?? ''}</span>
        <img
          src={initialsGraphicSrc}
          alt=""
          aria-hidden="true"
          className="sr-only"
          data-testid="responsive-image-initials-graphic"
          onError={() => setStage('reserved')}
        />
      </div>
    );
  }

  // Stage 1: the primary picture with next-gen sources and a raster fallback.
  return (
    <picture data-testid="responsive-image-picture">
      <source type="image/avif" srcSet={avifSrc} />
      <source type="image/webp" srcSet={webpSrc} />
      <img
        src={fallbackSrc}
        width={width}
        height={height}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'auto' : 'async'}
        // `fetchpriority` is not yet in the React DOM typings, so set it
        // imperatively via a callback ref for above-the-fold (hero) images.
        ref={(node) => {
          if (node && priority) {
            node.setAttribute('fetchpriority', 'high');
          }
        }}
        onError={() => setStage('initials')}
      />
    </picture>
  );
}

export default ResponsiveImage;
