import type { WithContext, WebPage, Service, Plumber, OfferCatalog } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

export class PricingPageSchema extends GoFlowSchema<WebPage> {
  private orgSchema: WithContext<Plumber>;

  private constructor(orgSchema: WithContext<Plumber>) {
    super();
    this.orgSchema = orgSchema;
  }

  public static async create(): Promise<PricingPageSchema> {
    const organization = await OrganizationSchema.create();
    const orgSchema = organization.build();
    return new PricingPageSchema(orgSchema);
  }

  build(): WithContext<WebPage> {
    const waterHeaterService: Service = {
      '@type': 'Service',
      '@id': 'https://goflow.plumbing/pricing/water-heater-services/#service',
      'name': 'Water Heater Services',
      'description': 'Professional water heater installation, repair, and maintenance services',
      'provider': this.orgSchema,
      'serviceType': ['Plumbing'],
      'areaServed': [
        {
          '@type': 'AdministrativeArea',
          'name': 'Sonoma County',
          'description': 'Professional plumbing services throughout Sonoma County',
          'containsPlace': [
            { '@type': 'City', 'name': 'Santa Rosa' },
            { '@type': 'City', 'name': 'Sonoma' },
            { '@type': 'City', 'name': 'Petaluma' },
            { '@type': 'City', 'name': 'Rohnert Park' },
            { '@type': 'City', 'name': 'Windsor' }
          ]
        },
        {
          '@type': 'AdministrativeArea',
          'name': 'Marin County',
          'description': 'Professional plumbing services throughout Marin County',
          'containsPlace': [
            { '@type': 'City', 'name': 'San Rafael' },
            { '@type': 'City', 'name': 'Novato' },
            { '@type': 'City', 'name': 'Mill Valley' },
            { '@type': 'City', 'name': 'San Anselmo' },
            { '@type': 'City', 'name': 'Larkspur' }
          ]
        }
      ],
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Service Offerings',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Standard Service Call',
              'description': 'Initial diagnostic fee for water heater services - $99',
              'serviceType': ['Plumbing'],
              'provider': this.orgSchema
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Water Heater Installation',
              'description': 'Standard 40-gallon gas water heater installation - Starting at $1,299',
              'serviceType': ['Plumbing'],
              'provider': this.orgSchema
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Water Heater Repair',
              'description': 'Basic water heater repair service - Starting at $199',
              'serviceType': ['Plumbing'],
              'provider': this.orgSchema
            }
          }
        ]
      }
    };

    this.setType('WebPage')
        .setId('https://goflow.plumbing/pricing/water-heater-services/#webpage')
        .addProperty('url', 'https://goflow.plumbing/pricing/water-heater-services/')
        .addProperty('name', 'Water Heater Services & Pricing | GoFlow Plumbing')
        .addProperty('description', 'View our competitive pricing for water heater installation, repair, and maintenance services in Sonoma County and Marin County.')
        .addProperty('mainEntity', waterHeaterService);

    return super.build();
  }
}
