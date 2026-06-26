# Implementation Plan: Ryze Technology Website

## Overview

This plan converts the approved design into incremental, dependency-ordered coding tasks. The implementation language is **TypeScript** (React 18 + Vite), as fixed by the design — no pseudocode was used, so no language selection is required.

The plan builds outward from the foundation: tooling and tokens first, then the pure logic layer with property-based tests for all 37 correctness properties, then typed data, providers/hooks, animation utilities and primitives, shared UI, the capability-gated WebGL hero, the router/app shell, every page, and finally the cross-cutting accessibility/SEO/performance gates. Each task builds on prior tasks so there is no orphaned code; the router and app shell wire everything together near the end.

Test sub-tasks are marked optional with `*`. Every task references the specific requirement clauses it satisfies. Property-based test tasks are annotated with their property number(s) and the requirement clause(s) they validate, and must run at a minimum of 100 iterations.

## Tasks

- [x] 1. Project foundation and design system tokens
  - [x] 1.1 Scaffold Vite + React + TypeScript project with strict config and aliases
    - Initialize Vite React-TS app; install `react`, `react-dom`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`
    - Enable strict `tsconfig` (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes) and configure path aliases (`@/`, `@components`, `@lib`, `@data`, `@hooks`, `@app-types` — avoid the reserved `@types` alias)
    - Configure Vite to resolve the same aliases; set up the base directory structure (`src/lib`, `src/data`, `src/hooks`, `src/components`, `src/providers`, `src/pages`, `src/app-types`)
    - _Requirements: 41.1_

  - [x] 1.2 Define design tokens as CSS custom properties mirrored into Tailwind
    - Author `:root` CSS custom properties for the "Engineered Permanence" system: ink/mist/pulse/ember/lime color tokens, fluid type scale (`clamp()` for display/heading/body), 8px spacing scale + section rhythm, 12-column grid tokens, and motion/easing tokens (ease-out-expo, ease-in-out-quint, ease-out-back, durations, stagger)
    - Mirror identical values into `tailwind.config.ts` so utilities and JS animation read one source of truth
    - _Requirements: 36.1, 36.4_

  - [x] 1.3 Self-host variable fonts with preload and fallback metrics
    - Add self-hosted `woff2` variable fonts (display grotesk, sans, mono); declare `@font-face` with `font-display: swap` and fallback metric overrides (size-adjust/ascent) to prevent CLS
    - Add `<link rel="preload">` for the critical variable fonts in the document head
    - _Requirements: 41.3, 39.3_

  - [x] 1.4 Implement global styles and grain material overlay
    - Author global stylesheet: base `ink` material background, film-grain noise overlay (~4% opacity) + faint vignette, focus-ring style (`--pulse-500`, 2px offset, never removed), prose `max-width: 68ch`, and the optional exposed blueprint grid overlay utility
    - Wire global styles into the app entry
    - _Requirements: 36.1, 36.2, 38.2, 15.2_

- [x] 2. Test tooling and CI guardrails
  - [x] 2.1 Configure Vitest + jsdom + RTL + jest-axe + fast-check
    - Install and configure `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `jest-axe`, `fast-check`
    - Add a test setup file (jest-dom matchers, jest-axe matcher, a `matchMedia` mock helper for reduced-motion tests) and seed fast-check for reproducible CI runs
    - _Requirements: 38.1, 38.2, 37.2_

  - [x] 2.2 Add Lighthouse CI configuration
    - Add `@lhci/cli` config asserting per-route thresholds (content pages Perf ≥ 95, homepage with deferred WebGL ≥ 85, A11y/Best-Practices/SEO ≥ 95) against the static build
    - _Requirements: 39.6_

  - [x] 2.3 Add bundle-budget guardrail check
    - Add a build-analysis script that fails CI if the initial route JS exceeds 180 KB gzip or if `three`/`@react-three/fiber` appears in the entry chunk
    - _Requirements: 39.1, 5.4_

