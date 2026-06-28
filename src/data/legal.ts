/**
 * Legal document content for the `/privacy`, `/terms`, and `/cookies` routes.
 *
 * `LegalPage` is a single param-driven template (design "12. /privacy · /terms
 * · /cookies"); this module is its typed content source. Each `LegalDoc` holds
 * a title, a human-readable last-updated label, and an ordered list of
 * `LegalSection`s. Section `id`s are stable slugs used both as the heading
 * anchor (`<h2 id>`) and as the auto-generated table-of-contents target, so
 * they MUST be unique within a document.
 *
 * Copy here is realistic placeholder long-form content — it conveys the shape
 * and tone of each policy without being legal advice; replace with
 * counsel-reviewed text before launch.
 *
 * Requirements: 17.1 (long-form content per route with TOC + last-updated).
 */

/** A single titled block of body copy within a legal document. */
export interface LegalSection {
  /** Stable, unique-within-document slug used as the heading anchor + TOC target. */
  id: string;
  /** Section heading, rendered as an `<h2 id={id}>`. */
  heading: string;
  /** One or more paragraphs of body copy. */
  body: string[];
}

/** A complete legal document rendered by the param-driven `LegalPage`. */
export interface LegalDoc {
  /** Route slug this document is served at. */
  slug: 'privacy' | 'terms' | 'cookies';
  /** Document title, rendered as the page's sole `<h1>`. */
  title: string;
  /** Human-readable last-updated label (e.g. "January 15, 2025"). */
  lastUpdated: string;
  /** Ordered sections composing the document. */
  sections: LegalSection[];
}

const privacy: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: 'January 15, 2025',
  sections: [
    {
      id: 'overview',
      heading: 'Overview',
      body: [
        'Ryze Technology ("Ryze", "we", "us") builds software for clients and operates this website. This Privacy Policy explains what information we collect when you visit our site or work with us, why we collect it, and the choices you have.',
        'We aim to collect as little as possible, keep it only as long as we need it, and never sell it. If anything here is unclear, reach out and we will walk you through it.',
      ],
    },
    {
      id: 'information-we-collect',
      heading: 'Information We Collect',
      body: [
        'When you submit our contact form we collect the details you choose to share — typically your name, email address, and the message describing your project. We use this solely to respond to your enquiry.',
        'Like most websites, we also log basic technical data such as your browser type, approximate region, and the pages you visit. This is aggregated and helps us understand how the site is used.',
      ],
    },
    {
      id: 'how-we-use-information',
      heading: 'How We Use Information',
      body: [
        'We use the information we collect to reply to enquiries, deliver and improve our services, maintain the security of our systems, and meet our legal obligations.',
        'We do not use your personal information to build advertising profiles, and we do not sell or rent it to third parties.',
      ],
    },
    {
      id: 'data-sharing',
      heading: 'Data Sharing',
      body: [
        'We share information only with the service providers that help us operate — for example, hosting and email delivery vendors — and only to the extent they need it to perform their work on our behalf.',
        'We may also disclose information where required by law, or to protect the rights, safety, and property of Ryze, our clients, or the public.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your Rights',
      body: [
        'Depending on where you live, you may have the right to access, correct, export, or delete the personal information we hold about you, and to object to or restrict certain processing.',
        'To exercise any of these rights, email us and we will respond within the timeframe required by applicable law.',
      ],
    },
    {
      id: 'contact-us',
      heading: 'Contact Us',
      body: [
        'Questions about this policy or your data can be sent to ryzetechonologyy@gmail.com. We read every message and will help you sort out whatever you need.',
      ],
    },
  ],
};

const terms: LegalDoc = {
  slug: 'terms',
  title: 'Terms of Service',
  lastUpdated: 'January 15, 2025',
  sections: [
    {
      id: 'acceptance',
      heading: 'Acceptance of Terms',
      body: [
        'By accessing this website you agree to these Terms of Service. If you do not agree with any part of them, please do not use the site.',
        'We may update these terms from time to time; continued use of the site after a change means you accept the revised terms.',
      ],
    },
    {
      id: 'use-of-site',
      heading: 'Use of the Site',
      body: [
        'You may browse and use this site for lawful purposes only. You agree not to interfere with its operation, attempt to gain unauthorized access, or use it to transmit harmful or unlawful content.',
        'We may suspend or restrict access to the site at any time if we reasonably believe it is being misused.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual Property',
      body: [
        'The content on this site — including text, design, graphics, and code — is owned by Ryze Technology or its licensors and is protected by intellectual property laws.',
        'You may not copy, reproduce, or redistribute our content without our prior written permission, except as permitted by law.',
      ],
    },
    {
      id: 'disclaimers',
      heading: 'Disclaimers',
      body: [
        'This site and its content are provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the site will be uninterrupted, error-free, or free of harmful components.',
        'Any information presented here is for general purposes and does not constitute professional, legal, or financial advice.',
      ],
    },
    {
      id: 'limitation-of-liability',
      heading: 'Limitation of Liability',
      body: [
        'To the fullest extent permitted by law, Ryze Technology will not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, this site.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing Law',
      body: [
        'These terms are governed by the laws of the jurisdiction in which Ryze Technology is established, without regard to its conflict-of-law principles.',
        'Any disputes arising under these terms will be subject to the exclusive jurisdiction of the courts of that jurisdiction.',
      ],
    },
  ],
};

const cookies: LegalDoc = {
  slug: 'cookies',
  title: 'Cookie Policy',
  lastUpdated: 'January 15, 2025',
  sections: [
    {
      id: 'what-are-cookies',
      heading: 'What Are Cookies',
      body: [
        'Cookies are small text files placed on your device when you visit a website. They help the site remember your actions and preferences over a period of time.',
        'Similar technologies such as local storage can serve comparable purposes; where we refer to "cookies" we mean these technologies collectively.',
      ],
    },
    {
      id: 'how-we-use-cookies',
      heading: 'How We Use Cookies',
      body: [
        'We use a small number of cookies to keep the site working correctly and to understand, in aggregate, how it is used so we can improve it.',
        'We do not use cookies to build cross-site advertising profiles.',
      ],
    },
    {
      id: 'types-of-cookies',
      heading: 'Types of Cookies We Use',
      body: [
        'Essential cookies are necessary for the site to function and cannot be switched off in our systems. They are usually set in response to actions you take, such as setting your privacy preferences.',
        'Analytics cookies help us count visits and traffic sources so we can measure and improve performance. All information these cookies collect is aggregated.',
      ],
    },
    {
      id: 'managing-cookies',
      heading: 'Managing Cookies',
      body: [
        'Most browsers let you refuse or delete cookies through their settings. Doing so may affect how parts of the site function.',
        'You can also use private browsing modes to limit the cookies stored on your device.',
      ],
    },
    {
      id: 'changes-to-this-policy',
      heading: 'Changes to This Policy',
      body: [
        'We may update this Cookie Policy to reflect changes to the cookies we use or for operational, legal, or regulatory reasons. The last-updated date above shows when it was most recently revised.',
      ],
    },
  ],
};

/** All legal documents keyed by their route slug. */
export const legalDocs: Record<'privacy' | 'terms' | 'cookies', LegalDoc> = {
  privacy,
  terms,
  cookies,
};

export default legalDocs;
