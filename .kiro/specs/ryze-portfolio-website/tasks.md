# Implementation Plan: Ryze Portfolio Website

## Overview

This plan implements the Ryze Portfolio Website as a static Vite + React + TypeScript application styled with Tailwind CSS. Work proceeds from the foundation outward: project scaffolding first, then the pure logic layer (property-tested with `fast-check`), then typed static content modules and data models, then shared hooks, then the seven sections in the design's build order (Navigation → Hero → Featured Work → Services → Differentiators → Team → Contact CTA → Footer), and finally cross-cutting concerns (accessibility, performance, SEO/Open Graph metadata, animation) plus the verification suites (Vitest, RTL, jest-axe, fast-check, Lighthouse CI).

Each step builds on prior steps and ends by wiring new code into the app so there is no orphaned code. Property-based test tasks reference their design property using the format `// Feature: ryze-portfolio-website, Property N: ...`.

## Tasks

- [x] 1. Set up project foundation (Vite + React + TypeScript + Tailwind)
  - Scaffold a Vite React + TypeScript project with the standard `src/` layout (`src/components`, `src/content`, `src/logic`, `src/hooks`, `src/styles`, `src/types`)
  - Install and configure Tailwind CSS (PostCSS, `tailwind.config.ts`, base/components/utilities in the global stylesheet)
  - Define the design tokens in Tailwind config: dark navy background, cyan accent, body text color, mobile (767px) / tablet (1023px) breakpoints, and a 44px min tap-target spacing token
  - Configure TypeScript `strict` mode and path aliases for the layer folders
  - _Requirements: 10.1, 10.2, 10.3, 14.1, 14.2, 14.3_

- [x] 2. Set up the test and quality tooling
  - Install and configure Vitest with jsdom, React Testing Library, `@testing-library/jest-axe` (axe-core), and `fast-check`
  - Add a Vitest setup file registering jest-dom and jest-axe matchers
  - Add npm scripts for `test` (single run via `vitest --run`), `build`, and a placeholder `lighthouse` script
  - Add a Lighthouse CI config targeting the production build with thresholds performance >= 95, LCP <= 2.5s, CLS <= 0.1
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 3. Define shared TypeScript types
  - Create `src/types` with `ViewportCategory`, `ColumnCount`, `SectionId`, `NavLink`, and the content interfaces (`SiteMetadata`, `CaseStudy`/`CaseStudyMetric`/`CaseStudyImage`, `Service`/`ServiceCategory`, `Differentiator`/`DifferentiatorTitle`, `TeamMember`/`TeamMemberImage`/`TeamContent`, `ContactContent`, `FooterContent`, `ContactFormValues`, `FieldError`, `SubmitState`, `DesignTokens`)
  - Export the literal union types so content modules are validated at build time
  - _Requirements: 3.2, 4.2, 5.1, 14.3_