- [x] 3. Shared TypeScript types and data models
  - [x] 3.1 Define shared domain types and data-model interfaces
    - In `src/app-types`, declare `Slug`, `ISODate`, `ServiceKey`, `PortfolioCategory`, `BlogCategory`, `ImageAsset`, `SEOMeta`, `Metric`, `CaseStudy`, `ProcessStep`, `FAQItem`, `Service`, `SocialLink`, `TeamMember`, `BlogAuthor`, `BlogPost`, `Testimonial`, `NavChild`, `NavItem`, `SiteMetadata`, `ViewportCategory`, `EasingFn`, `PageResult<T>`
    - _Requirements: 29.1, 29.3, 40.1_

- [x] 4. Pure logic layer with property-based tests
  - [x] 4.1 Implement easing and interpolation helpers
    - Implement `easeOutExpo`, `easeInOutQuint`, `easeOutBack`, `clamp`, `lerp` (t clamped to [0,1]), `mapRange` (optional clampOut), and `interpolateCounter(from, to, progress, easing, decimals)`
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 21.2_

  - [x]* 4.2 Write property tests for easing and interpolation
    - **Property 1: Easing endpoints** (`// Feature: ryze-technology-website, Property 1`) — Validates Requirement 34.1
    - **Property 2: Easing monotonicity (non-overshoot fns)** — Validates Requirement 34.2
    - **Property 3: clamp bounds** — Validates Requirement 34.3
    - **Property 4: lerp endpoints & bounds** — Validates Requirement 34.4
    - **Property 5: mapRange invertibility** — Validates Requirement 34.5
    - **Property 6: interpolateCounter clamping & rounding** — Validates Requirements 34.6, 21.2
    - Minimum 100 iterations per property
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 21.2_

  - [x] 4.3 Implement computeReadingTime
    - `computeReadingTime(content, wordsPerMinute = 225)`: word count via whitespace tokenization, ceil to minutes, minimum 1
    - _Requirements: 27.1, 27.2, 27.3, 27.4_

  - [x]* 4.4 Write property tests for reading time
    - **Property 7: Positivity** (`// Feature: ryze-technology-website, Property 7`) — Validates Requirement 27.1
    - **Property 8: Monotonic in length** — Validates Requirement 27.2
    - **Property 9: Whitespace invariance** — Validates Requirement 27.3
    - **Property 10: Scaling** — Validates Requirement 27.4
    - Minimum 100 iterations per property
    - _Requirements: 27.1, 27.2, 27.3, 27.4_

  - [x] 4.5 Implement normalizeMetaDescription
    - `normalizeMetaDescription(input, maxLen = 160)`: trim, return unchanged when within bound, otherwise cut at last word boundary before maxLen and append ellipsis without exceeding maxLen
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 40.2_

  - [x]* 4.6 Write property tests for meta-description normalization
    - **Property 11: Length bound** (`// Feature: ryze-technology-website, Property 11`) — Validates Requirement 28.1
    - **Property 12: Idempotence** — Validates Requirement 28.2
    - **Property 13: No mid-word cut** — Validates Requirement 28.3
    - **Property 14: Preservation when short** — Validates Requirement 28.4
    - Minimum 100 iterations per property
    - _Requirements: 28.1, 28.2, 28.3, 28.4_

  - [x] 4.7 Implement resolveBySlug and uniqueSlugs
    - `resolveBySlug<T extends {slug:string}>(items, slug)` returns the exact entity or `undefined` without throwing; `uniqueSlugs(items)` invariant check
    - _Requirements: 29.1, 29.2, 29.3_

  - [x]* 4.8 Write property tests for slug resolution
    - **Property 15: Round-trip resolution** (`// Feature: ryze-technology-website, Property 15`) — Validates Requirement 29.1
    - **Property 16: Unknown slug** — Validates Requirement 29.2
    - **Property 17: Slug uniqueness invariant** (generated input) — Validates Requirement 29.3
    - Minimum 100 iterations per property
    - _Requirements: 29.1, 29.2, 29.3_

  - [x] 4.9 Implement filtering helpers
    - `filterCaseStudies(items, category|'all')`, `filterPostsByCategory(posts, category|'all')`, `getCaseStudiesByService(items, service)` — order-preserving, subset, `'all'` identity
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 7.5, 14.3, 10.2_

  - [x]* 4.10 Write property tests for filtering
    - **Property 19: Subset** (`// Feature: ryze-technology-website, Property 19`) — Validates Requirement 30.1
    - **Property 20: Predicate soundness** — Validates Requirement 30.2
    - **Property 21: 'all' identity (as set)** — Validates Requirement 30.3
    - **Property 22: Order stability** — Validates Requirements 30.4, 7.5
    - **Property 23: Partition completeness** — Validates Requirement 30.5
    - **Property 24: Blog filter parity** (P19–P23 for `filterPostsByCategory`) — Validates Requirement 14.3
    - Minimum 100 iterations per property
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 7.5, 14.3_

  - [x] 4.11 Implement related-entity helpers
    - `getRelatedCaseStudies(all, current, limit)` and `getRelatedPosts(all, current, limit)` — exclude self, respect limit, prefer shared service/category, honor explicit `relatedSlugs` overrides
    - _Requirements: 31.1, 31.2, 8.3, 15.3_

  - [x]* 4.12 Write property tests for related entities
    - **Property 25: Related excludes self & respects limit** (`// Feature: ryze-technology-website, Property 25`) — Validates Requirement 31.1
    - **Property 26: Related relevance** — Validates Requirement 31.2
    - Minimum 100 iterations per property
    - _Requirements: 31.1, 31.2_

  - [x] 4.13 Implement paginate
    - `paginate<T>(items, page, perPage)` returning `{ items, page, totalPages, hasPrev, hasNext, total }` with page clamped to [1, totalPages]
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 14.4, 14.5_

  - [x]* 4.14 Write property tests for pagination
    - **Property 27: Page bounds** (`// Feature: ryze-technology-website, Property 27`) — Validates Requirement 32.1
    - **Property 28: Coverage / no loss** — Validates Requirement 32.2
    - **Property 29: Page size** — Validates Requirement 32.3
    - **Property 30: Flag correctness** — Validates Requirement 32.4
    - **Property 31: totalPages formula** — Validates Requirement 32.5
    - Minimum 100 iterations per property
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5_

  - [x] 4.15 Implement wrapIndex
    - `wrapIndex(index, length)` mapping any integer index into [0, length-1] with wrap continuity
    - _Requirements: 33.2, 33.3, 33.4_

  - [x]* 4.16 Write property tests for index wrapping
    - **Property 32: In-range** (`// Feature: ryze-technology-website, Property 32`) — Validates Requirement 33.2
    - **Property 33: Wrap continuity** — Validates Requirement 33.3
    - **Property 34: Identity in range** — Validates Requirement 33.4
    - Minimum 100 iterations per property
    - _Requirements: 33.2, 33.3, 33.4_

  - [x] 4.17 Implement viewportCategory
    - `viewportCategory(width)` total, deterministic mapping to `mobile | tablet | desktop | wide` with ordered, non-overlapping boundaries
    - _Requirements: 35.1, 35.2_

  - [x]* 4.18 Write property tests for viewport category
    - **Property 35: Totality & determinism** (`// Feature: ryze-technology-website, Property 35`) — Validates Requirement 35.1
    - **Property 36: Monotonic boundaries** — Validates Requirement 35.2
    - Minimum 100 iterations per property
    - _Requirements: 35.1, 35.2_

  - [x] 4.19 Implement buildBreadcrumbTrail
    - `buildBreadcrumbTrail(pathname, labelMap)` producing a Home-anchored, path-ordered trail where only the last item omits `path`, mapping segments via the label map
    - _Requirements: 3.2, 3.3, 3.4_

  - [x]* 4.20 Write property tests for breadcrumb building
    - **Property 37: Trail consistency** (`// Feature: ryze-technology-website, Property 37`) — Validates Requirements 3.2, 3.3
    - Minimum 100 iterations
    - _Requirements: 3.2, 3.3_

