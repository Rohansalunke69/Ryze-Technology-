# Requirements Document

## Introduction

This document defines the requirements for the Ryze Technology marketing website (v2), an award-caliber, multi-page front-end for a full-stack tech studio based in Nagpur. The site presents the brand promise "We build products that work forever" through scroll-driven storytelling, a signature WebGL hero, and a disciplined performance and accessibility budget. It is a static React + Vite + TypeScript Single Page Application with build-time prerendering, no dashboards, and no pricing. These requirements are derived from the approved design document and are written so that every correctness property (P1–P37) defined in the design maps to at least one acceptance criterion.

The requirements cover global navigation and shell, all thirteen route families, the capability-gated WebGL hero, motion and storytelling effects, the contact form, content filtering/pagination/related-entity logic, pure logic helpers (reading time, meta normalization, slug resolution, pagination, index wrapping, viewport mapping, breadcrumb building), the design system, motion accessibility fallbacks, WCAG 2.1 AA accessibility, the performance budget, SEO/metadata, technology-stack constraints, and error handling.

## Glossary

- **Site**: The complete Ryze Technology website application (the deployed static SPA).
- **App_Shell**: The always-loaded layer owning global providers, Navigation, Footer, and CustomCursor.
- **Navigation**: The sticky global header component rendering nav items, dropdowns, the Contact CTA, and the mobile menu.
- **Mobile_Menu**: The full-screen overlay navigation shown on small viewports via the hamburger control.
- **Footer**: The shared global footer component.
- **Breadcrumb**: The component rendering the hierarchical trail on sub-pages.
- **Route_Announcer**: The `aria-live="polite"` region that announces page changes to assistive technology.
- **Router**: The react-router-dom data router and its route table.
- **Page_Module**: A lazily-loaded, code-split page chunk (e.g., HomePage, CaseStudyPage).
- **PageTransition**: The wrapper that animates route enter/exit, scrolls to top, and manages focus and the Route_Announcer.
- **Hero**: The homepage hero component that decides between WebGL and fallback rendering.
- **Hero_WebGL**: The lazily-imported R3F (react-three-fiber) animated particle-to-lattice scene.
- **Hero_Fallback**: The static poster/CSS hero rendered when WebGL is gated off.
- **Capability_Gate**: The `canRenderWebGL()` decision logic determining whether Hero_WebGL may mount.
- **Reduced_Motion_Provider**: The provider exposing the user's `prefers-reduced-motion` preference via `useReducedMotion()`.
- **SmoothScroll_Provider**: The provider that wires Lenis smooth scrolling to the GSAP ticker and ScrollTrigger.
- **Lenis**: The smooth-scroll engine.
- **CustomCursor**: The custom cyan dot-and-ring cursor component.
- **AnimationWrapper**: The declarative reveal wrapper using IntersectionObserver.
- **SplitText**: The component splitting text into accessible per-word/line/char spans for staggered reveal.
- **MagneticButton**: The pointer-follow interactive button/link primitive.
- **AnimatedCounter**: The component that counts a numeric value up when scrolled into view.
- **MarqueeText**: The horizontally scrolling text row component.
- **Lightbox**: The accessible image dialog with index navigation and wrapping.
- **Contact_Form**: The contact form on `/contact` (name, email, company, project type, budget, timeline, message).
- **Form_Endpoint**: The externally hosted, env-configured POST target for Contact_Form submissions.
- **Case_Study**: A portfolio project entity (`CaseStudy` data model).
- **Service**: A service entity (`Service` data model), keyed by ServiceKey.
- **Blog_Post**: A blog article entity (`BlogPost` data model).
- **Team_Member**: A team profile entity (`TeamMember` data model).
- **Testimonial**: A client testimonial entity (`Testimonial` data model).
- **Data_Layer**: The typed static data modules (caseStudies, services, team, blogPosts, testimonials, navigation, siteMetadata).
- **Slug**: A kebab-case identifier unique within its collection.
- **ServiceKey**: One of `websites`, `mobile-apps`, `desktop`, `business-systems`.
- **PortfolioCategory**: One of `websites`, `mobile`, `systems`.
- **BlogCategory**: One of `engineering`, `design`, `process`, `company`.
- **SEOHead**: The per-route component setting title, description, canonical, and Open Graph metadata.
- **Reading_Time_Function**: `computeReadingTime(content, wordsPerMinute?)`.
- **Meta_Normalizer**: `normalizeMetaDescription(input, maxLen?)`.
- **Slug_Resolver**: `resolveBySlug(items, slug)`.
- **Pagination_Function**: `paginate(items, page, perPage)`.
- **WrapIndex_Function**: `wrapIndex(index, length)`.
- **Viewport_Function**: `viewportCategory(width)`.
- **Breadcrumb_Builder**: `buildBreadcrumbTrail(pathname, labelMap)`.
- **Filter_Function**: `filterCaseStudies` / `filterPostsByCategory`.
- **Related_Function**: `getRelatedCaseStudies` / `getRelatedPosts`.
- **Easing_Function**: A pure easing function (easeOutExpo, easeInOutQuint, easeOutBack).
- **Reduced_Motion**: The active state where `prefers-reduced-motion: reduce` is true.
- **Error_Boundary**: The React error boundary wrapping the Router and per-route Suspense.

