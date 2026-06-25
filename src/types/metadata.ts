/**
 * Site-level document metadata (SEO / Open Graph).
 */

/** Document metadata injected into the served HTML head. */
export interface SiteMetadata {
  /** Must contain "Ryze Technology". */
  title: string;
  /** >= 50 chars; truncated to <= 160 at build time. */
  description: string;
  /** Production canonical URL. */
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    /** Social preview image URL. */
    imageUrl: string;
  };
}
