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
  const serviceSchemas = await Promise.all(
    services.map(async service => ({
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
    mainEntity: {
      '@type': 'Plumber' as const,
      'name': 'GoFlow Plumbing',
      //'image': ['https://goflow.plumbing/GoFlow2.jpg/'],
      'telephone': '(707) 200-8350',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress' as const,
        'streetAddress': '10 Pine Ave',
        'addressLocality': 'Sonoma',
        'addressRegion': 'CA',
        'postalCode': '95476',
        'addressCountry': 'US'
      },
      'hasOfferCatalog': {
        '@type': 'OfferCatalog' as const,
        'name': 'Plumbing Services',
        'itemListElement': serviceSchemas
      }
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

export async function createRegionPageSchema(region: { name: string; url: string; description: string }) {
  const schema = await AboutPageSchema.create({
    url: region.url,
    name: region.name,
    description: region.description,
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://goflow.plumbing/#organization'
    }
  });
  return schema.build();
}

export async function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): Promise<WithContext<BreadcrumbList>> {
  // Google Rich Results prefers ListItem with top-level name and item as URL/@id
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
