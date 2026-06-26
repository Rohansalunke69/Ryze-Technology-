// Barrel for shared domain types. The bare `@app-types` alias resolves to this module.
// Concrete types are authored across primitives.ts, seo.ts, content.ts, navigation.ts.

export type {
  Slug,
  ISODate,
  ServiceKey,
  PortfolioCategory,
  BlogCategory,
  ViewportCategory,
  EasingFn,
  PageResult,
} from './primitives';

export type { ImageAsset, SEOMeta } from './seo';

export type {
  Metric,
  CaseStudy,
  ProcessStep,
  FAQItem,
  Service,
  SocialLink,
  TeamMember,
  BlogAuthor,
  BlogPost,
  Testimonial,
} from './content';

export type { NavChild, NavItem, SiteMetadata } from './navigation';
