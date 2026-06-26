/**
 * AnimationWrapper — declarative scroll-reveal wrapper.
 *
 * Wraps arbitrary content and plays a one-shot entrance animation the first
 * time the wrapper scrolls into view (driven by `useInView`/IntersectionObserver).
 * Four entrance `variant`s are supported:
 *
 *  - `rise`  (default): fades up from a small vertical offset;
 *  - `fade`           : opacity-only fade;
 *  - `clip`           : a bottom-to-top clip-path wipe reveal;
 *  - `scale`          : fades in while scaling up to its natural size.
 *
 * `delay` (seconds) offsets the start of the reveal. When `stagger` (seconds)
 * is provided, each direct child is wrapped and revealed in sequence with that
 * interval between them (with `delay` applied before the first child starts).
 *
 * Reduced motion (Requirements 37.2, 25.1): when `prefers-reduced-motion` is
 * active the wrapper renders its children immediately in their final, fully
 * visible end state with no transform, transition, or IntersectionObserver
 * gating — the content is never trapped in a hidden start state.
 *
 * Defaults: `variant='rise'`, `once=true`, `threshold=0.2`.
 *
 * _Requirements: 25.1, 37.2_
 */
import { Children, type ReactNode } from 'react';
import { motion, type TargetAndTransition, type Variants } from 'framer-motion';
import { useInView } from '@hooks/useInView';
import { useReducedMotion } from '@hooks/useReducedMotion';

export type AnimationVariant = 'rise' | 'fade' | 'clip' | 'scale';

export interface AnimationWrapperProps {
  /** Content to reveal. */
  children: ReactNode;
  /** Entrance animation style. Defaults to `'rise'`. */
  variant?: AnimationVariant;
  /** Delay before the reveal starts, in seconds. Defaults to `0`. */
  delay?: number;
  /**
   * Interval, in seconds, between the reveal of each direct child. When set
   * (and > 0) the children animate in sequence; otherwise the wrapper reveals
   * as a single unit.
   */
  stagger?: number;
  /**
   * When `true` (default) the reveal plays once and stays visible; when
   * `false` it re-hides when scrolled out of view.
   */
  once?: boolean;
  /** Fraction of the wrapper that must be visible to trigger. Defaults `0.2`. */
  threshold?: number;
}

/** Standard reveal timing shared by every variant. */
const DURATION = 0.6;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Hidden/visible target pairs for each entrance variant. */
function statesFor(variant: AnimationVariant): {
  hidden: TargetAndTransition;
  visible: TargetAndTransition;
} {
  switch (variant) {
    case 'fade':
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    case 'clip':
      return {
        hidden: { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
        visible: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
      };
    case 'scale':
      return { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } };
    case 'rise':
    default:
      return { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };
  }
}

export function AnimationWrapper({
  children,
  variant = 'rise',
  delay = 0,
  stagger,
  once = true,
  threshold = 0.2,
}: AnimationWrapperProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once });

  // Reduced motion: render the final visible state instantly (Req 37.2, 25.1).
  if (reducedMotion) {
    return <div data-animation-wrapper="">{children}</div>;
  }

  const { hidden, visible } = statesFor(variant);
  const animateState = inView ? 'visible' : 'hidden';

  // Staggered reveal: orchestrate direct children one after another.
  if (stagger !== undefined && stagger > 0) {
    const container: Variants = {
      hidden: {},
      visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    };
    const item: Variants = {
      hidden,
      visible: { ...visible, transition: { duration: DURATION, ease: EASE } },
    };

    return (
      <motion.div
        ref={ref}
        data-animation-wrapper=""
        variants={container}
        initial="hidden"
        animate={animateState}
      >
        {Children.map(children, (child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Single-unit reveal.
  const variants: Variants = {
    hidden,
    visible: { ...visible, transition: { duration: DURATION, ease: EASE, delay } },
  };

  return (
    <motion.div
      ref={ref}
      data-animation-wrapper=""
      variants={variants}
      initial="hidden"
      animate={animateState}
    >
      {children}
    </motion.div>
  );
}

export default AnimationWrapper;
