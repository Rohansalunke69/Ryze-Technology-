/**
 * ContactForm — the `/contact` submission form (task 14.15).
 *
 * Renders the Contact_Form fields (name, email, company, project type,
 * timeline, message) with inline validation and a strict status union
 * of exactly one of `idle | submitting | success | error` at any time
 * (Requirement 13.1, 13.6).
 *
 * Submission flow:
 *  - Invalid submit → submission is blocked, inline field errors render, invalid
 *    fields get `aria-invalid` + `aria-describedby`, and focus moves to a
 *    focusable error summary (Requirements 13.2, 38.6).
 *  - Valid submit → status becomes `submitting` and the values are POSTed to the
 *    env-configured `siteMetadata.contactEndpoint` (Requirement 13.3).
 *  - A 2xx response → `success`: the form is cleared and success is announced via
 *    a polite live region (Requirement 13.4).
 *  - A network failure, non-2xx response, or timeout → `error`: entered values
 *    are preserved, a "Try again" retry control and a `mailto:` fallback are
 *    shown, and the failure is announced via the live region (Requirement 13.5).
 *
 * Accessibility: every field has a programmatic `<label htmlFor>`; error messages
 * are linked through `aria-describedby`/`aria-invalid`; status changes are spoken
 * through an `aria-live="polite"` region; the submit control is disabled while
 * submitting (Requirements 38.6, 13.2, 13.4, 13.5).
 *
 * _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 38.6_
 */
import { useEffect, useRef, useState } from 'react';
import { siteMetadata } from '@data/siteMetadata';

/** The lifecycle status of a Contact_Form submission (Requirement 13.6). */
export type ContactStatus = 'idle' | 'submitting' | 'success' | 'error';

/** The Contact_Form field values (Requirement 13.1). */
export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  timeline: string;
  message: string;
}

/** Per-field inline validation messages, keyed by field name. */
type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY_VALUES: ContactValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  timeline: '',
  message: '',
};

/** Pragmatic email shape check: a local part, an `@`, and a dotted domain. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Abort the request if the endpoint has not responded within this window. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Select options for the optional categorical fields. */
const PROJECT_TYPE_OPTIONS = [
  'Website',
  'Web app',
  'Mobile app',
  'Desktop software',
  'Business system',
  'Something else',
] as const;

const TIMELINE_OPTIONS = [
  'ASAP',
  '1–3 months',
  '3–6 months',
  '6+ months',
  'Just exploring',
] as const;

/**
 * Validate the required fields (name, email, message). Company, project type,
 * and timeline are optional and never produce an error.
 */
function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length === 0) {
    errors.name = 'Please enter your name.';
  }
  if (values.email.trim().length === 0) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (values.message.trim().length === 0) {
    errors.message = 'Please tell us a little about your project.';
  }
  return errors;
}

const FIELD_BASE_CLASSES =
  'w-full rounded-md border bg-ink-800 px-4 py-3 font-sans text-body ' +
  'text-mist-100 placeholder:text-mist-300/60 transition-colors ' +
  'focus:outline-none focus-visible:border-pulse-500';

/** Border colour reflects validity so invalid fields read clearly. */
function fieldClasses(hasError: boolean): string {
  return `${FIELD_BASE_CLASSES} ${
    hasError ? 'border-red-400' : 'border-ink-600'
  }`;
}

