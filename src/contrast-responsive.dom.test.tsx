/**
 * Cross-cutting responsive DOM assertions (Task 19.2, companion to
 * contrast-responsive.test.ts).
 *
 * jsdom does not lay out elements, so physical tap-target size and true
 * "no horizontal scroll" (Req 9.1) cannot be measured. Instead the 44px tap
 * targets (Req 9.6) and the navigation presentation (Req 8.2, 8.5) are verified
 * through the resolved Tailwind utilities on the rendered interactive controls,
 * matching how the per-component tests assert them.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MotionProvider } from '@hooks';
import { heroContent } from './content/hero';
import { HeroSection } from './components/HeroSection';
import { Navigation } from './components/Navigation';

/** Stub `matchMedia` (read by MotionProvider on mount). Motion allowed. */
function mockMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

beforeEach(() => {
  mockMatchMedia();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Tap targets (Req 9.6)', () => {
  it('renders every Navigation control with 44px min tap-target utilities', () => {
    render(
      <MotionProvider>
        <Navigation />
      </MotionProvider>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button.className).toMatch(/min-h-tap-target/);
      expect(button.className).toMatch(/min-w-tap-target/);
    }
  });

  it('renders the Hero primary CTA with 44px min tap-target utilities', () => {
    render(
      <MotionProvider>
        <HeroSection />
      </MotionProvider>,
    );
    const cta = screen.getByRole('button', { name: heroContent.cta.label });
    expect(cta.className).toMatch(/min-h-tap-target/);
    expect(cta.className).toMatch(/min-w-tap-target/);
  });
});

describe('Navigation presentation (Req 8.2, 8.5)', () => {
  it('exposes the primary navigation landmark with a collapsed mobile menu', () => {
    render(
      <MotionProvider>
        <Navigation />
      </MotionProvider>,
    );
    // Navigation landmark present (Req 8.2).
    expect(
      screen.getByRole('navigation', { name: /primary/i }),
    ).toBeInTheDocument();
    // Mobile menu starts collapsed (Req 8.5).
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('primary-navigation-menu')).toBeNull();
  });
});
