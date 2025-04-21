import type { TeamPageSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createTeamPageSchema(url: string): TeamPageSchema {
  const canonicalUrl = new URL(url, 'https://goflow.plumbing').toString();
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${canonicalUrl}#webpage`,
    "url": canonicalUrl,
    "name": "GoFlow Plumbing Team",
    "description": "Meet the skilled and experienced plumbing professionals at GoFlow Plumbing serving Sonoma and Marin County.",
    "mainEntity": {
      "@context": "https://schema.org",
      "@type": "Plumber",
      "@id": "https://goflow.plumbing/#business",
      "name": businessInfo.name,
      "description": "Professional plumbing services in Sonoma and Marin County",
      "url": "https://goflow.plumbing",
      "telephone": "(707) 200-8350",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "10 Pine Ave",
        "addressLocality": "Sonoma",
        "addressRegion": "CA",
        "postalCode": "95476",
        "addressCountry": "US"
      },
      "contactPoint": [{
        "@type": "ContactPoint",
        "telephone": "(707) 200-8350",
        "contactType": "customer service",
        "areaServed": [{
          "@type": "AdministrativeArea",
          "name": "Sonoma County"
        }, {
          "@type": "AdministrativeArea",
          "name": "Marin County"
        }]
      }],
      "employee": [
        {
          "@type": "Person",
          "name": "Adam Bragg",
          "jobTitle": "Founder & Master Plumber",
          "description": "Master plumber with over 15 years of experience in residential and commercial plumbing. Licensed contractor and certified in advanced plumbing techniques.",
          "url": "https://goflow.plumbing/team#adam-bragg",
          "image": "https://goflow.plumbing/team/adam-bragg.jpg",
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "California State Contractors License",
              "credentialCategory": "Professional License",
              "validFrom": "2025-03-24"
            },
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Master Plumber Certification",
              "credentialCategory": "Professional Certification"
            }
          ]
        },
        {
          "@type": "Person",
          "name": "Sarah Chen",
          "jobTitle": "Lead Service Plumber",
          "description": "Experienced service plumber specializing in residential repairs and maintenance. Expert in modern plumbing technologies and eco-friendly solutions.",
          "url": "https://goflow.plumbing/team#sarah-chen",
          "image": "https://goflow.plumbing/team/sarah-chen.jpg",
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Journeyman Plumber License",
              "credentialCategory": "Professional License"
            }
          ]
        }
      ],
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": 5
      },
      "areaServed": {
        "@type": "State",
        "name": "California",
        "containsPlace": [
          {
            "@type": "AdministrativeArea",
            "name": "Sonoma County"
          },
          {
            "@type": "AdministrativeArea",
            "name": "Marin County"
          }
        ]
      }
    }
  };
}
