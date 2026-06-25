/**
 * Services section content for the Ryze Portfolio Website.
 *
 * Exactly four services are authored, one per fixed category (Requirements 3.1,
 * 3.2). Each entry pairs a lucide-react icon name with a single-sentence
 * description (Requirement 3.3).
 */

import type { Service } from '../types/service';

export const services: readonly Service[] = [
  {
    category: 'Websites & Web Apps',
    iconName: 'Globe',
    description:
      'We design and build fast, accessible websites and web applications that scale with your business and feel effortless to use.',
  },
  {
    category: 'Mobile Apps',
    iconName: 'Smartphone',
    description:
      'We craft polished iOS and Android apps with native-grade performance and interfaces your users actually enjoy returning to.',
  },
  {
    category: 'Desktop Applications',
    iconName: 'Monitor',
    description:
      'We deliver cross-platform desktop software that brings rich, reliable tooling straight to your team’s machines.',
  },
  {
    category: 'Business Systems & Automation',
    iconName: 'Workflow',
    description:
      'We connect your tools and automate the busywork so your operations run faster, cleaner, and with far fewer manual steps.',
  },
];