- [x] 5. Checkpoint - pure logic layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Typed static content and data modules
  - [x] 6.1 Author case studies and services data modules
    - Create `caseStudies.ts` and `services.ts` with realistic placeholder content conforming to the types; ensure unique slugs and contiguous 1..n process-step indices per service
    - _Requirements: 29.3, 29.4, 7.1, 9.1, 8.1, 10.1_

  - [x] 6.2 Author team and testimonials data modules
    - Create `team.ts` (members with social links, order) and `testimonials.ts` (linked to case studies via `caseStudySlug`)
    - _Requirements: 11.2, 8.1_

  - [x] 6.3 Author blog posts data module
    - Create `blogPosts.ts` with categories, excerpts, authors, content, and `readingTimeMinutes` precomputed via `computeReadingTime`; unique slugs
    - _Requirements: 14.1, 15.1, 29.3_

  - [x] 6.4 Author navigation and site metadata modules
    - Create `navigation.ts` (Work/Services/About dropdown parents + Contact CTA item) and `siteMetadata.ts` (titleTemplate, baseUrl, default OG, social, contactEmail, env-injected `contactEndpoint`)
    - _Requirements: 1.2, 4.2, 13.3, 40.1, 41.2_

  - [x]* 6.5 Write data-integrity tests against real shipped data + dev assertions
    - **Property 17: Slug uniqueness invariant** run against every real collection (`// Feature: ryze-technology-website, Property 17`) — Validates Requirements 29.3, 42.6
    - **Property 18: Process-step contiguity** run against real services data — Validates Requirements 29.4, 42.6
    - Add dev-time assertions that throw on duplicate slugs / non-contiguous process steps
    - Minimum 100 iterations for generated-input portions
    - _Requirements: 29.3, 29.4, 42.6_

