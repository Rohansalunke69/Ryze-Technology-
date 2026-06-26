/**
 * Unit tests for Footer (task 10.3).
 *
 * Rendered inside a MemoryRouter so the internal `Link`s resolve. Verifies the
 * contentinfo landmark, brand name, current-year copyright, social links
 * (external, new tab + rel=noopener), the contact mailto link, and the legal
 * links — all sourced from the typed site metadata (Requirements 4.1, 4.2).
 */
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { siteMetadata } from '@data/siteMetadata';
import { footerLegalLinks } from '@data/navigation';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('renders the contentinfo landmark', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the company name', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getAllByText(siteMetadata.siteName).length,
    ).toBeGreaterThan(0);
  });

  it('renders a copyright line with the current year', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`©\\s*${year}`))).toBeInTheDocument();
  });

  it('renders social links as external links opening in a new tab with rel=noopener', () => {
    renderFooter();
    const socialList = screen.getByRole('list', { name: /social media/i });
    const links = within(socialList).getAllByRole('link');
    expect(links).toHaveLength(siteMetadata.social.length);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('renders the contact email as a mailto link', () => {
    renderFooter();
    const mail = screen.getByRole('link', { name: siteMetadata.contactEmail });
    expect(mail).toHaveAttribute('href', `mailto:${siteMetadata.contactEmail}`);
  });

  it('renders the legal links', () => {
    renderFooter();
    const legalList = screen.getByRole('list', { name: /legal/i });
    for (const link of footerLegalLinks) {
      expect(
        within(legalList).getByRole('link', { name: link.label }),
      ).toHaveAttribute('href', link.path);
    }
  });
});
