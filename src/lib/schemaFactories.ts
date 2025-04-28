import type { CollectionEntry } from 'astro:content';

interface ServiceData extends CollectionEntry<'services'> {
  data: {
    title: string;
    description: string;
    pubDate: Date;
    draft: boolean;
    featured: boolean;
    includeInMenu: boolean;
    linkText?: string;
    menuText?: string;
    updatedDate?: Date;
    heroImage?: string;
    schema?: any;
    offers?: Array<{
      name: string;
      description: string;
    }>;
  };
}
import type { PlumberSchema } from '../types/schema';
import type { 
  Article,
  ItemList,
  ListItem,
  Service,
  WebPage,
  WebSite,
  Plumber,
  WithContext,
  AdministrativeArea,
  SearchAction, 
  ContactPoint,
  LocalBusiness
} from 'schema-dts';
import { businessInfo } from './schema';
import { createOrganizationSchema } from './organizationSchemaFactory';

// Define types for our specific administrative areas
type County = AdministrativeArea & {
  '@type': 'AdministrativeArea';
  name: string;
  description?: string;
  containsPlace?: string[];
};

type City = AdministrativeArea & {
  '@type': 'AdministrativeArea';
  name: string;
  description?: string;
};

// Define a more specific type for plumbing services
type PlumbingService = Service & {
  '@type': 'Service';
  provider: { '@id': string };
  areaServed: Array<AdministrativeArea>;
  category: 'Plumbing';
  timeRequired?: string;
  contactPoint?: ContactPoint[];
  '@id': string;
  'mainEntityOfPage': {
    '@type': 'WebPage',
    '@id': string
  };
};

export function createServicePageSchema(service: ServiceData): WithContext<LocalBusiness> {
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

  const organization = createOrganizationSchema();

  interface ServiceOffer {
    name: string;
    description: string;
  }

  const serviceSchema: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    '@id': organization['@id'],
    'name': organization.name,
    'url': organization.url,
    'telephone': organization.telephone,
    'priceRange': organization.priceRange,
    'image': organization.image,
    'address': organization.address,
    'areaServed': {
      '@type': 'GeoCircle',
      'geoMidpoint': {
        '@type': 'GeoCoordinates',
        'latitude': 38.3147602,
        'longitude': -122.4849469
      },
      'geoRadius': '50'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      'opens': '00:00',
      'closes': '23:59'
    },
    'description': `${service.data.description}. ${serviceDetail.output}`,
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `${service.data.title} Services`,
      'itemListElement': (service.data.offers as ServiceOffer[] | undefined)?.map(offer => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': offer.name,
          'description': offer.description
        }
      })) || [{
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': service.data.title,
          'description': service.data.description
        }
      }]
    }
  };

  return serviceSchema;
}

export function createArticlePageSchema(article: CollectionEntry<'articles'>): WithContext<Article> {
  // Destructure and omit schema-specific properties and duplicates from businessInfo
  const { 
    address, 
    image, 
    '@type': _, 
    '@context': __, 
    '@id': ___, 
    name: orgName,
    url: orgUrl,
    telephone: orgPhone,
    ...orgInfo 
  } = businessInfo;

  const organization = createOrganizationSchema();
  const articleUrl = `https://goflow.plumbing/articles/${article.slug}/`;
  
  // Create properly typed organization for author/publisher
  const typedOrganization = {
    '@type': 'Organization' as const,
    '@id': organization['@id'],
    'name': organization.name,
    'url': organization.url,
    'logo': organization.image,
    'address': organization.address,
    'telephone': organization.telephone
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.data.title,
    'description': article.data.description,
    'datePublished': `${article.data.pubDate}T00:00:00-07:00`,
    'dateModified': article.data.updatedDate ? `${article.data.updatedDate}T00:00:00-07:00` : `${article.data.pubDate}T00:00:00-07:00`,
    'author': typedOrganization,
    'publisher': typedOrganization,
    'isAccessibleForFree': true,
    'hasPart': {
      '@type': 'WebPageElement',
      'isAccessibleForFree': true,
      'cssSelector': '.article-content'
    },
    'isPartOf': {
      '@type': 'WebSite',
      'isAccessibleForFree': true,
      '@id': 'https://goflow.plumbing/#website',
      'name': 'GoFlow Plumbing',
      'url': 'https://goflow.plumbing'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl,
      'url': articleUrl,
      'name': article.data.title,
      'description': article.data.description,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'name': article.data.title,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://goflow.plumbing/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Articles',
            'item': 'https://goflow.plumbing/articles/'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': article.data.title,
            'item': articleUrl
          }
        ]
      }
    } as WebPage,
    'image': article.data.heroImage || 'https://goflow.plumbing/GoFlow2.jpg',
    'inLanguage': 'en-US',
    'keywords': article.data.tags || [],
    'articleSection': article.data.category,
    'genre': 'Professional Services'
  };
}