- [x] 7. Global providers and hooks
  - [x] 7.1 Implement ReducedMotionProvider and useReducedMotion
    - Read `matchMedia('(prefers-reduced-motion: reduce)')`, expose via context, update reactively on mid-session preference change
    - _Requirements: 37.1_

  - [x] 7.2 Implement useViewportCategory and useInView
    - `useViewportCategory` reads width through `viewportCategory`; `useInView` wraps IntersectionObserver with threshold/rootMargin/once
    - _Requirements: 35.1, 2.1, 21.1, 25.1_

  - [x] 7.3 Implement SmoothScrollProvider and useLenis
    - Instantiate Lenis only when motion is allowed; advance it from a single `gsap.ticker` loop; wire `ScrollTrigger.scrollerProxy` and drive `ScrollTrigger.update` from Lenis scroll events; under reduced motion skip Lenis and use native scroll; catch Lenis init failure and fall back to native scroll
    - _Requirements: 20.1, 20.2, 37.3, 42.5_

  - [x] 7.4 Implement useCounter
    - Tween numeric value with easing + clamping; return target instantly under reduced motion; never emit a value outside [from, target]
    - _Requirements: 21.1, 21.2, 21.3, 37.2_

  - [x] 7.5 Implement useScrollAnimation and useMagnetic
    - `useScrollAnimation` registers a `gsap.context()`-scoped timeline/ScrollTrigger and auto-kills on unmount; `useMagnetic` returns pointer-follow motion values, no-op under reduced motion
    - _Requirements: 20.4, 23.1, 23.2_

  - [x] 7.6 Implement ErrorBoundary
    - Top-level error boundary plus a reusable per-route boundary that renders an error state with a retry control that re-imports the failed chunk
    - _Requirements: 42.1, 42.2_

  - [x] 7.7 Implement SEOHead
    - Per-route `react-helmet-async` component setting title via template, normalized description (via `normalizeMetaDescription`), canonical, Open Graph, and `noIndex` support
    - _Requirements: 40.1, 40.2, 18.3, 40.5_

  - [x] 7.8 Implement PageTransition
    - Animate route enter/exit (Framer Motion); always scroll to top; move focus to new page `h1`/main wrapper; announce via `aria-live="polite"` Route_Announcer; under reduced motion perform instant cross-fade ≤ 120ms
    - _Requirements: 26.1, 26.2, 37.4, 38.3, 20.3_

  - [x]* 7.9 Write tests for providers and hooks
    - Reduced-motion: assert no Lenis instantiation, useCounter returns final value immediately, provider updates on preference change
    - useInView/useViewportCategory behavior with mocked observers/matchMedia
    - _Requirements: 37.1, 37.2, 37.3, 21.3_

