import type { WithContext, WebPage } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

export class ContactPageSchema extends GoFlowSchema<WebPage> {
  private constructor() {
    super();
  }

  public static async create(): Promise<ContactPageSchema> {
    return new ContactPageSchema();
  }

  async build(): Promise<WithContext<WebPage>> {
    const organization = await OrganizationSchema.create();
    const orgSchema = await organization.build();

    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': 'https://goflow.plumbing/contact-us/#webpage',
      'url': 'https://goflow.plumbing/contact-us/',
      'name': 'Contact GoFlow Plumbing | Professional Plumbers in Sonoma & Marin',
      'description': 'Contact GoFlow Plumbing for professional plumbing services in Sonoma and Marin County. Available 24/7 for emergencies.',
      'provider': orgSchema,
      'mainEntity': orgSchema
    };
  }
}