## Requirements

### Requirement 1: Global Navigation Header

**User Story:** As a visitor, I want a persistent navigation header with grouped links and a clear contact action, so that I can move between sections of the Site from anywhere.

#### Acceptance Criteria

1. THE Navigation SHALL render as a sticky header that remains accessible while the visitor scrolls the page.
2. THE Navigation SHALL render the nav items defined in the Data_Layer, including dropdown parents for Work, Services, and About.
3. WHEN a visitor hovers or focuses a dropdown parent nav item, THE Navigation SHALL display that item's child links.
4. THE Navigation SHALL render the Contact nav item as a MagneticButton call-to-action linking to `/contact`.
5. WHERE `transparentUntilScroll` is enabled, THE Navigation SHALL render with a transparent background until the visitor scrolls past the page top, then SHALL render with a solid background.
6. THE Navigation SHALL provide an `aria-label` on each navigation region.

### Requirement 2: Mobile Navigation Menu

**User Story:** As a visitor on a small screen, I want a hamburger menu that opens a full-screen navigation overlay, so that I can navigate on mobile devices.

#### Acceptance Criteria

1. WHILE the viewport category is mobile, THE Navigation SHALL render a hamburger control in place of the inline nav links.
2. WHEN a visitor activates the hamburger control, THE Navigation SHALL open the Mobile_Menu overlay.
3. WHILE the Mobile_Menu is open, THE Navigation SHALL trap keyboard focus within the Mobile_Menu.
4. WHEN a visitor presses Escape WHILE the Mobile_Menu is open, THE Navigation SHALL close the Mobile_Menu.
5. WHEN the Mobile_Menu closes, THE Navigation SHALL restore focus to the control that opened it.
6. WHEN a visitor selects a link in the Mobile_Menu, THE Navigation SHALL navigate to the link target and close the Mobile_Menu.

### Requirement 3: Breadcrumbs on Sub-Pages

**User Story:** As a visitor on a sub-page, I want a breadcrumb trail, so that I understand my location and can navigate up the hierarchy.

#### Acceptance Criteria

1. WHEN the Site renders a sub-page, THE Breadcrumb SHALL display a trail that starts at Home and follows the current path order.
2. THE Breadcrumb_Builder SHALL produce a trail whose segments appear in path order and whose item count equals the number of meaningful path segments plus one.
3. THE Breadcrumb_Builder SHALL omit a navigation path only on the last item of the trail.
4. THE Breadcrumb_Builder SHALL map each path segment to a human-readable label using the provided label map.

### Requirement 4: Global Footer

**User Story:** As a visitor, I want a consistent footer, so that I can reach key links, social profiles, and contact details from any page.

#### Acceptance Criteria

1. THE Footer SHALL render on every page of the Site.
2. THE Footer SHALL render site links, social links, and the contact email sourced from the Data_Layer site metadata.

### Requirement 5: Routing and Code-Splitting

**User Story:** As a visitor, I want every page to load as its own lightweight chunk, so that pages render quickly and the initial download stays small.

#### Acceptance Criteria

1. THE Router SHALL serve the routes `/`, `/portfolio`, `/portfolio/:slug`, `/services`, `/services/:slug`, `/about`, `/manifesto`, `/contact`, `/blog`, `/blog/:slug`, `/resources`, `/privacy`, `/terms`, `/cookies`, and a catch-all `*` route.
2. THE Router SHALL load each Page_Module as a lazily-imported, code-split chunk wrapped in a Suspense boundary with a branded skeleton.
3. WHEN a visitor hovers or focuses a navigation link, THE Site SHALL prefetch the chunk for that link's route.
4. THE Site SHALL split heavy optional dependencies (R3F/Three and page-specific GSAP timelines) below the route boundary so that page content can render before its spectacle loads.

