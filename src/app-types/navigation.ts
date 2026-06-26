// Navigation and site-wide metadata types. See design.md "Data Models".

import type { ImageAsset } from './seo';
import type { SocialLink } from './content';

export interface NavChild {
  label: string;
  path: string;
  description?: string;
}

export interface NavItem {
  label: string;
  /** Present if not a pure dropdown parent. */
  path?: string;
  /** Dropdown children (Work, Services, About). */
  children?: NavChild[];
  /** Renders as MagneticButton (Contact). */
  cta?: boolean;
}

export interface SiteMetadata {
  siteName: string;
  defaultTitle: string;
  /** e.g. "%s — Ryze Technology". */
  titleTemplate: string;
  defaultDescription: string;
  /** For canonical/OG. */
  baseUrl: string;
  defaultOgImage: ImageAsset;
  social: SocialLink[];
  contactEmail: string;
  /** Form POST target (env-injected). */
  contactEndpoint: string;
}
