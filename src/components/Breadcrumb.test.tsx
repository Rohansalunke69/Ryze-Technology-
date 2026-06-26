/**
 * Unit tests for Breadcrumb (task 10.3).
 *
 * Rendered inside a MemoryRouter at a known sub-page route so the trail is
 * derived from the location. Verifies the Breadcrumb nav landmark, the
 * Home-anchored trail in path order, that non-last items are links, and that
 * the last item is the current page (aria-current="page", no link)
 * (Requirements 3.1, 3.2, 3.3, 3.4).
 */
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Breadcrumb } from './Breadcrumb';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumb />
    </MemoryRouter>,
  );
}

describe('Breadcrumb', () => {
  it('renders a Breadcrumb nav landmark with an ordered list', () => {
    renderAt('/portfolio/some-project');
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
  });

  it('anchors the trail at Home as a link', () => {
    renderAt('/portfolio/some-project');
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/');
  });

  it('renders the trail in path order with mapped labels', () => {
    renderAt('/portfolio/some-project');
    const items = screen.getAllByRole('listitem').filter((li) =>
      li.textContent && li.textContent.trim() !== '/',
    );
    const labels = items.map((li) => li.textContent?.trim());
    expect(labels).toEqual(['Home', 'Portfolio', 'Some Project']);
  });

  it('marks the last item as the current page with no link', () => {
    renderAt('/portfolio/some-project');
    const current = screen.getByText('Some Project');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).not.toBe('A');
    expect(
      screen.queryByRole('link', { name: 'Some Project' }),
    ).toBeNull();
  });

  it('renders intermediate segments as navigable links', () => {
    renderAt('/portfolio/some-project');
    expect(
      screen.getByRole('link', { name: 'Portfolio' }),
    ).toHaveAttribute('href', '/portfolio');
  });

  it('accepts an explicit trail', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          trail={[
            { label: 'Home', path: '/' },
            { label: 'Blog', path: '/blog' },
            { label: 'A Post' },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(screen.getByText('A Post')).toHaveAttribute('aria-current', 'page');
  });
});
