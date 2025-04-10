import type { PlumberSchema } from '../types/schema';

export const businessInfo: Omit<PlumberSchema, '@context'> = {
  "@type": "Plumber",
  "@id": "https://goflow.plumbing/#business",
  "name": "GoFlow Plumbing",
  "telephone": "(916) 719-1897",
  "email": "info@goflow.plumbing",
  "image": "https://goflow.plumbing/GoFlow2.jpg",
  "description": "Professional plumbing services in Sonoma and Marin County",
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
  "paymentAccepted": ["Cash", "Credit Card", "Check"],
  "currenciesAccepted": "USD",
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61574410838549",
    "https://www.yelp.com/biz/goflow-plumbing-sonoma"
  ]
};
