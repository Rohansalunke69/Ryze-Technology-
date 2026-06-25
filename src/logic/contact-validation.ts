/**
 * Pure contact-form validation logic for the Ryze Portfolio Website.
 *
 * These functions are side-effect free and DOM-free so they can be unit- and
 * property-tested in isolation from React (see design.md "Pure Logic Interfaces").
 *
 * _Requirements: 6.3, 6.4, 6.5, 6.6_
 */

import type { ContactFormValues, FieldError } from '@apptypes/form';

/**
 * Reasonable syntactic check for an email address.
 *
 * This is intentionally a *syntactic* check (Requirements 6.4, 6.6), not a
 * deliverability check. It requires a single `@` separating a non-empty local
 * part from a domain that has at least one dot-separated label and a TLD, with
 * no whitespace anywhere.
 */
export function isSyntacticallyValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }

  // No leading/trailing whitespace and no internal whitespace allowed.
  if (email.trim() !== email || /\s/.test(email)) {
    return false;
  }

  if (email.length === 0) {
    return false;
  }

  // local@domain — exactly one "@", non-empty local part, dotted domain
  // with a TLD of at least two characters and no consecutive dots.
  const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validate the contact form values.
 *
 * Returns:
 *  - one error for `name` when it is empty after trimming whitespace,
 *  - one error for `message` when it is empty after trimming whitespace,
 *  - one error for `email` when it is empty OR non-empty but syntactically
 *    invalid (email is a required field).
 *
 * Returns an empty array if and only if `name` and `message` are non-empty
 * after trimming AND `email` is syntactically valid. No spurious errors are
 * ever produced.
 */
export function validateContactForm(values: ContactFormValues): FieldError[] {
  const errors: FieldError[] = [];

  if (values.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required.' });
  }

  if (!isSyntacticallyValidEmail(values.email)) {
    const message =
      values.email.trim().length === 0
        ? 'Email is required.'
        : 'Please enter a valid email address.';
    errors.push({ field: 'email', message });
  }

  if (values.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required.' });
  }

  return errors;
}
