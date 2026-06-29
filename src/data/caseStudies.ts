// Case study content for the Ryze Technology portfolio.
// See design.md "Data Models" + "/portfolio/:slug — Case Study Detail".
// Invariants (requirements 29.3): slugs are unique within this collection.

import type { CaseStudy } from '@app-types';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'orange-city-grocers',
    title: 'A storefront that turned aisle browsers into loyal subscribers',
    client: 'Orange City Grocers',
    category: 'websites',
    services: ['development', 'sales-strategy'],
    year: 2024,
    role: 'Product strategy, full-stack engineering, design system',
    featured: true,
    order: 1,
    summary:
      'A Nagpur grocery chain wanted online ordering without losing the neighbourhood feel. We built a fast storefront and a subscription engine that keeps regulars coming back.',
    hero: {
      src: '/images/case-studies/orange-city-grocers-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Orange City Grocers storefront homepage on a laptop and phone',
    },
    challenge:
      'Orange City Grocers ran six stores on phone orders and handwritten ledgers. Repeat customers wanted recurring deliveries, but the team had no way to schedule, bill, or track them, and a slow legacy site drove shoppers to national apps.',
    solution:
      'We shipped a server-rendered storefront with sub-second navigation, a recurring-order subscription engine, and an inventory dashboard that syncs stock across all six stores. Drivers get an optimized daily route, and customers manage deliveries from a single account page.',
    results: [
      { label: 'Online revenue growth', value: 240, suffix: '%' },
      { label: 'Repeat order rate', value: 68, suffix: '%' },
      { label: 'Faster page loads', value: 4, suffix: 'x' },
      { label: 'Active subscriptions', value: 1200, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/orange-city-grocers-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Product listing grid with category filters',
      },
      {
        src: '/images/case-studies/orange-city-grocers-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Subscription management screen on mobile',
      },
      {
        src: '/images/case-studies/orange-city-grocers-gallery-3.svg',
        width: 1280,
        height: 800,
        alt: 'Store inventory dashboard with stock levels',
      },
      {
        src: '/images/case-studies/orange-city-grocers-gallery-4.svg',
        width: 1280,
        height: 800,
        alt: 'Delivery route map for the driver app',
      },
    ],
    testimonialId: 't-orange-city-grocers',
    techStack: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe', 'Redis'],
    learnings: [
      'Subscription churn dropped sharply once we let customers skip a week instead of cancelling outright.',
      'Inventory accuracy mattered more than feature count; reliable stock counts built shopper trust.',
    ],
    relatedSlugs: ['vidarbha-logistics-hub'],
    seo: {
      title: 'Orange City Grocers — Grocery storefront & subscriptions',
      description:
        'How we helped a Nagpur grocery chain grow online revenue 240% with a fast storefront and recurring delivery engine.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/orange-city-grocers',
    },
  },
  {
    slug: 'mednudge-care-companion',
    title: 'A care companion app that keeps patients on track between visits',
    client: 'MedNudge Health',
    category: 'mobile',
    services: ['development', 'design'],
    year: 2024,
    role: 'Mobile architecture, offline sync, design system',
    featured: true,
    order: 2,
    summary:
      'A clinic network needed a patient app that works on patchy networks across Vidarbha. We built an offline-first companion for medication reminders and follow-ups.',
    hero: {
      src: '/images/case-studies/mednudge-care-companion-hero.svg',
      width: 1600,
      height: 900,
      alt: 'MedNudge care companion app shown on two smartphones',
    },
    challenge:
      'Patients in semi-urban Vidarbha frequently missed medication doses and follow-up appointments. Connectivity was unreliable, so any reminder system had to work entirely offline and reconcile cleanly once a signal returned.',
    solution:
      'We built an offline-first React Native app with a conflict-free local store, scheduled local notifications for doses, and a background sync layer that reconciles reminders and visit notes with the clinic backend. Caregivers can manage a relative\u2019s schedule from the same account.',
    results: [
      { label: 'Medication adherence', value: 82, suffix: '%' },
      { label: 'Follow-up attendance', value: 57, suffix: '%' },
      { label: 'Works offline', value: 100, suffix: '%' },
      { label: 'Patients onboarded', value: 9000, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/mednudge-care-companion-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Daily medication schedule screen',
      },
      {
        src: '/images/case-studies/mednudge-care-companion-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Reminder notification on a lock screen',
      },
      {
        src: '/images/case-studies/mednudge-care-companion-gallery-3.svg',
        width: 1280,
        height: 800,
        alt: 'Caregiver dashboard tracking a relative',
      },
    ],
    testimonialId: 't-mednudge-care-companion',
    techStack: ['React Native', 'Expo', 'TypeScript', 'SQLite', 'WatermelonDB', 'Node.js'],
    learnings: [
      'Local-first storage with deterministic merge rules removed nearly all sync conflicts.',
      'Plain-language reminders outperformed clinical wording for adherence in user testing.',
    ],
    seo: {
      title: 'MedNudge — Offline-first patient care companion app',
      description:
        'An offline-first mobile app that lifted medication adherence to 82% across patchy networks in Vidarbha.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/mednudge-care-companion',
    },
  },
  {
    slug: 'vidarbha-logistics-hub',
    title: 'An operations hub that replaced spreadsheets for a regional fleet',
    client: 'Vidarbha Logistics',
    category: 'systems',
    services: ['development', 'maintenance-support'],
    year: 2023,
    role: 'Systems design, full-stack engineering, desktop tooling',
    featured: true,
    order: 3,
    summary:
      'A freight operator ran dispatch on spreadsheets and phone calls. We built a real-time operations hub plus a desktop dispatch console for the control room.',
    hero: {
      src: '/images/case-studies/vidarbha-logistics-hub-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Vidarbha Logistics operations dashboard on a wide monitor',
    },
    challenge:
      'Vidarbha Logistics coordinated 140 vehicles with shared spreadsheets that went stale within minutes. Dispatchers double-booked trucks, billing lagged days behind, and no one had a live view of where shipments actually were.',
    solution:
      'We delivered a real-time operations hub with live shipment tracking, automated billing, and role-based access, paired with a native desktop dispatch console built for the control room\u2019s multi-monitor setup. Events stream over websockets so every screen reflects the same state instantly.',
    results: [
      { label: 'Dispatch errors cut', value: 91, suffix: '%' },
      { label: 'Billing cycle faster', value: 6, suffix: 'x' },
      { label: 'Fleet utilisation', value: 34, suffix: '%' },
      { label: 'Hours saved weekly', value: 120, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/vidarbha-logistics-hub-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Live shipment tracking map',
      },
      {
        src: '/images/case-studies/vidarbha-logistics-hub-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Desktop dispatch console across two monitors',
      },
      {
        src: '/images/case-studies/vidarbha-logistics-hub-gallery-3.svg',
        width: 1280,
        height: 800,
        alt: 'Automated billing summary screen',
      },
      {
        src: '/images/case-studies/vidarbha-logistics-hub-gallery-4.svg',
        width: 1280,
        height: 800,
        alt: 'Role-based access settings panel',
      },
    ],
    testimonialId: 't-vidarbha-logistics-hub',
    techStack: ['React', 'TypeScript', 'Electron', 'Node.js', 'PostgreSQL', 'WebSocket', 'Redis'],
    learnings: [
      'A native desktop console beat the browser for dispatchers who live on multi-monitor rigs all day.',
      'Streaming a single source of truth to every screen eliminated the double-booking problem entirely.',
    ],
    relatedSlugs: ['orange-city-grocers'],
    seo: {
      title: 'Vidarbha Logistics — Real-time fleet operations hub',
      description:
        'A real-time operations hub and desktop dispatch console that cut dispatch errors 91% for a regional freight fleet.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/vidarbha-logistics-hub',
    },
  },
  {
    slug: 'aurora-finance-dashboard',
    title: 'A finance dashboard that turns raw ledgers into decisions',
    client: 'Aurora Capital',
    category: 'websites',
    services: ['development', 'design'],
    year: 2024,
    role: 'Product design, data viz, full-stack engineering',
    featured: false,
    order: 4,
    summary:
      'A boutique investment firm drowned in spreadsheets. We built a real-time portfolio dashboard that surfaces risk, returns, and cash flow at a glance.',
    hero: {
      src: '/images/case-studies/aurora-finance-dashboard-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Aurora Capital portfolio dashboard with charts',
    },
    challenge:
      'Analysts spent the first two hours of every day stitching numbers together by hand. Reporting was always a day behind, and no one could answer a client question without rebuilding a spreadsheet from scratch.',
    solution:
      'We built a real-time dashboard that ingests custodial feeds, computes risk and performance on the fly, and renders fast, interactive charts. Saved views and one-click client reports replaced the morning spreadsheet ritual entirely.',
    results: [
      { label: 'Reporting time saved', value: 90, suffix: '%' },
      { label: 'Live data latency', value: 2, suffix: 's' },
      { label: 'Client reports faster', value: 8, suffix: 'x' },
      { label: 'Dashboards in use', value: 40, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/aurora-finance-dashboard-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Portfolio performance overview',
      },
      {
        src: '/images/case-studies/aurora-finance-dashboard-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Risk breakdown by asset class',
      },
    ],
    techStack: ['React', 'TypeScript', 'D3', 'Node.js', 'PostgreSQL', 'Redis'],
    learnings: [
      'Pre-aggregating metrics on ingest kept the dashboard instant even with millions of rows.',
      'Letting analysts save their own views removed 80% of one-off report requests.',
    ],
    seo: {
      title: 'Aurora Capital — Real-time finance dashboard',
      description:
        'A real-time portfolio dashboard that cut an investment firm\u2019s reporting time by 90%.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/aurora-finance-dashboard',
    },
  },
  {
    slug: 'trailhead-booking-platform',
    title: 'A booking platform that filled off-season weekends',
    client: 'Trailhead Stays',
    category: 'websites',
    services: ['development'],
    year: 2023,
    role: 'Design, full-stack engineering, payments',
    featured: false,
    order: 5,
    summary:
      'A network of boutique homestays needed direct bookings to escape high OTA commissions. We built a conversion-focused booking platform with dynamic pricing.',
    hero: {
      src: '/images/case-studies/trailhead-booking-platform-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Trailhead Stays booking website with a property gallery',
    },
    challenge:
      'Owners handed 22% of every booking to third-party platforms and had no relationship with their guests. Their old site couldn\u2019t take a payment, so every reservation meant a flurry of calls.',
    solution:
      'We launched a direct-booking platform with real-time availability, dynamic seasonal pricing, and instant payments. A lightweight CRM keeps guest history so owners can win repeat stays without the middleman.',
    results: [
      { label: 'Direct bookings', value: 73, suffix: '%' },
      { label: 'Commission saved', value: 22, suffix: '%' },
      { label: 'Off-season occupancy', value: 41, suffix: '%' },
      { label: 'Repeat guests', value: 2, suffix: 'x' },
    ],
    gallery: [
      {
        src: '/images/case-studies/trailhead-booking-platform-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Property detail page with availability calendar',
      },
      {
        src: '/images/case-studies/trailhead-booking-platform-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Checkout flow with instant payment',
      },
    ],
    techStack: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
    learnings: [
      'Transparent dynamic pricing converted better than hidden discount codes.',
      'A two-step checkout cut booking abandonment nearly in half.',
    ],
    seo: {
      title: 'Trailhead Stays — Direct booking platform',
      description:
        'A direct-booking platform that took 73% of reservations off commission-heavy OTAs.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/trailhead-booking-platform',
    },
  },
  {
    slug: 'fieldwise-inspection-app',
    title: 'A field inspection app that works miles from a signal',
    client: 'FieldWise',
    category: 'mobile',
    services: ['development', 'design', 'sales-strategy'],
    year: 2024,
    role: 'Mobile architecture, offline sync, integrations',
    featured: false,
    order: 6,
    summary:
      'Inspectors logged site visits on paper and re-keyed them at night. We built an offline mobile app that captures structured reports and photos in the field.',
    hero: {
      src: '/images/case-studies/fieldwise-inspection-app-hero.svg',
      width: 1600,
      height: 900,
      alt: 'FieldWise inspection app on a rugged phone at a work site',
    },
    challenge:
      'Field teams worked at remote sites with no connectivity, then spent evenings transcribing paper forms. Photos got lost, reports were inconsistent, and head office was always days behind.',
    solution:
      'We built an offline-first inspection app with structured checklists, on-device photo capture and annotation, and GPS-stamped entries that sync automatically when a connection returns. Managers get clean, consistent reports in real time.',
    results: [
      { label: 'Report turnaround', value: 95, suffix: '%' },
      { label: 'Re-keying removed', value: 100, suffix: '%' },
      { label: 'Inspections / day', value: 3, suffix: 'x' },
      { label: 'Field users', value: 600, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/fieldwise-inspection-app-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Structured inspection checklist screen',
      },
      {
        src: '/images/case-studies/fieldwise-inspection-app-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Photo annotation tool in the field',
      },
    ],
    techStack: ['React Native', 'TypeScript', 'SQLite', 'Node.js', 'AWS S3'],
    learnings: [
      'Capturing structured data at the source eliminated an entire transcription job.',
      'Queuing photo uploads separately from form data made sync feel instant.',
    ],
    seo: {
      title: 'FieldWise — Offline field inspection app',
      description:
        'An offline-first inspection app that cut report turnaround by 95% for remote field teams.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/fieldwise-inspection-app',
    },
  },
  {
    slug: 'lumen-learning-app',
    title: 'A learning app that made daily practice a habit',
    client: 'Lumen Education',
    category: 'mobile',
    services: ['development', 'design'],
    year: 2023,
    role: 'Product design, mobile engineering, gamification',
    featured: false,
    order: 7,
    summary:
      'An ed-tech startup had great content but poor retention. We rebuilt the mobile experience around streaks, spaced repetition, and bite-sized lessons.',
    hero: {
      src: '/images/case-studies/lumen-learning-app-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Lumen learning app lesson and streak screens',
    },
    challenge:
      'Learners signed up, did one lesson, and never returned. The content was strong, but nothing pulled people back the next day, and progress felt invisible.',
    solution:
      'We redesigned the app around short daily sessions, a spaced-repetition engine that resurfaces the right material, and a streak system with gentle nudges. Progress is visualized so learners feel momentum every session.',
    results: [
      { label: 'Day-30 retention', value: 3, suffix: 'x' },
      { label: 'Daily active users', value: 156, suffix: '%' },
      { label: 'Lessons completed', value: 4, suffix: 'x' },
      { label: 'Avg. streak length', value: 18, suffix: ' days' },
    ],
    gallery: [
      {
        src: '/images/case-studies/lumen-learning-app-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Daily lesson screen with progress ring',
      },
      {
        src: '/images/case-studies/lumen-learning-app-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Streak and achievements screen',
      },
    ],
    techStack: ['React Native', 'Expo', 'TypeScript', 'GraphQL', 'Node.js'],
    learnings: [
      'Spaced repetition drove retention far more than adding new content did.',
      'A forgiving streak (one free skip a week) kept more users engaged than a strict one.',
    ],
    seo: {
      title: 'Lumen Education — Habit-forming learning app',
      description:
        'A mobile learning app rebuilt around streaks and spaced repetition that tripled day-30 retention.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/lumen-learning-app',
    },
  },
  {
    slug: 'cobalt-ops-automation',
    title: 'An automation layer that gave a back office its nights back',
    client: 'Cobalt Manufacturing',
    category: 'systems',
    services: ['development', 'sales-strategy'],
    year: 2024,
    role: 'Systems design, integrations, automation',
    featured: false,
    order: 8,
    summary:
      'A manufacturer\u2019s team copy-pasted between five tools every day. We built an automation layer that connects them and runs the busywork on its own.',
    hero: {
      src: '/images/case-studies/cobalt-ops-automation-hero.svg',
      width: 1600,
      height: 900,
      alt: 'Cobalt Manufacturing automation workflow board',
    },
    challenge:
      'Orders, inventory, invoicing, and shipping lived in five disconnected tools. Staff re-entered the same data into each, errors crept in, and month-end close took a full week.',
    solution:
      'We mapped the workflows and built an automation layer that syncs the systems, validates data as it moves, and runs scheduled jobs for invoicing and reporting. A clean console lets the team watch every run and step in only when needed.',
    results: [
      { label: 'Manual entry removed', value: 85, suffix: '%' },
      { label: 'Month-end close', value: 5, suffix: 'x' },
      { label: 'Data errors cut', value: 78, suffix: '%' },
      { label: 'Hours saved monthly', value: 320, suffix: '+' },
    ],
    gallery: [
      {
        src: '/images/case-studies/cobalt-ops-automation-gallery-1.svg',
        width: 1280,
        height: 800,
        alt: 'Automation workflow builder',
      },
      {
        src: '/images/case-studies/cobalt-ops-automation-gallery-2.svg',
        width: 1280,
        height: 800,
        alt: 'Run history and monitoring console',
      },
    ],
    techStack: ['TypeScript', 'Node.js', 'Temporal', 'PostgreSQL', 'REST APIs'],
    learnings: [
      'Validating data in transit caught errors that used to surface only at month-end.',
      'A visible run history built the team\u2019s trust in letting automation own the busywork.',
    ],
    seo: {
      title: 'Cobalt Manufacturing — Back-office automation layer',
      description:
        'An automation layer that removed 85% of manual data entry and made month-end close 5x faster.',
      canonical: 'https://ryze-technology.pages.dev/portfolio/cobalt-ops-automation',
    },
  },
];
