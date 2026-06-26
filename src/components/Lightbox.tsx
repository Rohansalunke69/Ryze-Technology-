/**
 * Lightbox — an accessible, keyboard-navigable image overlay.
 *
 * Behavior (design.md "Animation Wrappers & Primitives" + Error Handling):
 *  - WHEN a visitor opens a non-empty gallery image, the Lightbox renders as a
 *    labeled `role="dialog"` with `aria-modal`, focus trap + restore, and
 *    keyboard navigation (Requirements 33.1, 38.4).
 *  - Navigation (prev/next buttons + Left/Right arrow keys) wraps around using
 *    the pure `wrapIndex` helper, so stepping past the last image lands on the
 *    first and vice-versa (Requirement 33.2–33.4 are validated on `wrapIndex`).
 *  - `Esc` closes the overlay (Requirement 38.4).
 *  - IF the gallery image array is empty, or `open` is requested with a
 *    non-finite index that cannot be wrapped, the Lightbox is a no-op and does
 *    not open (Requirement 33.5).
 *
 * Focus management: on open the previously-focused element is remembered and
 * focus moves into the dialog; `Tab`/`Shift+Tab` are trapped within the dialog;
 * on close focus is restored to the triggering element (Requirement 38.4).
 *
 * _Requirements: 33.1, 33.5, 38.4_
 */
import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import type { ImageAsset } from '@app-types';
import { wrapIndex } from '@lib/wrapIndex';

export interface LightboxProps {
  /** The gallery images. An empty array makes the Lightbox a no-op. */
  images: ImageAsset[];
  /** The requested image index (wrapped into range via `wrapIndex`). */
  index: number;
  /** Whether the Lightbox should be open. */
  open: boolean;
  /** Called when the user requests to close (Esc, close button, backdrop). */
  onClose: () => void;
  /** Called with the next index; the caller updates `index`. Wraps via `wrapIndex`. */
  onIndexChange: (i: number) => void;
}

/** Selector matching the focusable controls inside the dialog. */
const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

export function Lightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
}: LightboxProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const length = images.length;
  // A valid open requires at least one image and a finite index that can be
  // wrapped into range (Requirement 33.5).
  const canOpen = open && length > 0 && Number.isFinite(index);
  const currentIndex = canOpen ? wrapIndex(Math.trunc(index), length) : 0;

  // Focus trap + restore: remember the trigger, move focus into the dialog on
  // open, and restore it on close/unmount (Requirement 38.4).
  useEffect(() => {
    if (!canOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(() => dialogRef.current?.focus())
        : (dialogRef.current?.focus(), 0);

    return () => {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf as number);
      const prev = previouslyFocused.current;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [canOpen]);

  const goPrev = useCallback(() => {
    onIndexChange(wrapIndex(currentIndex - 1, length));
  }, [currentIndex, length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange(wrapIndex(currentIndex + 1, length));
  }, [currentIndex, length, onIndexChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          return;
        case 'ArrowLeft':
          event.preventDefault();
          goPrev();
          return;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          return;
        case 'Tab': {
          const root = dialogRef.current;
          if (!root) return;
          const focusable = Array.from(
            root.querySelectorAll<HTMLElement>(FOCUSABLE),
          ).filter((el) => !el.hasAttribute('disabled'));
          if (focusable.length === 0) {
            event.preventDefault();
            root.focus();
            return;
          }
          const first = focusable[0]!;
          const last = focusable[focusable.length - 1]!;
          const active = document.activeElement;
          if (event.shiftKey && (active === first || active === root)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
          }
          return;
        }
        default:
      }
    },
    [goPrev, goNext, onClose],
  );

  // No-op when there is nothing valid to show (Requirement 33.5).
  if (!canOpen) return null;

  const image = images[currentIndex]!;
  const label = `Image ${currentIndex + 1} of ${length}${image.alt ? `: ${image.alt}` : ''}`;

  return (
    <div
      className="ryze-lightbox__overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="ryze-lightbox"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', outline: 'none', maxWidth: '90vw', maxHeight: '90vh' }}
      >
        <button
          type="button"
          className="ryze-lightbox__close"
          onClick={onClose}
          aria-label="Close image viewer"
          style={{ position: 'absolute', top: 0, right: 0, minWidth: 44, minHeight: 44 }}
        >
          <span aria-hidden="true">{'\u2715'}</span>
        </button>

        <button
          type="button"
          className="ryze-lightbox__prev"
          onClick={goPrev}
          aria-label="Previous image"
          style={{ position: 'absolute', left: 0, top: '50%', minWidth: 44, minHeight: 44 }}
        >
          <span aria-hidden="true">{'\u2039'}</span>
        </button>

        <figure style={{ margin: 0 }}>
          <img
            src={image.src}
            srcSet={image.srcset}
            width={image.width}
            height={image.height}
            alt={image.alt}
            className="ryze-lightbox__image"
            style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block' }}
          />
        </figure>

        <button
          type="button"
          className="ryze-lightbox__next"
          onClick={goNext}
          aria-label="Next image"
          style={{ position: 'absolute', right: 0, top: '50%', minWidth: 44, minHeight: 44 }}
        >
          <span aria-hidden="true">{'\u203A'}</span>
        </button>

        <p
          className="ryze-lightbox__counter"
          aria-live="polite"
          style={{ textAlign: 'center', margin: 0 }}
        >
          {currentIndex + 1} / {length}
        </p>
      </div>
    </div>
  );
}

export default Lightbox;
