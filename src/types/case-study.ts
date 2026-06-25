/**
 * Case study (Featured Work) content types.
 */

/** A single highlighted metric for a case study. */
export interface CaseStudyMetric {
  /** e.g. "Conversion uplift" */
  label: string;
  /** e.g. "+38%" */
  value: string;
}

/** Responsive image model for a case study preview. */
export interface CaseStudyImage {
  avifSrc: string;
  webpSrc: string;
  /** jpg/png fallback. */
  fallbackSrc: string;
  /** Explicit dimensions prevent layout shift. */
  width: number;
  height: number;
  /** Descriptive alt text. */
  alt: string;
}

/** A portfolio case study entry. */
export interface CaseStudy {
  id: string;
  projectName: string;
  industry: string;
  /** At least one metric. */
  metrics: CaseStudyMetric[];
  preview: CaseStudyImage;
  /** Detail page or external live URL. */
  detailUrl: string;
}
