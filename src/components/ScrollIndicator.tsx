/**
 * ScrollIndicator — animated "scroll" affordance (task 10.4).
 *
 * Shows a small bouncing chevron/line cue. When `targetId` is supplied the cue
 * is an interactive, keyboard-operable button labelled for assistive tech; on
 * activation it scrolls the matching element into view. With no `targetId` the
 * cue is purely decorative and marked `aria-hidden` so it is skipped by screen
 * readers (Requirement 38.1 / 38.5).
 *
 * Under `prefers-reduced-motion` the chevron is static (no bounce animation)
 * and the scroll jump is instant rather than smooth (Requirement 37.x).
 *
 * _Requirements: 38.1_
 */
import { motion } from 'framer-motion';

import { useReducedMotion } from '@hooks/useReducedMotion';

export interface ScrollIndicatorProps {
  /** Id of the element to scroll to when the cue is activated. */
  targetId?: string;
}

/** Decorative downward chevron drawn with an inline SVG. */
function Chevron(): JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ScrollIndicator({
  targetId,
}: ScrollIndicatorProps): JSX.Element {
  const reducedMotion = useReducedMotion();

  // The bounce loop is suppressed entirely under reduced motion.
  const animation = reducedMotion
    ? undefined
    : {
        animate: { y: [0, 8, 0] },
        transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
      };

  const cue = (
    <motion.span
      className="flex flex-col items-center text-pulse-500"
      {...animation}
    >
      <Chevron />
    </motion.span>
  );

  // Decorative only — no target to scroll to.
  if (targetId === undefined || targetId.length === 0) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none flex items-center justify-center"
      >
        {cue}
      </div>
    );
  }

  const handleScroll = (): void => {
    const target = document.getElementById(targetId);
    if (target === null) return;
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      aria-label="Scroll to next section"
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-pulse-500 transition-colors duration-200 ease-out hover:text-mist-100"
    >
      {cue}
    </button>
  );
}

export default ScrollIndicator;
