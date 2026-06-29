// Typed blog content for the Ryze Technology website.
// See design.md "Data Models" (BlogPost) and the blog listing/post breakdowns.
// Requirements: 14.1 (listing fields), 15.1 (post detail fields), 29.3 (unique slugs).
//
// `readingTimeMinutes` is derived by calling computeReadingTime on each post's
// content so the displayed reading time always stays in sync with the prose.

import type { BlogPost, ImageAsset, SEOMeta } from '@app-types';
import { computeReadingTime } from '../lib/readingTime';
import { authors } from './authors';

const SITE_URL = 'https://ryze-technology.pages.dev';

/** Build a 16:9 cover ImageAsset from a slug. Placeholder art lives under /images/blog. */
function cover(slug: string, alt: string): ImageAsset {
  return {
    src: `/images/blog/${slug}.svg`,
    width: 1200,
    height: 675,
    alt,
  };
}

/** Build per-post SEO metadata with a canonical blog URL. */
function seo(slug: string, title: string, description: string): SEOMeta {
  return {
    title,
    description,
    canonical: `${SITE_URL}/blog/${slug}`,
  };
}

/**
 * Raw post definitions without the derived `readingTimeMinutes` field. The
 * exported `blogPosts` array is produced by mapping these through
 * `computeReadingTime(content)` so reading time can never drift from content.
 */
type RawPost = Omit<BlogPost, 'readingTimeMinutes'>;

