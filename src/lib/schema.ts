import type { Organization, PostalAddress, GeoCoordinates, GeoCircle, OpeningHoursSpecification, ContactPoint } from 'schema-dts';

import type { BaseSchema } from '../types/schema';

type PlumberOrganization = BaseSchema & {
  '@context': 'https://schema.org';
  '@type': 'Plumber';
  '@id'?: string;
  name: string;
  url: string;
  email?: string;
  telephone?: string;
  description?: string;
  image?: string;
  contactPoint: ContactPoint[];
  address: PostalAddress;
  geo?: GeoCoordinates;
  areaServed?: string[] | Array<{
    '@type': 'AdministrativeArea';
    name: string;
  }>;
  serviceArea?: {
    '@type': 'GeoCircle';
    geoMidpoint: GeoCoordinates;
    geoRadius: string;
  };
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  paymentAccepted?: string[];
  currenciesAccepted?: string;
  sameAs?: string[];
};

export const businessInfo: PlumberOrganization = {
  "@context": "https://schema.org",
  "@type": "Plumber",
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "(707) 200-8350",
    "contactType": "customer service"
  }],
  "@id": "https://goflow.plumbing/#business",
  "name": "GoFlow Plumbing",

  "email": "info@goflow.plumbing",
  "image": "https://goflow.plumbing/GoFlow2.jpg",
  "description": "Residential plumbing services in Sonoma and Marin County",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "10 Pine Ave",
    "addressLocality": "Sonoma",
    "addressRegion": "CA",
    "postalCode": "95476",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 38.3147602,
    "longitude": -122.4849469
  },
  "url": "https://goflow.plumbing",
  "areaServed": ["Sonoma County", "Marin County"],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 38.3147602,
      "longitude": -122.4849469
    },
    "geoRadius": "50"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "priceRange": "$$",
  "paymentAccepted": ["Cash", "Credit Card", "Check", "PayPal", "Venmo", "Bitcoin"],
  "currenciesAccepted": "USD",
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61574410838549",
    "https://www.yelp.com/biz/goflow-plumbing-sonoma"
  ]
};
