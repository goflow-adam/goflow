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

    // Reference the Organization by @id to avoid duplicating org details in each Service
    const provider: Organization = {
      '@type': 'Plumber',
      '@id': this.organizationId,
    } as Organization;

    this.setType({ '@type': schema['@type'] || 'Service' })
        .setId(schema['@id'] || `https://goflow.plumbing/${details.slug}#service`)
        .addProperty('name', details.name)
        .addProperty('description', details.description)
        .addProperty('provider', schema.provider || provider)
        .addProperty('serviceType', schema.serviceType || ['Plumbing'])
        .addProperty('areaServed', schema.areaServed || this.getAreaServed())
        .addProperty('timeRequired', timeRequired);

    // Only add optional fields when explicitly provided by frontmatter schema overrides
    if (schema.priceRange) {
      this.addProperty('priceRange', schema.priceRange);
    }
    if (schema.availableChannel?.servicePhone) {
      this.addProperty('telephone', schema.availableChannel.servicePhone);
    }

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
