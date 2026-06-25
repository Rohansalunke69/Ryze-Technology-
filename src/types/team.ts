/**
 * Team section content types.
 */

/** Responsive image model for a team member photo. */
export interface TeamMemberImage {
  avifSrc: string;
  webpSrc: string;
  fallbackSrc: string;
  width: number;
  height: number;
  alt: string;
}

/** A single team member. */
export interface TeamMember {
  name: string;
  role: string;
  photo: TeamMemberImage;
  /** Placeholder shown when the photo fails to load. */
  initials: string;
}

/** Full content for the Team section. */
export interface TeamContent {
  /** Optional 30–120 word story; rendered only when present. */
  story?: string;
  /** Exactly four members. */
  members: TeamMember[];
}