### Requirement 6: Homepage

**User Story:** As a prospective client, I want a homepage that tells the Ryze story, so that I understand the studio's philosophy and offerings.

#### Acceptance Criteria

1. THE HomePage SHALL render, in order, the Hero, Problems, Philosophy, Portfolio-preview, Services, Why-Us, Team, CTA, and Footer sections.
2. THE HomePage Portfolio-preview section SHALL display the Case_Study entities marked `featured`.
3. THE HomePage Why-Us section SHALL render metric rows using AnimatedCounter components.
4. THE HomePage CTA section SHALL render a MagneticButton linking to `/contact`.

### Requirement 7: Portfolio Listing

**User Story:** As a prospective client, I want to browse and filter portfolio projects, so that I can find work relevant to my needs.

#### Acceptance Criteria

1. THE PortfolioListPage SHALL render a grid of CaseStudyCard components for the Case_Study collection.
2. THE PortfolioListPage SHALL render a filter bar with the options All, Websites, Mobile, and Systems.
3. WHEN a visitor selects a filter category, THE PortfolioListPage SHALL display only the Case_Study entities matching that category.
4. WHEN a visitor selects the All filter, THE PortfolioListPage SHALL display every Case_Study entity.
5. THE PortfolioListPage SHALL preserve the relative order of the Case_Study collection when applying any filter.

### Requirement 8: Case Study Detail

**User Story:** As a prospective client, I want a detailed case study page, so that I can understand the challenge, solution, results, and related work.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/portfolio/:slug` for an existing Slug, THE CaseStudyPage SHALL render the resolved Case_Study, including its Breadcrumb, hero, challenge, solution, results, gallery, testimonial, technical breakdown, learnings, and related projects.
2. THE CaseStudyPage results section SHALL render each Metric using an AnimatedCounter.
3. THE CaseStudyPage SHALL render a related-projects section computed by the Related_Function.
4. IF the Slug in `/portfolio/:slug` resolves to no Case_Study, THEN THE CaseStudyPage SHALL render the in-route not-found state with related suggestions.

### Requirement 9: Services Overview

**User Story:** As a prospective client, I want a services overview, so that I can see what Ryze offers and how they work.

#### Acceptance Criteria

1. THE ServicesPage SHALL render the four Service entities (Websites, Mobile, Desktop, Systems/Automation) as service cards.
2. THE ServicesPage SHALL render a numbered process-steps section and a support/maintenance band.
3. THE ServicesPage SHALL render a CTA section.

### Requirement 10: Service Detail

**User Story:** As a prospective client, I want a detailed page per service, so that I can evaluate a specific offering.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/services/:slug` for an existing ServiceKey, THE ServiceDetailPage SHALL render the resolved Service, including its Breadcrumb, hero, what-we-do, features, related case studies, tech stack, process timeline, and FAQ.
2. THE ServiceDetailPage SHALL render related case studies computed by `getCaseStudiesByService` for the current ServiceKey.
3. THE ServiceDetailPage SHALL render the FAQ as an accessible accordion.
4. IF the Slug in `/services/:slug` resolves to no Service, THEN THE ServiceDetailPage SHALL render the in-route not-found state.

### Requirement 11: About Page

**User Story:** As a visitor, I want an about page, so that I can learn about the studio's story, team, and track record.

#### Acceptance Criteria

1. THE AboutPage SHALL render the story, mission, team profiles, differentiators, by-the-numbers, testimonials, and CTA sections.
2. THE AboutPage team profiles section SHALL render a TeamCard for each Team_Member with social links.
3. THE AboutPage by-the-numbers section SHALL render metrics using AnimatedCounter components.

### Requirement 12: Manifesto Page

**User Story:** As a visitor, I want a manifesto page, so that I can understand what the studio believes and stands against.

#### Acceptance Criteria

1. THE ManifestoPage SHALL render the hero, core-beliefs sequence, what-we-stand-against band, the Ryze promise, and CTA sections.
2. WHERE motion is allowed, THE ManifestoPage SHALL present the core beliefs as a pinned sequential reveal.

### Requirement 13: Contact Page and Form

