import type { FAQPageSchema } from '../types/schema';

export function createFAQPageSchema(): FAQPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you offer emergency plumbing services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we provide 24/7 emergency plumbing services throughout Sonoma and Marin Counties. Our emergency response team is always ready to help with urgent plumbing issues."
        }
      },
      {
        "@type": "Question",
        "name": "What areas do you serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve both Sonoma County (including Santa Rosa, Petaluma, and Rohnert Park) and Marin County (including San Rafael, Novato, and Mill Valley)."
        }
      },
      {
        "@type": "Question",
        "name": "Are you licensed and insured?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we are fully licensed, bonded, and insured plumbing contractors in California. Our team consists of experienced, certified plumbers."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept cash, credit cards, and checks for all our plumbing services."
        }
      }
    ]
  };
}
