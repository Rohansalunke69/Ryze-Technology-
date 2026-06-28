/**
 * Logo — Ryze Technology brand lockup.
 *
 * An original, resolution-independent SVG rendering of the brand: a geometric
 * "R" monogram filled with the brand blue gradient and a black echo behind it
 * (mirroring the company logo), optionally followed by the "Ryze Technology"
 * wordmark.
 *
 * Variants:
 *  - `mark`  — just the monogram (used where space is tight / as a favicon-like
 *    badge);
 *  - `full`  — monogram + wordmark (default, used in the header and footer).
 *
 * The component is purely presentational and inherits sizing from `height`
 * (the mark scales to the given pixel height; the wordmark scales with it).
 * It carries no own link/role — callers wrap it in a `<Link>`/`<a>` and supply
 * the accessible name, so the SVG itself is `aria-hidden`.
 *
 * If a raster brand file is later added at `public/logo.png`, swap the mark for
 * an `<img src="/logo.png">` — the surrounding layout already accommodates it.
 */
export interface LogoProps {
  /** `full` shows mark + wordmark (default); `mark` shows the monogram only. */
  variant?: 'full' | 'mark';
  /** Pixel height of the mark. Wordmark scales relative to it. Default 32. */
  height?: number;
  /** `light` tones the wordmark + monogram counter for a dark surface. */
  tone?: 'default' | 'light';
  /** Extra classes for the wrapping element. */
  className?: string;
}

/** The geometric "R" monogram with a black echo + brand-blue gradient face. */
function Mark({ size }: { size: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="ryze-r" x1="10" y1="6" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b93f0" />
          <stop offset="0.55" stopColor="#3a6fe0" />
          <stop offset="1" stopColor="#2156c9" />
        </linearGradient>
      </defs>

      {/* Black echo (shadow leg) offset down-left, mirroring the brand mark. */}
      <path
        d="M9 8 H30 a14 14 0 0 1 0 28 H22 l14 16 H22 L8 36 V8 Z"
        fill="#0a0a08"
        transform="translate(-3.5 4)"
        opacity="0.92"
      />

      {/* Gradient R face on top. */}
      <path
        d="M9 8 H30 a14 14 0 0 1 0 28 H22 l14 16 H22 L8 36 V8 Z"
        fill="url(#ryze-r)"
      />
      {/* Counter (the hole in the R bowl) — matches the surface behind it. */}
      <path d="M16 15 H29 a7 7 0 0 1 0 14 H16 Z" fill="var(--logo-counter, var(--ink-900))" />
    </svg>
  );
}

export function Logo({
  variant = 'full',
  height = 32,
  tone = 'default',
  className,
}: LogoProps): JSX.Element {
  const wrapperClass = [
    'inline-flex items-center gap-2.5',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // On a dark surface, tone the wordmark light and match the R counter to the
  // dark footer surface so the bowl reads correctly.
  const wrapperStyle =
    tone === 'light'
      ? ({ ['--logo-counter' as string]: '#0a0a08' } as React.CSSProperties)
      : undefined;
  const wordmarkClass =
    tone === 'light' ? 'text-[#f3f1ea]' : 'text-mist-100';

  if (variant === 'mark') {
    return (
      <span className={wrapperClass} style={wrapperStyle}>
        <Mark size={height} />
      </span>
    );
  }

  return (
    <span className={wrapperClass} style={wrapperStyle}>
      <Mark size={height} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.05rem] font-bold uppercase tracking-[0.14em] ${wordmarkClass}`}
        >
          Ryze
        </span>
        <span className="font-mono text-[0.5rem] font-medium uppercase tracking-[0.34em] text-pulse-500">
          Technology
        </span>
      </span>
    </span>
  );
}

export default Logo;
