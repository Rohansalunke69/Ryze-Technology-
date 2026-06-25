import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MotionProvider } from '../hooks/MotionProvider';
import { footerContent } from '../content/contact';
import { currentCopyrightYear } from '../logic/metadata';
import { Footer } from './Footer';

/** Render the Footer inside the MotionProvider it depends on for context. */
function renderFooter() {
  return render(
    <MotionProvider>
      <Footer />
    </MotionProvider>,
  );
}

describe('Footer', () => {
  it('renders a contentinfo landmark (Req 13.4)', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows the company name and current copyright year (Req 7.1)', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');
    const year = String(currentCopyrightYear(new Date()));

    // Company name appears (brand + copyright line both contain it).
    expect(within(footer).getAllByText(/Ryze Technology/).length).toBeGreaterThan(0);
    // Copyright notice includes the current year.
    expect(within(footer).getByText(new RegExp(`©\\s*${year}`))).toBeInTheDocument();
  });

  it('renders anchor links to all six sections (Req 7.2)', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');

    for (const link of footerContent.navLinks) {
      const anchor = within(footer).getByRole('link', { name: link.label });
      expect(anchor).toHaveAttribute('href', `#${link.id}`);
    }

    const expectedIds = ['hero', 'portfolio', 'services', 'differentiators', 'team', 'contact'];
    expect(footerContent.navLinks.map((l) => l.id).sort()).toEqual([...expectedIds].sort());
  });

  it('renders at least one external contact link opening in a new tab safely (Req 7.3)', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');

    expect(footerContent.externalContacts.length).toBeGreaterThanOrEqual(1);

    const external = footerContent.externalContacts.find((c) => /^https?:\/\//i.test(c.href));
    expect(external).toBeDefined();

    const anchor = within(footer).getByRole('link', { name: external!.label });
    expect(anchor).toHaveAttribute('href', external!.href);
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
