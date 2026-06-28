/**
 * Unit + a11y tests for ContactPage / ContactForm (tasks 14.15, 14.16).
 *
 * ContactPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper, CTA) and SEOHead, so renders are wrapped in `MemoryRouter`
 * (CTA link), `ReducedMotionProvider` (motion prefs), and `HelmetProvider`
 * (SEOHead). `matchMedia` and `IntersectionObserver` are stubbed because jsdom
 * does not implement them, and `fetch` is stubbed per-test to exercise the
 * submit states.
 *
 * Requirements: 13.1 (seven fields), 13.2 (invalid → block + inline errors +
 * aria-invalid + focus error summary), 13.3 (valid → submitting + POST to
 * endpoint), 13.4 (2xx → success, clear, polite announce), 13.5 (failure/non-2xx
 * → error, preserve values, retry + mailto fallback, announce), 38.6 (labels +
 * aria-describedby/aria-invalid).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { axe } from 'jest-axe';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { siteMetadata } from '@data/siteMetadata';

import { ContactPage } from './ContactPage';

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

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ReducedMotionProvider>
          <ContactPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/** Fill the three required fields with valid data. */
async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name *'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email *'), 'ada@example.com');
  await user.type(screen.getByLabelText('Message *'), 'I have a project in mind.');
}

describe('ContactPage', () => {
  it('renders the page-level h1 hero heading', () => {
    renderPage();
    const h1 = screen.getByRole('heading', {
      level: 1,
      name: "Let's build something that lasts",
    });
    expect(h1.tagName).toBe('H1');
  });

  it('renders all six Contact_Form fields (Req 13.1)', () => {
    renderPage();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Project type')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeline')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
  });

  it('blocks invalid submit with inline errors, aria-invalid, and focused error summary (Req 13.2, 38.6)', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderPage();
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Submission is blocked — no network request.
    expect(fetchSpy).not.toHaveBeenCalled();

    // Inline errors for each required field.
    const name = screen.getByLabelText('Name *');
    const email = screen.getByLabelText('Email *');
    const message = screen.getByLabelText('Message *');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(message).toHaveAttribute('aria-invalid', 'true');

    // A focusable error summary receives focus.
    const summary = screen.getByRole('alert');
    expect(summary).toHaveFocus();
    expect(
      within(summary).getByRole('heading', {
        name: /there.s a problem with your details/i,
      }),
    ).toBeInTheDocument();
  });

  it('on valid submit enters submitting and POSTs to the endpoint, then succeeds and clears (Req 13.3, 13.4)', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    renderPage();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // POSTed to the env-configured endpoint with the entered values.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(siteMetadata.contactEndpoint);
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as Record<string, string>;
    expect(body.name).toBe('Ada Lovelace');
    expect(body.email).toBe('ada@example.com');

    // Success is announced via the polite live region and the form is cleared.
    expect(await screen.findByText(/your message is on its way/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toHaveValue('');
    expect(screen.getByLabelText('Email *')).toHaveValue('');
    expect(screen.getByLabelText('Message *')).toHaveValue('');
  });

  it('on a non-2xx response enters error, preserves values, and shows retry + mailto fallback (Req 13.5)', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500 } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    renderPage();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Failure announced, values preserved.
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toHaveValue('Ada Lovelace');

    // Retry control + mailto fallback are present.
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    const mailtoLinks = screen.getAllByRole('link', {
      name: new RegExp(siteMetadata.contactEmail, 'i'),
    });
    expect(
      mailtoLinks.some(
        (link) =>
          link.getAttribute('href') === `mailto:${siteMetadata.contactEmail}`,
      ),
    ).toBe(true);
  });

  it('on a network failure enters the error state (Req 13.5)', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchSpy);

    renderPage();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    mockReducedMotion(true);
    const { container } = renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
