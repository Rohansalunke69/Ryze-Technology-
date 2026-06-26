/**
 * Unit tests for MagneticButton (task 9.3).
 *
 * Rendered inside a ReducedMotionProvider with a mocked `matchMedia` so the
 * motion branch can be toggled. Verifies:
 *  - renders as a native button by default and as an anchor with `as="a"`;
 *  - always carries the minimum 44×44px tap-target classes (Req 36.3) and the
 *    `data-cursor="magnetic"` hook for the custom cursor;
 *  - under reduced motion applies no JavaScript pointer transform (Req 23.2);
 *  - forwards `href`, `onClick`, and `ariaLabel`.
 *
 * Framework: Vitest + @testing-library/react.
 * Requirements: 23.1, 23.2, 36.3
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { MagneticButton } from './MagneticButton';

function renderButton(ui: React.ReactElement) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

afterEach(() => {
  resetMatchMedia();
  vi.restoreAllMocks();
});

describe('MagneticButton', () => {
  describe('with motion allowed', () => {
    beforeEach(() => {
      mockReducedMotion(false);
    });

    it('renders as a native button by default', () => {
      renderButton(<MagneticButton ariaLabel="Get started">Start</MagneticButton>);
      const btn = screen.getByRole('button', { name: 'Get started' });
      expect(btn.tagName).toBe('BUTTON');
    });

    it('renders as an anchor when as="a" and forwards href', () => {
      renderButton(
        <MagneticButton as="a" href="/contact" ariaLabel="Contact us">
          Contact
        </MagneticButton>,
      );
      const link = screen.getByRole('link', { name: 'Contact us' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/contact');
    });

    it('exposes min 44×44 tap-target classes and the magnetic cursor hook', () => {
      renderButton(<MagneticButton>Tap</MagneticButton>);
      const btn = screen.getByRole('button', { name: 'Tap' });
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('min-w-[44px]');
      expect(btn).toHaveAttribute('data-cursor', 'magnetic');
    });

    it('invokes onClick when activated', async () => {
      const onClick = vi.fn();
      renderButton(<MagneticButton onClick={onClick}>Go</MagneticButton>);
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('under reduced motion (Req 23.2)', () => {
    beforeEach(() => {
      mockReducedMotion(true);
    });

    it('applies no inline JavaScript pointer transform', () => {
      renderButton(<MagneticButton>Static</MagneticButton>);
      const btn = screen.getByRole('button', { name: 'Static' });
      // No transform should be written to the element's inline style.
      expect(btn.style.transform).toBe('');
    });

    it('still renders the tap-target classes and cursor hook', () => {
      renderButton(
        <MagneticButton as="a" href="/x" ariaLabel="Reduced link">
          Link
        </MagneticButton>,
      );
      const link = screen.getByRole('link', { name: 'Reduced link' });
      expect(link.className).toContain('min-h-[44px]');
      expect(link.className).toContain('min-w-[44px]');
      expect(link).toHaveAttribute('data-cursor', 'magnetic');
      expect(link).toHaveAttribute('href', '/x');
    });
  });
});