**User Story:** As a prospective client, I want a contact form with validation and clear submission feedback, so that I can reach Ryze with my project details.

#### Acceptance Criteria

1. THE ContactPage SHALL render the Contact_Form with fields for name, email, company, project type, budget, timeline, and message.
2. WHEN a visitor submits the Contact_Form with invalid data, THE Contact_Form SHALL block submission, render inline field errors, set `aria-invalid` on invalid fields, and move focus to a focusable error summary.
3. WHEN a visitor submits the Contact_Form with valid data, THE Contact_Form SHALL enter the submitting state and POST the form data to the Form_Endpoint.
4. WHEN the Form_Endpoint returns a 2xx response, THE Contact_Form SHALL enter the success state, clear the form, and announce success via a polite live region.
5. IF the submission to the Form_Endpoint fails, returns a non-2xx response, or times out, THEN THE Contact_Form SHALL enter the error state, preserve the entered values, present a retry control, and announce the failure via a live region.
6. THE Contact_Form SHALL represent its status as exactly one of idle, submitting, success, or error at any time.

### Requirement 14: Blog Listing with Filtering and Pagination

**User Story:** As a reader, I want to browse, filter, and page through blog posts, so that I can find articles of interest.

#### Acceptance Criteria

1. THE BlogListPage SHALL render a grid of BlogCard components, each showing image, category, title, excerpt, date, and reading time.
2. THE BlogListPage SHALL render a category filter for the BlogCategory values plus an All option.
3. WHEN a visitor selects a category filter, THE BlogListPage SHALL display only the Blog_Post entities matching that category, preserving input order, and SHALL display all Blog_Post entities when All is selected.
4. THE BlogListPage SHALL paginate the filtered Blog_Post entities using the Pagination_Function.
5. WHEN a visitor changes the page, THE BlogListPage SHALL render the items for that page and enable the previous/next controls according to the page's `hasPrev` and `hasNext` flags.

### Requirement 15: Blog Post Detail

**User Story:** As a reader, I want a readable blog post page, so that I can consume an article and discover related content.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog/:slug` for an existing Slug, THE BlogPostPage SHALL render the resolved Blog_Post, including its Breadcrumb, hero with title/category/date/reading-time/author, table of contents, content, author bio, related posts, and share buttons.
2. THE BlogPostPage SHALL constrain prose content to a maximum measure of 68 characters per line.
3. THE BlogPostPage SHALL render related posts computed by `getRelatedPosts`.
4. IF the Slug in `/blog/:slug` resolves to no Blog_Post, THEN THE BlogPostPage SHALL render the in-route not-found state with related suggestions.

### Requirement 16: Resources Page

**User Story:** As a visitor, I want a resources page, so that I can access downloadable materials.

#### Acceptance Criteria

1. WHERE the resources feature is enabled, THE ResourcesPage SHALL render a grid of downloadable resource cards with file metadata and download links.

### Requirement 17: Legal Pages

**User Story:** As a visitor, I want privacy, terms, and cookies pages, so that I can read the studio's policies.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/privacy`, `/terms`, or `/cookies`, THE LegalPage SHALL render the corresponding long-form content with a Breadcrumb, an auto-generated table of contents, and a last-updated label.

### Requirement 18: Custom 404 Page

**User Story:** As a visitor who reaches a non-existent URL, I want a helpful 404 page, so that I can recover and find what I need.

#### Acceptance Criteria

1. WHEN a visitor navigates to a URL that matches no defined route, THE Router SHALL render the NotFoundPage.
2. THE NotFoundPage SHALL render quick links to top routes and a home/back action.
3. THE NotFoundPage SHALL set its page metadata to `noIndex`.

### Requirement 19: WebGL Hero with Capability Gating and Fallback

**User Story:** As a visitor, I want a striking hero that still works on any device, so that the experience is impressive but never broken.

#### Acceptance Criteria

1. THE Hero SHALL render the Hero_Fallback before any WebGL scene is ready.
2. IF Reduced_Motion is active, THEN THE Hero SHALL render only the Hero_Fallback and SHALL NOT mount a WebGL canvas.
3. IF a WebGL2 context is unavailable, THEN THE Hero SHALL render only the Hero_Fallback.
4. IF the Capability_Gate score is below threshold (fewer than 4 cores, less than 4 GB memory, or save-data enabled), THEN THE Hero SHALL render only the Hero_Fallback.
5. WHEN Reduced_Motion is inactive, a WebGL2 context is available, and the Capability_Gate passes, THE Hero SHALL lazily import and mount Hero_WebGL behind an IntersectionObserver.
6. WHEN Hero_WebGL becomes ready, THE Hero SHALL cross-fade from the Hero_Fallback to the animated scene.
7. WHILE the hero is scrolled out of view or the tab is hidden, THE Hero SHALL pause the Hero_WebGL render loop.

