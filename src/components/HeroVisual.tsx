/**
 * HeroVisual
 *
 * The Hero section's single primary visual element: an animated cyan/navy
 * gradient (Requirement 1.3). The gradient slowly drifts via a CSS keyframe
 * animation when motion is allowed; when reduced motion is active the gradient
 * is rendered in a fixed, static state with no motion-based animation
 * (Requirement 1.8).
 *
 * The component is purely decorative, so it is hidden from assistive technology.
 *
 * Requirements: 1.3, 1.8
 */

export interface HeroVisualProps {
  /**
   * Whether the gradient should animate. When `false` (reduced motion) the
   * gradient renders statically with no motion-based animation.
   */
  animate: boolean;
  /** Optional class names applied to the root element. */
  className?: string;
}

/** Scoped keyframes for the drifting gradient. Kept local to the component. */
const GRADIENT_KEYFRAMES = `
@keyframes ryze-hero-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ryze-hero-glow-drift {
  0%, 100% { transform: translate3d(-4%, -2%, 0) scale(1.05); opacity: 0.9; }
  50% { transform: translate3d(4%, 3%, 0) scale(1.15); opacity: 1; }
}
`;

export function HeroVisual({
  animate,
  className,
}: HeroVisualProps): JSX.Element {
  // A layered gradient: a deep navy base wash plus a cyan radial glow.
  // `backgroundSize: 200%` gives the linear wash room to drift when animated.
  const baseStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(120deg, #0a0e1a 0%, #0b1120 35%, #111a2e 60%, #0a0e1a 100%)',
    backgroundSize: '200% 200%',
    backgroundPosition: animate ? undefined : '0% 50%',
    animation: animate
      ? 'ryze-hero-gradient-shift 18s ease-in-out infinite'
      : undefined,
  };

  const glowStyle: React.CSSProperties = {
    backgroundImage:
      'radial-gradient(60% 60% at 70% 30%, rgba(34, 211, 238, 0.35) 0%, rgba(34, 211, 238, 0.12) 35%, rgba(34, 211, 238, 0) 70%)',
    animation: animate
      ? 'ryze-hero-glow-drift 14s ease-in-out infinite'
      : undefined,
  };

  return (
    <div
      data-testid="hero-visual"
      data-animated={animate ? 'true' : 'false'}
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Keyframes are injected once with the visual; they are inert when
          `animate` is false because no element references them. */}
      {animate ? <style>{GRADIENT_KEYFRAMES}</style> : null}
      <div className="absolute inset-0" style={baseStyle} />
      <div className="absolute inset-0" style={glowStyle} />
      {/* Subtle vignette so foreground text retains contrast (Req 10.4). */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
    </div>
  );
}

export default HeroVisual;
