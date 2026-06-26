/**
 * SplitText — accessible, staggered text reveal.
 *
 * Splits a string into per-word, per-line, or per-character spans so each
 * fragment can be revealed in sequence (Requirement 25.1). The fragments are
 * purely decorative: the wrapper element carries `aria-label={text}` so
 * assistive technology reads the original string as a single accessible name,
 * and every fragment span is marked `aria-hidden` (Requirement 25.2). The
 * concatenation of the rendered span text always reconstructs the original
 * `text` exactly, so nothing is lost or duplicated visually.
 *
 * Usage scope (Requirement 25.4): split reveals are intended ONLY for display
 * and section-opener text (hero headlines, large section titles). They must
 * NOT be applied to body prose — splitting paragraph copy harms readability and
 * accessibility. Pass whole headings here, never long-form content.
 *
 * Trigger:
 *  - `'inview'` (default): the reveal plays when the wrapper scrolls into view.
 *  - `'mount'`           : the reveal plays immediately on mount.
 *
 * Reduced motion (Requirements 37.2, 25.2/25.4 fallback): when
 * `prefers-reduced-motion` is active the text renders fully visible with no
 * transform or transition, while preserving the same accessible-name structure
 * (wrapper `aria-label`, decorative `aria-hidden` spans).
 *
 * _Requirements: 25.1, 25.2, 25.4, 37.2_
 */
import {
  createElement,
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react';
import { useInView } from '@hooks/useInView';
import { useReducedMotion } from '@hooks/useReducedMotion';

export type SplitBy = 'word' | 'line' | 'char';
export type SplitTrigger = 'inview' | 'mount';

export interface SplitTextProps {
  /** The string to split and reveal. Intended for display/section-opener text. */
  text: string;
  /** Granularity of the split. Defaults to `'word'`. */
  by?: SplitBy;
  /** The wrapper element tag. Defaults to `'span'`. */
  as?: keyof JSX.IntrinsicElements;
  /** Optional class applied to the wrapper. */
  className?: string;
  /** What triggers the reveal. Defaults to `'inview'`. */
  trigger?: SplitTrigger;
}

/** Per-fragment stagger interval (seconds) tuned to each split granularity. */
const STAGGER_STEP: Record<SplitBy, number> = {
  word: 0.05,
  char: 0.025,
  line: 0.08,
};

const REVEAL_DURATION = 0.5;

/**
 * Split `text` into fragments whose concatenation equals `text` exactly.
 *
 * The capturing-group splits keep the separators (whitespace / newlines) as
 * their own tokens so the visual output reconstructs the original string.
 */
function tokenize(text: string, by: SplitBy): string[] {
  switch (by) {
    case 'char':
      return Array.from(text);
    case 'line':
      return text.split(/(\n)/);
    case 'word':
    default:
      return text.split(/(\s+)/);
  }
}

export function SplitText({
  text,
  by = 'word',
  as = 'span',
  className,
  trigger = 'inview',
}: SplitTextProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2, once: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Whether fragments should be in their visible end state.
  const active = reducedMotion || (trigger === 'mount' ? mounted : inView);
  const step = STAGGER_STEP[by];

  // Drop empty tokens (leading/trailing separators) — concatenation is
  // unaffected and we avoid rendering empty spans.
  const tokens = tokenize(text, by).filter((token) => token.length > 0);

  const fragments = tokens.map((token, index) => {
    const isWhitespace = /^\s+$/.test(token);

    let style: CSSProperties;
    if (isWhitespace) {
      // Preserve separator whitespace exactly; no animation needed.
      style = { whiteSpace: 'pre' };
    } else if (reducedMotion) {
      // Final visible state, no transform/transition (Req 37.2).
      style = { display: 'inline-block' };
    } else {
      style = {
        display: 'inline-block',
        willChange: 'transform, opacity',
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(0.4em)',
        transition: `opacity ${REVEAL_DURATION}s ease, transform ${REVEAL_DURATION}s ease`,
        transitionDelay: `${index * step}s`,
      };
    }

    return (
      <span key={index} aria-hidden="true" style={style}>
        {token}
      </span>
    );
  });

  const Tag = as as ElementType;

  return createElement(
    Tag,
    {
      // Attach the IntersectionObserver ref only when it drives the reveal.
      ref: trigger === 'inview' && !reducedMotion ? ref : undefined,
      'aria-label': text,
      className,
      style: { display: 'inline-block' },
    },
    fragments,
  );
}

export default SplitText;
