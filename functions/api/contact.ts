/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Receives Contact_Form submissions (same-origin) from `ContactForm`, validates
 * them, and delivers them by email. Delivery provider is chosen by the env vars
 * configured in the Cloudflare Pages project (Settings → Environment variables):
 *
 *   RESEND_API_KEY      — if set, the message is sent via Resend (recommended).
 *   CONTACT_TO_EMAIL    — recipient inbox (defaults to the studio gmail).
 *   CONTACT_FROM_EMAIL  — verified "from" address for Resend
 *                         (defaults to onboarding@resend.dev for first-run tests).
 *   CONTACT_WEBHOOK_URL — alternative: POST the JSON payload to any webhook
 *                         (Zapier/Make/Formspree/Discord/Slack) if no Resend key.
 *
 * If NO provider is configured the function responds 503 so the form shows its
 * built-in "Try again / email us directly" fallback instead of silently losing
 * the message. CORS is same-origin only (the form posts to its own origin).
 *
 * Security: no secrets are bundled in the static client; everything sensitive is
 * read from the runtime env. Inputs are length-capped and HTML-escaped before
 * being placed in the email body.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_WEBHOOK_URL?: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  projectType?: string;
  timeline?: string;
  message?: string;
}

const DEFAULT_TO = 'ryzetechonologyy@gmail.com';
const DEFAULT_FROM = 'Ryze Website <onboarding@resend.dev>';
const MAX_FIELD = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Trim + hard-cap a field so a hostile payload can't blow up the email body. */
function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD) : '';
}

/** Escape user text for safe inclusion in the HTML email body. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Parse JSON defensively.
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const name = clean(payload.name);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const company = clean(payload.company);
  const projectType = clean(payload.projectType);
  const timeline = clean(payload.timeline);
  const message = clean(payload.message);

  // Mirror the client-side required-field validation (name, email, message).
  if (name.length === 0 || email.length === 0 || message.length === 0) {
    return json({ ok: false, error: 'Missing required fields.' }, 422);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Invalid email address.' }, 422);
  }

  const to = env.CONTACT_TO_EMAIL ?? DEFAULT_TO;
  const subject = `New enquiry — ${name}${company ? ` (${company})` : ''}`;
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    company ? `Company: ${company}` : '',
    projectType ? `Project type: ${projectType}` : '',
    timeline ? `Timeline: ${timeline}` : '',
    '',
    'Message:',
    message,
  ].filter((l) => l.length > 0 || l === '');
  const text = lines.join('\n');
  const html =
    `<table style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6">` +
    `<tr><td><strong>Name</strong></td><td>${esc(name)}</td></tr>` +
    `<tr><td><strong>Email</strong></td><td>${esc(email)}</td></tr>` +
    (phone ? `<tr><td><strong>Phone</strong></td><td>${esc(phone)}</td></tr>` : '') +
    (company ? `<tr><td><strong>Company</strong></td><td>${esc(company)}</td></tr>` : '') +
    (projectType ? `<tr><td><strong>Project type</strong></td><td>${esc(projectType)}</td></tr>` : '') +
    (timeline ? `<tr><td><strong>Timeline</strong></td><td>${esc(timeline)}</td></tr>` : '') +
    `</table>` +
    `<hr/><p style="font-family:system-ui,sans-serif;white-space:pre-wrap">${esc(message)}</p>`;

  // 1) Preferred: Resend (transactional email).
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM,
          to: [to],
          reply_to: email,
          subject,
          text,
          html,
        }),
      });
      if (!res.ok) {
        return json({ ok: false, error: 'Email provider rejected the message.' }, 502);
      }
      return json({ ok: true }, 200);
    } catch {
      return json({ ok: false, error: 'Email provider unreachable.' }, 502);
    }
  }

  // 2) Alternative: forward the raw payload to a configured webhook.
  if (env.CONTACT_WEBHOOK_URL) {
    try {
      const res = await fetch(env.CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, projectType, timeline, message }),
      });
      if (!res.ok) {
        return json({ ok: false, error: 'Webhook rejected the message.' }, 502);
      }
      return json({ ok: true }, 200);
    } catch {
      return json({ ok: false, error: 'Webhook unreachable.' }, 502);
    }
  }

  // 3) No provider configured — fail loudly so the form shows its mailto
  //    fallback rather than pretending the message was delivered.
  return json(
    { ok: false, error: 'Contact endpoint is not configured yet.' },
    503,
  );
};