export function createRegionPageSchema(region: CollectionEntry<'regions'>): PlumberSchema {
  // Extract the name without 'Plumbing Services'
  const name = region.data.title.replace(/ Plumbing Services.*$/, '');
  const isCounty = name.toLowerCase().includes('county');

  return {
    "@context": "https://schema.org",
    "@type": "Plumber",
    "name": businessInfo.name,
    "description": region.data.description,
    "url": `https://goflow.plumbing/${region.slug}/`,
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
            "@type": "Service",
            "name": "Emergency Plumbing",
            "description": `24/7 emergency plumbing services in ${region.data.region}`
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Residential Plumbing",
            "description": `Complete home plumbing services for ${region.data.region} residents`
          }
        }
      ]
    }
  };
}

export function createWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'GoFlow Plumbing',
    'url': 'https://goflow.plumbing',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://goflow.plumbing/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    } as SearchAction
  } as WithContext<WebSite>;
}

export function createServiceListSchema(services: { title: string; description: string; url: string }[], regions: CollectionEntry<'regions'>[]): WithContext<WebPage> {
  const businessId = 'https://goflow.plumbing/#business';
  // Filter out schema-specific properties from businessInfo
  const { '@type': _, '@context': __, '@id': ___, ...businessData } = businessInfo;

  // Create shared area definitions
  const areaDefinitions = regions.map((region, index) => {
    const name = region.data.title.replace(/ Plumbing Services.*$/, '').replace(/ for your home$/, '');
    const isCounty = name.toLowerCase().includes('county');
    return {
      '@type': 'AdministrativeArea',
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
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://goflow.plumbing/plumbing-services',
    'url': 'https://goflow.plumbing/plumbing-services/',
    'name': 'Professional Plumbing Services in Sonoma & Marin County',
    'description': 'Comprehensive plumbing services including water heater repair, drain cleaning, emergency services, and more.',
    'provider': {
      '@type': 'Plumber',
      '@id': businessId,
      ...businessData
    } as Plumber,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': services.map((service, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Service',
          'name': service.title,
          'description': service.description,
          'url': service.url,
          'provider': { '@id': businessId },
          'areaServed': areaDefinitions.map(area => ({
            '@type': 'AdministrativeArea',
            'name': area.name,
            'description': area.description
          }))
        } as Service
      } as ListItem))
    } as ItemList
  } as WithContext<WebPage>;
}

export function createArticleListSchema(articles: CollectionEntry<'articles'>[]): WithContext<WebPage> {
  const organization = createOrganizationSchema();

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://goflow.plumbing/articles#webpage',
    'url': 'https://goflow.plumbing/articles/',
    'name': 'Plumbing Articles & Resources | GoFlow Plumbing',
    'description': 'Expert plumbing tips, maintenance guides, and industry insights from GoFlow Plumbing\'s experienced professionals.',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': articles.map((article, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Article',
          'headline': article.data.title,
          'description': article.data.description,
          'image': article.data.heroImage || 'https://goflow.plumbing/GoFlow2.jpg',
          'datePublished': new Date(article.data.pubDate).toISOString(),
          'author': organization,
          'publisher': organization,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://goflow.plumbing/articles/${article.slug}/`
          },
          'url': `https://goflow.plumbing/articles/${article.slug}/`
        } as Article
      })) as ListItem[]
    } as ItemList
  } as WithContext<WebPage>;
}

export function createServiceRegionsSchema(regions: CollectionEntry<'regions'>[]): WithContext<WebPage> {
  const organization = createOrganizationSchema();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://goflow.plumbing/service-regions#webpage',
    'url': 'https://goflow.plumbing/service-regions/',
    'name': 'Service Areas - GoFlow Plumbing',
    'description': 'Professional plumbing services throughout Sonoma and Marin Counties',
    'about': {
      '@type': 'Plumber',
      '@id': 'https://goflow.plumbing/#business',
      'name': organization.name,
      'url': organization.url,
      'telephone': organization.telephone,
      'image': organization.image,
      'address': organization.address,
      'priceRange': organization.priceRange,
      'areaServed': organization.areaServed,
      'openingHoursSpecification': organization.openingHoursSpecification
    },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': regions.map((region, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Service',
          'name': region.data.title,
          'url': `https://goflow.plumbing/${region.slug}/`,
          'description': region.data.description,
          'provider': { '@id': 'https://goflow.plumbing/#business' },
          'areaServed': {
            '@type': 'AdministrativeArea',
            'name': region.data.title.replace(/ Plumbing Services.*$/, ''),
            'description': region.data.description,
            'containsPlace': region.data.containsPlace && Array.isArray(region.data.containsPlace) ?
              region.data.containsPlace.map(place => Array.isArray(place) ? place[0] : place) :
              []
          }
        }
      }))
    }
  };
}
