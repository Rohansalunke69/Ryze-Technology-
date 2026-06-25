/**
 * TeamSection
 *
 * The "Meet the Team" section. It renders an optional team story paragraph
 * (only when present and non-empty) followed by exactly four team member
 * cards in a responsive grid (1 column on mobile, 2 on tablet, 4 on desktop).
 *
 * Composition:
 *   - {@link TeamStory}      optional 30–120 word narrative (Req 5.3, 5.4)
 *   - {@link TeamMemberCard} one per member: name, role, photo (Req 5.1, 5.2)
 *
 * Each card delegates its photo to {@link ResponsiveImage}, which owns the
 * photo -> initials -> reserved-space fallback chain (Req 5.5, 5.6).
 *
 * Responsive columns map to the design breakpoints (Req 9.2, 9.3, 9.4):
 *   base = 1 (mobile), `tablet:` = 2, `desktop:` = 4.
 *
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 9.2, 9.3, 9.4.
 */
import { useRef } from 'react';
import type { TeamContent, TeamMember } from '@apptypes';
import { useSectionEntrance } from '@hooks';
import { teamContent } from '@content/team';
import { ResponsiveImage } from './ResponsiveImage';

/** Props for {@link TeamStory}. */
export interface TeamStoryProps {
  /** The narrative text. Rendered only when present and non-empty. */
  story?: string | undefined;
}

/**
 * The optional team story paragraph. Returns `null` when the story is missing
 * or contains only whitespace, so the section renders cleanly without it
 * (Requirements 5.3, 5.4).
 */
export function TeamStory({ story }: TeamStoryProps): JSX.Element | null {
  if (story === undefined || story.trim().length === 0) {
    return null;
  }

  return (
    <p
      className="mx-auto mt-6 max-w-3xl text-center text-body-mobile text-body-muted desktop:text-body-desktop"
      data-testid="team-story"
    >
      {story}
    </p>
  );
}

/** Props for {@link TeamMemberCard}. */
export interface TeamMemberCardProps {
  /** The team member to render. */
  member: TeamMember;
}

/**
 * A single premium team member card showing the member's photo, name, and
 * role. The photo is rendered through {@link ResponsiveImage}, which handles
 * the graceful fallback to the member's initials and then to reserved space
 * (Requirements 5.2, 5.5, 5.6).
 */
export function TeamMemberCard({ member }: TeamMemberCardProps): JSX.Element {
  return (
    <article className="group flex flex-col items-center rounded-2xl bg-navy-800 p-8 text-center shadow-lg shadow-black/20 ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:ring-accent/40">
      <div className="mb-6 h-32 w-32 overflow-hidden rounded-full ring-2 ring-white/10 transition duration-300 group-hover:ring-accent/60">
        <ResponsiveImage
          image={member.photo}
          initials={member.initials}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-body">{member.name}</h3>
      <p className="mt-1 text-body-mobile text-accent">{member.role}</p>
    </article>
  );
}

/** Props for {@link TeamSection}. */
export interface TeamSectionProps {
  /**
   * Team content to render. Defaults to the authored {@link teamContent} so
   * callers (and tests) may pass alternative variants.
   */
  content?: TeamContent;
}

/**
 * The full Team section. Renders the optional story and exactly the supplied
 * members in a responsive grid, with a subtle scroll-triggered entrance.
 */
export function TeamSection({ content = teamContent }: TeamSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const hasEntered = useSectionEntrance(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="team"
      aria-labelledby="team-heading"
      className={[
        'bg-navy py-20 transition-all duration-700 ease-out desktop:py-28',
        hasEntered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
      ].join(' ')}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="team-heading"
          className="text-center text-3xl font-bold text-body desktop:text-4xl"
        >
          Meet the Team
        </h2>

        {content.story ? <TeamStory story={content.story} /> : null}

        <div className="mt-14 grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-4">
          {content.members.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
