/**
 * Services section content types.
 */

/** The four fixed service categories. */
export type ServiceCategory =
  | 'Websites & Web Apps'
  | 'Mobile Apps'
  | 'Desktop Applications'
  | 'Business Systems & Automation';

/** A single service offering. */
export interface Service {
  /** Exactly one of the four categories. */
  category: ServiceCategory;
  /** Icon identifier. */
  iconName: string;
  /** Single sentence describing the service. */
  description: string;
}
