import type { ItemList, WithContext, BreadcrumbList } from 'schema-dts';
import { OrganizationSchema } from './types/OrganizationSchema';
import { WebPageSchema } from './types/WebPageSchema';
import { WebSiteSchema } from './types/WebSiteSchema';
import { ArticleListSchema } from './types/ArticleListSchema';
import { ServiceSchema } from './types/ServiceSchema';
import { ArticleSchema } from './types/ArticleSchema';
import { AboutPageSchema } from './types/AboutPageSchema';
import { FAQPageSchema } from './types/FAQPageSchema';
import { ContactPageSchema } from './types/ContactPageSchema';
import { TeamPageSchema } from './types/TeamPageSchema';
import { PricingPageSchema } from './types/PricingPageSchema';
import type { ServiceDetails, ArticleDetails, WebPageDetails, FAQItem } from './index';

// Singleton instance of OrganizationSchema
let organizationSchema: OrganizationSchema | null = null;

async function getOrganizationSchema(): Promise<OrganizationSchema> {
  if (!organizationSchema) {
    organizationSchema = await OrganizationSchema.create();
  }
  return organizationSchema;
}

export async function createOrganizationSchema() {
  const schema = await getOrganizationSchema();
  return schema.build();
}

export async function createWebSiteSchema() {
  const schema = await WebSiteSchema.create();
  return schema.build();
}

export async function createHomePageSchemas() {
  const [website, webpage] = await Promise.all([
    WebSiteSchema.create(),
    WebPageSchema.create({
      url: 'https://goflow.plumbing/',
      name: 'GoFlow Plumbing | Professional Plumbing Services in Sonoma & Marin',
      description: 'Professional plumbing services in Sonoma and Marin County',
      type: 'WebPage'
    })
  ]);

  return [
    await website.build(),
    await webpage.build()
  ];
}

export async function createServicePageSchema(details: ServiceDetails) {
  const schema = await ServiceSchema.create(details);
  return schema.build();
}

/**
 * Create a geo-focused WebPage schema for service pages.
 * If a location/city is provided, use it; otherwise, best-effort infer from the slug tail.
 */
export async function createServiceGeoSchema(service: { slug: string; name: string; description: string; locationName?: string; cityName?: string; image?: string }) {
  // Try to infer city from slug if not provided explicitly
  const inferCityFromSlug = (slug: string): string | undefined => {
    const seg = slug.split('/').filter(Boolean).pop();
    if (!seg) return undefined;
    const parts = seg.split('-');
    const city = parts[parts.length - 1];
    if (!city) return undefined;
    return city.replace(/\b\w/g, c => c.toUpperCase());
  };

  const cityName = service.locationName || service.cityName || inferCityFromSlug(service.slug);
  // Convert relative image path to absolute URL for schema.org
  const imageUrl = service.image 
    ? (service.image.startsWith('http') ? service.image : `https://goflow.plumbing${service.image}`)
    : undefined;

  if (!cityName) {
    // Fallback: build a plain webpage without geo focus
    const webpage = await WebPageSchema.create({
      url: `https://goflow.plumbing/${service.slug}/`,
      name: service.name,
      description: service.description,
      type: 'WebPage',
      image: imageUrl
    });
    return webpage.build();
  }

  const cityId = `https://goflow.plumbing/#city-${cityName.toLowerCase().replace(/\s+/g, '-')}`;
  const webpage = await WebPageSchema.create({
    url: `https://goflow.plumbing/${service.slug}/`,
    name: service.name,
    description: service.description,
    type: 'WebPage',
    image: imageUrl
  });
  webpage.addGeoFocus({ name: cityName, id: cityId, description: `City in California` });
  return webpage.build();
}

export async function createArticlePageSchema(details: ArticleDetails) {
  const schema = await ArticleSchema.create(details);
  return schema.build();
}

export async function createWebPageSchema(details: WebPageDetails) {
  const schema = await WebPageSchema.create(details);
  return schema.build();
}

export async function createAboutPageSchema() {
  const schema = await AboutPageSchema.create({
    url: 'https://goflow.plumbing/about-us/',
    name: 'About GoFlow Plumbing | Professional Plumbers in Sonoma & Marin',
    description: 'Learn about GoFlow Plumbing\'s history, mission, and commitment to providing exceptional plumbing services in Sonoma and Marin County.'
  });
  return schema.build();
}

export async function createFAQPageSchema() {
  const schema = await FAQPageSchema.create();
  return schema.build();
}

export async function createContactPageSchema() {
  const schema = await ContactPageSchema.create();
  return schema.build();
}

export async function createTeamPageSchema() {
  const schema = await TeamPageSchema.create();
  return schema.build();
}

export async function createPricingPageSchema() {
  const schema = await PricingPageSchema.create();
  return schema.build();
}