### Requirement 20: Scroll-Driven Storytelling and Smooth Scroll

**User Story:** As a visitor, I want fluid scroll-driven animation, so that the story unfolds as I move through a page.

#### Acceptance Criteria

1. WHERE motion is allowed, THE SmoothScroll_Provider SHALL instantiate Lenis and advance it from a single GSAP ticker loop.
2. THE SmoothScroll_Provider SHALL drive ScrollTrigger updates from Lenis scroll events using a single RAF source.
3. WHEN a route change occurs, THE App_Shell SHALL refresh ScrollTrigger after the new page mounts and scroll to the top.
4. WHEN a Page_Module unmounts, THE Site SHALL kill that page's ScrollTrigger instances and timelines.
5. WHERE motion is allowed, THE Site SHALL render at most one heavy "hero moment" of motion per page.

### Requirement 21: Animated Counters

**User Story:** As a visitor, I want metrics to count up as I reach them, so that achievements feel dynamic.

#### Acceptance Criteria

1. WHEN an AnimatedCounter scrolls into view AND motion is allowed, THE AnimatedCounter SHALL animate from its starting value to its target value.
2. THE AnimatedCounter SHALL land exactly on its target value, rendered with the configured number of decimal places, prefix, and suffix.
3. WHILE animating, THE AnimatedCounter SHALL never display a value outside the range between its start value and its target value.

### Requirement 22: Custom Cursor

**User Story:** As a visitor using a pointer device, I want an expressive custom cursor, so that interactive elements feel responsive.

#### Acceptance Criteria

1. WHERE the pointer is fine AND motion is allowed, THE CustomCursor SHALL mount and hide the native cursor.
2. WHEN the pointer is over an element marked `[data-cursor="link"]`, THE CustomCursor SHALL present its hover-link state.
3. WHEN the pointer is over a MagneticButton, THE CustomCursor SHALL present its magnetic state.
4. WHEN the pointer is over an element marked `[data-cursor="view"]`, THE CustomCursor SHALL present a labeled view state.
5. IF the device is touch-only OR Reduced_Motion is active OR the pointer leaves the window, THEN THE CustomCursor SHALL unmount and restore the native cursor.

### Requirement 23: Magnetic Buttons

**User Story:** As a visitor, I want primary actions to react to my pointer, so that key calls-to-action feel tactile.

#### Acceptance Criteria

1. WHERE motion is allowed, WHEN the pointer moves near a MagneticButton, THE MagneticButton SHALL translate toward the pointer scaled by its strength factor.
2. IF Reduced_Motion is active, THEN THE MagneticButton SHALL apply only CSS hover styling and SHALL NOT apply any JavaScript pointer transform.

### Requirement 24: Marquee

**User Story:** As a visitor, I want moving text rows where appropriate, so that the page feels alive without being distracting.

#### Acceptance Criteria

1. WHERE motion is allowed, THE MarqueeText SHALL continuously translate its items in the configured direction at the configured speed.
2. WHERE `pauseOnHover` is enabled, WHEN the pointer is over the MarqueeText, THE MarqueeText SHALL pause its motion.
3. IF auto-motion would run longer than 5 seconds, THEN THE MarqueeText SHALL provide a pause mechanism.

### Requirement 25: Text Split Reveals and Image Reveals

**User Story:** As a visitor, I want headlines and media to reveal elegantly, so that the page feels crafted.

#### Acceptance Criteria

1. WHERE motion is allowed, WHEN a SplitText element enters the viewport, THE SplitText SHALL reveal its words or lines with a staggered transition.
2. THE SplitText SHALL expose the original text as a single accessible name via `aria-label` on the wrapper and mark decorative spans `aria-hidden`.
3. WHERE motion is allowed, WHEN media enters the viewport, THE Site SHALL reveal the media with a clip-path wipe.
4. THE Site SHALL apply per-line, per-word, or per-character split reveals only to display and section-opener text, never to body prose.

### Requirement 26: Page Transitions

