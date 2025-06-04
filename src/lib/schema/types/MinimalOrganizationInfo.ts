import type { Plumber, PostalAddress } from 'schema-dts';

export interface MinimalOrganizationInfo {
  '@type': 'Plumber';
  '@id': string;
  name: string;
  image: string[];
  telephone: string;
  priceRange: string;
  address: PostalAddress;
}

export function createMinimalOrganizationInfo(): MinimalOrganizationInfo {
  return {
    '@type': 'Plumber',
    '@id': 'https://goflow.plumbing/#organization',
    'name': 'GoFlow Plumbing',
    'image': [/*'https://goflow.plumbing/GoFlow2.jpg/'*/],
    'telephone': '(707) 200-8350',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '10 Pine Ave',
      'addressLocality': 'Sonoma',
      'addressRegion': 'CA',
      'postalCode': '95476',
      'addressCountry': 'US'
    }
  };
}
