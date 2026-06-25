import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { differentiators } from '@content/differentiators';
import { DifferentiatorsSection } from './DifferentiatorsSection';

/**
 * DifferentiatorsSection — "Why Choose Ryze".
 *
 * Validates: Requirements 4.1, 4.2, 4.3
 */
describe('DifferentiatorsSection', () => {
  it('renders the section heading inside a #differentiators section', () => {
    const { container } = render(<DifferentiatorsSection />);

    const section = container.querySelector('#differentiators');
    expect(section).not.toBeNull();

    const heading = screen.getByRole('heading', {
      level: 2,
      name: /why choose ryze/i,
    });
    expect(heading).toBeInTheDocument();
  });

  // Req 4.1: exactly four differentiators are rendered.
  it('renders exactly four differentiator items', () => {
    render(<DifferentiatorsSection />);
    expect(screen.getAllByTestId('differentiator-item')).toHaveLength(4);
  });

  // Req 4.2: all four named titles are present as level-3 headings.
  it('renders all four named differentiator titles', () => {
    render(<DifferentiatorsSection />);

    const expectedTitles = [
      'Complete ownership',
      'Full-stack expertise',
      'Long-term partnership',
      'Transparent process',
    ];

    for (const title of expectedTitles) {
      expect(
        screen.getByRole('heading', { level: 3, name: title }),
      ).toBeInTheDocument();
    }
  });

  // Req 4.3: each differentiator has a non-empty supporting description.
  it('renders a non-empty description for every differentiator', () => {
    render(<DifferentiatorsSection />);

    for (const { description } of differentiators) {
      expect(description.trim().length).toBeGreaterThan(0);
      expect(screen.getByText(description)).toBeInTheDocument();
    }
  });
});
