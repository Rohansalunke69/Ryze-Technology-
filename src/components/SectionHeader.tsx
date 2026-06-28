/**
 * SectionHeader — eyebrow label + section heading (task 10.4).
 *
 * Renders an optional mono "eyebrow" kicker above a display-font heading. The
 * heading element is `h1` or `h2` per the `as` prop (default `h2`) so callers
 * keep a correct, ordered heading hierarchy — exactly one `h1` per page, with
 * section openers as `h2` (Requirement 38.1). The visible heading text is
 * revealed with `SplitText`, which preserves the original string as a single
 * accessible name (`aria-label`) so the heading's accessible name is always the
 * untouched `title` regardless of the per-fragment split.
 *
 * Alignment is `left` (default) or `center`; centered headers also center the
 * block via `mx-auto` so the eyebrow and title share an axis.
 *
 * _Requirements: 38.1, 6.4, 9.3_
 */
import { SplitText } from './SplitText';

export interface SectionHeaderProps {
  /** Optional mono kicker rendered above the title. */
  eyebrow?: string;
  /** The section heading text. */
  title: string;
  /** Horizontal alignment of the block. Defaults to `'left'`. */
  align?: 'left' | 'center';
  /** Heading level. Defaults to `'h2'`; use `'h1'` only for a page's sole h1. */
  as?: 'h1' | 'h2';
}

/** Heading-level → fluid display type token. h1 reads larger than h2. */
const HEADING_SIZE: Record<'h1' | 'h2', string> = {
  h1: 'text-display-l',
  h2: 'text-h2',
};

export function SectionHeader({
  eyebrow,
  title,
  align = 'left',
  as = 'h2',
}: SectionHeaderProps): JSX.Element {
  const centered = align === 'center';

  const containerClasses = [
    'flex flex-col gap-3',
    centered ? 'items-center text-center mx-auto' : 'items-start text-left',
  ].join(' ');

  const headingClasses = [
    'font-display text-mist-100',
    HEADING_SIZE[as],
    centered ? 'max-w-5xl' : 'max-w-4xl',
  ].join(' ');

  return (
    <div className={containerClasses}>
      {eyebrow !== undefined && eyebrow.length > 0 ? (
        <div className="inline-flex items-center justify-center rounded-full border border-pulse-500/20 bg-pulse-500/10 px-5 py-2 mb-3 shadow-sm">
          <span className="font-mono text-base font-extrabold uppercase tracking-[0.2em] text-pulse-500">
            {eyebrow}
          </span>
        </div>
      ) : null}
      <SplitText as={as} text={title} by="word" className={headingClasses} />
    </div>
  );
}

export default SectionHeader;
