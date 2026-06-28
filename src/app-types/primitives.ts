// Shared primitive types and generics for the Ryze Technology domain model.
// See design.md "Data Models" and "Components and Interfaces".

/** kebab-case identifier, unique within a collection. */
export type Slug = string;

/** ISO date string in 'YYYY-MM-DD' form. */
export type ISODate = string;

/** Canonical service identifiers (also used as service detail route slugs). */
export type ServiceKey =
  | 'development'
  | 'design'
  | 'digital-marketing'
  | 'sales-strategy'
  | 'maintenance-support';

/** Portfolio filter categories. */
export type PortfolioCategory = 'websites' | 'mobile' | 'systems';

/** Blog filter categories. */
export type BlogCategory = 'engineering' | 'design' | 'process' | 'company';

/** Semantic viewport buckets derived from width; single source of breakpoints. */
export type ViewportCategory = 'mobile' | 'tablet' | 'desktop' | 'wide';

/** Easing function; domain & range conceptually [0,1] (back easing may overshoot). */
export type EasingFn = (t: number) => number;

/** Generic paginated result envelope returned by `paginate`. */
export interface PageResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  total: number;
}