- [x] 4. Implement the pure logic layer
  - [x] 4.1 Implement viewport and layout selectors
    - Implement `selectViewportCategory(widthPx)`, `selectColumnCount(category)`, and `resolveViewportPrecedence(matches)` in `src/logic`
    - _Requirements: 2.7, 9.2, 9.3, 9.4, 9.5_

  - [x]* 4.2 Write property test for column count mapping
    - **Property 1: Column count maps correctly per viewport category**
    - `// Feature: ryze-portfolio-website, Property 1: selectColumnCount returns 1 for mobile, 2 for tablet, 4 for desktop and never any other value`
    - Generator: enum of `ViewportCategory`; minimum 100 iterations
    - **Validates: Requirements 2.7, 9.2, 9.3, 9.4**

  - [x]* 4.3 Write property test for viewport category partition
    - **Property 2: Viewport category partitions the width axis**
    - `// Feature: ryze-portfolio-website, Property 2: selectViewportCategory returns mobile when width < 768, tablet when 768 <= width < 1024, desktop when width >= 1024, monotonic across boundaries`
    - Generator: non-negative integers/floats spanning boundaries (0, 767, 768, 1023, 1024); minimum 100 iterations
    - **Validates: Requirements 9.5**

  - [x]* 4.4 Write property test for viewport precedence
    - **Property 3: Overlapping breakpoints resolve to the smallest matching category**
    - `// Feature: ryze-portfolio-website, Property 3: resolveViewportPrecedence returns the smallest category present under mobile < tablet < desktop`
    - Generator: non-empty subsets of the category set; minimum 100 iterations
    - **Validates: Requirements 9.5**

  - [x] 4.5 Implement scroll-behavior selector
    - Implement a pure `selectScrollBehavior(reducedMotion)` returning `'auto'` when reduced motion is active and `'smooth'` otherwise
    - _Requirements: 8.3, 8.4_

  - [x]* 4.6 Write property test for scroll behavior selection
    - **Property 4: Scroll behavior is smooth exactly when motion is allowed**
    - `// Feature: ryze-portfolio-website, Property 4: scroll behavior is 'smooth' iff reducedMotion is false, otherwise 'auto'`
    - Generator: booleans; minimum 100 iterations
    - **Validates: Requirements 8.3, 8.4**

  - [x] 4.7 Implement contact form validation logic
    - Implement `isSyntacticallyValidEmail(email)` and `validateContactForm(values)` returning one error per empty required field (name, message) and one email error when the email is non-empty but invalid, with no spurious errors
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x]* 4.8 Write property test for contact form validation
    - **Property 5: Contact form validation produces exactly the correct error set**
    - `// Feature: ryze-portfolio-website, Property 5: validateContactForm returns empty iff name and message non-empty after trim and email syntactically valid; otherwise exactly one error per empty field and one email error, no spurious errors`
    - Generator: records with arbitrary strings incl. empty/whitespace names/messages and valid/invalid emails; minimum 100 iterations
    - **Validates: Requirements 6.4, 6.5, 6.6**

  - [x] 4.9 Implement meta-description normalization and copyright year
    - Implement `normalizeMetaDescription(raw)` (max 160 chars, unchanged when already <= 160, idempotent) and `currentCopyrightYear(now)` in `src/logic`
    - _Requirements: 7.1, 15.2, 15.3_

  - [x]* 4.10 Write property test for meta description normalization
    - **Property 10: Meta description normalization bounds length, preserves short input, and is idempotent**
    - `// Feature: ryze-portfolio-website, Property 10: normalizeMetaDescription returns <= 160 chars, returns short input unchanged, and is idempotent`
    - Generator: arbitrary strings incl. lengths around 160, unicode, empty; minimum 100 iterations
    - **Validates: Requirements 15.3**

  - [x]* 4.11 Write property test for footer copyright year
    - **Property 11: Footer copyright year reflects the current year**
    - `// Feature: ryze-portfolio-website, Property 11: currentCopyrightYear returns the four-digit calendar year of the given Date`
    - Generator: arbitrary `Date` values across years; minimum 100 iterations
    - **Validates: Requirements 7.1**

- [x] 5. Checkpoint - logic layer verified
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Author typed static content modules
  - [x] 6.1 Create site metadata, hero, and navigation content
    - Author `content/site.ts` (title containing "Ryze Technology", description >= 50 chars run through `normalizeMetaDescription`, canonical URL, Open Graph fields), hero content (fixed headline/subheadline/visual kind/CTA), and the six-entry nav links
    - _Requirements: 1.1, 1.2, 8.1, 15.1, 15.2, 15.4, 15.5_

  - [x] 6.2 Create portfolio, services, differentiators, team, contact, and footer content
    - Author at least two case studies (name, industry, >= 1 metric, image model, detail URL), exactly four services with the named categories, exactly four differentiators with the named titles, exactly four team members plus an optional 30–120 word story, contact content (form or schedule mode), and footer content (company name, six nav anchors, >= 1 external contact)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.3, 6.1, 6.2, 7.1, 7.2, 7.3_

  - [x]* 6.3 Write unit tests for content invariants
    - Assert exactly-four invariants and presence of named categories/differentiators, >= 2 case studies, footer six anchors and >= 1 external contact, authored team-story word count 30–120 and authored description >= 50 chars
    - _Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.3, 7.2, 7.3, 15.2_

- [x] 7. Implement shared hooks and motion context
  - [x] 7.1 Implement motion, viewport, entrance, and scroll hooks
    - Implement `useReducedMotion()` (wraps `prefers-reduced-motion: reduce`), `MotionProvider` context, `useViewportCategory()` (delegates to `selectViewportCategory`), `useSectionEntrance(ref)` (IntersectionObserver gated by reduced motion), and `smoothScrollToSection(id, reducedMotion)` (delegates to `selectScrollBehavior`)
    - _Requirements: 1.8, 2.6, 3.5, 8.3, 8.4, 11.1, 11.2_

  - [x]* 7.2 Write unit tests for hooks
    - Test reduced-motion boolean, viewport category transitions at boundaries, entrance trigger, and scroll behavior selection wiring
    - _Requirements: 8.3, 8.4, 11.1, 11.2_

