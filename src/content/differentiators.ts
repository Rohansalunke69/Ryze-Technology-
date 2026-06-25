/**
 * "Why Choose Ryze" differentiator content for the Ryze Portfolio Website.
 *
 * Exactly four differentiators are authored with the fixed titles
 * (Requirements 4.1, 4.2), each with a short supporting description
 * (Requirement 4.3).
 */

import type { Differentiator } from '../types/differentiator';

export const differentiators: readonly Differentiator[] = [
  {
    title: 'Complete ownership',
    description:
      'We treat your product like our own, taking end-to-end responsibility from first sketch to production and beyond.',
  },
  {
    title: 'Full-stack expertise',
    description:
      'One team handles design, frontend, backend, and infrastructure, so nothing gets lost in the handoffs.',
  },
  {
    title: 'Long-term partnership',
    description:
      'We build relationships, not one-off projects, sticking around to evolve your product as your business grows.',
  },
  {
    title: 'Transparent process',
    description:
      'You always know where things stand with clear communication, honest timelines, and no surprises along the way.',
  },
];