export async function createServiceListSchema(services: ServiceDetails[]) {
  const sortedServices = [...services].sort((a, b) => {
    const aPos = a.position ?? Number.POSITIVE_INFINITY;
    const bPos = b.position ?? Number.POSITIVE_INFINITY;

    if (aPos !== bPos) return aPos - bPos;
    return a.name.localeCompare(b.name);
  });

  const serviceSchemas = await Promise.all(
    sortedServices.map(async service => ({
      '@type': 'Offer' as const,
      'itemOffered': {
        '@type': 'Service' as const,
        'name': service.name,
        'description': service.description
      }
    }))
  );

  const details: WebPageDetails = {
    url: 'https://goflow.plumbing/plumbing-services/',
    name: 'GoFlow Plumbing Services',
    description: 'Professional plumbing services in Sonoma and Marin County',
    type: 'CollectionPage',
    // Use an OfferCatalog as the mainEntity to avoid embedding the Organization here
    mainEntity: {
      '@type': 'OfferCatalog' as const,
      'name': 'Plumbing Services',
      'itemListElement': serviceSchemas
    }
  };
  const schema = await WebPageSchema.create(details);
  return schema.build();
}

export async function createArticleListSchema(articles: ArticleDetails[]) {
  const articleSchemas = await Promise.all(
    articles.map(async (article, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Article',
        'headline': article.title,
        'description': article.description,
        'url': article.url,
        'image': article.imageUrl ? [article.imageUrl] : undefined,
        'datePublished': article.publishDate,
        'dateModified': article.modifyDate || article.publishDate
      }
    }))
  );

  const details = {
    url: 'https://goflow.plumbing/articles/',
    name: 'Plumbing Articles & Resources',
    description: 'Expert plumbing tips, maintenance guides, and industry insights from GoFlow Plumbing\'s experienced professionals.',
    mainEntity: {
      '@type': 'ItemList',
      'numberOfItems': articles.length,
      'itemListElement': articleSchemas
    } as ItemList
  };
  const schema = await ArticleListSchema.create(details);
  return schema.build();
}

export async function createServiceRegionsSchema(regions: Array<{ name: string; url: string }>) {
  const details: WebPageDetails = {
    url: 'https://goflow.plumbing/service-regions/',
    name: 'Service Regions',
    description: 'Areas served by GoFlow Plumbing in Sonoma and Marin County',
    type: 'CollectionPage',
    mainEntity: {
      '@type': 'ItemList',
      'itemListElement': regions.map((region, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'WebPage',
          'name': region.name,
          'url': `${region.url}/`
        }
      }))
    } as ItemList
  };
  const schema = await WebPageSchema.create(details);
  return schema.build();
}

export async function createRegionPageSchema(region: { name: string; url: string; description: string; cityName?: string; image?: string }) {
  const slug = region.url
    .replace('https://goflow.plumbing/', '')
    .replace(/\/$/, '');

  const areaName = region.cityName || region.name;

  // Embed Service directly within WebPage's mainEntity instead of as a sibling object
  const embeddedService = {
    '@type': 'Service' as const,
    '@id': `https://goflow.plumbing/${slug}#service`,
    'name': region.name,
    'description': region.description,
    'provider': {
      '@type': 'Plumber' as const,
      '@id': 'https://goflow.plumbing/#organization'
    },
    'serviceType': ['Plumbing'],
    'areaServed': {
      '@type': 'AdministrativeArea' as const,
      'name': areaName
    }
  };

  // Convert relative image path to absolute URL for schema.org
  const imageUrl = region.image 
    ? (region.image.startsWith('http') ? region.image : `https://goflow.plumbing${region.image}`)
    : undefined;

  const webpage = await WebPageSchema.create({
    url: region.url,
    name: region.name,
    description: region.description,
    type: 'WebPage',
    mainEntity: embeddedService,
    image: imageUrl
  });

  if (region.cityName) {
    const cityId = `https://goflow.plumbing/#city-${region.cityName.toLowerCase().replace(/\s+/g, '-')}`;
    webpage.addGeoFocus({ name: region.cityName, id: cityId, description: 'City in California' });
  }

  // Return single WebPage with embedded Service (not an array of siblings)
  return await webpage.build();
}

/**
 * Create a WebPage schema that explicitly focuses on a single city for geo relevance.
 */
export async function createWebPageGeoSchema(details: { url: string; name: string; description: string; city: { name: string; id?: string; description?: string } }) {
  // Deprecated for region pages; retained for any other use-cases if needed.
  const webpage = await WebPageSchema.create({
    url: details.url,
    name: details.name,
    description: details.description,
    type: 'WebPage'
  });
  webpage.addGeoFocus(details.city);
  return webpage.build();
}

export async function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): Promise<WithContext<BreadcrumbList>> {
  // Google Rich Results prefers ListItem with top-level name and item as URL/@id
  const pageUrl = items.length > 0 ? items[items.length - 1].url : 'https://goflow.plumbing/';
  const breadcrumbId = `${pageUrl.replace(/\/$/, '')}#breadcrumb`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url
      // Alternatively, object form is also accepted:
      // item: { '@id': crumb.url }
    }))
  } as WithContext<BreadcrumbList>;
}
