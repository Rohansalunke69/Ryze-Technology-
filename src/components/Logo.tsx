/**
 * Logo — Ryze Technology brand lockup.
 *
 * Renders the official brand SVG (`public/ryze-logo.svg`) — the geometric "R"
 * monogram in the brand-blue gradient with the "RYZE TECHNOLOGY" wordmark.
 *
 * The component is purely presentational and scales to the given pixel
 * `height` (width follows the logo's intrinsic aspect ratio). It carries no own
 * link/role — callers wrap it in a `<Link>`/`<a>` and supply the accessible
 * name, so the image is decorative (`alt=""`).
 *
 * `tone="light"` renders the logo as a clean white monochrome for placement on
 * dark surfaces (e.g. the footer), where the default black wordmark would
 * otherwise disappear.
 */
export interface LogoProps {
  /** Kept for API compatibility; the brand lockup is rendered for both. */
  variant?: 'full' | 'mark';
  /** Pixel height of the logo. Width follows the intrinsic aspect ratio. Default 32. */
  height?: number;
  /** `light` renders a white monochrome logo for dark surfaces. */
  tone?: 'default' | 'light';
  /** Extra classes for the wrapping element. */
  className?: string;
}

/** Intrinsic aspect ratio of the brand SVG (766 × 336). */
const LOGO_RATIO = 766 / 336;

export function Logo({
  variant = 'full',
  height = 32,
  tone = 'default',
  className,
}: LogoProps): JSX.Element {
  // `variant` is retained for call-site compatibility; both render the lockup.
  void variant;

  const width = Math.round(height * LOGO_RATIO);

  const imgClass = [
    'block w-auto',
    // On dark surfaces, flatten the logo to a crisp white monochrome so the
    // dark wordmark stays visible.
    tone === 'light' ? '[filter:brightness(0)_invert(1)]' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <img
      src="/ryze-logo.svg"
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      style={{ height, width: 'auto' }}
      className={imgClass}
    />
  );
}

export default Logo;