- [x] 8. Checkpoint - providers and hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Animation utilities and motion primitives
  - [x] 9.1 Implement imperative animation utilities
    - `revealOnScroll`, `pinSection`, `parallaxLayer`, `applySplit`, `hoverDistort` — all branch on reduced motion (resolve to end-state / neutral position) and return cleanup handles
    - _Requirements: 20.5, 25.1, 25.3, 25.4, 37.2_

  - [x] 9.2 Implement AnimationWrapper and SplitText
    - `AnimationWrapper` (rise/fade/clip/scale variants via IntersectionObserver, instant-visible under reduced motion); `SplitText` (word/line/char spans with `aria-label` on wrapper and `aria-hidden` decorative spans, applied only to display/section-opener text)
    - _Requirements: 25.1, 25.2, 25.4, 37.2_

  - [x] 9.3 Implement MagneticButton and AnimatedCounter
    - `MagneticButton` (pointer-follow transform scaled by strength; CSS-only hover under reduced motion; ≥44×44px target); `AnimatedCounter` (counts up on in-view via useCounter, lands exactly on target with decimals/prefix/suffix)
    - _Requirements: 23.1, 23.2, 21.1, 21.2, 21.3, 36.3_

  - [x] 9.4 Implement MarqueeText and Lightbox
    - `MarqueeText` (continuous translate, pauseOnHover, pause mechanism for >5s auto-motion, static under reduced motion); `Lightbox` (labeled `role="dialog"`, focus trap + restore, Esc close, index navigation via `wrapIndex`, no-op when gallery empty)
    - _Requirements: 24.1, 24.2, 24.3, 33.1, 33.5, 38.4_

  - [x]* 9.5 Write tests and a11y checks for primitives
    - RTL + jest-axe for SplitText accessible name, AnimatedCounter final value under reduced motion, MagneticButton no-transform under reduced motion, Lightbox keyboard/focus/wrap and empty no-op, Marquee pause
    - _Requirements: 25.2, 21.3, 23.2, 33.1, 33.5, 24.2_

- [x] 10. Shared UI components
  - [x] 10.1 Implement CustomCursor
    - Mount only on fine pointer + motion allowed; hide native cursor; states default/hover-link/magnetic/view/text; unmount and restore native cursor on touch-only, reduced motion, or pointer-leave
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [x] 10.2 Implement Navigation (sticky, dropdowns, mobile menu)
    - Sticky header rendering data-driven nav items with Work/Services/About dropdowns (hover/focus), Contact MagneticButton CTA, optional transparent-until-scroll, `aria-label` per region; mobile hamburger + full-screen Mobile_Menu with focus trap, Esc-to-close, focus restore, and close-on-navigate
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 38.4_

  - [x] 10.3 Implement Footer and Breadcrumb
    - `Footer` rendering site/social links and contact email from site metadata on every page; `Breadcrumb` rendering the trail from `buildBreadcrumbTrail`
    - _Requirements: 4.1, 4.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 10.4 Implement ScrollIndicator, SectionHeader, and CTA
    - `ScrollIndicator`, `SectionHeader` (eyebrow/title/align/as), and reusable `CTA` (heading + MagneticButton link)
    - _Requirements: 6.4, 9.3, 38.1_

  - [x] 10.5 Implement content cards
    - `CaseStudyCard`, `ServiceCard`, `TeamCard`, `BlogCard` (image, category, title, excerpt, date, reading time), `TestimonialCard`; reserved aspect-ratio media boxes; image `onError` swap to blurDataURL/placeholder
    - _Requirements: 7.1, 9.1, 11.2, 14.1, 8.1, 39.3, 42.3_

  - [x]* 10.6 Write tests and a11y checks for shared UI
    - jest-axe + RTL: Navigation dropdown keyboard access, Mobile_Menu focus trap/restore/Esc, Breadcrumb trail rendering, Footer content, card rendering and image error fallback
    - _Requirements: 1.3, 2.3, 2.4, 2.5, 3.1, 4.2, 42.3, 38.4_

