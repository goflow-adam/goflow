import type { WithContext, WebPage } from 'schema-dts';
import { GOFLOWSchema } from '../base/GOFLOWSchema';
// Organization referenced by @id via base class organizationId

export class ContactPageSchema extends GOFLOWSchema<WebPage> {
  private constructor() {
    super();
  }

  public static async create(): Promise<ContactPageSchema> {
    return new ContactPageSchema();
  }

  build(): WithContext<WebPage> {
    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': 'https://goflow.plumbing/contact-us/#webpage',
      'url': 'https://goflow.plumbing/contact-us/',
      'name': 'Contact GOFLOW Plumbing | Professional Plumbers in Sonoma & Marin',
      'description': 'Contact GOFLOW Plumbing for professional plumbing services in Sonoma County and Marin County. Available 24/7 for emergencies.',
      // Reference Organization by @id to avoid duplication
      'provider': { '@id': this.organizationId },
      'mainEntity': { '@id': this.organizationId }
    };
  }
}
