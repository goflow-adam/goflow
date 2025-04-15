import type { CollectionEntry } from 'astro:content';
import type { Schema, ServiceSchema, ArticleSchema, PlumberSchema, WebSiteSchema, OrganizationSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createServicePageSchema(service: CollectionEntry<'services'>): ServiceSchema {
  // Define service-specific details
  const serviceDetails: Record<string, { output: string, time: string }> = {
    'clogged-drains-rootered': {
      output: 'Clear, properly flowing drains with no clogs or backups',
      time: 'PT2H'
    },
    'water-heater-repair-and-replacement': {
      output: 'Fully functional water heater providing consistent hot water',
      time: 'PT4H'
    },
    'emergency-plumbing-services': {
      output: 'Resolved plumbing emergency with minimal disruption',
      time: 'PT1H'
    },
    'leak-detection-and-repair': {
      output: 'Identified and repaired leaks with no residual water damage',
      time: 'PT3H'
    },
    'garbage-disposal-repair-or-installation': {
      output: 'Fully functional garbage disposal with proper installation and optimal performance',
      time: 'PT1H30M'
    },
    'faucet-leaks-repaired': {
      output: 'Leak-free faucet with proper water flow and operation',
      time: 'PT1H'
    },
    'pipe-repair-and-replacement': {
      output: 'Properly sealed and functioning pipes with no leaks',
      time: 'PT3H'
    },
    'sewer-line-repair-and-replacement': {
      output: 'Fully functional sewer line with proper flow and no blockages',
      time: 'PT8H'
    }
  };

  const serviceDetail = serviceDetails[service.slug] || {
    output: 'Professional plumbing solution with guaranteed satisfaction',
    time: 'PT3H'
  };

  return {
    "@context": "https://schema.org",
    "@type": "PlumbingService",
    "name": service.data.title,
    "description": service.data.description,
    "provider": {
      "@id": "https://goflow.plumbing/#business"
    },
    "telephone": businessInfo.telephone,
    "priceRange": businessInfo.priceRange || "$$",
    "address": businessInfo.address,
    "image": service.data.heroImage || "https://goflow.plumbing/GoFlow2.jpg",
    "areaServed": Array.isArray(businessInfo.areaServed) ? 
      businessInfo.areaServed.map(area => ({
        "@type": "County" as const,
        "name": typeof area === 'string' ? area : area.name
      })) : 
      [],
    "url": `https://goflow.plumbing/${service.slug}`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceRange": "$$",
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 38.3147602,
          "longitude": -122.4849469
        },
        "geoRadius": "50"
      }
    },
    "serviceOutput": {
      "@type": "HomeAndConstructionBusiness",
      "name": service.data.title,
      "description": serviceDetail.output,
      "address": businessInfo.address,
      "telephone": businessInfo.telephone,
      "url": `https://goflow.plumbing/${service.slug}`,
      "areaServed": businessInfo.areaServed
    },
    "category": "Plumbing",
    "timeRequired": serviceDetail.time
  };
}

export function createArticlePageSchema(article: CollectionEntry<'articles'>): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.data.title,
    "description": article.data.description,
    "datePublished": article.data.pubDate.toISOString(),
    "dateModified": article.data.updatedDate?.toISOString() || article.data.pubDate.toISOString(),
    "author": {
      "@id": "https://goflow.plumbing/#business",
      ...businessInfo
    },
    "publisher": {
      "@id": "https://goflow.plumbing/#business",
      ...businessInfo
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://goflow.plumbing/articles/${article.slug}`
    },
    "image": article.data.heroImage || "https://goflow.plumbing/GoFlow2.jpg",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "keywords": article.data.tags || [],
    "articleSection": article.data.category,
    "genre": "Professional Services"
  };
}

export function createRegionPageSchema(region: CollectionEntry<'regions'>): PlumberSchema {
  // Extract the name without 'Plumbing Services'
  const name = region.data.title.replace(/ Plumbing Services.*$/, '');
  const isCounty = name.toLowerCase().includes('county');

  return {
    "@context": "https://schema.org",
    ...businessInfo,
    "name": businessInfo.name,
    "description": region.data.description,
    "url": `https://goflow.plumbing/regions/${region.slug}`,
    "areaServed": [{
      "@type": isCounty ? "County" : "City",
      "name": name,
      "description": region.data.description,
      ...(isCounty && Array.isArray(region.data.containsPlace) && {
        "containsPlace": region.data.containsPlace.map(place => 
          Array.isArray(place) ? place[0] : place
        )
      })
    }],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${region.data.region} Plumbing Services`,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "PlumbingService",
            "name": "Emergency Plumbing",
            "description": `24/7 emergency plumbing services in ${region.data.region}`
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "PlumbingService",
            "name": "Residential Plumbing",
            "description": `Complete home plumbing services for ${region.data.region} residents`
          }
        }
      ]
    }
  };
}

export function createOrganizationSchema(): OrganizationSchema {
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

export function createWebSiteSchema(): WebSiteSchema {
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

export function createServiceListSchema(services: { title: string; description: string; url: string }[], regions: CollectionEntry<'regions'>[]): Schema[] {
  const businessId = "https://goflow.plumbing/#business";
  const { '@type': _, '@id': __, ...businessInfoWithoutTypeAndId } = businessInfo;

  // Create shared area definitions
  const areaDefinitions = regions.map((region, index) => {
    const name = region.data.title.replace(/ Plumbing Services.*$/, '').replace(/ for your home$/, '');
    const isCounty = name.toLowerCase().includes('county');
    const areaType = isCounty ? "County" as const : "City" as const;
    return {
      "@type": areaType,
      "@id": `https://goflow.plumbing/#${region.slug}`,
      "name": name,
      "description": region.data.description,
      "containsPlace": isCounty && Array.isArray(region.data.containsPlace) ?
        region.data.containsPlace.map(place => 
          Array.isArray(place) ? place[0] : place
        ) :
        []
    };
  });
  
  return [
    {
      "@context": "https://schema.org",
      "@type": "Plumber",
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
        "@type": "PlumbingService",
        "name": service.title,
        "description": service.description,
        "url": service.url,
        "provider": { "@id": businessId },
        "areaServed": areaDefinitions.map(area => ({
          "@id": area["@id"]
        }))
      }))
    },
    ...areaDefinitions.map(area => ({
      ...area,
      "@context": "https://schema.org" as const
    }))
  ];
}

export function createServiceRegionsSchema(regions: CollectionEntry<'regions'>[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "mainEntity": {
      ...businessInfo,
      "areaServed": regions.map((region, index) => {
        // Extract the name without 'Plumbing Services'
        const name = region.data.title.replace(/ Plumbing Services.*$/, '');
        
        // Determine if this is a county or city service area
        const isCounty = name.toLowerCase().includes('county');
        
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Service",
            "name": region.data.title,
            "description": region.data.description,
            "provider": { "@id": "https://goflow.plumbing/#business" },
            "areaServed": {
              "@type": isCounty ? "County" : "City",
              "name": name,
              "description": region.data.description,
              "containsPlace": isCounty && Array.isArray(region.data.containsPlace) ?
                region.data.containsPlace.map(place => 
                  Array.isArray(place) ? place[0] : place
                ) :
                []
            },
            "url": `https://goflow.plumbing/${region.slug}`
          }
        };
      })
    }
  };
}
