/**
 * Unit tests for SectionHeader, CTA, and ScrollIndicator (task 10.4).
 *
 * These components read the motion preference (directly or via SplitText /
 * MagneticButton), so renders are wrapped in a `ReducedMotionProvider` with a
 * mocked `matchMedia`. `IntersectionObserver` is stubbed because SplitText's
 * in-view trigger uses it and jsdom does not implement it.
 *
 * Requirements: 6.4, 9.3, 38.1
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { SectionHeader } from './SectionHeader';
import { CTA } from './CTA';
import { ScrollIndicator } from './ScrollIndicator';

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockReducedMotion(false);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderUI(ui: React.ReactElement) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

describe('SectionHeader', () => {
  it('renders the eyebrow and the title as an h2 by default', () => {
    renderUI(<SectionHeader eyebrow="Our work" title="Engineered permanence" />);

    expect(screen.getByText('Our work')).toBeInTheDocument();
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Engineered permanence',
    });
    expect(heading.tagName).toBe('H2');
  });

  it('renders the title as an h1 when as="h1"', () => {
    renderUI(<SectionHeader title="Page title" as="h1" />);

    const heading = screen.getByRole('heading', { level: 1, name: 'Page title' });
    expect(heading.tagName).toBe('H1');
  });

  it('omits the eyebrow when not provided', () => {
    const { container } = renderUI(<SectionHeader title="No kicker" />);
    // The heading is still present and named via SplitText's aria-label.
    expect(
      screen.getByRole('heading', { name: 'No kicker' }),
    ).toBeInTheDocument();
    // No eyebrow paragraph should be rendered.
    expect(container.querySelector('p')).toBeNull();
  });
});

describe('CTA', () => {
  it('renders the heading and a link to the default /contact href', () => {
    renderUI(<CTA heading="Let's build something permanent" />);

    expect(
      screen.getByRole('heading', { name: "Let's build something permanent" }),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: "Let's build" });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('honors a custom href, label, and subtext', () => {
    renderUI(
      <CTA
        heading="Start a project"
        sub="We reply within a day."
        href="/services"
        label="See services"
      />,
    );

    expect(screen.getByText('We reply within a day.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'See services' });
    expect(link).toHaveAttribute('href', '/services');
  });
});

describe('ScrollIndicator', () => {
  it('is a labeled button that scrolls to the target when activated', async () => {
    const target = document.createElement('section');
    target.id = 'next';
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderUI(<ScrollIndicator targetId="next" />);

    const button = screen.getByRole('button', { name: 'Scroll to next section' });
    await userEvent.click(button);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    document.body.removeChild(target);
  });

  it('is decorative (no button) when no target is provided', () => {
    renderUI(<ScrollIndicator />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