- [x] 8. Implement the shared Image component with next-gen formats and fallback chain
  - [x] 8.1 Build the `ResponsiveImage` component
    - Render a `<picture>` with AVIF and WebP sources and a fallback `<img>` carrying explicit width/height and required `alt`; apply `loading="lazy"` for non-hero images; implement the onError fallback chain (photo → initials placeholder → reserved aspect-ratio space)
    - _Requirements: 5.5, 5.6, 12.3, 12.4, 12.5, 13.3_

  - [x]* 8.2 Write property test for image rendering
    - **Property 9: Image rendering provides next-gen formats, a fallback, and alt text**
    - `// Feature: ryze-portfolio-website, Property 9: rendered <picture> contains an AVIF source, a WebP source, and a fallback <img> with a defined alt attribute`
    - Generator: arbitrary image model; minimum 100 iterations
    - **Validates: Requirements 12.5, 13.3**

  - [x]* 8.3 Write unit tests for image fallback chain
    - Test photo failure → initials placeholder and double failure → reserved layout space
    - _Requirements: 5.5, 5.6_

- [x] 9. Implement Navigation (DesktopNav + MobileMenu)
  - [x] 9.1 Build the Navigation component
    - Render a `<nav>` landmark visible at the top on tablet/desktop; provide a toggleable mobile menu control on mobile; render anchor links that call `smoothScrollToSection`; ensure 44px min tap targets
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 9.6, 13.4_

  - [x]* 9.2 Write unit and a11y tests for Navigation
    - Test desktop/tablet visibility, mobile menu toggle, smooth vs auto scroll under reduced motion, and nav landmark/focus order via axe
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 13.1, 13.2, 13.4_

- [x] 10. Implement Hero section
  - [x] 10.1 Build the HeroSection and HeroVisual
    - Render fixed headline/subheadline, exactly one primary visual (motion-aware via `useReducedMotion`), and exactly one Primary CTA; wire CTA to scroll to portfolio ("See our work") or contact ("Let's talk"); fill >= 90% viewport height on desktop; render static visual under reduced motion
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x]* 10.2 Write unit tests for Hero
    - Test headline/subheadline/visual/CTA content, CTA scroll targets, and reduced-motion static render
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_

- [x] 11. Implement Featured Work / Portfolio section
  - [x] 11.1 Build CaseStudyCard and PortfolioSection
    - Render >= 2 case study cards each showing name, industry, >= 1 metric, and preview image; activation navigates to `detailUrl`; placeholder cards when no case studies; single-column on mobile via `selectColumnCount`; hover scale + detail reveal on desktop, static reveal under reduced motion
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x]* 11.2 Write property test for case study card rendering
    - **Property 6: Case study card renders all required fields and links to its destination**
    - `// Feature: ryze-portfolio-website, Property 6: rendered Case_Study_Card contains project name, industry, >= 1 metric, preview image with defined alt, and an activation target whose href equals detailUrl`
    - Generator: arbitrary `CaseStudy`; minimum 100 iterations
    - **Validates: Requirements 2.2, 2.5**

  - [x]* 11.3 Write edge-case tests for portfolio
    - Test empty-portfolio placeholder rendering and reduced-motion detail reveal
    - _Requirements: 2.3, 2.6_

- [x] 12. Implement Services section
  - [x] 12.1 Build ServiceCard and ServicesSection
    - Render exactly four service cards (icon, category title, single-sentence description); responsive columns 1/2/4 via `selectColumnCount`; hover animation on desktop, non-motion hover state under reduced motion
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.2, 9.3, 9.4_

  - [x]* 12.2 Write property test for service card rendering
    - **Property 7: Service card renders all required fields**
    - `// Feature: ryze-portfolio-website, Property 7: rendered Service_Card contains an icon, the category title, and the single-sentence description`
    - Generator: arbitrary `Service`; minimum 100 iterations
    - **Validates: Requirements 3.3**

  - [x]* 12.3 Write unit tests for Services
    - Test exactly-four invariant, named categories, and reduced-motion hover state
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 13. Implement Differentiators section
  - [x] 13.1 Build DifferentiatorItem and DifferentiatorsSection
    - Render exactly four differentiators with the named titles and a short supporting description each
    - _Requirements: 4.1, 4.2, 4.3_

  - [x]* 13.2 Write unit tests for Differentiators
    - Test exactly-four invariant, named titles, and presence of descriptions
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 14. Implement Team section
  - [x] 14.1 Build TeamMemberCard, TeamStory, and TeamSection
    - Render exactly four member cards (name, role, photo via `ResponsiveImage`); render optional story only when present; render normally when story is missing/short; responsive columns 1/2/4
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.2, 9.3, 9.4_

  - [x]* 14.2 Write property test for team member card rendering
    - **Property 8: Team member card renders all required fields**
    - `// Feature: ryze-portfolio-website, Property 8: rendered Team_Member_Card contains the member's name, role, and a photo image element`
    - Generator: arbitrary `TeamMember`; minimum 100 iterations
    - **Validates: Requirements 5.2**

  - [x]* 14.3 Write edge-case tests for Team
    - Test missing/short story rendering and photo failure → initials → reserved space chain
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 15. Implement Contact CTA section
  - [x] 15.1 Build ContactSection with ContactForm and ScheduleCallCTA
    - Render fixed headline; in form mode render name/email/message inputs with programmatically linked labels, run `validateContactForm` before submit, POST to the external endpoint, show success within 2s, show field errors, and retain input on network/server failure; in schedule mode open the scheduling URL in a new tab; disable submit and set `aria-busy` while submitting
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 13.5, 14.4_

  - [x]* 15.2 Write unit and integration tests for Contact
    - Test headline, form/schedule mode, field-level and email validation errors, happy path against a mocked endpoint within the time budget, request targets the configured external endpoint, and network-failure retains input with error message
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 14.4_

