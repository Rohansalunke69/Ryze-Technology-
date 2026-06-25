import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ContactContent } from '@apptypes';
import { ContactSection } from './ContactSection';

/**
 * Integration tests for the Contact CTA section.
 *
 * The form is the only runtime I/O path, so `fetch` is mocked globally to keep
 * tests hermetic. We exercise headline rendering, the two display modes,
 * field-level + email validation, the happy path against the configured
 * endpoint within the time budget, and network-failure input retention.
 *
 * Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 14.4
 */

const formContent: ContactContent = {
  headline: 'Ready to build something great?',
  mode: 'form',
  endpoint: 'https://formspree.io/f/test-endpoint',
};

const scheduleContent: ContactContent = {
  headline: 'Ready to build something great?',
  mode: 'schedule',
  scheduleUrl: 'https://cal.example.com/ryze',
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** A resolved 2xx fetch Response stub. */
function okResponse(): Partial<Response> {
  return { ok: true, status: 200 };
}

describe('ContactSection - headline & section (Req 6.1)', () => {
  it('renders the fixed headline within a #contact section', () => {
    const { container } = render(<ContactSection content={formContent} />);
    expect(
      screen.getByRole('heading', { name: 'Ready to build something great?' }),
    ).toBeInTheDocument();
    expect(container.querySelector('section#contact')).not.toBeNull();
  });
});

describe('ContactSection - form mode (Req 6.2, 6.3)', () => {
  it('renders three programmatically labeled inputs', () => {
    render(<ContactSection content={formContent} />);

    const name = screen.getByLabelText('Name');
    const email = screen.getByLabelText('Email');
    const message = screen.getByLabelText('Message');

    expect(name).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(message).toBeInTheDocument();

    // Each control is a real form field associated with its label.
    expect(name).toHaveAttribute('id');
    expect(email).toHaveAttribute('id');
    expect(message).toHaveAttribute('id');
  });
});

describe('ContactSection - validation (Req 6.5, 6.6)', () => {
  it('shows field errors and does NOT POST when submitting empty', async () => {
    const user = userEvent.setup();
    render(<ContactSection content={formContent} />);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows an email error for a syntactically invalid email and does NOT POST', async () => {
    const user = userEvent.setup();
    render(<ContactSection content={formContent} />);

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Message'), 'Hello there, lets build.');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    const emailInput = screen.getByLabelText('Email');
    expect(
      await screen.findByText('Please enter a valid email address.'),
    ).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    // The error is programmatically associated with the input.
    const describedBy = emailInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'Please enter a valid email address.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('ContactSection - happy path (Req 6.4, 14.4)', () => {
  it('POSTs to the configured endpoint and shows success, clearing inputs', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(okResponse());

    render(<ContactSection content={formContent} />);

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Message'), 'I would like to build something.');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Success confirmation appears within the 2-second budget.
    await waitFor(
      () => expect(screen.getByRole('status')).toBeInTheDocument(),
      { timeout: 2000 },
    );

    // The request targeted the separately hosted endpoint with a JSON body.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(formContent.endpoint);
    expect(init).toMatchObject({ method: 'POST' });
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to build something.',
    });

    // Inputs are cleared after success.
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });
});

describe('ContactSection - network failure (Req 6.7)', () => {
  it('shows an error message and retains the user input when fetch rejects', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new Error('network down'));

    render(<ContactSection content={formContent} />);

    await user.type(screen.getByLabelText('Name'), 'Grace Hopper');
    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('Message'), 'Lets talk about a project.');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    // An error alert is shown.
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // The user's input is retained so they can retry without re-typing.
    expect(screen.getByLabelText('Name')).toHaveValue('Grace Hopper');
    expect(screen.getByLabelText('Email')).toHaveValue('grace@example.com');
    expect(screen.getByLabelText('Message')).toHaveValue(
      'Lets talk about a project.',
    );
  });
});

describe('ContactSection - schedule mode (Req 6.8)', () => {
  it('renders a "Schedule a call" CTA that opens the scheduling URL in a new tab', () => {
    render(<ContactSection content={scheduleContent} />);

    const cta = screen.getByRole('link', { name: /schedule a call/i });
    expect(cta).toHaveAttribute('href', scheduleContent.scheduleUrl);
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));

    // No form is rendered in schedule mode.
    expect(screen.queryByLabelText('Email')).toBeNull();
  });
});

describe('ContactSection - duplicate submit guard', () => {
  it('disables the submit button and sets aria-busy while submitting', async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Partial<Response>) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise<Partial<Response>>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { container } = render(<ContactSection content={formContent} />);

    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Message'), 'A message body here.');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    const form = container.querySelector('form');
    await waitFor(() => expect(form).toHaveAttribute('aria-busy', 'true'));
    expect(within(form as HTMLElement).getByRole('button')).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Resolve to let the component settle.
    resolveFetch(okResponse());
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });
});
