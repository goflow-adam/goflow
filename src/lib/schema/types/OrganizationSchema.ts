import type { WithContext, Plumber, OpeningHoursSpecification, GeoCoordinates, ContactPoint, Review, AggregateRating, OfferCatalog } from 'schema-dts';
import { createMinimalOrganizationInfo } from './MinimalOrganizationInfo';
import { AreaService } from '../base/AreaService';
import { GOFLOWSchema } from '../base/GOFLOWSchema';
import reviewsData from '../../../data/reviews.json';

interface ReviewData {
  id: string;
  reviewerName: string;
  date: string;
  datePublished: string;
  rating: number;
  text: string;
  source: string;
  sourceLabel?: string;
  url: string;
  jobId: string | null;
}

export class OrganizationSchema extends GOFLOWSchema<Plumber> {
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
        .addProperty('alternateName', 'GOFLOW')
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
        .addProperty('review', this.getReviews())
        .addProperty('hasOfferCatalog', this.getOfferCatalog());
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
      'reviewCount': String(reviewsData.length),
      'bestRating': '5',
      'worstRating': '1'
    } as AggregateRating;
  }

  private getOfferCatalog(): OfferCatalog {
    const baseUrl = 'https://goflow.plumbing';
    return {
      '@type': 'OfferCatalog',
      'name': 'Plumbing Services',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/water-heater-repair-and-replacement/`,
            'name': 'Water Heater Services',
            'url': `${baseUrl}/water-heater-repair-and-replacement/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/clogged-drains-rootered/`,
            'name': 'Drain Cleaning',
            'url': `${baseUrl}/clogged-drains-rootered/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/emergency-plumbing-services/`,
            'name': 'Emergency Plumbing',
            'url': `${baseUrl}/emergency-plumbing-services/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/leak-detection-and-repair/`,
            'name': 'Leak Detection & Repair',
            'url': `${baseUrl}/leak-detection-and-repair/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/sewer-line-repair-and-replacement/`,
            'name': 'Sewer Line Services',
            'url': `${baseUrl}/sewer-line-repair-and-replacement/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/clogged-or-running-toilets/`,
            'name': 'Toilet Repair',
            'url': `${baseUrl}/clogged-or-running-toilets/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/faucet-leaks-repaired/`,
            'name': 'Faucet Repair',
            'url': `${baseUrl}/faucet-leaks-repaired/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/garbage-disposal-repair-or-installation/`,
            'name': 'Garbage Disposal Services',
            'url': `${baseUrl}/garbage-disposal-repair-or-installation/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/automatic-water-shutoff-installation/`,
            'name': 'Automatic Water Shutoff Installation',
            'url': `${baseUrl}/automatic-water-shutoff-installation/`
          }
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${baseUrl}/instant-hot-water-installed-or-repaired/`,
            'name': 'Instant Hot Water Installation',
            'url': `${baseUrl}/instant-hot-water-installed-or-repaired/`
          }
        }
      ]
    } as OfferCatalog;
  }

  private getReviews(): Review[] {
    return (reviewsData as ReviewData[]).map((review) => ({
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': review.reviewerName },
      'datePublished': review.datePublished,
      'reviewRating': { '@type': 'Rating', 'ratingValue': String(review.rating), 'bestRating': '5', 'worstRating': '1' },
      'reviewBody': review.text,
      'url': review.url
    } as Review));
  }

  public build(): WithContext<Plumber> {
    return super.build();
  }
}
