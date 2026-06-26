/**
 * Imperative GSAP / DOM animation wrappers.
 *
 * These are the thin imperative helpers that hooks and components call to drive
 * scroll-reveals, section pinning, parallax, text splitting, and pointer-driven
 * hover distortion. Unlike the pure numeric helpers in this folder (easing,
 * clamp, paginate, …) these touch the DOM and GSAP, so they are validated by
 * example/integration tests rather than property-based tests.
 *
 * Reduced-motion contract (Requirement 37.2): every motion helper accepts a
 * `reducedMotion` flag. When it is `true` the helper resolves to the animation's
 * *end state* instantly and creates **no** ScrollTrigger — split text stays
 * fully visible, parallax sits at its neutral position, and revealed media is
 * shown statically. In that case the motion helpers return `undefined` (there is
 * no live ScrollTrigger handle to clean up). When motion is allowed they return
 * the created `ScrollTrigger` so the caller can `.kill()` it on unmount
 * (Requirement 20.4 is handled by the `useScrollAnimation` context; these raw
 * wrappers hand back the instance for callers that manage their own lifecycle).
 *
 * `applySplit` is pure DOM (no motion) and always runs — it is what makes split
 * reveals accessible by exposing the original text via `aria-label` on the
 * wrapper and marking the per-piece spans `aria-hidden` (Requirement 25.2). The
 * caller decides, per Requirement 25.4, to apply it only to display and
 * section-opener text, never body prose.
 *
 * _Requirements: 20.5, 25.1, 25.3, 25.4, 37.2_
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger a single time for all callers. `registerPlugin` is
// idempotent, so this is safe even when other modules register it too.
gsap.registerPlugin(ScrollTrigger);

/** Reveal variants supported by {@link revealOnScroll}. */
export type RevealVariant = 'rise' | 'fade' | 'clip' | 'scale';

/** Options for {@link revealOnScroll}. */
export interface RevealOnScrollOptions {
  /** Which reveal transition to play. */
  variant: RevealVariant;
  /** Live `prefers-reduced-motion` preference. */
  reducedMotion: boolean;
}

/** Hidden "from" state per reveal variant. */
const REVEAL_FROM: Record<RevealVariant, gsap.TweenVars> = {
  rise: { autoAlpha: 0, y: 48 },
  fade: { autoAlpha: 0 },
  // A left-to-right clip-path wipe (Requirement 25.3) for media reveals.
  clip: { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' },
  scale: { autoAlpha: 0, scale: 0.92 },
};

/** Visible "to" / end state per reveal variant. */
const REVEAL_TO: Record<RevealVariant, gsap.TweenVars> = {
  rise: { autoAlpha: 1, y: 0 },
  fade: { autoAlpha: 1 },
  clip: { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)' },
  scale: { autoAlpha: 1, scale: 1 },
};

/**
 * Reveal an element as it scrolls into view.
 *
 * When motion is allowed the element animates from its hidden state to its
 * visible state, triggered by a ScrollTrigger as it enters the viewport, and the
 * created ScrollTrigger is returned. Under reduced motion the element is set to
 * its end state instantly with no ScrollTrigger and `undefined` is returned
 * (Requirements 25.1, 25.3, 37.2).
 *
 * @param el - The element to reveal.
 * @param opts - Reveal variant and reduced-motion flag.
 * @returns The created ScrollTrigger, or `undefined` under reduced motion.
 */
export function revealOnScroll(
  el: HTMLElement,
  opts: RevealOnScrollOptions,
): ScrollTrigger | undefined {
  const { variant, reducedMotion } = opts;

  if (reducedMotion) {
    // End-state instantly: visible, no movement, no ScrollTrigger.
    gsap.set(el, REVEAL_TO[variant]);
    return undefined;
  }

  const tween = gsap.fromTo(el, REVEAL_FROM[variant], {
    ...REVEAL_TO[variant],
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });

  return tween.scrollTrigger;
}

/** Options for {@link pinSection}. */
export interface PinSectionOptions {
  /** ScrollTrigger `end` expression (e.g. `'+=100%'`). */
  end: string;
  /** Scrub setting: `true`, a number (seconds of catch-up), or `false`. */
  scrub: boolean | number;
  /** Live `prefers-reduced-motion` preference. */
  reducedMotion: boolean;
}

/**
 * Pin an element in place while the page scrolls past it.
 *
 * No-op under reduced motion (returns `undefined`) so the section simply scrolls
 * normally (Requirement 37.2). Otherwise pins the element and returns the
 * created ScrollTrigger.
 *
 * @param el - The element to pin.
 * @param opts - End expression, scrub setting, and reduced-motion flag.
 * @returns The created ScrollTrigger, or `undefined` under reduced motion.
 */
export function pinSection(
  el: HTMLElement,
  opts: PinSectionOptions,
): ScrollTrigger | undefined {
  const { end, scrub, reducedMotion } = opts;

  if (reducedMotion) {
    return undefined;
  }

  return ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end,
    pin: true,
    scrub,
  });
}

/** Options for {@link parallaxLayer}. */
export interface ParallaxLayerOptions {
  /**
   * Parallax speed multiplier. Positive values move the layer up as the page
   * scrolls down; larger magnitudes move it further.
   */
  speed: number;
  /** Live `prefers-reduced-motion` preference. */
  reducedMotion: boolean;
}

