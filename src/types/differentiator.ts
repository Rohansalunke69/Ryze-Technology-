/**
 * "Why Choose Ryze" differentiator content types.
 */

/** The four fixed differentiator titles. */
export type DifferentiatorTitle =
  | 'Complete ownership'
  | 'Full-stack expertise'
  | 'Long-term partnership'
  | 'Transparent process';

/** A single differentiator entry. */
export interface Differentiator {
  /** Exactly one of the four titles. */
  title: DifferentiatorTitle;
  /** Short supporting description. */
  description: string;
}
