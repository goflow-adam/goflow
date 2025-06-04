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
    const timeRequired = details.timeRequired || 'PT3H';

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

    this.setType({ '@type': 'Service' })
        .setId(`https://goflow.plumbing/${details.slug}#service`)
        .addProperty('name', details.name)
        .addProperty('description', details.description)
        .addProperty('provider', provider)
        .addProperty('serviceType', ['Plumbing'])
        .addProperty('areaServed', this.getAreaServed())
        .addProperty('timeRequired', timeRequired)
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
