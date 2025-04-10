import type { AboutPageSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createAboutPageSchema(): AboutPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "GoFlow Plumbing Story and Mission",
    "description": "Learn about GoFlow Plumbing's commitment to excellence in Sonoma and Marin County. Professional plumbing services backed by years of experience.",
    "mainEntity": {
      ...businessInfo,
      "@type": "Plumber",
      "description": "Professional plumbing services in Sonoma and Marin County",
      "@id": "https://goflow.plumbing/#business",
      "foundingDate": "2025-03-24",
      "founder": [
        {
          "@type": "Person",
          "name": "Adam Bragg",
          "jobTitle": "Founder & CEO",
          "description": "Master plumber with over 15 years of experience in residential and commercial plumbing",
          "url": "https://goflow.plumbing/team#adam-bragg",
          "image": "https://goflow.plumbing/team/adam-bragg.jpg"
        }
      ],
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": 5
      },
      "hasCredential": [
        {
          "@type": "Credential",
          "name": "California State Contractors License",
          "credentialCategory": "Professional License",
          "validFrom": "2025-03-24"
        },
        {
          "@type": "Credential",
          "name": "Master Plumber Certification",
          "credentialCategory": "Professional Certification"
        }
      ],
      "slogan": "Professional Plumbing Services You Can Trust",
      "brand": {
        "@type": "Brand",
        "name": "GoFlow Plumbing",
        "description": "GoFlow Plumbing is your trusted local plumbing service provider in Sonoma and Marin County, offering 24/7 emergency service and a full range of residential and commercial plumbing solutions.",
        "logo": "https://goflow.plumbing/GoFlow2.jpg"
      },
      "areaServed": {
        "@type": "State",
        "name": "California",
        "containsPlace": [
          {
            "@type": "County",
            "name": "Sonoma County"
          },
          {
            "@type": "County",
            "name": "Marin County"
          }
        ]
      }
    }
  };
}
