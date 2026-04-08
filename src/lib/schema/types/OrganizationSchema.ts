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
          'url': 'https://goflow.plumbing/images/LogoForGoogle.webp'
        })
        .addProperty('image', minimalInfo.image)
        .addProperty('telephone', minimalInfo.telephone)
        .addProperty('priceRange', minimalInfo.priceRange)
        .addProperty('address', minimalInfo.address)

    // Add additional organization properties
        .addProperty('url', 'https://goflow.plumbing/')
        .addProperty('email', 'info@goflow.plumbing')
        .addProperty('description', 'Residential plumbing services in Sonoma County and Marin County')
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
      'reviewCount': '8',
      'bestRating': '5',
      'worstRating': '1'
    } as AggregateRating;
  }

  private getReviews(): Review[] {
    const googleReviewUrl = 'https://www.google.com/search?q=goflow+plumbing#lrd=0x21ccd84811445dd1:0xbc645b3c34cce840,1,,,,';
    return [
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Barbara Norman'
        },
        'datePublished': '2026-03-31',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'I can\'t say enough good things about these guys! My water heater started leaking Thursday night—right before family were to arrive for the weekend. I was panicking but they got someone out to my place in Oakmont first thing Friday. I had a brand new water heater before they arrived. Seriously saved my weekend! Chris was super professional and explained everything he was doing. I\'m so grateful they were able to squeeze me in on such short notice. Thank you thank you thank you!!',
        'url': googleReviewUrl
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Kyle P.'
        },
        'datePublished': '2026-03-19',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'I got a great deal and everything fixed in a timely manner. I couldn\'t have asked for a better plumbing service. Chris, who I believe is the owner, was very friendly and professional. I would definitely recommend this company for any first time customers as you will find the only plumber you need to call.',
        'url': 'https://www.yelp.com/biz/goflow-plumbing-sonoma?hrid=BzmZ6qxYL94ZYLDt7kDkiw'
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Christina Danner'
        },
        'datePublished': '2025-09-09',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'Great communication, thorough work, highly recommend!',
        'url': 'https://www.facebook.com/goflow.plumbing.usa/reviews'
      } as Review,
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
        'reviewBody': 'Chris knows what he\'s doing, is very conscientious and takes all the time necessary to get the job done right. His prices are the most reasonable I\'ve found. He\'s my new plumber, highly recommended.',
        'url': 'https://www.angi.com/companylist/us/ca/rohnert-park/chris-torres-plumbing-reviews-1.htm#reviews'
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
        'reviewBody': 'Chris was prompt to reply to your texts. Chris was conscientious about letting you know he was going to be a little late and why. He was very polite, clean and organized. The job was completed faster than I expected. I am extremely pleased with his work and will highly recommend him. Would not hesitate to used him again. He also had a very competitive price.',
        'url': 'https://www.angi.com/companylist/us/ca/rohnert-park/chris-torres-plumbing-reviews-1.htm#reviews'
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Mark K.'
        },
        'datePublished': '2026-03',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'I thought I had a crimped water line requiring trenching. Chris came out and determined the pressure valve needed cleaning. He didn\'t even push a replacement. Water flow in the house is now fantastic.',
        'url': googleReviewUrl
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Jason B.'
        },
        'datePublished': '2026-03',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'Great experience with GoFlow Plumbing. They do high-quality work and stand behind everything they do. Chris was super easy to work with and made the whole job stress-free. I\'ll be using them again for sure.',
        'url': googleReviewUrl
      } as Review,
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Karen T.'
        },
        'datePublished': '2026-03',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': '5',
          'bestRating': '5',
          'worstRating': '1'
        },
        'reviewBody': 'I am really happy with the service I received from GoFlow Plumbing. Chris was great to work with and everything turned out perfectly.',
        'url': googleReviewUrl
      } as Review
    ];
  }

  public build(): WithContext<Plumber> {
    return super.build();
  }
}
