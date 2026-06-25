/**
 * Design token model. Color tokens are chosen so body text against the navy
 * background meets the 4.5:1 AA contrast ratio and large text / interactive
 * boundaries meet 3:1.
 */

/** Resolved design tokens for colors, typography, and layout. */
export interface DesignTokens {
  colors: {
    /** Dark navy primary background. */
    backgroundNavy: string;
    /** Cyan accent for CTAs / emphasis. */
    accentCyan: string;
    /** Body text color chosen for >= 4.5:1 contrast. */
    bodyText: string;
  };
  typography: {
    /** >= 16 */
    bodyMobilePx: number;
    /** >= 18 */
    bodyDesktopPx: number;
  };
  layout: {
    /** Minimum tap target size. */
    minTapTargetPx: 44;
    mobileMaxPx: 767;
    tabletMaxPx: 1023;
  };
}