const rawPosts: RawPost[] = [
  {
    slug: 'engineering-for-99-8-uptime',
    title: 'Engineering for 99.8% Uptime Without Heroics',
    category: 'engineering',
    excerpt:
      'Reliability is not luck. It is a set of boring, repeatable decisions. Here is how we hold a 99.8% uptime line without a war room on speed dial.',
    cover: cover(
      'engineering-for-99-8-uptime',
      'A monitoring dashboard showing a steady uptime line',
    ),
    content: `## Reliability is a design choice

When a product is down, no feature matters. We treat uptime as a first-class
requirement, on the same footing as the things a client can see. A 99.8% target
sounds modest until you do the math: it leaves room for roughly ninety minutes
of unplanned downtime a month, and not a second more.

Hitting that number is not about heroics at 3 a.m. It is about removing the
classes of failure that cause those late nights in the first place.

## Remove single points of failure

The first pass on any system we inherit is a hunt for the one box, one queue, or
one credential that can take everything down. We map the request path end to
end and ask a blunt question at every hop: what happens when this disappears?

- Stateless services scale horizontally and restart cleanly.
- Data stores run with replicas and tested failover, not just backups.
- Background work survives a worker dying mid-task through idempotent retries.

## Make deploys boring

Most outages we have investigated trace back to a change, not a meteor. So we
make change safe. Every deploy is automated, reversible, and observable. We ship
small, behind flags, and we watch the graphs for a few minutes before walking
away.

A rollback should be a button, not a research project. If reverting a release
takes longer than shipping it, that is the bug to fix first.

## Measure what users feel

Server CPU is not an outage. A checkout that times out is. We anchor our alerts
to user-facing symptoms — error rates, latency at the tail, failed
transactions — rather than machine internals. That keeps the on-call engineer
focused on impact instead of noise.

The result is a system that holds its line quietly. Uptime stops being a number
we hope for and becomes a number we engineer.`,
    author: authors.aanya,
    publishedAt: '2024-02-12',
    updatedAt: '2024-06-03',
    tags: ['reliability', 'uptime', 'sre', 'architecture'],
    featured: true,
    relatedSlugs: ['monitoring-that-actually-matters', 'devops-automation-that-pays-off'],
    seo: seo(
      'engineering-for-99-8-uptime',
      'Engineering for 99.8% Uptime Without Heroics',
      'How we hold a 99.8% uptime line through boring, repeatable engineering decisions instead of late-night firefighting.',
    ),
  },
  {
    slug: 'the-real-cost-of-technical-debt',
    title: 'The Real Cost of Technical Debt',
    category: 'process',
    excerpt:
      'Technical debt is not a moral failing. It is a loan with interest. The trick is knowing which debt to carry and which to pay down now.',
    cover: cover(
      'the-real-cost-of-technical-debt',
      'A whiteboard covered in architecture notes and arrows',
    ),
    content: `## Debt is a tool, not a sin

Every shortcut you take to ship faster is a loan against future work. Like any
loan, technical debt is fine in moderation and ruinous when it compounds
unnoticed. The teams that move fastest are not the ones with zero debt. They are
the ones who know exactly how much they carry and what it costs them each sprint.

## The interest shows up as friction

You rarely get a bill labelled "technical debt." Instead you feel it as friction:

- A one-line change that touches nine files.
- A test suite nobody trusts, so nobody runs it.
- Onboarding that takes a month because the system lives in one person's head.

Each of these is interest payment. Left alone, the payments grow until most of a
team's energy goes to servicing debt rather than building anything new.

## Make the debt visible

We keep a written ledger of known debt: what we deferred, why, and what it will
cost to fix later. That single document changes the conversation. Debt stops
being a vague feeling and becomes a list of items with estimates, so we can
prioritise it against features honestly.

## Pay down what blocks the roadmap

Not all debt deserves repayment. The dead code in a module nobody touches can
sit there forever. The brittle auth layer that every new feature has to route
around is a different story — that one we fix first, because it taxes everything
downstream.

The discipline is simple to state and hard to practice: refactor the parts of the
system you are about to build on, leave the rest alone, and never let the ledger
go quiet.`,
    author: authors.rohan,
    publishedAt: '2024-03-05',
    tags: ['technical-debt', 'maintainability', 'engineering-management'],
    relatedSlugs: ['scaling-without-the-rewrite'],
    seo: seo(
      'the-real-cost-of-technical-debt',
      'The Real Cost of Technical Debt',
      'Technical debt is a loan with interest. Here is how we make it visible, decide which debt to carry, and pay down what blocks the roadmap.',
    ),
  },
  {
    slug: 'designing-apis-that-last',
    title: 'Designing APIs That Last',
    category: 'engineering',
    excerpt:
      'An API is a promise to everyone who builds against it. We design that promise to survive years of change without breaking the people who trusted it.',
    cover: cover('designing-apis-that-last', 'Code editor showing a clean API contract'),
    content: `## An API is a contract

Once a client writes code against your endpoint, you no longer own that endpoint
alone. You share it. Every breaking change you ship becomes their emergency. The
goal of good API design is to keep that contract stable while the system behind
it keeps evolving.

## Model the domain, not the database

The fastest way to paint yourself into a corner is to expose your tables
directly. The database schema is an implementation detail that will change. The
API should speak the language of the domain — orders, invoices, shipments —
so that you can rework storage underneath without rewriting every client.

## Design for change from day one

Durable APIs assume they will change and make room for it:

- Version at the boundary so old clients keep working.
- Add fields; never repurpose or remove them silently.
- Return explicit, typed errors instead of overloading status codes.
- Paginate every collection, even the ones that seem small today.

These habits cost almost nothing up front and save you from migrations that
ripple across every consumer later.

## Make the easy thing the correct thing

The best API guides callers toward correct usage. Sensible defaults, required
fields that are genuinely required, and names that mean what they say all reduce
the number of ways a client can hold it wrong. Documentation helps, but a
well-shaped contract teaches itself.

We treat the first version of an API as the hardest to change, so we slow down
and get the nouns right. Everything after that is addition, not apology.`,
    author: authors.aanya,
    publishedAt: '2024-04-18',
    tags: ['api-design', 'architecture', 'backend'],
    seo: seo(
      'designing-apis-that-last',
      'Designing APIs That Last',
      'An API is a contract with everyone who builds against it. How we design that contract to survive years of change without breaking consumers.',
    ),
  },
  {
    slug: 'devops-automation-that-pays-off',
    title: 'DevOps Automation That Actually Pays Off',
    category: 'engineering',
    excerpt:
      'Automation is not about replacing people. It is about deleting the repetitive, error-prone steps that quietly drain a team and cause outages.',
    cover: cover(
      'devops-automation-that-pays-off',
      'A continuous integration pipeline visualised as connected stages',
    ),
    content: `## Automate the steps that hurt

Not every manual step is worth automating. The ones that are share a profile:
they happen often, they are easy to get wrong, and a mistake is expensive. Deploys,
database migrations, and environment setup all qualify. A one-off script you run
twice a year usually does not.

## A pipeline you can trust

Continuous integration only helps if the team believes its result. A flaky
pipeline is worse than none, because people learn to ignore red builds. We invest
early in fast, deterministic tests so that green means green and red means stop.

From there the pipeline earns its keep:

- Every commit builds, tests, and produces a deployable artifact.
- The same artifact promotes from staging to production unchanged.
- Infrastructure is described in code and reviewed like any other change.

## Make the safe path the default path

When the easy way to deploy is also the safe way, people take it. We wire safety
into the pipeline itself — automated checks, gradual rollouts, automatic
rollback on error spikes — so that doing the right thing requires no extra
discipline at the moment of stress.

## Automation is documentation

A script that provisions an environment is the most honest documentation you can
have, because it has to be correct or it fails. When the knowledge of how to run
a system lives in code rather than in someone's memory, the team stops being
hostage to whoever happens to be on holiday.

The payoff is not flashy. It is a quieter on-call rotation, fewer self-inflicted
outages, and engineers spending their hours on problems worth solving.`,
    author: authors.rohan,
    publishedAt: '2024-05-22',
    tags: ['devops', 'ci-cd', 'automation', 'infrastructure'],
    relatedSlugs: ['engineering-for-99-8-uptime'],
    seo: seo(
      'devops-automation-that-pays-off',
      'DevOps Automation That Actually Pays Off',
      'Automation is about deleting the repetitive, error-prone steps that drain teams and cause outages. How we choose what to automate and why.',
    ),
  },
  {
    slug: 'monitoring-that-actually-matters',
    title: 'Monitoring That Actually Matters',
    category: 'engineering',
    excerpt:
      'A wall of green dashboards feels reassuring and tells you almost nothing. Good monitoring answers one question: are users having a good time right now?',
    cover: cover(
      'monitoring-that-actually-matters',
      'A focused dashboard showing latency and error-rate graphs',
    ),
    content: `## Dashboards are not observability

It is easy to confuse the number of graphs with the quality of insight. A screen
full of CPU charts looks serious and rarely helps when something breaks. Real
observability means you can answer questions you did not anticipate, after the
fact, using the data you already collect.

## Alert on symptoms, not causes

Machines run hot all the time without anyone noticing. Users noticing is the
event that matters. We point our paging alerts at user-facing symptoms:

- Error rate climbing past its normal band.
- Latency at the 95th and 99th percentile, not the average.
- Key flows — sign-up, checkout, search — failing more than usual.

Cause-level metrics like memory and queue depth are still worth recording. They
just belong on the debugging dashboard, not on the pager.

## The three signals worth keeping

We lean on logs, metrics, and traces, each doing a job the others cannot. Metrics
tell you something is wrong. Traces tell you where in the request it went wrong.
Logs tell you exactly what happened at that point. Together they turn a 2 a.m.
mystery into a ten-minute investigation.

## Tune the noise out

An alert that fires when nothing is wrong trains people to ignore alerts. We
treat every false page as a bug and fix the threshold or the check that caused
it. The goal is a pager that stays silent until it genuinely needs a human, so
that when it does ring, everyone takes it seriously.

Good monitoring is quiet most of the time. That quiet is the product working.`,
    author: authors.aanya,
    publishedAt: '2024-07-09',
    tags: ['observability', 'monitoring', 'sre', 'reliability'],
    relatedSlugs: ['engineering-for-99-8-uptime'],
    seo: seo(
      'monitoring-that-actually-matters',
      'Monitoring That Actually Matters',
      'Good monitoring answers one question: are users having a good time right now? How we alert on symptoms and keep the pager honest.',
    ),
  },
  {
    slug: 'scaling-without-the-rewrite',
    title: 'Scaling Without the Big Rewrite',
    category: 'process',
    excerpt:
      'The rewrite is the most expensive bet in software. Most systems can grow ten times without one, if you find the real bottleneck first.',
    cover: cover(
      'scaling-without-the-rewrite',
      'A growth chart climbing steadily beside a system diagram',
    ),
    content: `## The rewrite is rarely the answer

When a system strains under growth, the loudest suggestion in the room is usually
to start over. It is also usually wrong. A rewrite freezes new features for
months, reintroduces bugs you already fixed, and bets the company on a system
that has never seen production. Sometimes it is necessary. Far more often, it is
avoidance dressed up as ambition.

## Find the one bottleneck

Systems do not slow down everywhere at once. They slow down at a specific seam —
a database query, a synchronous call, a lock. Before changing anything, we
measure under realistic load and let the data point at the constraint. Optimising
anything else is motion without progress.

## Scale the constraint, then re-measure

Once the bottleneck is clear, the fix is usually targeted and cheap relative to a
rewrite:

- Add an index or reshape the query that dominates the slow path.
- Move heavy work off the request path into a queue.
- Cache the expensive, rarely-changing result.
- Split the one table or service that everything funnels through.

Then we measure again, because relieving one constraint always reveals the next.
Scaling is a sequence of these moves, not a single grand redesign.

## Buy time the system needs

Each of these changes buys headroom while keeping the product shipping. That is
the whole point. Growth is a good problem, and a system that can grow in place —
without a year-long pause and a leap of faith — is worth far more than a
beautiful rewrite that never quite lands.`,
    author: authors.rohan,
    publishedAt: '2024-08-14',
    tags: ['scaling', 'performance', 'architecture', 'process'],
    relatedSlugs: ['the-real-cost-of-technical-debt'],
    seo: seo(
      'scaling-without-the-rewrite',
      'Scaling Without the Big Rewrite',
      'The rewrite is the most expensive bet in software. How to grow a system ten times by finding the real bottleneck first.',
    ),
  },
  {
    slug: 'a-design-system-that-scales',
    title: 'A Design System That Scales With the Team',
    category: 'design',
    excerpt:
      'A design system is not a sticker sheet of components. It is the shared language that keeps a product coherent as more hands touch it.',
    cover: cover(
      'a-design-system-that-scales',
      'A grid of UI components and design tokens laid out neatly',
    ),
    content: `## A system, not a sticker sheet

A folder of buttons is not a design system. A design system is the set of shared
decisions — spacing, type, colour, motion — encoded so that every screen the
team builds feels like part of the same product. The components are just where
those decisions become visible.

## Tokens are the single source of truth

Underneath every good system sits a small set of tokens: the spacing scale, the
type ramp, the colour roles, the motion timings. When those values live in one
place and flow into both code and design tools, a change to the brand is one edit
rather than a thousand. Consistency stops being a matter of vigilance and becomes
the path of least resistance.

## Accessibility belongs in the primitives

The cheapest place to get accessibility right is the component library. If the
button, the input, and the dialog handle focus, contrast, and labelling
correctly, every screen built from them inherits that for free. We bake WCAG
contrast and 44-pixel touch targets into the primitives so product teams cannot
accidentally ship an inaccessible screen.

## Let the system evolve

A design system that never changes is a fossil. Real products grow new needs, and
the system has to absorb them without fragmenting. We treat it like any other
codebase: versioned, documented, and open to proposals. A new pattern earns its
place by being used in three real screens before it becomes canon.

The payoff is speed with coherence. Designers and engineers stop relitigating the
same small decisions and spend their attention on the problems that are actually
unique to the product in front of them.`,
    author: authors.meera,
    publishedAt: '2024-09-30',
    updatedAt: '2024-11-11',
    tags: ['design-systems', 'design', 'accessibility', 'frontend'],
    seo: seo(
      'a-design-system-that-scales',
      'A Design System That Scales With the Team',
      'A design system is the shared language that keeps a product coherent as more hands touch it. How tokens, accessible primitives, and versioning make it last.',
    ),
  },
  {
    slug: 'building-products-that-work-forever',
    title: 'What We Mean by "Products That Work Forever"',
    category: 'company',
    excerpt:
      'Our promise is not that software never changes. It is that the products we build keep working for the people who depend on them, year after year.',
    cover: cover(
      'building-products-that-work-forever',
      'The Ryze studio team reviewing work at a shared desk',
    ),
    content: `## The promise behind the tagline

"We build products that work forever" is a bold thing to put on a wall. We do not
mean software is frozen in amber or never needs maintenance. We mean the products
we ship keep doing their job for the people who rely on them, long after the
launch announcement scrolls off the feed.

## Boring is a feature

A lot of our craft looks unglamorous from the outside. We choose proven tools
over novel ones. We write the tests. We document the system so it does not live
in one person's head. None of this trends on social media, and all of it is why a
client can stop thinking about their software and get back to running their
business.

## We build to hand over

A product that only its original authors can maintain is fragile by design. From
the first week we build as if someone else will own it next year, because often
they will. Clear structure, honest documentation, and automated deploys mean a
handover is a calm event, not a crisis.

## Working forever is a relationship

Software that lasts is not a single heroic act of construction. It is a steady
relationship — small, safe changes; quick responses when something breaks; and
an honest conversation about what to fix next. That is the work we have
organised the whole studio around, and it is the reason clients stay with us for
years rather than projects.

If you are building something you intend to depend on for a long time, that is
exactly the kind of work we are here for.`,
    author: authors.rohan,
    publishedAt: '2024-12-02',
    tags: ['company', 'culture', 'craft', 'maintainability'],
    featured: true,
    seo: seo(
      'building-products-that-work-forever',
      'What We Mean by "Products That Work Forever"',
      'Our promise is not that software never changes. It is that the products we build keep working for the people who depend on them, year after year.',
    ),
  },
];

/**
 * Published blog posts, ordered newest-first is not assumed here — input order
 * is preserved so filtering/pagination helpers stay deterministic. Each post's
 * `readingTimeMinutes` is computed from its content to stay in sync.
 */
export const blogPosts: BlogPost[] = rawPosts.map((post) => ({
  ...post,
  readingTimeMinutes: computeReadingTime(post.content),
}));
