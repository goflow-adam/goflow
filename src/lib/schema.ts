export const businessInfo = {
  "@type": "LocalBusiness",
  "@id": "https://goflow.plumbing/#business",
  "name": "GoFlow Plumbing",
  "telephone": "916-719-1897",
  "image": "https://goflow.plumbing/GoFlow2.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "10 Pine Ave",
    "addressLocality": "Sonoma",
    "addressRegion": "CA",
    "postalCode": "95476"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.3147602",
    "longitude": "-122.4849469"
  },
  "url": "https://goflow.plumbing",
  "priceRange": "$$",
  "areaServed": ["Sonoma County", "Marin County"],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  }
};

export function createServiceSchema(serviceName: string, serviceType: string, serviceUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "provider": businessInfo,
    "areaServed": ["Sonoma County", "Marin County"],
    "serviceType": serviceType,
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceType": serviceType,
      "availabilityStarts": "00:00:01",
      "availabilityEnds": "23:59:59",
      "serviceUrl": serviceUrl
    }
  };
}

export function createArticleSchema(article: {
  title: string;
  description: string;
  pubDate: Date;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.pubDate.toISOString(),
    "dateModified": article.pubDate.toISOString(),
    "author": businessInfo,
    "publisher": businessInfo,
    "mainEntityOfPage": article.url,
    "image": "https://goflow.plumbing/GoFlow2.jpg"
  };
}

export function createOrganizationSchema() {
  const { '@type': _, ...rest } = businessInfo;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...rest,
    "sameAs": [
      "https://www.facebook.com/goflowplumbing",
      "https://www.yelp.com/biz/goflow-plumbing-sonoma"
    ]
  };
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GoFlow Plumbing",
    "url": "https://goflow.plumbing",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://goflow.plumbing/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

export function createRegionSchema(region: {
  title: string;
  description: string;
  region: string;
  url: string;
  containsPlace?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": region.title,
    "description": region.description,
    "provider": {
      ...businessInfo,
      "areaServed": {
        "@type": "County",
        "name": region.region,
        ...(region.containsPlace && { "containsPlace": region.containsPlace })
      }
    },
    "areaServed": region.region,
    "serviceType": "Plumbing Service",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceType": "Plumbing Service",
      "availabilityStarts": "00:00:01",
      "availabilityEnds": "23:59:59",
      "serviceUrl": region.url
    }
  };
}
