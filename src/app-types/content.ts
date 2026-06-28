// Content domain models: case studies, services, team, blog, testimonials.
// See design.md "Data Models".

import type {
  Slug,
  ISODate,
  ServiceKey,
  PortfolioCategory,
  BlogCategory,
} from './primitives';
import type { ImageAsset, SEOMeta } from './seo';

/** A numeric metric rendered by AnimatedCounter. */
export interface Metric {
  label: string;
  /** Numeric target for the counter. */
  value: number;
  suffix?: string;
  prefix?: string;
  /** Defaults to 0. */
  decimals?: number;
}

// ---------- Case Study ----------
export interface CaseStudy {
  slug: Slug;
  title: string;
  client: string;
  category: PortfolioCategory;
  /** Which services this project used. */
  services: ServiceKey[];
  year: number;
  role: string;
  /** Surfaces on homepage preview. */
  featured: boolean;
  /** Manual sort weight. */
  order: number;
  summary: string;
  hero: ImageAsset;
  challenge: string;
  solution: string;
  results: Metric[];
  gallery: ImageAsset[];
  /** -> Testimonial.id */
  testimonialId?: string;
  techStack: string[];
  learnings: string[];
  /** Explicit overrides; else computed. */
  relatedSlugs?: Slug[];
  seo: SEOMeta;
}

// ---------- Service ----------
/** 1-based, must be contiguous & ordered. */
export interface ProcessStep {
  index: number;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Service {
  slug: ServiceKey;
  name: string;
  tagline: string;
  /** Icon key for line-draw SVG. */
  icon: string;
  order: number;
  summary: string;
  whatWeDo: string;
  features: { title: string; description: string }[];
  techStack: string[];
  process: ProcessStep[];
  faqs: FAQItem[];
  /** Else computed via services[] match. */
  relatedCaseStudySlugs?: Slug[];
  seo: SEOMeta;
}

// ---------- Team ----------
export interface SocialLink {
  platform: 'github' | 'linkedin' | 'x' | 'dribbble' | 'email' | 'instagram' | 'facebook' | 'whatsapp';
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  portrait: ImageAsset;
  socials: SocialLink[];
  order: number;
}

// ---------- Blog ----------
export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  avatar: ImageAsset;
}

export interface BlogPost {
  slug: Slug;
  title: string;
  category: BlogCategory;
  excerpt: string;
  cover: ImageAsset;
  /** Markdown/MDX source. */
  content: string;
  author: BlogAuthor;
  publishedAt: ISODate;
  updatedAt?: ISODate;
  /** Precomputed via computeReadingTime(content). */
  readingTimeMinutes: number;
  tags: string[];
  featured?: boolean;
  relatedSlugs?: Slug[];
  seo: SEOMeta;
}

// ---------- Testimonial ----------
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  authorRole: string;
  company: string;
  avatar?: ImageAsset;
  caseStudySlug?: Slug;
  /** 1..5 optional. */
  rating?: number;
}
