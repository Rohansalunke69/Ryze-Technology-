// Service offerings for Ryze Technology.
// See design.md "Data Models" + "/services/:slug — Service Detail".
// Invariants: slugs unique (req 29.3); process step indices contiguous 1..n (req 29.4).
//
// Five service categories, each surfacing its concrete offerings as `features`.

import type { Service } from '@app-types';

export const services: Service[] = [
  {
    slug: 'development',
    name: 'Development',
    tagline: 'Custom software engineered to work for years, not weeks.',
    icon: 'code',
    order: 1,
    summary:
      'Web apps, mobile apps, websites, e-commerce, dashboards, and the APIs and databases that power them.',
    whatWeDo:
      'We design and engineer the software your business runs on — from marketing sites and storefronts to custom web and mobile applications, internal dashboards, and the back-end systems behind them. Everything is built performance-first, accessible, and maintainable so it keeps working long after launch.',
    features: [
      { title: 'Custom Web Application Development', description: 'Tailored web apps built around your exact workflows and users.' },
      { title: 'Mobile App Development', description: 'Native-quality iOS and Android apps from a single codebase.' },
      { title: 'Business Websites', description: 'Fast, accessible marketing sites that earn attention and convert it.' },
      { title: 'E-commerce Development', description: 'Storefronts and checkout flows that handle real traffic and scale.' },
      { title: 'Admin Panels & Dashboards', description: 'Live operational views and control panels your team checks every day.' },
      { title: 'Booking & Scheduling Systems', description: 'Reservations, appointments, and scheduling with reminders and payments.' },
      { title: 'API Development & Integration', description: 'Clean, documented APIs and integrations that connect your tools.' },
      { title: 'Backend & Database Systems', description: 'Reliable servers, data models, and infrastructure built to scale.' },
    ],
    techStack: ['React', 'Next.js', 'React Native', 'TypeScript', 'Node.js', 'PostgreSQL'],
    process: [
      { index: 1, title: 'Discovery', description: 'We map your goals, users, and constraints into a clear scope.' },
      { index: 2, title: 'Design', description: 'We shape the system and key flows so you react to something real early.' },
      { index: 3, title: 'Build', description: 'We engineer in vertical slices, shipping working software continuously.' },
      { index: 4, title: 'Launch', description: 'We test, optimize, and deploy with monitoring and rollback in place.' },
      { index: 5, title: 'Iterate', description: 'We measure real usage and refine based on what the data shows.' },
    ],
    faqs: [
      { question: 'Can you build both the website and the mobile app?', answer: 'Yes. We deliver web, mobile, and the shared backend together, so everything stays in sync on the same data.' },
      { question: 'Do you take over existing projects?', answer: 'We do. We can stabilize an existing codebase, fix what is broken, and extend it with new features.' },
      { question: 'How long does a typical project take?', answer: 'Most websites ship in six to ten weeks; apps and custom systems take longer depending on scope. We agree on a timeline during discovery.' },
      { question: 'Will we be able to maintain it afterwards?', answer: 'Yes. We write documented, maintainable code, and we offer ongoing maintenance plans if you would rather we keep it running.' },
    ],
    seo: {
      title: 'Software Development',
      description: 'Custom web and mobile app development, business websites, e-commerce, dashboards, APIs, and backend systems.',
      canonical: 'https://ryze.technology/services/development',
    },
  },
  {
    slug: 'design',
    name: 'Design',
    tagline: 'Interfaces and brand work people actually enjoy using.',
    icon: 'palette',
    order: 2,
    summary:
      'UI/UX, branding, wireframing and prototyping, website redesigns, marketing creatives, and design systems.',
    whatWeDo:
      'We turn ideas and requirements into clear, confident design — from brand identity and logos to product UI/UX, prototypes, and the design systems that keep everything consistent as you grow. We design for real use: accessible, on-brand, and ready to build.',
    features: [
      { title: 'UI/UX Design', description: 'Intuitive product interfaces grounded in how people actually work.' },
      { title: 'Branding & Logo Design', description: 'Distinct brand identities and logos that scale across every surface.' },
      { title: 'Wireframing & Prototyping', description: 'Interactive prototypes that validate flows before a line of code.' },
      { title: 'Website Redesign', description: 'Modern redesigns that lift clarity, speed, and conversion.' },
      { title: 'Marketing Creatives', description: 'Social media posts, ads, and banners that stay on-brand.' },
      { title: 'Design Systems', description: 'Token-driven component libraries for consistency at scale.' },
    ],
    techStack: ['Figma', 'Design Tokens', 'Prototyping', 'Accessibility', 'Brand', 'Illustration'],
    process: [
      { index: 1, title: 'Discover', description: 'We learn your brand, audience, and goals before designing anything.' },
      { index: 2, title: 'Explore', description: 'We sketch directions and align on a clear visual language.' },
      { index: 3, title: 'Design', description: 'We craft high-fidelity screens, brand assets, and prototypes.' },
      { index: 4, title: 'Handoff', description: 'We deliver a documented system the build team can use directly.' },
    ],
    faqs: [
      { question: 'Do you design and build, or design only?', answer: 'Both. We can hand off polished designs to your team, or design and engineer the product end to end.' },
      { question: 'Can you refresh our brand without a full rebrand?', answer: 'Yes. We can evolve your existing identity or create a brand new one, depending on what the business needs.' },
      { question: 'Do you provide social media and ad creatives?', answer: 'We design marketing creatives — social posts, ads, and banners — that match your brand system.' },
      { question: 'Will the design be accessible?', answer: 'Accessibility is built in: we design to WCAG AA contrast and usable, keyboard-friendly patterns from the start.' },
    ],
    seo: {
      title: 'Design Services',
      description: 'UI/UX design, branding and logo design, wireframing, website redesigns, marketing creatives, and design systems.',
      canonical: 'https://ryze.technology/services/design',
    },
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing',
    tagline: 'Turn attention into customers across every channel.',
    icon: 'megaphone',
    order: 3,
    summary:
      'SEO, social media marketing, paid ads, content, WhatsApp and email marketing, and local SEO.',
    whatWeDo:
      'We help people find you and choose you. From search and local SEO to social media, paid ads, content, and messaging campaigns, we build a marketing engine that grows your audience and turns it into real business — measured, not guessed.',
    features: [
      { title: 'Search Engine Optimization (SEO)', description: 'Technical and content SEO that earns durable organic traffic.' },
      { title: 'Social Media Marketing', description: 'Instagram, Facebook, and LinkedIn content and community that grows your brand.' },
      { title: 'Paid Ads', description: 'Google Ads and Meta Ads campaigns tuned for return on spend.' },
      { title: 'Content Marketing', description: 'Articles, assets, and campaigns that attract and convert.' },
      { title: 'WhatsApp Marketing', description: 'Broadcast and automation flows that reach customers where they are.' },
      { title: 'Email Marketing', description: 'Lifecycle and campaign emails that nurture and retain.' },
      { title: 'Local SEO', description: 'Google Business Profile and local visibility that drives footfall.' },
    ],
    techStack: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics', 'Email', 'WhatsApp API'],
    process: [
      { index: 1, title: 'Audit', description: 'We assess your current presence, channels, and competitors.' },
      { index: 2, title: 'Strategy', description: 'We pick the channels and messages with the best return for you.' },
      { index: 3, title: 'Launch', description: 'We set up campaigns, content, and tracking, then go live.' },
      { index: 4, title: 'Optimize', description: 'We read the data weekly and double down on what works.' },
    ],
    faqs: [
      { question: 'How soon will we see results?', answer: 'Paid ads can drive traffic immediately; SEO and content compound over months. We set realistic expectations per channel up front.' },
      { question: 'Do you manage the ad budget too?', answer: 'Yes. We plan, run, and optimize Google and Meta ad spend, and report on return clearly.' },
      { question: 'Can you handle our social media day to day?', answer: 'We offer ongoing social media management — content, scheduling, and community engagement.' },
      { question: 'How do you measure success?', answer: 'We track the metrics that matter — leads, conversions, and revenue — not just likes, and report on them transparently.' },
    ],
    seo: {
      title: 'Digital Marketing',
      description: 'SEO, social media marketing, paid ads, content, WhatsApp, email, and local SEO that grow your business.',
      canonical: 'https://ryze.technology/services/digital-marketing',
    },
  },
  {
    slug: 'sales-strategy',
    name: 'Sales & Strategy',
    tagline: 'A system for finding, converting, and keeping customers.',
    icon: 'target',
    order: 4,
    summary:
      'Lead generation, sales funnel setup, CRM setup and consulting, and business consulting.',
    whatWeDo:
      'We help you build a repeatable engine for growth — generating qualified leads, designing sales funnels that convert, setting up the CRM that keeps it all organized, and advising on the strategy that ties it together.',
    features: [
      { title: 'Lead Generation', description: 'Targeted campaigns and funnels that fill your pipeline with qualified leads.' },
      { title: 'Sales Funnel Setup', description: 'End-to-end funnels that move prospects from interest to purchase.' },
      { title: 'CRM Setup & Consulting', description: 'The right CRM configured to your process, with your team trained on it.' },
      { title: 'Business Consulting', description: 'Practical strategy to align product, marketing, and sales for growth.' },
    ],
    techStack: ['CRM', 'Funnels', 'Automation', 'Analytics', 'Lead Gen', 'Strategy'],
    process: [
      { index: 1, title: 'Assess', description: 'We map your current funnel, tools, and where leads are lost.' },
      { index: 2, title: 'Design', description: 'We design the funnel, CRM, and follow-up that fit your business.' },
      { index: 3, title: 'Implement', description: 'We set up the tools, automations, and tracking, then train your team.' },
      { index: 4, title: 'Refine', description: 'We review the numbers and tune the funnel for higher conversion.' },
    ],
    faqs: [
      { question: 'Which CRM do you recommend?', answer: 'We recommend the CRM that fits your size and process rather than a one-size-fits-all tool, and we configure it around how you actually sell.' },
      { question: 'Can you generate leads for our business?', answer: 'Yes. We build lead-generation campaigns and funnels tailored to your audience and offer.' },
      { question: 'Do you only consult, or do you implement too?', answer: 'Both. We can advise on strategy and also set up the funnels, automations, and CRM ourselves.' },
      { question: 'Will this integrate with our website and marketing?', answer: 'Yes. We connect your funnel and CRM to your site, ads, and marketing so everything works as one system.' },
    ],
    seo: {
      title: 'Sales & Strategy',
      description: 'Lead generation, sales funnel setup, CRM setup and consulting, and business consulting for growth.',
      canonical: 'https://ryze.technology/services/sales-strategy',
    },
  },
  {
    slug: 'maintenance-support',
    name: 'Maintenance & Support',
    tagline: 'We stay after launch, because durable means supported.',
    icon: 'wrench',
    order: 5,
    summary:
      'Maintenance plans, updates, 24/7 support, performance optimization, hosting, and annual contracts.',
    whatWeDo:
      'Shipping is the start, not the finish. We keep your website, app, and systems fast, secure, and up to date — with proactive maintenance, performance tuning, hosting and server management, and support that is there when you need it.',
    features: [
      { title: 'Website Maintenance Plans', description: 'Ongoing updates, fixes, and improvements that keep your site healthy.' },
      { title: 'App Maintenance & Updates', description: 'OS-compatibility updates, fixes, and new features for your apps.' },
      { title: '24/7 Technical Support', description: 'Help when you need it, so issues never sit unattended.' },
      { title: 'Performance Optimization', description: 'Speed, reliability, and Core Web Vitals tuning on a schedule.' },
      { title: 'Hosting & Server Management', description: 'Managed hosting, monitoring, backups, and security patching.' },
      { title: 'Annual Maintenance Contracts (AMC)', description: 'Predictable, all-in plans that cover everything above for the year.' },
    ],
    techStack: ['Monitoring', 'CI/CD', 'Hosting', 'Backups', 'Security', 'Performance'],
    process: [
      { index: 1, title: 'Onboard', description: 'We audit your stack and set up monitoring, backups, and access.' },
      { index: 2, title: 'Stabilize', description: 'We fix outstanding issues and harden the most fragile parts first.' },
      { index: 3, title: 'Maintain', description: 'We apply updates, patches, and optimizations on a regular cadence.' },
      { index: 4, title: 'Support', description: 'We respond to issues and report on health, uptime, and performance.' },
    ],
    faqs: [
      { question: 'Do you maintain sites and apps you did not build?', answer: 'Yes. We can take over an existing website or app, get it stable, and keep it maintained.' },
      { question: 'What does an AMC include?', answer: 'An Annual Maintenance Contract bundles updates, fixes, performance tuning, hosting management, and support into one predictable plan.' },
      { question: 'How fast do you respond to issues?', answer: 'Response times depend on your plan; our support tiers include options up to 24/7 coverage for critical systems.' },
      { question: 'Can you manage our hosting and backups?', answer: 'Yes. We offer managed hosting with monitoring, automated backups, and security patching.' },
    ],
    seo: {
      title: 'Maintenance & Support',
      description: 'Website and app maintenance, 24/7 support, performance optimization, hosting, and annual maintenance contracts.',
      canonical: 'https://ryze.technology/services/maintenance-support',
    },
  },
];
