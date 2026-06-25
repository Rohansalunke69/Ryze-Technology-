import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { render, screen, within } from '@testing-library/react';
import type { TeamContent, TeamMember } from '@apptypes';
import { TeamSection, TeamMemberCard } from './TeamSection';

/**
 * Generates non-empty, non-whitespace display text under a stable prefix.
 *
 * The text is normalized exactly the way Testing Library's `getByText`
 * normalizes rendered content (collapse internal whitespace, then trim) so the
 * query string and the rendered text always agree. The prefix guarantees the
 * result is non-empty and non-whitespace even when the random suffix is purely
 * whitespace, keeping every generated card's name/role reliably queryable.
 */
const labelArb = (prefix: string): fc.Arbitrary<string> =>
  fc
    .string({ minLength: 1, maxLength: 24 })
    .map((s) => `${prefix} ${s}`.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0);

/**
 * Generator for an arbitrary team member. Names and roles are non-empty,
 * non-whitespace strings so the card always has visible, queryable text; the
 * photo carries a defined, non-empty `alt` matching the responsive image
 * contract.
 */
const teamMemberArb: fc.Arbitrary<TeamMember> = fc.record({
  name: labelArb('Name'),
  role: labelArb('Role'),
  initials: fc.string({ minLength: 1, maxLength: 3 }),
  photo: fc.record({
    avifSrc: fc.webUrl(),
    webpSrc: fc.webUrl(),
    fallbackSrc: fc.webUrl(),
    width: fc.integer({ min: 1, max: 4000 }),
    height: fc.integer({ min: 1, max: 4000 }),
    alt: labelArb('Alt'),
  }),
});

describe('TeamMemberCard - property: renders all required fields', () => {
  // Feature: ryze-portfolio-website, Property 8: rendered Team_Member_Card contains the member's name, role, and a photo image element
  // Validates: Requirements 5.2
  it('always renders the member name, role, and a photo image element', () => {
    fc.assert(
      fc.property(teamMemberArb, (member) => {
        const { container, unmount } = render(<TeamMemberCard member={member} />);

        // Name and role text are present.
        expect(screen.getByText(member.name)).toBeInTheDocument();
        expect(screen.getByText(member.role)).toBeInTheDocument();

        // A photo image element is present (ResponsiveImage's <img>).
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('alt')).toBe(member.photo.alt);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

const sampleMembers: TeamMember[] = Array.from({ length: 4 }, (_, i) => ({
  name: `Member ${i + 1}`,
  role: `Role ${i + 1}`,
  initials: `M${i + 1}`,
  photo: {
    avifSrc: `https://cdn.example.com/m${i}.avif`,
    webpSrc: `https://cdn.example.com/m${i}.webp`,
    fallbackSrc: `https://cdn.example.com/m${i}.jpg`,
    width: 480,
    height: 480,
    alt: `Portrait of Member ${i + 1}`,
  },
}));

describe('TeamSection - structure and edge cases', () => {
  it('renders the section with a heading and exactly four member cards (Req 5.1)', () => {
    const content: TeamContent = { story: 'A short founding story.', members: sampleMembers };
    const { container } = render(<TeamSection content={content} />);

    const section = container.querySelector('section#team');
    expect(section).not.toBeNull();
    expect(screen.getByRole('heading', { name: /meet the team/i })).toBeInTheDocument();

    const cards = container.querySelectorAll('article');
    expect(cards).toHaveLength(4);
  });

  it('renders the story paragraph only when present and non-empty (Req 5.3)', () => {
    render(<TeamSection content={{ story: 'Our story matters.', members: sampleMembers }} />);
    expect(screen.getByTestId('team-story')).toHaveTextContent('Our story matters.');
  });

  it('renders the section fine when the story is missing (Req 5.4)', () => {
    const { container } = render(<TeamSection content={{ members: sampleMembers }} />);
    expect(screen.queryByTestId('team-story')).toBeNull();
    // Section and all four cards still render correctly without a story.
    expect(container.querySelector('section#team')).not.toBeNull();
    expect(container.querySelectorAll('article')).toHaveLength(4);
  });

  it('renders the section fine when the story is only whitespace (Req 5.4)', () => {
    render(<TeamSection content={{ story: '   ', members: sampleMembers }} />);
    expect(screen.queryByTestId('team-story')).toBeNull();
  });

  it('renders each member card with an image carrying the member alt (Req 5.2, 5.5)', () => {
    render(<TeamSection content={{ members: sampleMembers }} />);
    for (const member of sampleMembers) {
      const card = screen.getByText(member.name).closest('article');
      expect(card).not.toBeNull();
      const img = within(card as HTMLElement).getByAltText(member.photo.alt);
      expect(img.tagName.toLowerCase()).toBe('img');
    }
  });
});
