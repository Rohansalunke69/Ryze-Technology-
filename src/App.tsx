/**
 * App root — assembles the full single-page portfolio.
 *
 * The tree is wrapped in {@link MotionProvider} so every descendant can read
 * the reduced-motion preference from context (Req 8.4). The page exposes the
 * three required landmarks: `nav` (Navigation), `main` (here), and
 * `contentinfo` (Footer) for accessibility (Req 13.4).
 *
 * Sections render top-to-bottom in narrative order (Req 8.1):
 *   hero → portfolio → services → differentiators → team → contact.
 *
 * Everything below the fold is code-split via `React.lazy` + `Suspense` so the
 * initial payload stays small (design "Rendering & Hydration Strategy").
 * Navigation and the hero load eagerly because they are above the fold.
 */
import { lazy, Suspense } from 'react';

import { MotionProvider } from '@hooks';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';

const PortfolioSection = lazy(() => import('./components/PortfolioSection'));
const ServicesSection = lazy(() => import('./components/ServicesSection'));
const DifferentiatorsSection = lazy(
  () => import('./components/DifferentiatorsSection'),
);
const TeamSection = lazy(() => import('./components/TeamSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

/**
 * Minimal Suspense fallback. Renders nothing visible so awaiting a chunk does
 * not introduce layout shift; the section claims its space once resolved.
 */
function SectionFallback() {
  return <div aria-hidden="true" />;
}

export default function App() {
  return (
    <MotionProvider>
      <div className="min-h-screen bg-navy text-body">
        <Navigation />
        <main>
          <HeroSection />
          <Suspense fallback={<SectionFallback />}>
            <PortfolioSection />
            <ServicesSection />
            <DifferentiatorsSection />
            <TeamSection />
            <ContactSection />
          </Suspense>
        </main>
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </div>
    </MotionProvider>
  );
}
