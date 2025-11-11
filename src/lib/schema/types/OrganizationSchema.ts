import type { WithContext, Plumber, OpeningHoursSpecification, GeoCoordinates, ContactPoint } from 'schema-dts';
import { createMinimalOrganizationInfo } from './MinimalOrganizationInfo';
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
    const minimalInfo = createMinimalOrganizationInfo();

    // Start with minimal info
    this.setType(minimalInfo['@type'])
        .setId(minimalInfo['@id'])
        .addProperty('name', minimalInfo.name)
        .addProperty('alternateName', 'GoFlow')
        .addProperty('logo', {
          '@type': 'ImageObject',
          'url': 'https://goflow.plumbing/apple-touch-icon.png'
        })
        .addProperty('image', minimalInfo.image)
        .addProperty('telephone', minimalInfo.telephone)
        .addProperty('priceRange', minimalInfo.priceRange)
        .addProperty('address', minimalInfo.address)

    // Add additional organization properties
        .addProperty('url', 'https://goflow.plumbing/')
        .addProperty('email', 'info@goflow.plumbing')
        .addProperty('description', 'Residential plumbing services in Sonoma and Marin County')
        .addProperty('geo', this.getGeoCoordinates())
        .addProperty('openingHoursSpecification', this.getOpeningHours())
        .addProperty('paymentAccepted', ['Cash', 'Credit Card', 'Check', 'PayPal', 'Venmo', 'Bitcoin'] as string[])
        .addProperty('currenciesAccepted', 'USD')
        .addProperty('sameAs', [
          'https://www.facebook.com/profile.php?id=61574410838549/',
          'https://www.yelp.com/biz/goflow-plumbing-sonoma/'
        ] as string[])
        .addProperty('contactPoint', this.getContactPoint())
        .addProperty('areaServed', AreaService.getInstance().getServiceAreas());
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