**User Story:** As a visitor, I want smooth transitions between pages, so that navigation feels continuous.

#### Acceptance Criteria

1. WHERE motion is allowed, WHEN a route change occurs, THE PageTransition SHALL animate the exit of the old page and the entrance of the new page.
2. WHEN a route change occurs, THE PageTransition SHALL scroll to the top of the new page regardless of motion preference.

### Requirement 27: Reading-Time Computation

**User Story:** As a reader, I want an accurate reading-time estimate on posts, so that I can gauge the time commitment.

#### Acceptance Criteria

1. WHEN content is non-empty, THE Reading_Time_Function SHALL return a value of at least 1 minute.
2. FOR ANY two contents where the first has no more words than the second, THE Reading_Time_Function SHALL return a value for the first that is not greater than the value for the second.
3. WHEN runs of whitespace in the content are collapsed, THE Reading_Time_Function SHALL return the same value as for the original content.
4. WHEN the word count is doubled at the same words-per-minute rate, THE Reading_Time_Function SHALL return approximately double the minutes, within rounding.

### Requirement 28: Meta-Description Normalization

**User Story:** As a content owner, I want meta descriptions normalized to a safe length, so that search and social previews render cleanly.

#### Acceptance Criteria

1. FOR ANY input, THE Meta_Normalizer SHALL return a string whose length does not exceed the maximum length (default 160).
2. THE Meta_Normalizer SHALL be idempotent, such that normalizing an already-normalized string returns the same string.
3. WHEN the input has a word boundary before the maximum length, THE Meta_Normalizer SHALL NOT end the output (excluding any ellipsis) on a partial word.
4. WHEN the trimmed input length is within the maximum length, THE Meta_Normalizer SHALL return the trimmed input unchanged without adding an ellipsis.

### Requirement 29: Slug Resolution and Data Integrity

**User Story:** As a visitor following a link, I want detail pages to resolve reliably and unknown links to fail safely, so that I always reach a valid page or a clear 404.

#### Acceptance Criteria

1. FOR ANY entity in a collection with unique slugs, THE Slug_Resolver SHALL return that exact entity when given its Slug.
2. IF a Slug is not present in the collection, THEN THE Slug_Resolver SHALL return undefined without throwing and without returning a different entity.
3. THE Data_Layer SHALL ensure that the slugs within each shipped collection are unique.
4. THE Data_Layer SHALL ensure that each Service's process step indices are contiguous from 1 to n and strictly increasing.

### Requirement 30: Portfolio and Blog Filtering Logic

**User Story:** As a developer, I want filtering to be correct and predictable, so that category views always show exactly the right content.

#### Acceptance Criteria

1. FOR ANY category, THE Filter_Function SHALL return a result that is a subset of the input items.
2. WHEN a concrete category (not All) is applied, THE Filter_Function SHALL return exactly the items whose category equals the selected category and no others.
3. WHEN the All category is applied, THE Filter_Function SHALL return exactly the same elements as the input.
4. THE Filter_Function SHALL preserve the relative order of the input items.
5. THE Filter_Function SHALL partition the items such that the union of results over all concrete categories equals the full set of items, with each item appearing in exactly its category.

### Requirement 31: Related Entities Logic

**User Story:** As a visitor, I want relevant related content suggestions, so that I can continue exploring.

#### Acceptance Criteria

1. THE Related_Function SHALL never include the current entity in its result and SHALL return at most the requested limit of items.
2. WHEN at least one candidate shares a service or category with the current entity, THE Related_Function SHALL return only entities that share at least one service or category with the current entity.

### Requirement 32: Pagination Logic

**User Story:** As a reader, I want pagination that never loses or duplicates content, so that I can reach every item exactly once.

#### Acceptance Criteria

1. FOR ANY requested page and `perPage` of at least 1, THE Pagination_Function SHALL return a `page` value clamped to the range 1 to `totalPages`.
2. THE Pagination_Function SHALL ensure that concatenating the items of pages 1 through `totalPages` reproduces the input items in order with no duplicates or omissions.
3. THE Pagination_Function SHALL return exactly `perPage` items on every page except possibly the last, which SHALL contain between 1 and `perPage` items.
4. THE Pagination_Function SHALL set `hasPrev` to true exactly when `page` is greater than 1 and `hasNext` to true exactly when `page` is less than `totalPages`.
5. THE Pagination_Function SHALL compute `totalPages` as the maximum of 1 and the ceiling of `total` divided by `perPage`.

