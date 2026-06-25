/**
 * Barrel export for all shared types of the Ryze Portfolio Website.
 *
 * Import from `@apptypes` (the configured path alias) anywhere in the app:
 *   import type { CaseStudy, ViewportCategory } from '@apptypes';
 */

export type { ViewportCategory, ColumnCount } from './viewport';
export type { SectionId, NavLink } from './navigation';
export type { HeroVisualKind, HeroContent } from './hero';
export type { SiteMetadata } from './metadata';
export type { CaseStudy, CaseStudyMetric, CaseStudyImage } from './case-study';
export type { Service, ServiceCategory } from './service';
export type { Differentiator, DifferentiatorTitle } from './differentiator';
export type { TeamMember, TeamMemberImage, TeamContent } from './team';
export type { ContactContent, FooterContent } from './contact';
export type { ContactFormValues, FieldError, SubmitState } from './form';
export type { DesignTokens } from './tokens';
