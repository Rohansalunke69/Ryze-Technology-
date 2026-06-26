/**
 * CardImage — reserved-aspect-ratio media box shared by the content cards (task 10.5).
 *
 * Every card surfaces an image (case-study hero, team portrait, blog cover,
 * testimonial avatar). To keep Cumulative Layout Shift at zero (Requirement
 * 39.3) the image is rendered inside a wrapper whose `aspect-ratio` is reserved
 * from the asset's intrinsic `width`/`height`, and the `<img>` itself carries
 * explicit `width`/`height` attributes. Images load lazily (`loading="lazy"`).
 *
 * On a load failure the `onError` handler degrades gracefully without breaking
 * layout (Requirement 42.3):
 *  - if the asset has a `blurDataURL` LQIP, the `<img>` src is swapped to it;
 *  - otherwise the box is filled with a solid, token-colored placeholder.
 * In both cases the reserved aspect box is retained so nothing reflows. A
 * one-shot guard prevents an infinite `onError` loop if the fallback also fails.
 *
 * _Requirements: 39.3, 42.3_
 */
import { useState, type SyntheticEvent } from 'react';
import type { ImageAsset } from '@app-types';
import { brandArtDataUri } from '@lib/brandArt';

export interface CardImageProps {
  /** The image asset with intrinsic dimensions used to reserve the box. */
  image: ImageAsset;
  /** Extra classes for the reserved aspect-ratio wrapper. */
  className?: string;
  /** Extra classes for the inner `<img>` element. */
  imgClassName?: string;
  /** Responsive `sizes` hint forwarded to the `<img>`. */
  sizes?: string;
}

export function CardImage({
  image,
  className,
  imgClassName,
  sizes,
}: CardImageProps): JSX.Element {
  // `true` once the image has failed and there is no LQIP to fall back to, so
  // we render the solid placeholder instead of a broken <img>.
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  // Guards against an infinite onError loop if the swapped-in fallback errors.
  const [didFallback, setDidFallback] = useState(false);

  const wrapperClasses = [
    'relative overflow-hidden bg-ink-700',
    className ?? '',
  ]
    .filter((c) => c.length > 0)
    .join(' ');

  const imgClasses = [
    'h-full w-full object-cover',
    imgClassName ?? '',
  ]
    .filter((c) => c.length > 0)
    .join(' ');

  const handleError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (didFallback) {
      // Fallback already attempted; show the solid placeholder and stop.
      setShowPlaceholder(true);
      return;
    }
    setDidFallback(true);
    if (image.blurDataURL !== undefined && image.blurDataURL.length > 0) {
      // Swap to the low-quality placeholder image, keeping the reserved box.
      event.currentTarget.src = image.blurDataURL;
    } else {
      // No LQIP — fall back to a solid token-colored fill.
      setShowPlaceholder(true);
    }
  };

  // Reserve the aspect ratio from intrinsic dimensions to prevent CLS, and
  // paint the deterministic brand artwork behind the <img> so a missing/slow
  // image never flashes a broken box — the art shows through instantly.
  const aspectRatio = `${image.width} / ${image.height}`;
  const artUri = brandArtDataUri(image.src.length > 0 ? image.src : image.alt);

  return (
    <div
      className={wrapperClasses}
      style={{
        aspectRatio,
        backgroundImage: `url("${artUri}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {showPlaceholder ? (
        <div
          className="relative flex h-full w-full items-end"
          data-card-image-placeholder="true"
          {...(image.alt.length > 0
            ? { role: 'img', 'aria-label': image.alt }
            : { 'aria-hidden': true })}
        >
          <span
            aria-hidden="true"
            className="m-3 rounded-full bg-ink-900/80 px-3 py-1 font-mono text-[0.625rem] uppercase tracking-widest text-mist-100 backdrop-blur"
          >
            Ryze
          </span>
        </div>
      ) : (
        <img
          src={image.src}
          {...(image.srcset !== undefined ? { srcSet: image.srcset } : {})}
          {...(sizes !== undefined ? { sizes } : {})}
          width={image.width}
          height={image.height}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          onError={handleError}
          className={imgClasses}
        />
      )}
    </div>
  );
}

export default CardImage;
