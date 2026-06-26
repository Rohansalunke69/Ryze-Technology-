/**
 * MarqueeText — a continuously scrolling row of text items.
 *
 * Behavior (design.md "Animation Wrappers & Primitives"):
 *  - WHERE motion is allowed, the row continuously translates its items in the
 *    configured `direction` at the configured `speed` (px/sec) (Requirement 24.1).
 *  - WHERE `pauseOnHover` is enabled (default), pointer-over pauses the motion
 *    (Requirement 24.2).
 *  - Because the auto-motion loops indefinitely (always longer than 5 seconds),
 *    the component always exposes an explicit pause/resume control so users can
 *    stop the movement (Requirement 24.3).
 *  - WHILE Reduced_Motion is active, the row renders statically with no
 *    animation and no auto-motion control (Requirement 24.1 is motion-gated;
 *    Requirement 37.2 end-state rendering).
 *
 * Implementation: the items are rendered twice inside a flex track; the track
 * is translated from 0 to -50% via a linear, infinite CSS animation, so when
 * one copy scrolls fully out of view the second copy has seamlessly taken its
 * place. The animation duration is derived from the measured width of one copy
 * and the requested `speed` so the visual velocity is consistent regardless of
 * content length.
 *
 * _Requirements: 24.1, 24.2, 24.3, 37.2_
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface MarqueeTextProps {
  /** The text items rendered in sequence along the row. */
  items: string[];
  /** Scroll velocity in pixels per second. Defaults to 60. */
  speed?: number;
  /** Direction of travel. Defaults to `'left'`. */
  direction?: 'left' | 'right';
  /** Pause the motion while the pointer is over the row. Defaults to `true`. */
  pauseOnHover?: boolean;
  /** Node rendered between items. Defaults to a decorative bullet. */
  separator?: ReactNode;
}

const KEYFRAMES_ID = 'ryze-marquee-keyframes';
const KEYFRAMES = '@keyframes ryze-marquee-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}';

/** Inject the shared scroll keyframes once (idempotent, SSR/jsdom-safe). */
function ensureKeyframes(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

const DEFAULT_SEPARATOR = (
  <span aria-hidden="true" className="ryze-marquee__sep" style={{ padding: '0 1.5rem' }}>
    &bull;
  </span>
);

export function MarqueeText({
  items,
  speed = 60,
  direction = 'left',
  pauseOnHover = true,
  separator,
}: MarqueeTextProps): JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupWidth, setGroupWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  // Inject keyframes + measure the width of a single content copy so the
  // animation duration reflects the requested px/sec velocity.
  useEffect(() => {
    if (reducedMotion) return undefined;
    ensureKeyframes();

    const el = groupRef.current;
    if (!el) return undefined;

    const measure = (): void => setGroupWidth(el.scrollWidth);
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, items]);

  const togglePause = useCallback(() => setManuallyPaused((p) => !p), []);

  if (items.length === 0) return null;

  const sep = separator ?? DEFAULT_SEPARATOR;

  // The duplicated copy is hidden from assistive tech so the row is announced
  // exactly once.
  const renderGroup = (forwardRef: boolean, hidden: boolean): JSX.Element => (
    <div
      ref={forwardRef ? groupRef : undefined}
      className="ryze-marquee__group"
      aria-hidden={hidden || undefined}
      style={{ display: 'flex', flexShrink: 0, alignItems: 'center', whiteSpace: 'nowrap' }}
    >
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="ryze-marquee__item" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span>{item}</span>
          {sep}
        </span>
      ))}
    </div>
  );

  // ----- Reduced motion: a single static row, no animation, no controls. -----
  if (reducedMotion) {
    return (
      <div
        className="ryze-marquee ryze-marquee--static"
        data-reduced-motion="true"
        role="marquee"
        aria-label={items.join(', ')}
        style={{ overflow: 'hidden', display: 'flex', whiteSpace: 'nowrap' }}
      >
        {renderGroup(false, false)}
      </div>
    );
  }

  // ----- Motion allowed: animated, pausable row. -----
  const paused = manuallyPaused || (pauseOnHover && hovered);
  const duration = groupWidth > 0 ? groupWidth / Math.max(speed, 1) : items.length * 4;

  return (
    <div
      className="ryze-marquee"
      data-paused={paused ? 'true' : 'false'}
      role="marquee"
      aria-label={items.join(', ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', display: 'flex', whiteSpace: 'nowrap' }}
    >
      <div
        className="ryze-marquee__track"
        data-testid="marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          willChange: 'transform',
          animationName: 'ryze-marquee-scroll',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {renderGroup(true, false)}
        {renderGroup(false, true)}
      </div>

      {/*
        Auto-motion runs indefinitely (well beyond 5s), so an explicit pause
        control is always offered (Requirement 24.3). It is the first focusable
        element so keyboard users can stop the motion immediately.
      */}
      <button
        type="button"
        className="ryze-marquee__toggle"
        onClick={togglePause}
        aria-pressed={manuallyPaused}
        aria-label={manuallyPaused ? 'Resume scrolling text' : 'Pause scrolling text'}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          minWidth: 44,
          minHeight: 44,
        }}
      >
        <span aria-hidden="true">{manuallyPaused ? '\u25B6' : '\u23F8'}</span>
      </button>
    </div>
  );
}

export default MarqueeText;
