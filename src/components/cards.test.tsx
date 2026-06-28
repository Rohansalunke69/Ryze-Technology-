/**
 * Unit tests for the content cards (task 10.5).
 *
 * Rendered inside a ReducedMotionProvider (with a mocked `matchMedia`) and a
 * MemoryRouter so the `Link`s resolve. Verifies each card renders its key
 * fields and correct destination links, and that the shared reserved-box image
 * swaps to a placeholder on load failure (Requirements 7.1, 9.1, 11.2, 14.1,
 * 8.1, 39.3, 42.3).
 *
 * Framework: Vitest + @testing-library/react.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import type {
  BlogPost,
  CaseStudy,
  Service,
  TeamMember,
  Testimonial,
  ImageAsset,
} from '@app-types';

import { CaseStudyCard } from './CaseStudyCard';
import { ServiceCard } from './ServiceCard';
import { TeamCard } from './TeamCard';
import { BlogCard } from './BlogCard';
import { TestimonialCard } from './TestimonialCard';

function renderCard(ui: React.ReactElement) {
  return render(
    <ReducedMotionProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ReducedMotionProvider>,
  );
}

const image = (overrides: Partial<ImageAsset> = {}): ImageAsset => ({
  src: 'https://cdn.ryze.test/img.jpg',
  width: 1200,
  height: 800,
  alt: 'A descriptive alt',
  ...overrides,
});

const caseStudy: CaseStudy = {
  slug: 'atlas-platform',
  title: 'Atlas Platform',
  client: 'Atlas Corp',
  category: 'systems',
  services: ['business-systems'],
  year: 2024,
  role: 'Design & Engineering',
  featured: false,
  order: 1,
  summary: 'A durable internal platform.',
  hero: image({ alt: 'Atlas hero' }),
  challenge: 'c',
  solution: 's',
  results: [{ label: 'faster ops', value: 212, suffix: '%', prefix: '+' }],
  gallery: [],
  techStack: ['React'],
  learnings: ['l'],
  seo: { title: 't', description: 'd', canonical: 'https://ryze.test/portfolio/atlas-platform' },
};

const service: Service = {
  slug: 'development',
  name: 'Development',
  tagline: 'Fast, accessible sites.',
  icon: 'globe',
  order: 1,
  summary: 'Summary text.',
  whatWeDo: 'w',
  features: [],
  techStack: [],
  process: [],
  faqs: [],
  seo: { title: 't', description: 'd', canonical: 'https://ryze.test/services/development' },
};

const member: TeamMember = {
  id: 'm1',
  name: 'Jordan Rivera',
  role: 'Principal Engineer',
  bio: 'b',
  portrait: image({ alt: 'Jordan Rivera portrait' }),
  socials: [
    { platform: 'github', url: 'https://github.com/jordan' },
    { platform: 'email', url: 'jordan@ryze.test' },
  ],
  order: 1,
};

const post: BlogPost = {
  slug: 'engineered-permanence',
  title: 'Engineered Permanence',
  category: 'engineering',
  excerpt: 'Why we build software that lasts.',
  cover: image({ alt: 'Post cover' }),
  content: 'word '.repeat(450),
  author: {
    id: 'a1',
    name: 'Sam Lee',
    role: 'Engineer',
    avatar: image({ alt: 'Sam' }),
  },
  publishedAt: '2025-01-05',
  readingTimeMinutes: 7,
  tags: ['x'],
  seo: { title: 't', description: 'd', canonical: 'https://ryze.test/blog/engineered-permanence' },
};

const testimonial: Testimonial = {
  id: 'tm1',
  quote: 'They built something permanent.',
  author: 'Dana Fox',
  authorRole: 'CTO',
  company: 'Northwind',
  rating: 5,
};

beforeEach(() => {
  mockReducedMotion(false);
});

afterEach(() => {
  resetMatchMedia();
});

describe('CaseStudyCard', () => {
  it('renders title, client/category, key metric, and links to the case study', () => {
    renderCard(<CaseStudyCard caseStudy={caseStudy} />);
    expect(screen.getByText('Atlas Platform')).toBeInTheDocument();
    expect(screen.getByText(/Atlas Corp/)).toBeInTheDocument();
    expect(screen.getByText(/Systems/)).toBeInTheDocument();
    expect(screen.getByText(/\+212%/)).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/portfolio/atlas-platform');
    expect(link).toHaveAttribute('data-cursor', 'view');
  });
});

describe('ServiceCard', () => {
  it('renders name, tagline, and a Learn More link to the service', () => {
    renderCard(<ServiceCard service={service} />);
    expect(screen.getByRole('heading', { name: 'Development' })).toBeInTheDocument();
    expect(screen.getByText('Fast, accessible sites.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /learn more about Development/i });
    expect(link).toHaveAttribute('href', '/services/development');
    expect(link).toHaveAttribute('data-cursor', 'link');
  });
});

describe('TeamCard', () => {
  it('renders name, role, and external social links with safe rel/target', () => {
    renderCard(<TeamCard member={member} />);
    expect(screen.getByRole('heading', { name: 'Jordan Rivera' })).toBeInTheDocument();
    expect(screen.getByText('Principal Engineer')).toBeInTheDocument();

    const github = screen.getByRole('link', { name: /jordan rivera on github/i });
    expect(github).toHaveAttribute('href', 'https://github.com/jordan');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');

    const email = screen.getByRole('link', { name: /jordan rivera on email/i });
    expect(email).toHaveAttribute('href', 'mailto:jordan@ryze.test');
  });
});

describe('BlogCard', () => {
  it('renders category, title link, excerpt, date, and reading time', () => {
    renderCard(<BlogCard post={post} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Why we build software that lasts.')).toBeInTheDocument();
    expect(screen.getByText('7 min read')).toBeInTheDocument();
    expect(screen.getByText('Jan 5, 2025')).toBeInTheDocument();

    const titleLink = screen.getByRole('link', { name: 'Engineered Permanence' });
    expect(titleLink).toHaveAttribute('href', '/blog/engineered-permanence');
  });
});

describe('TestimonialCard', () => {
  it('renders quote, author, role, company, and a rating label', () => {
    renderCard(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByText(/They built something permanent\./)).toBeInTheDocument();
    expect(screen.getByText('Dana Fox')).toBeInTheDocument();
    expect(screen.getByText(/CTO, Northwind/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /rated 5 out of 5/i })).toBeInTheDocument();
  });
});

describe('CardImage error handling (Req 42.3)', () => {
  it('swaps the src to blurDataURL when the image fails and an LQIP exists', () => {
    const withLqip: TeamMember = {
      ...member,
      portrait: image({ alt: 'Has LQIP', blurDataURL: 'data:image/png;base64,LQIP' }),
    };
    renderCard(<TeamCard member={withLqip} />);
    const img = screen.getByRole('img', { name: 'Has LQIP' }) as HTMLImageElement;
    fireEvent.error(img);
    expect(img.getAttribute('src')).toBe('data:image/png;base64,LQIP');
  });

  it('renders a solid placeholder when the image fails and no LQIP exists', () => {
    const noLqip: TeamMember = {
      ...member,
      portrait: image({ alt: 'No LQIP' }),
    };
    const { container } = renderCard(<TeamCard member={noLqip} />);
    const img = screen.getByRole('img', { name: 'No LQIP' });
    fireEvent.error(img);

    const placeholder = container.querySelector('[data-card-image-placeholder="true"]');
    expect(placeholder).not.toBeNull();
    // The reserved aspect box still exposes the alt text via role="img".
    expect(within(placeholder as HTMLElement).queryByText('Ryze')).toBeInTheDocument();
    // The broken <img> is gone, replaced by the placeholder fill.
    expect(screen.queryByRole('img', { name: 'No LQIP' })?.tagName).not.toBe('IMG');
  });
});