- [x] 11. Capability-gated WebGL hero
  - [x] 11.1 Implement canRenderWebGL capability gate
    - `canRenderWebGL(opts)` checks WebGL2 availability, cores ≥ 4, memory ≥ 4 GB, and save-data disabled
    - _Requirements: 19.3, 19.4_

  - [x] 11.2 Implement HeroFallback and Hero decision component
    - `HeroFallback` (static poster/CSS mesh + CSS text reveal); `Hero` renders fallback first, and only when motion is allowed + WebGL2 available + gate passes, lazily imports and mounts Hero_WebGL behind an IntersectionObserver, cross-fading from fallback when ready
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [x] 11.3 Implement lazy Hero_WebGL R3F scene
    - R3F particle→lattice instanced scene (below-route lazy chunk, never in entry bundle), cap DPR at 2, pause render loop when offscreen or tab hidden, handle `webglcontextlost`/`webglcontextrestored` (pause, dispose, swap to fallback, single re-init attempt)
    - _Requirements: 19.5, 19.7, 42.4, 39.1, 5.4_

  - [x]* 11.4 Write tests for hero gating and fallback
    - Reduced motion → no canvas mounted; WebGL2 unavailable / gate fail → fallback only; cross-fade on ready; pause offscreen; context-loss swap to fallback
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.6, 19.7, 42.4_

- [x] 12. Checkpoint - primitives, shared UI, and hero
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Router and application shell
  - [ ] 13.1 Implement router with lazy routes, Suspense, and per-route error boundaries
    - Configure react-router-dom data router for `/`, `/portfolio`, `/portfolio/:slug`, `/services`, `/services/:slug`, `/about`, `/manifesto`, `/contact`, `/blog`, `/blog/:slug`, `/resources`, `/privacy`, `/terms`, `/cookies`, `*`; lazy-load each Page_Module wrapped in Suspense (branded skeleton) and a per-route error boundary
    - _Requirements: 5.1, 5.2, 18.1, 42.1, 42.2_

  - [ ] 13.2 Wire app shell, global providers, and route prefetch
    - Compose ReducedMotionProvider, SmoothScrollProvider, HelmetProvider, CustomCursor, Navigation, Footer, ErrorBoundary, and PageTransition around the router; refresh ScrollTrigger + scroll to top on route change; prefetch the next route chunk on nav-link hover/focus and via requestIdleCallback
    - _Requirements: 5.3, 5.4, 20.3, 26.2, 38.1_