export function ContactForm(): JSX.Element {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<ContactStatus>('idle');
  // Bumped on every invalid submit so the focus effect re-runs each attempt.
  const [errorSummaryToken, setErrorSummaryToken] = useState(0);

  const summaryRef = useRef<HTMLDivElement>(null);

  const errorEntries = (Object.keys(errors) as (keyof ContactValues)[]).filter(
    (key) => errors[key] !== undefined,
  );
  const hasErrors = errorEntries.length > 0;

  // Move focus to the error summary after an invalid submit (Requirement 13.2).
  useEffect(() => {
    if (errorSummaryToken > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errorSummaryToken]);

  function updateField(field: keyof ContactValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a resolved error as the visitor edits the field.
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function postValues(payload: ContactValues): Promise<void> {
    setStatus('submitting');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(siteMetadata.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // Any non-2xx response is treated as a failure (Requirement 13.5).
      if (response.ok) {
        setStatus('success');
        setValues(EMPTY_VALUES);
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      // Network failure or timeout abort (Requirement 13.5).
      setStatus('error');
    } finally {
      clearTimeout(timer);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // Block submission and surface the error summary (Requirement 13.2).
      setStatus('idle');
      setErrorSummaryToken((token) => token + 1);
      return;
    }

    void postValues(values);
  }

  function handleRetry(): void {
    void postValues(values);
  }

  const submitting = status === 'submitting';

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Focusable error summary, shown after an invalid submit (Req 13.2). */}
      {hasErrors ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="contact-error-summary-title"
          className="rounded-md border border-red-400 bg-ink-800 p-4 focus:outline-none focus-visible:border-pulse-500"
        >
          <h2
            id="contact-error-summary-title"
            className="font-display text-h3 text-mist-100"
          >
            There{"\u2019"}s a problem with your details
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 font-sans text-body text-mist-300">
            {errorEntries.map((key) => (
              <li key={key}>
                <a
                  href={`#contact-${key}`}
                  className="text-pulse-500 underline underline-offset-2"
                >
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Name (required) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-name"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Name <span className="text-pulse-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={fieldClasses(errors.name !== undefined)}
            {...(errors.name !== undefined ? { 'aria-invalid': true } : {})}
            {...(errors.name !== undefined
              ? { 'aria-describedby': 'contact-name-error' }
              : {})}
          />
          {errors.name !== undefined ? (
            <p
              id="contact-name-error"
              className="font-sans text-body text-red-400"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        {/* Email (required) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-email"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Email <span className="text-pulse-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={fieldClasses(errors.email !== undefined)}
            {...(errors.email !== undefined ? { 'aria-invalid': true } : {})}
            {...(errors.email !== undefined
              ? { 'aria-describedby': 'contact-email-error' }
              : {})}
          />
          {errors.email !== undefined ? (
            <p
              id="contact-email-error"
              className="font-sans text-body text-red-400"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        {/* Phone (optional) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-phone"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={fieldClasses(false)}
          />
        </div>

        {/* Company (optional) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-company"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Company
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => updateField('company', e.target.value)}
            className={fieldClasses(false)}
          />
        </div>

        {/* Project type (optional) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-projectType"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Project type
          </label>
          <select
            id="contact-projectType"
            name="projectType"
            value={values.projectType}
            onChange={(e) => updateField('projectType', e.target.value)}
            className={fieldClasses(false)}
          >
            <option value="">Select…</option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline (optional) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-timeline"
            className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
          >
            Timeline
          </label>
          <select
            id="contact-timeline"
            name="timeline"
            value={values.timeline}
            onChange={(e) => updateField('timeline', e.target.value)}
            className={fieldClasses(false)}
          >
            <option value="">Select…</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message (required) */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="contact-message"
          className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300"
        >
          Message <span className="text-pulse-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => updateField('message', e.target.value)}
          className={fieldClasses(errors.message !== undefined)}
          {...(errors.message !== undefined ? { 'aria-invalid': true } : {})}
          {...(errors.message !== undefined
            ? { 'aria-describedby': 'contact-message-error' }
            : {})}
        />
        {errors.message !== undefined ? (
          <p
            id="contact-message-error"
            className="font-sans text-body text-red-400"
          >
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-pulse-500 px-6 py-3 font-mono text-sm tracking-wide text-pulse-500 transition-colors hover:bg-pulse-500 hover:text-ink-900 focus-visible:bg-pulse-500 focus-visible:text-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </div>

      {/* Polite live region announcing success/failure (Req 13.4, 13.5). */}
      <div aria-live="polite" role="status" className="font-sans text-body">
        {status === 'success' ? (
          <p className="text-mist-100">
            Thanks — your message is on its way. We{"\u2019"}ll be in touch soon.
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="text-red-400">
            Something went wrong sending your message. Please try again, or email
            us directly.
          </p>
        ) : null}
      </div>

      {/* Retry + mailto fallback, shown only on error (Req 13.5). */}
      {status === 'error' ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-pulse-500 px-6 py-3 font-mono text-sm tracking-wide text-pulse-500 transition-colors hover:bg-pulse-500 hover:text-ink-900 focus-visible:bg-pulse-500 focus-visible:text-ink-900"
          >
            Try again
          </button>
          <a
            href={`mailto:${siteMetadata.contactEmail}`}
            className="font-sans text-body text-pulse-500 underline underline-offset-2"
          >
            Email us at {siteMetadata.contactEmail}
          </a>
        </div>
      ) : null}
    </form>
  );
}

export default ContactForm;
