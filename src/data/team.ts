// Team profiles for the Ryze Technology studio.
// See design.md "Data Models" (TeamMember) and requirements 11.2.
// Portraits live under /public/images/team/<id>.jpg (square, 640×640).

import type { ImageAsset, TeamMember } from '@app-types';

/** Build a square portrait ImageAsset from a stable member id. */
function portrait(id: string, name: string): ImageAsset {
  return {
    src: `/images/team/${id}.jpg`,
    width: 640,
    height: 640,
    alt: `Portrait of ${name}`,
  };
}

export const team: TeamMember[] = [
  {
    id: 'rohan-salunke',
    name: 'Rohan Salunke',
    role: 'Founder & CEO',
    bio: 'Rohan founded Ryze to build software that lasts. He sets the studio’s direction and keeps every project anchored to real client outcomes.',
    portrait: portrait('rohan-salunke', 'Rohan Salunke'),
    socials: [{ platform: 'email', url: 'mailto:rohan@ryze.technology' }],
    order: 1,
  },
  {
    id: 'kunal-khande',
    name: 'Kunal Khande',
    role: 'Co-Founder & CTO',
    bio: 'Kunal leads engineering across the studio — architecture, code quality, and the systems that keep client products fast and dependable.',
    portrait: portrait('kunal-khande', 'Kunal Khande'),
    socials: [{ platform: 'email', url: 'mailto:kunal@ryze.technology' }],
    order: 2,
  },
  {
    id: 'gaurav-dhage',
    name: 'Gaurav Dhage',
    role: 'Co-Founder & Design Lead',
    bio: 'Gaurav turns dense requirements into interfaces people enjoy using. He owns the studio design language and obsesses over accessibility and detail.',
    portrait: portrait('gaurav-dhage', 'Gaurav Dhage'),
    socials: [{ platform: 'email', url: 'mailto:gaurav@ryze.technology' }],
    order: 6,
  },
  {
    id: 'gokul-pawar',
    name: 'Gokul Pawar',
    role: 'Co-Founder & CMO',
    bio: 'Gokul shapes how Ryze shows up in the world — positioning, campaigns, and the story behind the work the studio ships.',
    portrait: portrait('gokul-pawar', 'Gokul Pawar'),
    socials: [{ platform: 'email', url: 'mailto:gokul@ryze.technology' }],
    order: 5,
  },
  {
    id: 'sakshant-waghmare',
    name: 'Sakshant Waghmare',
    role: 'Co-Founder & Social Media Manager',
    bio: 'Sakshant runs Ryze’s social presence — building the audience, the voice, and the day-to-day conversations that grow the brand.',
    portrait: portrait('sakshant-waghmare', 'Sakshant Waghmare'),
    socials: [{ platform: 'email', url: 'mailto:sakshant@ryze.technology' }],
    order: 4,
  },
  {
    id: 'harshal-harode',
    name: 'Harshal Harode',
    role: 'Co-Founder & Head of Business Development',
    bio: 'Harshal connects Ryze with the right clients and partnerships, turning conversations into long-term working relationships.',
    portrait: portrait('harshal-harode', 'Harshal Harode'),
    socials: [{ platform: 'email', url: 'mailto:harshal@ryze.technology' }],
    order: 3,
  },
  {
    id: 'aryan-dhabale',
    name: 'Aryan Dhabale',
    role: 'Co-Founder & CFO',
    bio: 'Aryan keeps the studio running smoothly — finance, operations, and the behind-the-scenes structure that lets the team focus on building.',
    portrait: portrait('aryan-dhabale', 'Aryan Dhabale'),
    socials: [{ platform: 'email', url: 'mailto:aryan@ryze.technology' }],
    order: 7,
  },
];
