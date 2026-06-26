// Media and SEO metadata types. See design.md "Data Models".

/** Responsive image descriptor with intrinsic dimensions to reserve aspect ratio (no CLS). */
export interface ImageAsset {
  src: string;
  srcset?: string;
  /** Intrinsic width, used to reserve aspect ratio (no CLS). */
  width: number;
  height: number;
  /** '' if purely decorative. */
  alt: string;
  /** LQIP placeholder. */
  blurDataURL?: string;
}

/** Per-route SEO/meta. `description` is normalized to <=160 chars via normalizeMetaDescription. */
export interface SEOMeta {
  title: string;
  description: string;
  /** Absolute URL. */
  canonical: string;
  ogImage?: ImageAsset;
  noIndex?: boolean;
}
