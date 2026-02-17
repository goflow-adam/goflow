import type { WithContext, WebPage, Plumber, AdministrativeArea, PostalAddress } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

export class TeamPageSchema extends GoFlowSchema<WebPage> {
  private constructor() {
    super();
  }

  public static async create(): Promise<TeamPageSchema> {
    return new TeamPageSchema();
  }

  build(): WithContext<WebPage> {
    return {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': 'https://goflow.plumbing/team/#webpage',
      'url': 'https://goflow.plumbing/team/',
      'name': 'Our Team | GoFlow Plumbing',
      'description': 'Meet the skilled and experienced team at GoFlow Plumbing, serving Sonoma County and Marin County with professional plumbing services.',
      // Reference Organization by @id to avoid duplication
      'provider': { '@id': this.organizationId },
      'mainEntity': { '@id': this.organizationId }
    };
  }
}
