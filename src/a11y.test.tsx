import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from './App';

/**
 * Cross-cutting accessibility tests for the assembled single-page site.
 *
 * These tests render the full `<App />`, wait for the lazy below-the-fold
 * sections to resolve (signalled by the Footer's `contentinfo` landmark), and
 * then assert site-wide accessibility invariants with a combination of an axe
 * audit and targeted structural checks.
 *
 * Scope (jsdom cannot compute real color contrast — contrast-ratio checks live
 * in task 19.2): landmarks, programmatic form-label association, image alt
 * presence, and keyboard focusability / focus-visible styling.
 *
 * Validates Requirements 13.1, 13.2, 13.3, 13.4, 13.5.
 */

/**
 * Render the full App and wait for every lazy section to resolve. The Footer is
 * the last lazy chunk, so once its `contentinfo` landmark is present the entire
 * page (including the contact form and all images) is mounted.
 */
async function renderFullApp(): Promise<HTMLElement> {
  const { container } = render(<App />);
  // Awaiting the contentinfo landmark guarantees all Suspense boundaries have
  // resolved before we audit the DOM.
  await screen.findByRole('contentinfo');
  return container;
}

describe('Accessibility - axe audit (Req 13.3, 13.4, 13.5)', () => {
  it('reports no accessibility violations for the assembled page', async () => {
    const container = await renderFullApp();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility - semantic landmarks (Req 13.4)', () => {
  it('exposes exactly one Primary nav, one main, and one contentinfo landmark', async () => {
    await renderFullApp();

    // `getByRole` throws if zero or more than one match, so these assertions
    // simultaneously prove existence and uniqueness.
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('Accessibility - contact form label association (Req 13.5)', () => {
  it('associates the Name, Email, and Message inputs with programmatic labels', async () => {
    await renderFullApp();

    // `getByLabelText` resolves a control only when a label is programmatically
    // linked (via htmlFor/id), so success proves the association exists.
    const name = screen.getByLabelText('Name');
    const email = screen.getByLabelText('Email');
    const message = screen.getByLabelText('Message');

    expect(name).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(message).toBeInTheDocument();

    // Each labelled control is a real, identifiable form field.
    expect(name).toHaveAttribute('id');
    expect(email).toHaveAttribute('id');
    expect(message).toHaveAttribute('id');
  });
});

describe('Accessibility - image alternative text (Req 13.3)', () => {
  it('gives every rendered image a defined alt attribute', async () => {
    const container = await renderFullApp();

    const images = Array.from(container.querySelectorAll('img'));
    // The assembled page renders imagery (case studies, team photos, etc.).
    expect(images.length).toBeGreaterThan(0);

    for (const img of images) {
      // Informative, ambiguous, and decorative images alike must declare alt;
      // decorative images use the empty string, which still satisfies this.
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });
});

describe('Accessibility - keyboard focusability & tab order (Req 13.1, 13.2)', () => {
  /** Collect the interactive controls that participate in keyboard navigation. */
  function getInteractiveElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, select',
      ),
    );
  }

  it('keeps every interactive element keyboard-focusable (no negative tabindex) (Req 13.1)', async () => {
    const container = await renderFullApp();

    const controls = getInteractiveElements(container);
    expect(controls.length).toBeGreaterThan(0);

    for (const control of controls) {
      const tabindex = control.getAttribute('tabindex');
      // A negative tabindex would remove the control from the tab sequence.
      if (tabindex !== null) {
        expect(Number(tabindex)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('applies visible focus styling to a sample of interactive controls (Req 13.1)', async () => {
    await renderFullApp();

    // The Navigation links and the Contact form controls each carry a
    // focus-visible / focus ring utility class.
    const navButtons = within(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).getAllByRole('button');
    expect(navButtons.length).toBeGreaterThan(0);
    for (const button of navButtons) {
      expect(button.className).toMatch(/focus-visible:ring/);
    }

    // Contact form fields use a focus ring as well.
    for (const label of ['Name', 'Email', 'Message'] as const) {
      expect(screen.getByLabelText(label).className).toMatch(/focus:ring/);
    }
  });

  it('keeps interactive controls in DOM (reading) order within the document (Req 13.2)', async () => {
    const container = await renderFullApp();

    const controls = getInteractiveElements(container);
    // Every collected control is connected to the rendered document, so the
    // browser tab sequence follows this DOM (visual reading) order.
    for (const control of controls) {
      expect(container.contains(control)).toBe(true);
    }

    // The Primary nav (top of the page) precedes the contact submit control
    // (near the bottom) in document order, matching the visual reading order.
    const navButton = within(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).getAllByRole('button')[0];
    const submitButton = screen.getByRole('button', { name: /send message/i });
    const position = navButton.compareDocumentPosition(submitButton);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