- [ ] 14. Pages
  - [x] 14.1 Implement HomePage
    - Render in order: Hero, Problems, Philosophy, Portfolio-preview (featured case studies), Services (4 cards), Why-Us (AnimatedCounter metrics), Team, CTA (MagneticButton → /contact), Footer; one heavy hero moment, lighter reveals elsewhere; SEOHead
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 20.5, 40.1_

  - [ ]* 14.2 Write tests for HomePage
    - Section order, featured-only preview, counters present, CTA links to /contact; jest-axe single-h1/landmarks
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 38.1_

  - [x] 14.3 Implement PortfolioListPage
    - Title + count hero, filter bar (All/Websites/Mobile/Systems) with animated active indicator, grid of CaseStudyCard using `filterCaseStudies`, CTA; order preserved on filter
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 14.4 Write tests for PortfolioListPage
    - Filter selection updates grid to matching/all items, order preserved; jest-axe
    - _Requirements: 7.3, 7.4, 7.5, 38.1_

  - [x] 14.5 Implement CaseStudyPage
    - Resolve slug via `resolveBySlug`; render Breadcrumb, hero, challenge, solution, results (AnimatedCounter per Metric), gallery + Lightbox ("OPEN" cursor), testimonial, tech breakdown, learnings, related projects (`getRelatedCaseStudies`); in-route not-found state with related suggestions on unknown slug
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 14.6 Write tests for CaseStudyPage
    - Known slug renders sections + counters; lightbox open/keyboard/wrap; unknown slug → not-found with suggestions; jest-axe
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 33.1, 38.1_

  - [x] 14.7 Implement ServicesPage
    - Hero, four ServiceCards, numbered process-steps section (scrubbed timeline), support/maintenance band, CTA
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 14.8 Write tests for ServicesPage
    - Four services rendered, process steps + maintenance band + CTA present; jest-axe
    - _Requirements: 9.1, 9.2, 9.3, 38.1_

  - [x] 14.9 Implement ServiceDetailPage
    - Resolve ServiceKey; render Breadcrumb, hero, what-we-do, features grid, related case studies (`getCaseStudiesByService`), tech stack, process timeline, FAQ accessible accordion; in-route not-found on unknown slug
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 14.10 Write tests for ServiceDetailPage
    - Resolved service sections, related-by-service, FAQ accordion keyboard/ARIA, unknown slug → not-found; jest-axe
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 38.1_

  - [ ] 14.11 Implement AboutPage
    - Story, mission, team profiles (TeamCard per member with social links), differentiators, by-the-numbers (AnimatedCounter), testimonials (carousel/marquee), CTA
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 14.12 Write tests for AboutPage
    - All sections, TeamCard per member, counters present; jest-axe
    - _Requirements: 11.1, 11.2, 11.3, 38.1_

  - [ ] 14.13 Implement ManifestoPage
    - Hero, core-beliefs sequence (pinned sequential reveal where motion allowed, flowing end-state under reduced motion), what-we-stand-against band, the Ryze promise, CTA
    - _Requirements: 12.1, 12.2, 37.2_

  - [ ]* 14.14 Write tests for ManifestoPage
    - Sections render; reduced motion → beliefs visible without pinning; jest-axe
    - _Requirements: 12.1, 12.2, 37.2, 38.1_

  - [ ] 14.15 Implement ContactPage and Contact_Form
    - Fields (name, email, company, project type, budget, timeline, message) with inline validation; status union idle/submitting/success/error; invalid → block submit, inline errors, `aria-invalid`, focus error summary; valid → submitting + POST to env `contactEndpoint`; 2xx → success, clear form, polite announce; failure/non-2xx/timeout → error, preserve values, retry control, announce, mailto fallback
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 38.6_

  - [ ]* 14.16 Write tests for ContactPage and form
    - Invalid submit blocked with errors/aria/focus; valid submit POSTs (mocked); success clears + announces; error preserves values + retry; jest-axe label/aria-describedby associations
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 38.6_

  - [ ] 14.17 Implement BlogListPage
    - Hero, category filter (BlogCategory + All) using `filterPostsByCategory`, BlogCard grid, pagination via `paginate` with prev/next enabled per `hasPrev`/`hasNext`, CTA
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 14.18 Write tests for BlogListPage
    - Filter matches/all + order preserved, pagination items + prev/next flags; jest-axe
    - _Requirements: 14.3, 14.4, 14.5, 38.1_

  - [ ] 14.19 Implement BlogPostPage
    - Resolve slug; Breadcrumb, hero (title/category/date/reading-time/author), sticky TOC scroll-spy, prose constrained to 68ch, author bio, related posts (`getRelatedPosts`), share buttons; in-route not-found with suggestions on unknown slug
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 14.20 Write tests for BlogPostPage
    - Resolved post sections, 68ch measure, related posts, unknown slug → not-found; jest-axe
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 38.1_

  - [ ] 14.21 Implement ResourcesPage
    - When feature enabled, render grid of downloadable resource cards with file metadata and download links
    - _Requirements: 16.1_

  - [ ] 14.22 Implement LegalPage
    - Param-driven template for `/privacy`, `/terms`, `/cookies`: Breadcrumb, long-form content, auto-generated TOC, last-updated label
    - _Requirements: 17.1_

  - [ ] 14.23 Implement NotFoundPage
    - Oversized 404 with lazy interactive canvas (static under reduced motion), quick links to top routes, home/back action, `noIndex` metadata
    - _Requirements: 18.1, 18.2, 18.3, 40.5_

  - [ ]* 14.24 Write tests for Resources, Legal, and NotFound pages
    - Resources grid renders when enabled; legal pages render TOC + last-updated per param; 404 quick links + noIndex meta; jest-axe
    - _Requirements: 16.1, 17.1, 18.2, 18.3, 38.1_

