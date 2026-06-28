/**
 * MagneticButton — pointer-follow interactive button/link primitive (task 9.3).
 *
 * When motion is allowed the element translates toward the pointer scaled by
 * `strength` via the `useMagnetic` hook, which exposes spring-smoothed `x`/`y`
 * motion values bound to a `motion.button` / `motion.a` transform
 * (Requirement 23.1). The element advertises itself to the CustomCursor through
 * `data-cursor="magnetic"` so the cursor can present its magnetic state
 * (Requirement 22.3 / 23).
 *
 * Under `prefers-reduced-motion` the component renders a plain (non-motion)
 * element with no JavaScript pointer transform — only the CSS hover styling
 * applies (Requirement 23.2). The hook is already a no-op in that case; we also
 * drop the `motion` wrapper entirely so no inline transform is ever emitted.
 *
 * Every instance keeps a minimum 44×44px hit area (Requirement 36.3) and a
 * cyan ("pulse") accent with a visible focus ring (the global `:focus-visible`
 * style is never removed).
 *
 * _Requirements: 23.1, 23.2, 21.x (counter sibling), 36.3_
 */
import type { ReactNode, Ref } from 'react';
import { motion } from 'framer-motion';

import { useMagnetic } from '@hooks/useMagnetic';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface MagneticButtonProps {
  /** Visible / interactive content. */
  children: ReactNode;
  /** Render as a native `button` (default) or an anchor `a`. */
  as?: 'button' | 'a';
  /** Destination when rendered as an anchor. */
  href?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Magnetic pull factor in `0..1` (default `0.35`). */
  strength?: number;
  /** Accessible label, applied as `aria-label`. */
  ariaLabel?: string;
  /** Optional extra classes appended to the base styling. */
  className?: string;
}

/**
 * Base styling shared by both the button and anchor renderings:
 *  - `inline-flex` + centering so the label sits in the middle of the target;
 *  - `min-h-[44px] min-w-[44px]` guarantees the ≥44×44px hit area (Req 36.3);
 *  - cyan ("pulse") accent border/text with a hover ignite;
 *  - `transition-colors` gives the CSS-only hover used under reduced motion.
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] ' +
  'px-6 py-3 rounded-full border border-pulse-500 text-pulse-500 ' +
  'font-display font-bold text-xs uppercase tracking-widest cursor-pointer select-none ' +
  'transition-colors duration-200 ease-out ' +
  'hover:bg-pulse-500 hover:text-ink-900 ' +
  'focus-visible:bg-pulse-500 focus-visible:text-ink-900';

function composeClassName(extra?: string): string {
  return extra === undefined || extra.length === 0
    ? BASE_CLASSES
    : `${BASE_CLASSES} ${extra}`;
}

export function MagneticButton({
  children,
  as = 'button',
  href,
  onClick,
  strength = 0.35,
  ariaLabel,
  className,
}: MagneticButtonProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { ref, x, y } = useMagnetic(strength);

  const classes = composeClassName(className);

  // Shared attributes for every rendering.
  const commonProps = {
    'data-cursor': 'magnetic',
    className: classes,
    ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
    onClick,
  } as const;

  // Reduced motion → plain element, CSS-only hover, NO pointer transform (Req 23.2).
  if (reducedMotion) {
    if (as === 'a') {
      return (
        <a {...commonProps} {...(href !== undefined ? { href } : {})}>
          {children}
        </a>
      );
    }
    return (
      <button type="button" {...commonProps}>
        {children}
      </button>
    );
  }

  // Motion allowed → translate toward the pointer scaled by strength (Req 23.1).
  if (as === 'a') {
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        style={{ x, y }}
        {...commonProps}
        {...(href !== undefined ? { href } : {})}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      style={{ x, y }}
      {...commonProps}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
