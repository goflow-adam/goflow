import type { WithContext, Plumber, PostalAddress, OpeningHoursSpecification, GeoCoordinates, ContactPoint } from 'schema-dts';
import { AreaService } from '../base/AreaService';
import { GoFlowSchema } from '../base/GoFlowSchema';

export class OrganizationSchema extends GoFlowSchema<Plumber> {
  private constructor() {
    super();
    this.initialize();
  }

  public static async create(): Promise<OrganizationSchema> {
    return new OrganizationSchema();
  }

  private initialize(): void {
    // Initialize synchronous properties
    this.setType('Plumber')
        .setId(this.organizationId)
        .addProperty('name', 'GoFlow Plumbing')
        .addProperty('url', 'https://goflow.plumbing/')
        .addProperty('telephone', '(707) 200-8350')
        .addProperty('email', 'info@goflow.plumbing')
        .addProperty('image', ['https://goflow.plumbing/GoFlow2.jpg/'] as string[])
        .addProperty('description', 'Residential plumbing services in Sonoma and Marin County')
        .addProperty('address', this.getAddress())
        .addProperty('geo', this.getGeoCoordinates())
        .addProperty('openingHoursSpecification', this.getOpeningHours())
        .addProperty('priceRange', '$$')
        .addProperty('paymentAccepted', ['Cash', 'Credit Card', 'Check', 'PayPal', 'Venmo', 'Bitcoin'] as string[])
        .addProperty('currenciesAccepted', 'USD')
        .addProperty('sameAs', [
          'https://www.facebook.com/profile.php?id=61574410838549/',
          'https://www.yelp.com/biz/goflow-plumbing-sonoma/'
        ] as string[])
        .addProperty('contactPoint', this.getContactPoint())
        .addProperty('areaServed', AreaService.getInstance().getServiceAreas());
  }

  private getAddress(): PostalAddress {
    return {
      '@type': 'PostalAddress',
      'streetAddress': '10 Pine Ave',
      'addressLocality': 'Sonoma',
      'addressRegion': 'CA',
      'postalCode': '95476',
      'addressCountry': 'US'
    } as PostalAddress;
  }

  private getGeoCoordinates(): GeoCoordinates {
    return {
      '@type': 'GeoCoordinates',
      'latitude': 38.3147602,
      'longitude': -122.4849469
    } as GeoCoordinates;
  }

  private getOpeningHours(): OpeningHoursSpecification[] {
    return [{
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as string[],
      'opens': '00:00',
      'closes': '23:59'
    } as OpeningHoursSpecification];
  }

  private getContactPoint(): ContactPoint[] {
    return [{
      '@type': 'ContactPoint',
      'telephone': '(707) 200-8350',
      'contactType': 'customer service'
    } as ContactPoint];
  }

  public build(): WithContext<Plumber> {
    return super.build();
  }
}
