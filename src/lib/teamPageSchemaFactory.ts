import type { TeamPageSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createTeamPageSchema(): TeamPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "GoFlow Plumbing Team",
    "description": "Meet the skilled and experienced plumbing professionals at GoFlow Plumbing serving Sonoma and Marin County.",
    "mainEntity": {
      ...businessInfo,
      "@type": "Plumber",
      "description": "Professional plumbing services in Sonoma and Marin County",
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
              "@type": "Credential",
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
