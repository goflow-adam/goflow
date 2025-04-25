import type { Organization } from 'schema-dts';
import { businessInfo } from './schema';

export function createOrganizationSchema(): { [key: string]: any } {
  const { 
    '@type': _, 
    '@context': __, 
    '@id': ___, 
    name,
    url,
    telephone,
    address,
    image,
    ...orgInfo 
  } = businessInfo;

  return {
    '@type': 'Organization',
    '@id': 'https://goflow.plumbing/#organization',
    'name': name || 'GoFlow Plumbing',
    'url': url || 'https://goflow.plumbing',
    'telephone': telephone || '+17072008350',
    'image': image || 'https://goflow.plumbing/GoFlow2.jpg',
    'address': address,
    ...orgInfo
  };
}
