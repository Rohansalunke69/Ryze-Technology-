/**
 * Featured Work (Portfolio) content for the Ryze Portfolio Website.
 *
 * At least two case studies are authored (Requirement 2.1). Each entry carries a
 * project name, industry, one or more impact metrics, a responsive preview image
 * model, and a detail/live URL (Requirements 2.2, 2.5). Asset paths are
 * placeholders under `/images/portfolio/`; the actual assets are added later.
 */

import type { CaseStudy } from '../types/case-study';

export const caseStudies: readonly CaseStudy[] = [
  {
    id: 'northwind-commerce',
    projectName: 'Northwind Commerce',
    industry: 'E-commerce / Retail',
    metrics: [
      { label: 'Conversion uplift', value: '+38% conversion' },
      { label: 'Page load', value: '2.1s → 0.8s load' },
      { label: 'Cart abandonment', value: '-24% abandonment' },
    ],
    preview: {
      avifSrc: '/images/portfolio/northwind-commerce.avif',
      webpSrc: '/images/portfolio/northwind-commerce.webp',
      fallbackSrc: '/images/portfolio/northwind-commerce.jpg',
      width: 1280,
      height: 800,
      alt: 'Northwind Commerce storefront homepage on desktop and mobile showing a streamlined product grid and checkout flow',
    },
    detailUrl: '/work/northwind-commerce',
  },
  {
    id: 'pulse-health-app',
    projectName: 'Pulse Health',
    industry: 'Healthcare / Mobile',
    metrics: [
      { label: 'App store rating', value: '4.9★ rating' },
      { label: 'Daily active users', value: '120k DAU' },
      { label: 'Onboarding time', value: '3 min → 45s' },
    ],
    preview: {
      avifSrc: '/images/portfolio/pulse-health-app.avif',
      webpSrc: '/images/portfolio/pulse-health-app.webp',
      fallbackSrc: '/images/portfolio/pulse-health-app.jpg',
      width: 1280,
      height: 800,
      alt: 'Pulse Health mobile app screens showing a patient dashboard, medication reminders, and a clinician chat view',
    },
    detailUrl: '/work/pulse-health',
  },
  {
    id: 'forge-ops-platform',
    projectName: 'Forge Operations Platform',
    industry: 'Manufacturing / Business Systems',
    metrics: [
      { label: 'Manual hours saved', value: '1,200 hrs/mo saved' },
      { label: 'Order accuracy', value: '99.6% accuracy' },
      { label: 'Reporting latency', value: 'Real-time dashboards' },
    ],
    preview: {
      avifSrc: '/images/portfolio/forge-ops-platform.avif',
      webpSrc: '/images/portfolio/forge-ops-platform.webp',
      fallbackSrc: '/images/portfolio/forge-ops-platform.jpg',
      width: 1280,
      height: 800,
      alt: 'Forge Operations Platform desktop dashboard visualizing production throughput, inventory levels, and automated workflows',
    },
    detailUrl: '/work/forge-operations',
  },
];
