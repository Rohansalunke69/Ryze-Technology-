/**
 * CustomCursor — the expressive cyan dot-and-ring cursor (task 10.1).
 *
 * Mounts ONLY when the pointer is fine (`matchMedia('(pointer: fine)')`) AND
 * motion is allowed (`useReducedMotion() === false`). In every other case it
 * renders `null`, leaving the native cursor untouched (Requirements 22.1, 22.5;
 * 37.3). This covers touch-only devices (coarse pointer) and the reduced-motion
 * preference, both of which must keep the native cursor.
 *
 * While active it renders a small dot and a lagging ring, both GPU-transformed
 * (`translate3d`) and RAF-lerped toward the pointer so the ring trails the dot.
 * The native cursor is hidden by setting `cursor: none` on `<body>` while the
 * component is mounted; the previous value is restored on unmount or when the
 * pointer leaves the window (Requirements 22.1, 22.5).
 *
 * The cursor runs a small state machine driven by what sits under the pointer,
 * resolved from `[data-cursor]` attributes on the nearest ancestor:
 *   - `link`     → hover-link state, the ring scales up and the dot hides
 *                  (Requirement 22.2);
 *   - `magnetic` → magnetic state, emitted by `MagneticButton`
 *                  (Requirement 22.3);
 *   - `view`     → labeled "VIEW" pill state (Requirement 22.4);
 *   - otherwise  → the default dot + ring.
 * When the pointer leaves the window the cursor hides and the native cursor is
 * restored (Requirement 22.5).
 *
 * _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_
 */
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@hooks/useReducedMotion';
import { lerp } from '@lib/easing';

const FINE_POINTER_QUERY = '(pointer: fine)';

/** Lerp factor for the trailing ring (lower = more lag). */
const RING_LERP = 0.15;
/** Lerp factor for the dot (snappier than the ring). */
const DOT_LERP = 0.35;

/** Cursor state derived from the element under the pointer. */
export type CursorState = 'default' | 'link' | 'magnetic' | 'view';

/** Read whether the device currently exposes a fine pointer. SSR/jsdom-safe. */
function readFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

/**
 * Subscribe to the `(pointer: fine)` media query so the cursor unmounts if the
 * device switches to a coarse pointer (e.g. a 2-in-1 folding into tablet mode).
 */
function useFinePointer(): boolean {
  const [fine, setFine] = useState<boolean>(readFinePointer);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mql = window.matchMedia(FINE_POINTER_QUERY);
    setFine(mql.matches);

    const handleChange = (event: MediaQueryListEvent): void => {
      setFine(event.matches);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, []);

  return fine;
}

/** Resolve the cursor state from the nearest `[data-cursor]` ancestor. */
function resolveCursorState(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return 'default';
  const marked = target.closest('[data-cursor]');
  const value = marked?.getAttribute('data-cursor');
  if (value === 'link' || value === 'magnetic' || value === 'view') {
    return value;
  }
  return 'default';
}

export function CustomCursor(): JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  // Mount only on a fine pointer with motion allowed (Req 22.1, 22.5, 37.3).
  const active = finePointer && !reducedMotion;

  if (!active) {
    return <CursorInactive />;
  }

  return <CursorActive />;
}

/**
 * Inactive branch: renders nothing and is a hook-free component so React's
 * rules of hooks are respected when we flip between active/inactive.
 */
function CursorInactive(): null {
  return null;
}

/** Active branch: owns all listeners, the RAF loop, and native-cursor hiding. */
function CursorActive(): JSX.Element {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Hide the native cursor while active; restore the prior value on cleanup
    // (unmount → touch/reduced-motion path renders null) (Req 22.1, 22.5).
    const body = document.body;
    const previousCursor = body.style.cursor;
    body.style.cursor = 'none';

    // Target (pointer) and current (rendered) positions for dot + ring.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: target.x, y: target.y };
    const ringPos = { x: target.x, y: target.y };

    let rafId = 0;

    const render = (): void => {
      dotPos.x = lerp(dotPos.x, target.x, DOT_LERP);
      dotPos.y = lerp(dotPos.y, target.y, DOT_LERP);
      ringPos.x = lerp(ringPos.x, target.x, RING_LERP);
      ringPos.y = lerp(ringPos.y, target.y, RING_LERP);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      target.x = event.clientX;
      target.y = event.clientY;
      setVisible(true);
      setState(resolveCursorState(event.target));
    };

    const handlePointerOver = (event: PointerEvent): void => {
      setState(resolveCursorState(event.target));
    };

    // Leaving the window hides the cursor; native cursor is effectively
    // restored visually because nothing of ours is shown (Req 22.5).
    const handlePointerLeaveWindow = (): void => {
      setVisible(false);
    };

    const handlePointerEnterWindow = (): void => {
      setVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeaveWindow);
    document.documentElement.addEventListener('pointerenter', handlePointerEnterWindow);
    window.addEventListener('blur', handlePointerLeaveWindow);

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeaveWindow);
      document.documentElement.removeEventListener('pointerenter', handlePointerEnterWindow);
      window.removeEventListener('blur', handlePointerLeaveWindow);
      body.style.cursor = previousCursor;
    };
  }, []);

  const isLink = state === 'link';
  const isView = state === 'view';
  const isMagnetic = state === 'magnetic';

  // The dot hides on the link state (the ring takes over) (Req 22.2).
  const dotHidden = isLink || isView;

  return (
    <div
      data-testid="custom-cursor"
      data-cursor-state={state}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {/* Lagging ring */}
      <div
        ref={ringRef}
        data-testid="custom-cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isView ? 'auto' : isLink ? 48 : 32,
          height: isView ? 'auto' : isLink ? 48 : 32,
          minWidth: isView ? 56 : undefined,
          padding: isView ? '6px 14px' : 0,
          borderRadius: 9999,
          border: isView ? 'none' : '1.5px solid var(--pulse-500, #22d3ee)',
          background: isView ? 'var(--pulse-500, #22d3ee)' : 'transparent',
          color: isView ? 'var(--ink-900, #0a0a0a)' : 'inherit',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          letterSpacing: '0.1em',
          fontWeight: 600,
          mixBlendMode: isLink ? 'difference' : 'normal',
          willChange: 'transform',
          transition:
            'width 200ms ease-out, height 200ms ease-out, background 200ms ease-out, border-color 200ms ease-out',
        }}
      >
        {isView ? 'VIEW' : null}
      </div>

      {/* Leading dot */}
      <div
        ref={dotRef}
        data-testid="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: 'var(--pulse-500, #22d3ee)',
          opacity: dotHidden ? 0 : 1,
          transform: isMagnetic ? 'scale(1.4)' : undefined,
          willChange: 'transform',
          transition: 'opacity 150ms ease-out',
        }}
      />
    </div>
  );
}

export default CustomCursor;
