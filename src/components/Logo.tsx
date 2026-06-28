import logoUrl from '../../uiii/Group 12.svg';

export interface LogoProps {
  /** `full` shows mark + wordmark (default); `mark` shows the monogram only. */
  variant?: 'full' | 'mark';
  /** Pixel height of the mark. Wordmark scales relative to it. Default 32. */
  height?: number;
  /** `light` tones the wordmark for a dark surface. */
  tone?: 'default' | 'light';
  /** Extra classes for the wrapping element. */
  className?: string;
}

export function Logo({
  variant = 'full',
  height = 32,
  tone = 'default',
  className,
}: LogoProps): JSX.Element {
  const isMark = variant === 'mark';
  
  // Aspect ratios based on Group 12.svg dimensions (766x336)
  // Monogram is approx 320px wide out of 766px
  const markWidth = Math.round(height * (320 / 336));
  const fullWidth = Math.round(height * (766 / 336));
  
  const filterClass = tone === 'light' ? 'invert brightness-[5]' : '';

  if (isMark) {
    return (
      <span 
        className={`inline-block overflow-hidden relative shrink-0 select-none ${className ?? ''}`} 
        style={{ width: markWidth, height }}
      >
        <img 
          src={logoUrl} 
          alt="Ryze Technology" 
          className={`absolute left-0 top-0 max-w-none ${filterClass}`}
          style={{ width: fullWidth, height }}
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span 
      className={`inline-block overflow-hidden relative shrink-0 select-none ${className ?? ''}`} 
      style={{ width: fullWidth, height }}
    >
      <img 
        src={logoUrl} 
        alt="Ryze Technology" 
        className={`w-full h-full object-contain ${filterClass}`}
        draggable={false}
      />
    </span>
  );
}

export default Logo;
