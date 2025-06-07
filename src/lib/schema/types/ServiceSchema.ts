import type { WithContext, Service, Offer, Organization, OfferCatalog } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';

interface ServiceDetails {
  slug: string;
  name: string;
  description: string;
  timeRequired?: string;
  offers?: Array<{
    name: string;
    description: string;
  }>;
  schema?: {
    '@type'?: 'PlumbingService';
    '@id'?: string;
    provider?: {
      '@type': 'Plumber';
      '@id': string;
    };
    areaServed?: {
      '@type': 'AdministrativeArea';
      name: string;
      containedIn?: {
        '@type': 'AdministrativeArea';
        name: string;
        containedInPlace?: {
          '@type': 'State';
          name: string;
        };
      };
    };
    serviceType?: string[];
    availableChannel?: {
      '@type': 'ServiceChannel';
      serviceUrl: string;
      servicePhone: string;
      availableLanguage: string;
    };
    hasOfferCatalog?: {
      '@type': 'OfferCatalog';
      name: string;
      itemListElement: Array<{
        '@type': 'Offer';
        itemOffered: {
          '@type': 'Service';
          name: string;
        };
        availability: string;
        areaServed: string;
      }>;
    };
    priceRange?: string;
    openingHoursSpecification?: Array<{
      '@type': 'OpeningHoursSpecification';
      dayOfWeek: string[];
      opens: string;
      closes: string;
    }>;
  };
}

export class ServiceSchema extends GoFlowSchema<Service> {

  private constructor(details: ServiceDetails) {
    super();
    this.initialize(details);
  }

  public static async create(details: ServiceDetails): Promise<ServiceSchema> {
    return new ServiceSchema(details);
  }

  private initialize(details: ServiceDetails): void {
    // Use schema from frontmatter if available, otherwise use defaults
    const timeRequired = details.timeRequired || 'PT3H';
    const schema = details.schema || {};

    const provider: Organization = {
      '@type': 'Plumber',
      '@id': this.organizationId,
      'name': 'GoFlow Plumbing',
      'image': [/*'https://goflow.plumbing/GoFlow2.jpg/'*/],
      'telephone': '(707) 200-8350',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress' as const,
        'streetAddress': '10 Pine Ave',
        'addressLocality': 'Sonoma',
        'addressRegion': 'CA',
        'postalCode': '95476',
        'addressCountry': 'US'
      }
    };

    this.setType({ '@type': schema['@type'] || 'Service' })
        .setId(schema['@id'] || `https://goflow.plumbing/${details.slug}#service`)
        .addProperty('name', details.name)
        .addProperty('description', details.description)
        .addProperty('provider', schema.provider || provider)
        .addProperty('serviceType', schema.serviceType || ['Plumbing'])
        .addProperty('areaServed', schema.areaServed || this.getAreaServed())
        .addProperty('timeRequired', timeRequired)
        .addProperty('image', provider.image)
        .addProperty('telephone', schema.availableChannel?.servicePhone || provider.telephone)
        .addProperty('priceRange', schema.priceRange || provider.priceRange)
        .addProperty('address', provider.address);

    if (schema.hasOfferCatalog) {
      this.addProperty('hasOfferCatalog', schema.hasOfferCatalog);
    } else if (details.offers && details.offers.length > 0) {
      this.addProperty('hasOfferCatalog', this.createOfferCatalog(details.offers));
    }

    if (schema.availableChannel) {
      this.addProperty('availableChannel', schema.availableChannel);
    }

    if (schema.openingHoursSpecification) {
      this.addProperty('openingHoursSpecification', schema.openingHoursSpecification);
    }
  }

  private createOfferCatalog(offers: Array<{ name: string; description: string }>): OfferCatalog {
    const itemListElement: Offer[] = offers.map(offer => {
      const service: Service = {
        '@type': 'Service',
        'name': offer.name,
        'description': offer.description
      };

      const offerItem: Offer = {
        '@type': 'Offer',
        'itemOffered': service
      };

      return offerItem;
    });

    const catalog: OfferCatalog = {
      '@type': 'OfferCatalog',
      'name': 'Service Offerings',
      'itemListElement': itemListElement
    };

    return catalog;
  }

  public build(): WithContext<Service> {
    return super.build();
  }
}
