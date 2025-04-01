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
    "postalCode": "95476",
    "addressCountry": "US"
  },
  "location": {
    "@type": "GeoCoordinates",
    "latitude": "38.3147602",
    "longitude": "-122.4849469"
  },
  "url": "https://goflow.plumbing",
  "priceRange": "$$",
  "areaServed": ["Sonoma County", "Marin County"],
  "openingHours": ["Mo-Su 00:00-23:59"]
};

export function createServiceSchema(serviceName: string, serviceType: string, serviceUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "serviceProvider": businessInfo,
    "areaServed": ["Sonoma County", "Marin County"],
    "serviceType": serviceType,
    "url": serviceUrl
  };
}

export function createServiceListSchema(services: { title: string; description: string; url: string }[], regions: { data: { title: string; description: string; containsPlace?: string[] } }[]) {
  const businessId = "https://goflow.plumbing/#business";
  const { '@type': _, '@id': __, ...businessInfoWithoutTypeAndId } = businessInfo;
  
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": businessId,
      ...businessInfoWithoutTypeAndId
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://goflow.plumbing/plumbing-services",
      "url": "https://goflow.plumbing/plumbing-services",
      "name": "Professional Plumbing Services in Sonoma & Marin County",
      "description": "Comprehensive plumbing services including water heater repair, drain cleaning, emergency services, and more.",
      "provider": { "@id": businessId },
      "about": services.map(service => ({
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "url": service.url,
        "provider": { "@id": businessId },
        "areaServed": regions.map(region => ({
          "@type": "AdministrativeArea",
          "name": region.data.title.replace(" Plumbing Services", ""),
          "description": region.data.description,
          "containsPlace": region.data.containsPlace
        }))
      }))
    }
  ];
}

export function createServiceRegionsSchema(regions: { data: { title: string; description: string; containsPlace?: string[] }, slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "mainEntity": {
      ...businessInfo,
      "areaServed": regions.map((region, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Service",
          "name": region.data.title,
          "description": region.data.description,
          "provider": { "@id": "https://goflow.plumbing/#business" },
          "areaServed": {
            "@type": "County",
            "name": region.data.title,
            "description": region.data.description,
            ...(region.data.containsPlace && { "containsPlace": region.data.containsPlace })
          },
          "url": new URL(region.slug, "https://goflow.plumbing").toString()
        }
      }))
    }
  }
}

export function createArticleSchema(article: {
  title: string;
  description: string;
  pubDate: Date;
  url: string;
  heroImage?: string;
  wordCount?: number;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.pubDate.toISOString(),
    "dateModified": article.pubDate.toISOString(),
    "author": {
      "@type": "Organization",
      "@id": "https://goflow.plumbing/#organization",
      "name": businessInfo.name,
      "telephone": businessInfo.telephone,
      "url": "https://goflow.plumbing"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://goflow.plumbing/#organization",
      "name": businessInfo.name,
      "telephone": businessInfo.telephone,
      "url": "https://goflow.plumbing"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "image": article.heroImage || "https://goflow.plumbing/GoFlow2.jpg",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "keywords": article.keywords || [],
    "wordCount": article.wordCount,
    "articleSection": "Plumbing",
    "genre": "Professional Services"
  };
}

export function createOrganizationSchema() {
  const { '@type': _, ...rest } = businessInfo;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...rest,
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61574410838549",
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