/**
 * Translate a layer at a scroll-linked speed for a parallax effect.
 *
 * Under reduced motion the layer is set to its neutral (un-translated) position
 * with no ScrollTrigger and `undefined` is returned (Requirement 37.2).
 * Otherwise the layer is scrubbed against scroll progress and the created
 * ScrollTrigger is returned.
 *
 * @param el - The layer element to translate.
 * @param opts - Speed multiplier and reduced-motion flag.
 * @returns The created ScrollTrigger, or `undefined` under reduced motion.
 */
export function parallaxLayer(
  el: HTMLElement,
  opts: ParallaxLayerOptions,
): ScrollTrigger | undefined {
  const { speed, reducedMotion } = opts;

  if (reducedMotion) {
    // Neutral position, no motion.
    gsap.set(el, { yPercent: 0 });
    return undefined;
  }

  const tween = gsap.fromTo(
    el,
    { yPercent: speed * 50 },
    {
      yPercent: -speed * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  );

  return tween.scrollTrigger;
}

/** How {@link applySplit} divides the element's text. */
export type SplitBy = 'word' | 'line' | 'char';

/** Result handle returned by {@link applySplit}. */
export interface SplitResult {
  /** The per-piece span elements, in document order. */
  spans: HTMLElement[];
  /** Restore the element to its original markup and `aria-label` state. */
  revert: () => void;
}

/** Divide a source string into pieces according to the split mode. */
function splitPieces(text: string, by: SplitBy): string[] {
  switch (by) {
    case 'char':
      return Array.from(text);
    case 'line':
      return text.split(/\r?\n/);
    case 'word':
    default:
      // Collapse runs of whitespace; drop empty edges so each piece is a word.
      return text.split(/\s+/).filter((piece) => piece.length > 0);
  }
}

/**
 * Split an element's text into per-piece spans for staggered reveals, keeping it
 * accessible.
 *
 * The original text is preserved as the element's single accessible name via
 * `aria-label`, and every generated span is marked `aria-hidden` so assistive
 * technology reads the intact phrase rather than the fragmented spans
 * (Requirement 25.2). This is pure DOM work with no motion; the caller animates
 * the returned spans. `revert()` restores the original markup and the prior
 * `aria-label` state exactly.
 *
 * @param el - The element whose text should be split.
 * @param by - Split granularity: `'word'`, `'line'`, or `'char'`.
 * @returns The created spans and a `revert` cleanup function.
 */
export function applySplit(el: HTMLElement, by: SplitBy): SplitResult {
  const originalText = el.textContent ?? '';
  const originalHTML = el.innerHTML;
  const hadAriaLabel = el.hasAttribute('aria-label');
  const previousAriaLabel = el.getAttribute('aria-label');

  const doc = el.ownerDocument;
  const pieces = splitPieces(originalText, by);

  // Expose the intact text to AT, then replace the content with hidden spans.
  el.setAttribute('aria-label', originalText);
  el.textContent = '';

  const spans: HTMLElement[] = [];
  pieces.forEach((piece, index) => {
    const span = doc.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = `split-${by}`;
    span.style.display = 'inline-block';
    span.textContent = piece;
    el.appendChild(span);
    spans.push(span);

    // Re-introduce inter-piece separators so the visual text reads naturally.
    if (index < pieces.length - 1) {
      if (by === 'word') {
        el.appendChild(doc.createTextNode(' '));
      } else if (by === 'line') {
        el.appendChild(doc.createElement('br'));
      }
    }
  });

  const revert = (): void => {
    el.innerHTML = originalHTML;
    if (hadAriaLabel) {
      el.setAttribute('aria-label', previousAriaLabel as string);
    } else {
      el.removeAttribute('aria-label');
    }
  };

  return { spans, revert };
}

/** Options for {@link hoverDistort}. */
export interface HoverDistortOptions {
  /** Maximum tilt in degrees at the element's edges. */
  intensity: number;
}

/**
 * Apply a pointer-driven 3D tilt ("distort") to an element on hover.
 *
 * While the pointer moves over the element it tilts toward the pointer scaled by
 * `intensity`; on `pointerleave` it springs back to rest. Returns a cleanup
 * function that removes the listeners and clears the applied transform — callers
 * MUST invoke it on unmount.
 *
 * @param el - The element to distort.
 * @param opts - Tilt intensity.
 * @returns A cleanup function that detaches listeners and resets the transform.
 */
export function hoverDistort(el: HTMLElement, opts: HoverDistortOptions): () => void {
  const { intensity } = opts;

  const rotateXTo = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' });
  const rotateYTo = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' });

  const handlePointerMove = (event: PointerEvent): void => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    // Pointer position relative to center, normalized to [-0.5, 0.5].
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateYTo(px * intensity);
    rotateXTo(-py * intensity);
  };

  const handlePointerLeave = (): void => {
    rotateXTo(0);
    rotateYTo(0);
  };

  el.addEventListener('pointermove', handlePointerMove);
  el.addEventListener('pointerleave', handlePointerLeave);

  return () => {
    el.removeEventListener('pointermove', handlePointerMove);
    el.removeEventListener('pointerleave', handlePointerLeave);
    gsap.set(el, { clearProps: 'transform' });
  };
}
