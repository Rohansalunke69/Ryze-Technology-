import type { Service } from '@app-types';

export const services: Service[] = [
  {
    slug: 'development',
    name: 'Development',
    tagline: 'Fast, secure, and maintainable systems built for the long run.',
    icon: 'globe',
    order: 1,
    summary: 'Custom web apps, native-quality mobile apps, and robust backend systems engineered for durability.',
    whatWeDo:
      'We design and build custom software from the first commit to launch and scale. That means server-rendered performance, offline-first mobile apps, and reliable internal dashboards. Every codebase is built with strict performance budgets, type-safety, and automated test coverage so your systems scale without slowing down.',
    features: [
      {
        title: 'Custom Web Applications',
        description: 'Tailored Next.js and React web apps engineered for speed, utility, and user conversion.',
      },
      {
        title: 'Mobile App Development',
        description: 'Native-quality iOS and Android apps built from a single, shared React Native codebase.',
      },
      {
        title: 'Business Websites',
        description: 'High-performance marketing and corporate websites optimized for sub-second page loads.',
      },
      {
        title: 'E-commerce Solutions',
        description: 'Headless storefronts and custom checkout flows built to handle high volume without lag.',
      },
      {
        title: 'Admin Panels & Dashboards',
        description: 'Internal dashboards and command consoles optimized for high-density data display.',
      },
      {
        title: 'Booking & Scheduling Systems',
        description: 'Real-time booking and calendar systems built with zero-collision double-booking guards.',
      },
      {
        title: 'API Development & Integration',
        description: 'Secure, self-documenting REST and GraphQL interfaces built to connect disparate systems.',
      },
      {
        title: 'Backend & Database Systems',
        description: 'Durably modeled relational databases, cache configurations, and migrations that preserve integrity.',
      },
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'React Native', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Prisma'],
    process: [
      { index: 1, title: 'Discovery', description: 'We map your business workflows, model the data requirements, and define clear scope parameters.' },
      { index: 2, title: 'Architecture', description: 'We shape the schema models, outline integration seams, and build clickable flow prototypes.' },
      { index: 3, title: 'Engineering', description: 'We write modular, type-safe code in vertical slices, delivering working features continuously.' },
      { index: 4, title: 'Testing & QA', description: 'We run automated unit, integration, and accessibility suites across target viewports.' },
      { index: 5, title: 'Deployment', description: 'We ship to production using automated CI/CD pipelines with monitoring and rollback protection.' },
    ],
    faqs: [
      {
        question: 'How long does a development project take?',
        answer: 'Most Custom Web Applications or Business Websites ship in six to ten weeks. High-density mobile apps or custom internal systems take twelve to sixteen weeks depending on scope.',
      },
      {
        question: 'Will the mobile app work on both iOS and Android?',
        answer: 'Yes. We utilize React Native and Expo to compile a single, shared codebase to native iOS and Android binaries, maintaining strict parity and lowering ongoing support costs.',
      },
      {
        question: 'Do we own the source code after launch?',
        answer: 'Absolutely. Upon project completion, we hand over full ownership of the codebase and repositories to your team, complete with setup documentation.',
      },
    ],
    relatedCaseStudySlugs: ['mednudge-care-companion'],
    seo: {
      title: 'Custom Web & Mobile App Development',
      description: 'Engineering fast, type-safe web applications, native mobile apps, and robust backend database systems.',
      canonical: 'https://ryze.technology/services/development',
    },
  },
  {
    slug: 'design',
    name: 'Design',
    tagline: 'Interfaces that feel tactile, logical, and beautiful.',
    icon: 'smartphone',
    order: 2,
    summary: 'UI/UX design, brand identity systems, and unified Figma design systems mapped directly to code.',
    whatWeDo:
      'We design digital products that look stunning and function with absolute utility. We bridge the gap between design concepts and front-end engineering by building token-driven design systems in Figma. This ensures that every typographic scale, color variable, and component translates 1-to-1 to production code.',
    features: [
      {
        title: 'UI/UX Design',
        description: 'Digital interfaces structured for utility, ease of navigation, and clear conversion paths.',
      },
      {
        title: 'Branding & Logo Design',
        description: 'Cohesive brand identities including logo design, color theory, typography systems, and style guidelines.',
      },
      {
        title: 'Wireframing & Prototyping',
        description: 'Interactive wireframes and user flow prototypes built to validate UX logic early.',
      },
      {
        title: 'Website Redesigns',
        description: 'Modernizing aging interfaces to align with modern design patterns while preserving SEO equity.',
      },
      {
        title: 'Marketing Creatives',
        description: 'High-fidelity social media banners, advertisements, and templates that maintain brand guidelines.',
      },
      {
        title: 'Design Systems',
        description: 'Tokenized Figma libraries containing reusable components that mirror the frontend code tokens.',
      },
    ],
    techStack: ['Figma', 'Adobe CC', 'Tailwind CSS', 'Framer Motion', 'Vinci', 'Google Fonts'],
    process: [
      { index: 1, title: 'Brand Discovery', description: 'We study your brand values, target demographic, and primary communication objectives.' },
      { index: 2, title: 'Wireframing', description: 'We establish high-level structural layouts and user journeys without decorative color noise.' },
      { index: 3, title: 'Visual UI Design', description: 'We apply the design language, choosing typography scales, elevations, and tactile details.' },
      { index: 4, title: 'Prototyping', description: 'We wire up transitions, hover feedback, and micro-interactions so you can feel the UI flow.' },
      { index: 5, title: 'Code Handoff', description: 'We compile Figma variables directly into code tokens (CSS variables and tailwind values).' },
    ],
    faqs: [
      {
        question: 'Do you design in Figma?',
        answer: 'Yes, Figma is our primary tool for visual layouts, design system variables, and click-through prototyping, enabling seamless collaborative reviews.',
      },
      {
        question: 'What is a design system and why do we need one?',
        answer: 'A design system is a central library of styles and UI components. It ensures visual consistency across your site and apps, speeds up engineering handoffs, and makes future styling updates cheap and fast.',
      },
    ],
    relatedCaseStudySlugs: ['orange-city-grocers'],
    seo: {
      title: 'UI/UX Design & Brand System Engineering',
      description: 'Crafting responsive user interfaces, interactive wireframes, and unified Figma design systems.',
      canonical: 'https://ryze.technology/services/design',
    },
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing',
    tagline: 'Marketing driven by search visibility, analytics, and ROI.',
    icon: 'monitor',
    order: 3,
    summary: 'Search engine optimization, paid media campaigns, and local search visibility driven by evidence.',
    whatWeDo:
      'We run marketing campaigns that yield measurable user acquisition, not vanity metrics. We construct tracking frameworks that monitor user acquisition cost (CAC), optimizing paid advertising across search and social channels, while establishing organic visibility through SEO best practices and local optimization.',
    features: [
      {
        title: 'Search Engine Optimization (SEO)',
        description: 'Clean HTML, fast load speeds, structured JSON-LD schemas, and keyword ranking growth.',
      },
      {
        title: 'Social Media Marketing',
        description: 'Organic content schedules and campaign oversight across LinkedIn, Facebook, and Instagram.',
      },
      {
        title: 'Paid Ads (Google & Meta)',
        description: 'Targeted search, display, and social ad campaigns optimized for maximum return on ad spend (ROAS).',
      },
      {
        title: 'Content Marketing',
        description: 'Authoring insights, guides, and engineering playbooks that capture organic search intent.',
      },
      {
        title: 'WhatsApp Marketing',
        description: 'Transactional notifications, automated alert sequences, and customer engagement channels.',
      },
      {
        title: 'Email Marketing',
        description: 'Segmented customer lists, custom newsletter layouts, and automated drip sequences.',
      },
      {
        title: 'Local SEO',
        description: 'Google My Business optimization and regional citation building to capture local search queries.',
      },
    ],
    techStack: ['Google Ads', 'Meta Business Suite', 'Google Analytics', 'Semrush', 'Mailchimp', 'WhatsApp API'],
    process: [
      { index: 1, title: 'Audit & Analysis', description: 'We analyze your current search index coverage, ad account history, and tracking systems.' },
      { index: 2, title: 'Strategy Plan', description: 'We define core keyword groups, design landing page funnels, and calculate target customer acquisition costs.' },
      { index: 3, title: 'Setup & Tracking', description: 'We configure Google Analytics, conversion pixels, and webhook payloads to record key funnel milestones.' },
      { index: 4, title: 'Launch & Optimize', description: 'We activate campaign ad sets and perform regular adjustments on bid weights, keywords, and copy.' },
      { index: 5, title: 'Reporting', description: 'We deliver clear metrics summaries detailing cost per lead, click-through rates, and conversion volumes.' },
    ],
    faqs: [
      {
        question: 'How do you measure marketing success?',
        answer: 'We measure success by tracking conversions, customer acquisition cost (CAC), and return on ad spend (ROAS). We set up conversion trackers so you know exactly which campaigns are driving revenue.',
      },
      {
        question: 'How long does it take for SEO changes to show results?',
        answer: 'While technical fixes (improving speed, fixing crawl errors, and adding structured schema) show index updates in a few weeks, organic rank authority building takes three to six months to show significant keyword traffic gains.',
      },
    ],
    relatedCaseStudySlugs: ['orange-city-grocers'],
    seo: {
      title: 'Performance Marketing & SEO Optimization',
      description: 'Boosting brand traffic with search engine optimization, paid ad campaigns, and local search visibility.',
      canonical: 'https://ryze.technology/services/digital-marketing',
    },
  },
  {
    slug: 'sales-strategy',
    name: 'Sales & Strategy',
    tagline: 'Funnels, CRM consulting, and operational consulting.',
    icon: 'workflow',
    order: 4,
    summary: 'Lead generation, automated sales funnel setups, CRM consulting, and workflow strategy.',
    whatWeDo:
      'We optimize how leads flow into your business. We map out your existing customer acquisition paths, configure CRM pipelines to eliminate administrative overhead, and design automated lead routing, follow-up drip sequences, and team workflows that maximize sales conversion rates.',
    features: [
      {
        title: 'Lead Generation',
        description: 'Deploying high-converting landing pages, assessment quizzes, and contact captures.',
      },
      {
        title: 'Sales Funnel Setup',
        description: 'Automating lead scoring, nurturing, and routing to ensure sales reps act on warm leads.',
      },
      {
        title: 'CRM Setup & Consulting',
        description: 'Configuring HubSpot, Zoho, or Salesforce pipelines with custom properties and automation.',
      },
      {
        title: 'Business Consulting',
        description: 'Strategic audits of your current tech stack, licensing costs, and operational bottlenecks.',
      },
    ],
    techStack: ['HubSpot CRM', 'Zoho CRM', 'Zapier', 'Make.com', 'Typeform', 'ActiveCampaign'],
    process: [
      { index: 1, title: 'Workflow Audit', description: 'We map your existing sales pipelines, identify bottlenecks, and locate where leads slip through.' },
      { index: 2, title: 'Funnels Design', description: 'We model custom CRM stages, automated follow-up rules, and data validation rules.' },
      { index: 3, title: 'CRM Deployment', description: 'We build out custom pipelines, invite your sales teams, and configure access permissions.' },
      { index: 4, title: 'Automation Setup', description: 'We wire Zapier or Make webhooks to pass leads from advertisements to CRM deal cards.' },
      { index: 5, title: 'SLA Tracking', description: 'We set up tracking for lead response times, conversion rates, and monthly pipeline values.' },
    ],
    faqs: [
      {
        question: 'Which CRM system should we use?',
        answer: 'For most small-to-medium businesses, we recommend HubSpot for its clean UX or Zoho for its deep custom configurations and affordable cost. We choose the right CRM for your budget during discovery.',
      },
      {
        question: 'Can you automate email follow-ups for new leads?',
        answer: 'Yes. We construct automated nurturing funnels that send email or SMS sequences when a user fills a form, keeping leads warm until your sales team contacts them.',
      },
    ],
    relatedCaseStudySlugs: ['vidarbha-logistics-hub'],
    seo: {
      title: 'CRM Consulting & Automated Sales Funnels',
      description: 'Streamlining customer acquisition with lead generation, CRM pipelines, and strategic business consulting.',
      canonical: 'https://ryze.technology/services/sales-strategy',
    },
  },
  {
    slug: 'maintenance-support',
    name: 'Maintenance & Support',
    tagline: 'Uptime monitoring, server management, and technical support.',
    icon: 'monitor',
    order: 5,
    summary: 'Routine website updates, app upkeep, CDN configurations, and annual maintenance agreements (AMC).',
    whatWeDo:
      'We stand behind the systems we build. Our maintenance and technical support plans keep your web platforms and mobile apps secure, patched, and performing at peak efficiency. We manage cloud hosting, monitor server load, track crash reports, and implement ongoing minor feature updates.',
    features: [
      {
        title: 'Website Maintenance Plans',
        description: 'Routine dependency updates, security scans, database optimization, and content modifications.',
      },
      {
        title: 'App Maintenance & Updates',
        description: 'Compiling app binaries to satisfy new Android SDK or iOS requirements and pushing store updates.',
      },
      {
        title: '24/7 Technical Support',
        description: 'On-call emergency response, incident management, and operational uptime support.',
      },
      {
        title: 'Performance Optimization',
        description: 'Regular audits of query times, database indexing, asset loading speeds, and CDN caching rules.',
      },
      {
        title: 'Hosting & Server Management',
        description: 'Managing AWS, GCP, Vercel, or Hostinger setups with secure SSL renewals and auto-scaling rules.',
      },
      {
        title: 'Annual Maintenance Contracts (AMC)',
        description: 'Structured, SLA-backed retainers providing allocated engineering hours for minor styling and logic updates.',
      },
    ],
    techStack: ['AWS Cloudwatch', 'Sentry', 'Datadog', 'GitHub Actions', 'Vercel Edge', 'Cloudflare'],
    process: [
      { index: 1, title: 'Server Audit', description: 'We review your current cloud hosting environment, access permissions, and backups.' },
      { index: 2, title: 'Monitoring Setup', description: 'We wire up Sentry for error tracking and UptimeRobot or Datadog for server health alerts.' },
      { index: 3, title: 'SLA Activation', description: 'We define communication paths, emergency hotlines, and expected response times.' },
      { index: 4, title: 'Patch Routine', description: 'We schedule monthly or bi-weekly maintenance windows to update dependencies and apply security fixes.' },
      { index: 5, title: 'Uptime Delivery', description: 'We continuously monitor logs and handle hosting issues to keep systems online 24/7.' },
    ],
    faqs: [
      {
        question: 'What is an Annual Maintenance Contract (AMC)?',
        answer: 'An AMC is a dedicated monthly retainer plan. It grants your business a set number of engineering hours each month for minor code updates, bug fixes, content additions, and server audits.',
      },
      {
        question: 'How do you handle hosting and domain renewals?',
        answer: 'We configure auto-renewal guards for your domains and configure your cloud hosting (Vercel, AWS, etc.) with secure billing alerts so your systems never go offline due to expired credentials.',
      },
    ],
    relatedCaseStudySlugs: ['vidarbha-logistics-hub', 'orange-city-grocers'],
    seo: {
      title: 'Technical Support & Annual Website Maintenance',
      description: 'Guaranteeing system uptime with server management, website updates, and 24/7 support plans.',
      canonical: 'https://ryze.technology/services/maintenance-support',
    },
  },
];
