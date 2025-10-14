import type { PostalAddress } from 'schema-dts';

export interface MinimalOrganizationInfo {
  '@type': 'Plumber';
  '@id': string;
  name: string;
  legalName: string;
  image: string[];
  telephone: string;
  priceRange: string;
  address: PostalAddress;
}

export function createMinimalOrganizationInfo(): MinimalOrganizationInfo {
  return {
    '@type': 'Plumber',
    // Use a single canonical @id for the organization everywhere
    '@id': 'https://goflow.plumbing/#organization',
    'name': 'GoFlow Plumbing',
    'legalName': 'GoFlow Plumbing',
    // Provide at least one valid absolute image URL for Rich Results
    'image': [
      'https://goflow.plumbing/android-chrome-512x512.png'
    ],
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