### Requirement 33: Lightbox and Index Wrapping

**User Story:** As a visitor, I want to view gallery images in a navigable lightbox that wraps around, so that I can browse media smoothly.

#### Acceptance Criteria

1. WHEN a visitor opens a non-empty gallery image, THE Lightbox SHALL open as a labeled `role="dialog"` with keyboard navigation and focus management.
2. FOR ANY length of at least 1 and any integer index, THE WrapIndex_Function SHALL return a value in the range 0 to length minus 1.
3. THE WrapIndex_Function SHALL map the index equal to length to 0 and the index of -1 to length minus 1.
4. FOR ANY index already within the range 0 to length minus 1, THE WrapIndex_Function SHALL return that index unchanged.
5. IF the gallery image array is empty or an index is out of bounds with no valid wrap, THEN THE Lightbox SHALL refuse to open as a no-op.

### Requirement 34: Easing and Interpolation Helpers

**User Story:** As a developer, I want correct easing and interpolation primitives, so that all motion and counters behave predictably.

#### Acceptance Criteria

1. FOR EACH non-overshoot Easing_Function in {easeOutExpo, easeInOutQuint}, THE Easing_Function SHALL return approximately 0 at input 0 and approximately 1 at input 1.
2. FOR ANY two inputs t1 less than t2 in the range 0 to 1, THE easeOutExpo Easing_Function SHALL return a value for t1 that is not greater than the value for t2.
3. FOR ANY value and bounds where min is at most max, THE `clamp` function SHALL return a value within the range min to max, and SHALL return the value unchanged when it already lies within the range.
4. FOR ANY a and b, THE `lerp` function SHALL return a at t equal to 0 and b at t equal to 1, and FOR ANY t in the range 0 to 1 SHALL return a value within the range from min(a,b) to max(a,b).
5. FOR ANY valid ranges, THE `mapRange` function SHALL be invertible such that mapping a value and mapping the result back yields approximately the original value within epsilon.
6. FOR ANY progress in the range 0 to 1, THE `interpolateCounter` function SHALL return a value between `from` and `to` rounded to exactly the configured decimals, returning `from` when progress is at most 0 and `to` when progress is at least 1.

### Requirement 35: Viewport Category Mapping

**User Story:** As a developer, I want a single, consistent viewport classification, so that responsive layout never flickers at breakpoint edges.

#### Acceptance Criteria

1. FOR ANY width of at least 0, THE Viewport_Function SHALL return exactly one of the defined categories: mobile, tablet, desktop, or wide.
2. THE Viewport_Function SHALL order categories by width with no overlap or gap, such that increasing width never maps to a smaller category.

### Requirement 36: Design System Adherence

**User Story:** As a brand stakeholder, I want consistent visual design tokens, so that the Site looks cohesive and meets contrast standards.

#### Acceptance Criteria

1. THE Site SHALL source color, typography, spacing, and motion tokens from CSS custom properties in `:root` mirrored into the Tailwind configuration.
2. THE Site SHALL render text and interactive color pairings that meet WCAG AA contrast against their backgrounds.
3. THE Site SHALL render every interactive target at a minimum hit area of 44 by 44 pixels.
4. THE Site SHALL apply the fluid typography scale using `clamp()` for display, heading, and body text.

### Requirement 37: Reduced-Motion Fallbacks

**User Story:** As a visitor who prefers reduced motion, I want a fully usable static experience, so that the Site respects my preference.

#### Acceptance Criteria

1. THE Reduced_Motion_Provider SHALL expose the current `prefers-reduced-motion` preference and update reactively when the preference changes mid-session.
2. WHILE Reduced_Motion is active, THE Site SHALL render every animated effect in its end state, including fully visible split text, final counter values, neutral parallax positions, and statically revealed media.
3. WHILE Reduced_Motion is active, THE Site SHALL NOT instantiate Lenis, mount the CustomCursor, or mount a WebGL canvas, and SHALL use native scrolling.
4. WHILE Reduced_Motion is active, WHEN a route change occurs, THE PageTransition SHALL perform an instant cross-fade of at most 120 milliseconds or none, while still scrolling to top and managing focus.

### Requirement 38: Accessibility (WCAG 2.1 AA)

**User Story:** As a visitor using assistive technology or a keyboard, I want full access to all content and controls, so that I can use the Site independently.

