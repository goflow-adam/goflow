import type { WithContext, Service, Offer, Organization, OfferCatalog } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';

interface ServiceDetails {
  slug: string;
  title: string;
  description: string;
  offers?: Array<{
    name: string;
    description: string;
  }>;
}

interface ServiceTimeDetails {
  output: string;
  time: string;
}

export class ServiceSchema extends GoFlowSchema<Service> {
  private static readonly serviceDetails: Record<string, ServiceTimeDetails> = {
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
    // Add other service details as needed
  } as const;

  private constructor(details: ServiceDetails) {
    super();
    this.initialize(details);
  }

  public static async create(details: ServiceDetails): Promise<ServiceSchema> {
    return new ServiceSchema(details);
  }

  private initialize(details: ServiceDetails): void {
    const timeDetails = ServiceSchema.serviceDetails[details.slug] || {
      output: 'Professional plumbing solution with guaranteed satisfaction',
      time: 'PT3H'
    } as const;

    const provider: Organization = {
      '@type': 'Plumber',
      '@id': this.organizationId,
      'name': 'GoFlow Plumbing',
      'image': ['https://goflow.plumbing/GoFlow2.jpg/'],
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

    this.setType({ '@type': 'Service' })
        .setId(`https://goflow.plumbing/${details.slug}#service`)
        .addProperty('name', details.title)
        .addProperty('description', details.description)
        .addProperty('provider', provider)
        .addProperty('serviceType', ['Plumbing'])
        .addProperty('areaServed', this.getAreaServed())
        .addProperty('timeRequired', timeDetails.time)
        .addProperty('image', provider.image)
        .addProperty('telephone', provider.telephone)
        .addProperty('priceRange', provider.priceRange)
        .addProperty('address', provider.address);

    if (details.offers && details.offers.length > 0) {
      this.addProperty('hasOfferCatalog', this.createOfferCatalog(details.offers));
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
