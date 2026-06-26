/**
 * AnimatedCounter — counts a numeric value up when scrolled into view (task 9.3).
 *
 * Composition of two hooks:
 *  - `useInView` detects the first time the element enters the viewport and is
 *    the trigger for the count-up (Requirement 21.1).
 *  - `useCounter` tweens from `from` to `value`, easing + clamping every frame
 *    so the displayed number never leaves the `[from, value]` range
 *    (Requirement 21.3) and lands exactly on `value` (Requirement 21.2).
 *
 * The tween only starts once the element is in view AND motion is allowed; the
 * counter hook holds at `from` until then. Under reduced motion `useCounter`
 * returns the final value immediately, so the counter shows its target without
 * animating (Requirement 37.2).
 *
 * The rendered text is `prefix + value + suffix`, with the value formatted to
 * the configured number of decimal places via `toFixed` so trailing zeros are
 * preserved (Requirement 21.2).
 *
 * `duration` is expressed in seconds (design default `2`) and converted to the
 * milliseconds `useCounter` expects.
 *
 * _Requirements: 21.1, 21.2, 21.3, 37.2_
 */
import type { EasingFn } from '@app-types';
import { useCounter } from '@hooks/useCounter';
import { useInView } from '@hooks/useInView';

export interface AnimatedCounterProps {
  /** Target value the counter lands exactly on. */
  value: number;
  /** Starting value of the count-up (default `0`). */
  from?: number;
  /** Animation duration in seconds (default `2`). */
  duration?: number;
  /** Decimal places to render (default `0`). */
  decimals?: number;
  /** Text rendered before the number (e.g. `"$"`, `"+"`). */
  prefix?: string;
  /** Text rendered after the number (e.g. `"%"`, `"k"`). */
  suffix?: string;
  /** Easing applied to the tween (default `easeOutExpo` via `useCounter`). */
  easing?: EasingFn;
  /** Optional extra classes for the wrapping element. */
  className?: string;
}

export function AnimatedCounter({
  value,
  from = 0,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing,
  className,
}: AnimatedCounterProps): JSX.Element {
  const { ref, inView } = useInView<HTMLSpanElement>();

  const current = useCounter(value, {
    from,
    duration: duration * 1000,
    decimals,
    start: inView,
    ...(easing !== undefined ? { easing } : {}),
  });

  // `useCounter` already rounds to `decimals`; `toFixed` additionally preserves
  // trailing zeros so the rendered precision is exactly as configured.
  const formatted = current.toFixed(decimals);

  return (
    <span ref={ref} {...(className !== undefined ? { className } : {})}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