#### Acceptance Criteria

1. THE Site SHALL render semantic landmark regions (`header`, `nav`, `main`, `footer`) and exactly one `h1` per page with an ordered heading hierarchy.
2. THE Site SHALL make every interactive element reachable and operable by keyboard with a visible focus indicator that is never removed, and SHALL provide a skip-to-content link.
3. WHEN a route change occurs, THE PageTransition SHALL move focus to the new page's `h1` or main wrapper and announce the new page via the Route_Announcer.
4. WHILE the Mobile_Menu or Lightbox is open, THE Site SHALL trap focus within the overlay and restore focus to the triggering element on close.
5. THE Site SHALL provide meaningful `alt` text for informative images and `alt=""` for decorative images, and SHALL mark purely decorative canvas or video as `aria-hidden`.
6. THE Contact_Form SHALL associate each field with a programmatic label and SHALL link error messages via `aria-describedby` and `aria-invalid`.

### Requirement 39: Performance Budget

**User Story:** As a visitor on a mid-tier mobile device, I want the Site to load fast and stay stable, so that the experience is smooth despite the rich visuals.

#### Acceptance Criteria

1. THE Site SHALL keep the initial route JavaScript bundle at or below 180 KB gzip and SHALL NOT include `three` or `@react-three/fiber` in the entry chunk.
2. THE Site SHALL render the hero headline as HTML/CSS text as the LCP element, targeting LCP of at most 2.5 seconds on mid-tier mobile over throttled 4G.
3. THE Site SHALL reserve aspect-ratio boxes for all media and use non-shifting font loading to keep CLS at or below 0.02.
4. THE Site SHALL keep animation work off the main interaction path and RAF-batched to keep INP at or below 200 milliseconds.
5. THE Site SHALL serve below-fold media lazily with responsive `srcset`, modern formats (AVIF/WebP with fallback), and explicit dimensions.
6. THE content pages SHALL achieve a Lighthouse Performance score of at least 95, and the homepage with deferred WebGL SHALL achieve a Lighthouse Performance score of at least 85.

### Requirement 40: SEO and Metadata

**User Story:** As a marketer, I want correct per-page metadata and crawlable pages, so that the Site ranks and shares well.

#### Acceptance Criteria

1. THE SEOHead SHALL set the page title using the title template, plus the description, canonical URL, and Open Graph metadata for each route.
2. THE Site SHALL normalize each meta description via the Meta_Normalizer before output.
3. THE Site SHALL generate `sitemap.xml` and `robots.txt` at build time from the route table and typed data slugs.
4. THE Site SHALL prerender static routes and `:slug` routes at build time from the typed Data_Layer for crawlers.
5. THE NotFoundPage and any `noIndex` page SHALL emit metadata instructing crawlers not to index the page.

### Requirement 41: Technology Stack and Deployment Constraints

**User Story:** As an operator, I want a static, secret-free deployment, so that hosting is cheap, fast, and secure.

#### Acceptance Criteria

1. THE Site SHALL be produced as a static Vite build deployable to static hosting with an SPA fallback to `index.html`.
2. THE Site SHALL hold no secrets and SHALL read the Form_Endpoint URL from an injected environment configuration.
3. THE Site SHALL self-host variable fonts as preloaded `woff2` with fallback metric overrides.

### Requirement 42: Error Handling and Resilience

**User Story:** As a visitor, I want the Site to degrade gracefully when something fails, so that one error never breaks my whole experience.

#### Acceptance Criteria

1. THE Error_Boundary SHALL wrap the Router, and a per-route boundary SHALL wrap each Suspense, so that one failed chunk does not blank the whole application.
2. IF a lazy chunk import fails, THEN THE per-route boundary SHALL render an error state with a retry control that re-imports the chunk.
3. IF an image fails to load, THEN THE Site SHALL swap to the `blurDataURL` or a solid token placeholder while retaining the reserved aspect-ratio box.
4. IF the Hero_WebGL context is lost, THEN THE Hero SHALL pause the loop, dispose the scene, and swap to the Hero_Fallback, attempting a single re-initialization on context restore.
5. IF Lenis initialization fails, THEN THE Site SHALL fall back to native scrolling with ScrollTrigger using the default scroller while remaining fully functional.
6. IF the Data_Layer contains duplicate slugs or non-contiguous process steps, THEN the dev-time assertions and CI property checks SHALL fail the build.
