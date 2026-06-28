/**
 * TeamCard — team member profile card (task 10.5).
 *
 * Renders a member's portrait, name, role, and social links. The portrait sits
 * in a reserved aspect-ratio box (no CLS) and degrades to a blurDataURL/solid
 * placeholder on load failure via {@link CardImage}. Social links open in a new
 * tab with `rel="noopener noreferrer"` and have accessible labels naming both
 * the platform and the member (Requirement 11.2).
 *
 * _Requirements: 11.2, 39.3, 42.3_
 */
import type { SocialLink, TeamMember } from '@app-types';
import { CardImage } from './CardImage';

export interface TeamCardProps {
  /** The team member to render. */
  member: TeamMember;
  /** Position in a grid; drives a small stagger delay. */
  index?: number;
}

/** Human-readable labels per social platform. */
const PLATFORM_LABELS: Record<SocialLink['platform'], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  dribbble: 'Dribbble',
  email: 'Email',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
};

/** Build the href for a social link (`email` → `mailto:`). */
function socialHref(link: SocialLink): string {
  return link.platform === 'email' ? `mailto:${link.url}` : link.url;
}

export function TeamCard({ member, index = 0 }: TeamCardProps): JSX.Element {
  return (
    <article
      style={{ ['--card-index' as string]: index }}
      className="group flex flex-col gap-4"
    >
      <CardImage
        image={member.portrait}
        className="rounded-lg ring-1 ring-ink-600/60"
        imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <div className="flex flex-col gap-1">
        <h3 className="font-display text-h3 text-mist-100">{member.name}</h3>
        <p className="font-mono text-xs uppercase tracking-widest text-pulse-500">
          {member.role}
        </p>
      </div>

      {member.socials.length > 0 ? (
        <ul className="flex flex-wrap gap-4" aria-label={`${member.name} on social media`}>
          {member.socials.map((link) => (
            <li key={link.platform}>
              <a
                href={socialHref(link)}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                aria-label={`${member.name} on ${PLATFORM_LABELS[link.platform]}`}
                className="inline-flex min-h-[44px] min-w-[44px] items-center font-mono text-sm text-mist-300 transition-colors hover:text-pulse-500 focus-visible:text-pulse-500"
              >
                {PLATFORM_LABELS[link.platform]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default TeamCard;
