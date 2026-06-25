import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isSyntacticallyValidEmail,
  validateContactForm,
} from './contact-validation';
import type { ContactFormValues } from '@apptypes/form';

// Example-based unit tests pin down concrete behavior and edge cases.
describe('isSyntacticallyValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isSyntacticallyValidEmail('alice@example.com')).toBe(true);
    expect(isSyntacticallyValidEmail('a.b+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects empty and whitespace-only input', () => {
    expect(isSyntacticallyValidEmail('')).toBe(false);
    expect(isSyntacticallyValidEmail('   ')).toBe(false);
  });

  it('rejects malformed shapes', () => {
    expect(isSyntacticallyValidEmail('plainaddress')).toBe(false);
    expect(isSyntacticallyValidEmail('missing@domain')).toBe(false);
    expect(isSyntacticallyValidEmail('@no-local.com')).toBe(false);
    expect(isSyntacticallyValidEmail('two@@at.com')).toBe(false);
    expect(isSyntacticallyValidEmail('spaces in@email.com')).toBe(false);
    expect(isSyntacticallyValidEmail(' leading@space.com')).toBe(false);
    expect(isSyntacticallyValidEmail('trailing@space.com ')).toBe(false);
    expect(isSyntacticallyValidEmail('dot@end.')).toBe(false);
  });
});

describe('validateContactForm', () => {
  it('returns no errors for a fully valid form', () => {
    expect(
      validateContactForm({
        name: 'Alice',
        email: 'alice@example.com',
        message: 'Hello there',
      }),
    ).toEqual([]);
  });

  it('flags each empty required field plus a required-email error', () => {
    const errors = validateContactForm({ name: '   ', email: '', message: '' });
    const fields = errors.map((e) => e.field).sort();
    expect(fields).toEqual(['email', 'message', 'name']);
  });

  it('flags an invalid (non-empty) email', () => {
    const errors = validateContactForm({
      name: 'Alice',
      email: 'not-an-email',
      message: 'Hi',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('email');
  });
});

// Feature: ryze-portfolio-website, Property 5: validateContactForm returns empty iff name and message non-empty after trim and email syntactically valid; otherwise exactly one error per empty field and one email error, no spurious errors
// Validates: Requirements 6.4, 6.5, 6.6
describe('Property 5: contact form validation produces exactly the correct error set', () => {
  // Whitespace characters used to build "empty after trim" strings.
  const whitespace = fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v', ' \t ');

  // A field value that is empty or whitespace-only (empty after trim).
  const blankField = fc.oneof(
    fc.constant(''),
    fc.array(whitespace, { maxLength: 4 }).map((parts) => parts.join('')),
  );

  // A field value that is guaranteed non-empty after trimming.
  const nonBlankField = fc
    .string({ minLength: 1 })
    .filter((s) => s.trim().length > 0);

  const anyField = fc.oneof(blankField, nonBlankField);

  // Known-valid emails plus arbitrary (often-invalid) strings, so the email
  // input space spans both valid and invalid syntactic shapes.
  const emailField = fc.oneof(
    fc.constantFrom(
      'alice@example.com',
      'bob.smith@mail.co',
      'c+tag@sub.domain.org',
      'user_name@host.io',
    ),
    blankField,
    fc.string(),
  );

  const valuesArb: fc.Arbitrary<ContactFormValues> = fc.record({
    name: anyField,
    email: emailField,
    message: anyField,
  });

  it('returns exactly the errors implied by the field conditions', () => {
    fc.assert(
      fc.property(valuesArb, (values) => {
        const errors = validateContactForm(values);
        const fields = errors.map((e) => e.field);

        // No duplicate field errors — at most one error per field.
        expect(new Set(fields).size).toBe(fields.length);

        // Only known fields can appear.
        for (const field of fields) {
          expect(['name', 'email', 'message']).toContain(field);
        }

        const nameInvalid = values.name.trim().length === 0;
        const messageInvalid = values.message.trim().length === 0;
        const emailInvalid = !isSyntacticallyValidEmail(values.email);

        // Each error appears if and only if its condition holds.
        expect(fields.includes('name')).toBe(nameInvalid);
        expect(fields.includes('message')).toBe(messageInvalid);
        expect(fields.includes('email')).toBe(emailInvalid);

        // Empty error list iff everything is valid.
        const allValid = !nameInvalid && !messageInvalid && !emailInvalid;
        expect(errors.length === 0).toBe(allValid);

        // Every error carries a non-empty message.
        for (const error of errors) {
          expect(error.message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 200 },
    );
  });
});
