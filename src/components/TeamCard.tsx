/**
 * TeamCard — team member profile card (task 10.5).
 * Premium light-theme card with animated hover effects.
 *
 * _Requirements: 11.2, 39.3, 42.3_
 */
import type { SocialLink, TeamMember } from '@app-types';
import { CardImage } from './CardImage';

export interface TeamCardProps {
  member: TeamMember;
  index?: number;
}

const PLATFORM_LABELS: Record<SocialLink['platform'], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  dribbble: 'Dribbble',
  email: 'Email',
};

function socialHref(link: SocialLink): string {
  return link.platform === 'email' ? `mailto:${link.url}` : link.url;
}

export function TeamCard({ member, index = 0 }: TeamCardProps): JSX.Element {
  return (
    <article
      style={{ ['--card-index' as string]: index }}
      className="group relative flex flex-col rounded-xl border border-ink-600 bg-ink-800 text-mist-100 mt-6 overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_12px_40px_-8px_rgba(30,64,175,0.22)] hover:border-pulse-500/30 hover:-translate-y-1 beam-card"
    >
      {/* Animated top accent line on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{
          background:
            'linear-gradient(to right, var(--pulse-700), var(--pulse-400))',
        }}
      />

      {/* Portrait */}
      <CardImage
        image={member.portrait}
        className="relative mx-4 -mt-6 overflow-hidden rounded-xl shadow-lg ring-1 ring-ink-600/60 shadow-black/40"
        imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Content */}
      <div className="flex flex-grow flex-col p-6">
        <h3 className="mb-1 font-display text-xl font-bold leading-snug tracking-normal text-mist-100 antialiased">
          {member.name}
        </h3>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pulse-500 font-semibold">
          {member.role}
        </p>

        {member.bio !== undefined && member.bio.length > 0 ? (
          <p className="font-sans text-sm font-light leading-relaxed text-mist-300 antialiased">
            {member.bio}
          </p>
        ) : null}
      </div>

      {/* Social links */}
      {member.socials.length > 0 ? (
        <div className="px-6 pb-6 pt-0 mt-auto">
          <ul className="flex flex-wrap gap-2.5" aria-label={`${member.name} on social media`}>
            {member.socials.map((link) => (
              <li key={link.platform}>
                <a
                  href={socialHref(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  aria-label={`${member.name} on ${PLATFORM_LABELS[link.platform]}`}
                  className="select-none rounded-lg bg-pulse-500/10 hover:bg-pulse-500/20 border border-pulse-500/20 py-2 px-3 text-center align-middle font-mono text-xs font-bold uppercase text-pulse-400 transition-all hover:shadow-md hover:shadow-pulse-500/10 focus:opacity-[0.85] active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
                >
                  {PLATFORM_LABELS[link.platform]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default TeamCard;