- [x] 16. Implement Footer
  - [x] 16.1 Build the Footer component
    - Render a `contentinfo` landmark with company name and `currentCopyrightYear`, anchor links to all six sections, and >= 1 external contact link
    - _Requirements: 7.1, 7.2, 7.3, 13.4_

  - [x]* 16.2 Write unit tests for Footer
    - Test company name + current year, six section anchors, and external contact link
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 17. Wire the App shell, landmarks, and metadata
  - [x] 17.1 Assemble App root and document head
    - Compose `MotionProvider`, `Navigation`, `<main>` with sections in order (Hero, Portfolio, Services, Differentiators, Team, Contact), and `Footer`; code-split below-the-fold animated sections via dynamic import; populate `index.html` head with `<title>` containing "Ryze Technology", `<meta name="description">` (>= 50 chars, truncated to <= 160), Open Graph title/description/image, and `<link rel="canonical">`
    - _Requirements: 8.1, 13.4, 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x]* 17.2 Write unit tests for section order and SEO head
    - Test DOM section order, landmark presence, title text, Open Graph tags, canonical link, and lazy-load attributes on below-the-fold images
    - _Requirements: 8.1, 12.4, 13.4, 15.1, 15.4, 15.5_

- [x] 18. Checkpoint - all sections wired
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Cross-cutting accessibility, contrast, and responsive verification
  - [x]* 19.1 Write accessibility tests
    - Run axe audits for landmarks (nav/main/contentinfo), form label association, and image alt presence; assert visible focus indicators and keyboard tab-order in reading order
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x]* 19.2 Write contrast and responsive integration tests
    - Compute contrast ratios on resolved design tokens (>= 4.5:1 body, >= 3:1 large/interactive boundaries); assert no horizontal scroll and correct column counts / nav presentation at representative widths; assert 44px tap targets on mobile
    - _Requirements: 8.2, 8.5, 9.1, 9.6, 10.4, 10.5_

- [x] 20. Production build and Lighthouse smoke verification
  - [x]* 20.1 Add Lighthouse CI smoke test and static-build verification
    - Run Lighthouse CI against the production build asserting performance >= 95, LCP <= 2.5s, CLS <= 0.1; verify the build emits only static artifacts deployable without a server runtime
    - _Requirements: 12.1, 12.2, 12.3, 14.3_

- [x] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references specific granular requirements for traceability.
- Property-based tests validate the universal correctness properties from the design and each runs a minimum of 100 iterations, tagged with `// Feature: ryze-portfolio-website, Property N: ...`.
- Unit, edge-case, accessibility, integration, and Lighthouse smoke tests cover behaviors outside the pure logic space (visual content, animation, contrast, performance).
- Checkpoints ensure incremental validation at logical breaks.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["4.1", "4.5", "4.7", "4.9", "6.1", "6.2"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "4.6", "4.8", "4.10", "4.11", "6.3", "7.1", "8.1"] },
    { "id": 3, "tasks": ["7.2", "8.2", "8.3", "9.1", "10.1", "13.1", "16.1"] },
    { "id": 4, "tasks": ["9.2", "10.2", "11.1", "12.1", "13.2", "14.1", "15.1", "16.2"] },
    { "id": 5, "tasks": ["11.2", "11.3", "12.2", "12.3", "14.2", "14.3", "15.2"] },
    { "id": 6, "tasks": ["17.1"] },
    { "id": 7, "tasks": ["17.2", "19.1", "19.2", "20.1"] }
  ]
}
```
