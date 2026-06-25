/**
 * Navigation types: section anchor identifiers and nav links.
 */

/** Anchor target identifiers for the in-page sections. */
export type SectionId =
  | 'hero'
  | 'portfolio'
  | 'services'
  | 'differentiators'
  | 'team'
  | 'contact';

/** A navigation link mapping a label to a section anchor target. */
export interface NavLink {
  /** Anchor target. */
  id: SectionId;
  label: string;
}
