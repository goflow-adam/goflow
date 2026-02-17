import type { WithContext, FAQPage } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

export class FAQPageSchema extends GoFlowSchema<FAQPage> {
  private constructor() {
    super();
  }

  public static async create(): Promise<FAQPageSchema> {
    return new FAQPageSchema();
  }

  build(): WithContext<FAQPage> {

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://goflow.plumbing/faqs/#webpage',
      'url': 'https://goflow.plumbing/faqs/',
      'name': 'Frequently Asked Questions | GoFlow Plumbing',
      'description': 'Find answers to common plumbing questions from GoFlow Plumbing, serving Sonoma County and Marin County.',
      // Reference Organization by @id to avoid duplication
      'provider': { '@id': this.organizationId },
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What areas do you serve?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We serve all of Sonoma County and Marin County, including Santa Rosa, Petaluma, Rohnert Park, Windsor, and surrounding areas.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do you offer emergency plumbing services?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, we offer 24/7 emergency plumbing services throughout our service area.'
          }
        }
      ]
    };
  }
}