- [ ] 15. Checkpoint - pages and routing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Cross-cutting: SEO, accessibility, and performance gates
  - [ ] 16.1 Implement SEO output, sitemap/robots, and prerender build step
    - Wire SEOHead across all routes with normalized descriptions; generate `sitemap.xml` and `robots.txt` at build from the route table + typed data slugs; add the build-time prerender step for static and `:slug` routes; emit `noIndex` where required
    - _Requirements: 40.1, 40.2, 40.3, 40.4, 40.5, 41.1_

  - [ ]* 16.2 Write accessibility test suite
    - jest-axe zero-violations per page, focus management on route change + Route_Announcer, focus trap/restore for Mobile_Menu and Lightbox, reduced-motion end-state rendering across pages, alt/aria-hidden coverage
    - _Requirements: 38.1, 38.2, 38.3, 38.4, 38.5, 38.6, 37.2, 37.3, 37.4_

  - [ ]* 16.3 Write responsive and contrast tests
    - Assert token color pairings meet WCAG AA contrast, interactive targets ≥ 44×44px, fluid type via clamp, and viewport-category-driven layout switches
    - _Requirements: 36.2, 36.3, 36.4, 35.1_

  - [ ]* 16.4 Write performance and bundle-budget smoke checks
    - Run bundle-budget assertion (initial ≤ 180 KB gzip, no three/R3F in entry chunk), reserved aspect-ratio/CLS checks, and Lighthouse CI smoke against the build
    - _Requirements: 39.1, 39.2, 39.3, 39.4, 39.5, 39.6, 5.4_

- [ ] 17. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- The implementation language is TypeScript (React 18 + Vite), fixed by the design.
- Property-based tests (P1–P37) target the pure logic layer only; each runs at a minimum of 100 iterations and is tagged `// Feature: ryze-technology-website, Property N`. Data invariants P17 and P18 additionally run against the real shipped data modules so bad content fails the build.
- Animation, WebGL, scroll feel, and visual polish are validated by example/integration/a11y/smoke tests, not PBT.
- Every task references specific requirement clauses for traceability; checkpoints provide incremental validation.
- The router and app shell (Epic 13) wire all prior components together; pages are built before wiring so there is no orphaned code.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "3.1"] },
    { "id": 2, "tasks": ["4.1", "4.3", "4.5", "4.7", "4.9", "4.11", "4.13", "4.15", "4.17", "4.19", "7.1", "7.6"] },
    { "id": 3, "tasks": ["4.2", "4.4", "4.6", "4.8", "4.10", "4.12", "4.14", "4.16", "4.18", "4.20", "6.1", "6.2", "6.3", "6.4", "7.2", "7.3", "7.7"] },
    { "id": 4, "tasks": ["6.5", "7.4", "7.5", "7.8"] },
    { "id": 5, "tasks": ["7.9", "9.1", "9.2", "9.3", "9.4"] },
    { "id": 6, "tasks": ["9.5", "10.1", "10.2", "10.3", "10.4", "11.1"] },
    { "id": 7, "tasks": ["10.5", "10.6", "11.2"] },
    { "id": 8, "tasks": ["11.3", "11.4", "14.1", "14.3", "14.5", "14.7", "14.9", "14.11", "14.13", "14.15", "14.17", "14.19", "14.21", "14.22", "14.23"] },
    { "id": 9, "tasks": ["13.1", "14.2", "14.4", "14.6", "14.8", "14.10", "14.12", "14.14", "14.16", "14.18", "14.20", "14.24"] },
    { "id": 10, "tasks": ["13.2", "16.1"] },
    { "id": 11, "tasks": ["16.2", "16.3", "16.4"] }
  ]
}
```
