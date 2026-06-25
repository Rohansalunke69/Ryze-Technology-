/**
 * ContactSection — the Contact CTA section of the Ryze Portfolio Website.
 *
 * Renders the fixed headline and, depending on `content.mode`, either an
 * interactive `ContactForm` (mode 'form') or a "Schedule a call" Primary CTA
 * (mode 'schedule').
 *
 * The contact form is the only runtime I/O path in the site. It validates
 * client-side before any network call (`validateContactForm`), POSTs JSON to a
 * separately hosted endpoint, confirms success within the perceived 2-second
 * budget by transitioning state optimistically on a 2xx response, and retains
 * the user's input on network/server failure so they can retry without
 * re-typing.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 13.5, 14.4
 */

import { useId, useState, type FormEvent } from 'react';
import type { ContactContent, ContactFormValues, FieldError, SubmitState } from '@apptypes';
import { validateContactForm } from '@logic/contact-validation';
import { contactContent } from '@content/contact';

export interface ContactSectionProps {
  /** Contact content; defaults to the authored module content (overridable for tests). */
  content?: ContactContent;
}

const EMPTY_VALUES: ContactFormValues = { name: '', email: '', message: '' };

/**
 * The Contact CTA section. Displays the headline and switches between the
 * contact form and the scheduling CTA based on `content.mode`.
 */
export function ContactSection({ content = contactContent }: ContactSectionProps): JSX.Element {
  const headingId = useId();

  return (
    <section
      id="contact"
      aria-labelledby={headingId}
      className="mx-auto w-full max-w-2xl px-6 py-20 text-slate-100"
    >
      <h2
        id={headingId}
        className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl"
      >
        {content.headline}
      </h2>

      <div className="mt-8">
        {content.mode === 'form' ? (
          <ContactForm endpoint={content.endpoint ?? ''} onValidate={validateContactForm} />
        ) : (
          <ScheduleCallCTA scheduleUrl={content.scheduleUrl ?? ''} />
        )}
      </div>
    </section>
  );
}

export interface ContactFormProps {
  /** Separately hosted submission endpoint (Req 14.4). */
  endpoint: string;
  /** Pure validation function returning field-level errors (Req 6.5, 6.6). */
  onValidate: (values: ContactFormValues) => FieldError[];
}

/** Shared classes for text inputs / textarea: visible focus and 44px tap targets. */
const fieldClasses =
  'w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 ' +
  'text-base text-white placeholder:text-slate-400 ' +
  'focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400';

/**
 * The contact form. Validates before submitting, POSTs JSON to `endpoint`,
 * confirms success within the 2-second budget, and retains input on failure.
 */
export function ContactForm({ endpoint, onValidate }: ContactFormProps): JSX.Element {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const messageId = `${baseId}-message`;
  const formErrorId = `${baseId}-form-error`;

  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });

  const isSubmitting = submit.status === 'submitting';

  const errorFor = (field: keyof ContactFormValues): string | undefined =>
    errors.find((e) => e.field === field)?.message;

  const update =
    (field: keyof ContactFormValues) =>
    (event: { target: { value: string } }): void => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    // Guard against duplicate submissions while a request is in flight.
    if (isSubmitting) {
      return;
    }

    // Client-side validation runs before any network call (Req 6.5, 6.6).
    const validationErrors = onValidate(values);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setSubmit({ status: 'submitting' });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Success: confirm and clear inputs within the perceived budget (Req 6.4).
        setSubmit({ status: 'success' });
        setValues(EMPTY_VALUES);
      } else {
        // Non-2xx: treat as a server error and retain the user's input (Req 6.7).
        setSubmit({ status: 'error', retainedValues: values });
      }
    } catch {
      // Network failure (rejected promise): retain the user's input (Req 6.7).
      setSubmit({ status: 'error', retainedValues: values });
    }
  }

  return (
    <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor={nameId} className="block text-sm font-medium text-slate-200">
          Name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          value={values.name}
          onChange={update('name')}
          disabled={isSubmitting}
          aria-invalid={errorFor('name') ? true : undefined}
          aria-describedby={errorFor('name') ? `${nameId}-error` : undefined}
          className={`mt-1 ${fieldClasses}`}
        />
        {errorFor('name') && (
          <p id={`${nameId}-error`} className="mt-1 text-sm text-red-400">
            {errorFor('name')}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          value={values.email}
          onChange={update('email')}
          disabled={isSubmitting}
          aria-invalid={errorFor('email') ? true : undefined}
          aria-describedby={errorFor('email') ? `${emailId}-error` : undefined}
          className={`mt-1 ${fieldClasses}`}
        />
        {errorFor('email') && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-red-400">
            {errorFor('email')}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={messageId} className="block text-sm font-medium text-slate-200">
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={5}
          value={values.message}
          onChange={update('message')}
          disabled={isSubmitting}
          aria-invalid={errorFor('message') ? true : undefined}
          aria-describedby={errorFor('message') ? `${messageId}-error` : undefined}
          className={`mt-1 ${fieldClasses}`}
        />
        {errorFor('message') && (
          <p id={`${messageId}-error`} className="mt-1 text-sm text-red-400">
            {errorFor('message')}
          </p>
        )}
      </div>

      {/* Submission-level error (network/server) — retains input (Req 6.7). */}
      {submit.status === 'error' && (
        <p id={formErrorId} role="alert" className="text-sm text-red-400">
          Something went wrong and your message couldn&apos;t be sent. Please try again.
        </p>
      )}

      {/* Success confirmation (Req 6.4). */}
      {submit.status === 'success' && (
        <p role="status" className="text-sm text-cyan-400">
          Thanks for reaching out. We&apos;ll be in touch soon.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-describedby={submit.status === 'error' ? formErrorId : undefined}
        className={
          'inline-flex min-h-[44px] items-center justify-center rounded-md bg-cyan-500 px-6 py-2.5 ' +
          'text-base font-semibold text-slate-950 transition-colors ' +
          'hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ' +
          'focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

export interface ScheduleCallCTAProps {
  /** Destination opened in a new browser tab (Req 6.8). */
  scheduleUrl: string;
}

/**
 * The "Schedule a call" Primary CTA. Opens the scheduling destination in a new
 * browser tab (Req 6.8).
 */
export function ScheduleCallCTA({ scheduleUrl }: ScheduleCallCTAProps): JSX.Element {
  return (
    <a
      href={scheduleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'inline-flex min-h-[44px] items-center justify-center rounded-md bg-cyan-500 px-6 py-2.5 ' +
        'text-base font-semibold text-slate-950 transition-colors ' +
        'hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ' +
        'focus:ring-offset-slate-950'
      }
    >
      Schedule a call
    </a>
  );
}

export default ContactSection;
