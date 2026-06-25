/**
 * Team section content for the Ryze Portfolio Website.
 *
 * An optional team story (30–120 words) is authored alongside exactly four
 * team members (Requirements 5.1, 5.3). Each member carries a name, role, a
 * responsive photo model, and initials for the fallback placeholder
 * (Requirements 5.2, 5.5). Photo paths are placeholders under `/images/team/`.
 */

import type { TeamContent } from '../types/team';

export const teamContent: TeamContent = {
  story:
    'Ryze Technology began in Nagpur as a handful of engineers who were tired of building things that broke the moment they shipped. We bonded over long nights, strong chai, and a stubborn belief that software should last. Today we are seven people who design, code, and ship together, treating every product as if our own name is on the door. We stay small on purpose so craft never takes a back seat to scale.',
  members: [
    {
      name: 'Aarav Deshmukh',
      role: 'Founder & Full-Stack Engineer',
      photo: {
        avifSrc: '/images/team/aarav-deshmukh.avif',
        webpSrc: '/images/team/aarav-deshmukh.webp',
        fallbackSrc: '/images/team/aarav-deshmukh.jpg',
        width: 480,
        height: 480,
        alt: 'Portrait of Aarav Deshmukh, Founder and Full-Stack Engineer at Ryze Technology',
      },
      initials: 'AD',
    },
    {
      name: 'Priya Kulkarni',
      role: 'Lead Product Designer',
      photo: {
        avifSrc: '/images/team/priya-kulkarni.avif',
        webpSrc: '/images/team/priya-kulkarni.webp',
        fallbackSrc: '/images/team/priya-kulkarni.jpg',
        width: 480,
        height: 480,
        alt: 'Portrait of Priya Kulkarni, Lead Product Designer at Ryze Technology',
      },
      initials: 'PK',
    },
    {
      name: 'Rohan Joshi',
      role: 'Mobile Engineering Lead',
      photo: {
        avifSrc: '/images/team/rohan-joshi.avif',
        webpSrc: '/images/team/rohan-joshi.webp',
        fallbackSrc: '/images/team/rohan-joshi.jpg',
        width: 480,
        height: 480,
        alt: 'Portrait of Rohan Joshi, Mobile Engineering Lead at Ryze Technology',
      },
      initials: 'RJ',
    },
    {
      name: 'Sneha Patil',
      role: 'Backend & Automation Engineer',
      photo: {
        avifSrc: '/images/team/sneha-patil.avif',
        webpSrc: '/images/team/sneha-patil.webp',
        fallbackSrc: '/images/team/sneha-patil.jpg',
        width: 480,
        height: 480,
        alt: 'Portrait of Sneha Patil, Backend and Automation Engineer at Ryze Technology',
      },
      initials: 'SP',
    },
  ],
};
