import type { WithContext, Plumber, OpeningHoursSpecification, GeoCoordinates, ContactPoint, Review, AggregateRating } from 'schema-dts';
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
        .addProperty('legalName', minimalInfo.legalName)
        .addProperty('alternateName', 'GoFlow')
        .addProperty('logo', {
          '@type': 'ImageObject',
          'url': 'https://goflow.plumbing/images/logo.svg'
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
        .addProperty('areaServed', AreaService.getInstance().getServiceAreas())
        // Additional properties for richer structured data
        .addProperty('mainEntityOfPage', 'https://goflow.plumbing/')
        .addProperty('knowsAbout', [
          'Residential plumbing repair and installation',
          'Water heater repair and replacement',
          'Drain cleaning and sewer services',
          'Emergency plumbing services',
          'Tankless water heater installation',
          'Leak detection and repair'
        ] as string[])
        .addProperty('aggregateRating', this.getAggregateRating())
        .addProperty('review', this.getReviews());
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

  private getAggregateRating(): AggregateRating {
    return {
      '@type': 'AggregateRating',
      'ratingValue': '5.0',
      'reviewCount': '2',
      'bestRating': '5',
      'worstRating': '1'
    } as AggregateRating;
  }

  private getReviews(): Review[] {
    return [
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Kip B.'
        },
        'datePublished': '2024-10',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'Chris knows what he\'s doing, is very conscientious and takes all the time necessary to get the job done right. His prices are the most reasonable I\'ve found. He\'s my new plumber, highly recommended.'
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Bert P.'
        },
        'datePublished': '2024-09',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'Chris was prompt to reply to your texts. Chris was conscientious about letting you know he was going to be a little late and why. He was very polite, clean and organized. The job was completed faster than I expected. I am extremely pleased with his work and will highly recommend him. Would not hesitate to used him again. He also had a very competitive price.'
      } as Review
    ];
  }

  public build(): WithContext<Plumber> {
    return super.build();
  }
}
