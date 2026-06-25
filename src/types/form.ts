/**
 * Contact form value, error, and submission state types.
 */

/** The user-entered contact form values. */
export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

/** A field-level validation error. */
export type FieldError = {
  field: keyof ContactFormValues;
  message: string;
};

/** Discriminated union describing the contact form submission lifecycle. */
export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; retainedValues: ContactFormValues };
