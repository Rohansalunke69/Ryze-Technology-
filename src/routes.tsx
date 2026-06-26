/**
 * Application route configuration (task 13.1).
 *
 * Builds the react-router-dom v6 data-router route table for the whole site.
 * Every page is a code-split `React.lazy` chunk so the initial bundle stays
 * small (Requirements 5.1, 5.2, 18.1): a route's JS only loads when the user
 * navigates to it. Each lazy page is wrapped in:
 *
 *   <RouteErrorBoundary>            ← one failed chunk only fails that route
 *     <Suspense fallback={<RouteSkeleton />}>   ← branded loading state
 *       <LazyPage />
 *     </Suspense>
 *   </RouteErrorBoundary>
 *
 * The per-route boundary + Suspense pairing satisfies Requirements 42.1 / 42.2:
 * a chunk that fails to import surfaces a branded error with a retry control
 * scoped to just that route, while the rest of the shell stays interactive.
 *
 * ── Layout / task 13.2 integration point ────────────────────────────────────
 * All page routes are CHILDREN of a single parent layout route. For now that
 * parent's `element` is a bare `<Outlet />` placeholder. Task 13.2 owns the
 * app shell and will REPLACE `LayoutOutletPlaceholder` with the real
 * `AppLayout` (Navigation + Footer + PageTransition wrapping an `<Outlet />`)
 * — no child routes need to change. See `appRoutes[0].element`.
 *
 * Exports:
 *   - `appRoutes`  — `RouteObject[]` the app shell composes (13.2 may swap the
 *                    parent `element`, or recompose the children directly).
 *   - `router`     — a ready-to-use `createBrowserRouter(appRoutes)` instance.
 */
import { lazy, Suspense, type ReactNode } from 'react';
import {
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';

import { AppLayout } from '@components/AppLayout';
import { RouteErrorBoundary } from '@components/ErrorBoundary';
import { RouteSkeleton } from '@components/RouteSkeleton';

// ── Lazy-loaded Page_Modules ────────────────────────────────────────────────
// Each page module exports a `default`, so `React.lazy(() => import(...))`
// resolves directly to the component.
const HomePage = lazy(() => import('@pages/HomePage'));
const PortfolioListPage = lazy(() => import('@pages/PortfolioListPage'));
const CaseStudyPage = lazy(() => import('@pages/CaseStudyPage'));
const ServicesPage = lazy(() => import('@pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@pages/ServiceDetailPage'));
const AboutPage = lazy(() => import('@pages/AboutPage'));
const ManifestoPage = lazy(() => import('@pages/ManifestoPage'));
const ContactPage = lazy(() => import('@pages/ContactPage'));
const BlogListPage = lazy(() => import('@pages/BlogListPage'));
const BlogPostPage = lazy(() => import('@pages/BlogPostPage'));
const ResourcesPage = lazy(() => import('@pages/ResourcesPage'));
const LegalPage = lazy(() => import('@pages/LegalPage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

/**
 * Wrap a lazily-loaded route element in its per-route error boundary and a
 * Suspense fallback. Keeps the route table declarative and avoids repeating
 * the boundary/Suspense scaffolding on every leaf.
 */
function withRouteShell(node: ReactNode): ReactNode {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteSkeleton />}>{node}</Suspense>
    </RouteErrorBoundary>
  );
}

/**
 * Parent layout route element. Task 13.2 wires the real `AppLayout` shell
 * (CustomCursor + Navigation + PageTransition around an `<Outlet />` + Footer)
 * here, so every child route renders inside the shared shell.
 */

export const appRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: withRouteShell(<HomePage />) },
      { path: 'portfolio', element: withRouteShell(<PortfolioListPage />) },
      { path: 'portfolio/:slug', element: withRouteShell(<CaseStudyPage />) },
      { path: 'services', element: withRouteShell(<ServicesPage />) },
      { path: 'services/:slug', element: withRouteShell(<ServiceDetailPage />) },
      { path: 'about', element: withRouteShell(<AboutPage />) },
      { path: 'manifesto', element: withRouteShell(<ManifestoPage />) },
      { path: 'contact', element: withRouteShell(<ContactPage />) },
      { path: 'blog', element: withRouteShell(<BlogListPage />) },
      { path: 'blog/:slug', element: withRouteShell(<BlogPostPage />) },
      { path: 'resources', element: withRouteShell(<ResourcesPage />) },
      // The three legal docs share one lazy LegalPage, distinguished by the
      // explicit `slug` prop (overrides LegalPage's useParams().docType).
      { path: 'privacy', element: withRouteShell(<LegalPage slug="privacy" />) },
      { path: 'terms', element: withRouteShell(<LegalPage slug="terms" />) },
      { path: 'cookies', element: withRouteShell(<LegalPage slug="cookies" />) },
      // Catch-all 404.
      { path: '*', element: withRouteShell(<NotFoundPage />) },
    ],
  },
];

/**
 * Ready-to-use browser router. Task 13.2 can render this directly via
 * `<RouterProvider router={router} />`, or recompose `appRoutes` after swapping
 * the parent layout element.
 */
export const router = createBrowserRouter(appRoutes);

export default router;
