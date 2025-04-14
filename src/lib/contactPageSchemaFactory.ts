import type { ContactPageSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createContactPageSchema(): ContactPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact GoFlow Plumbing",
    "description": "Contact GoFlow Plumbing for professional plumbing services in Sonoma and Marin County. Available 24/7 for emergency service.",
    "mainEntity": {
      "@type": "Plumber",
      "@id": "https://goflow.plumbing/#business",
      "name": "GoFlow Plumbing",
      "image": "https://goflow.plumbing/GoFlow2.jpg",
      "telephone": businessInfo.telephone,
      "priceRange": businessInfo.priceRange || "$$",
      "address": businessInfo.address,
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "(707) 200-8350",
          "email": "info@goflow.plumbing",
          "availableLanguage": ["English"],
          "areaServed": [
            {
              "@type": "County",
              "name": "Sonoma County"
            },
            {
              "@type": "County",
              "name": "Marin County"
            }
          ],
          "hoursAvailable": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            }
          ]
        },
        {
          "@type": "ContactPoint",
          "contactType": "emergency service",
          "telephone": "(707) 200-8350",
          "availableLanguage": ["English"],
          "hoursAvailable": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            }
          ]
        }
      ],
      "potentialAction": [
        {
          "@type": "CommunicateAction",
          "name": "Call for Service",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "tel:+17072008350",
            "actionPlatform": [
              "http://schema.org/MobileWebPlatform",
              "http://schema.org/DesktopWebPlatform"
            ]
          }
        },
        {
          "@type": "CommunicateAction",
          "name": "Email Us",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "mailto:info@goflow.plumbing",
            "actionPlatform": [
              "http://schema.org/MobileWebPlatform",
              "http://schema.org/DesktopWebPlatform"
            ]
          }
        }
      ]
    }
  };
}
