/**
 * Viewport classification and responsive layout result types.
 *
 * `ViewportCategory` is produced by the pure `selectViewportCategory(width)`
 * logic and drives column counts and navigation presentation.
 * `ColumnCount` is the grid column result consumed by grid sections.
 */

/** Responsive viewport category derived from raw viewport width. */
export type ViewportCategory = 'mobile' | 'tablet' | 'desktop';

/** Column layout result consumed by grid sections (1 mobile, 2 tablet, 4 desktop). */
export type ColumnCount = 1 | 2 | 4;
