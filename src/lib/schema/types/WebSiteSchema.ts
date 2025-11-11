import type { WithContext, WebSite, SearchAction, EntryPoint } from 'schema-dts';
import { createMinimalOrganizationInfo } from './MinimalOrganizationInfo';
import { GoFlowSchema } from '../base/GoFlowSchema';

export class WebSiteSchema extends GoFlowSchema<WebSite> {
  private constructor() {
    super();
    this.initialize();
  }

  public static create(): WebSiteSchema {
    return new WebSiteSchema();
  }

  private initialize(): void {
    const orgInfo = createMinimalOrganizationInfo();
    this.setType('WebSite')
        .setId('https://goflow.plumbing/#website')
        .addProperty('name', 'GoFlow Plumbing')
        .addProperty('alternateName', 'GoFlow')
        .addProperty('inLanguage', 'en-US')
        .addProperty('url', 'https://goflow.plumbing/')
        .addProperty('description', 'Professional plumbing services in Sonoma and Marin County')
        .addProperty('potentialAction', this.getSearchAction())
        .addProperty('publisher', { '@id': orgInfo['@id'] })
        .addProperty('image', [
          'https://goflow.plumbing/favicon-32x32.png',
          'https://goflow.plumbing/favicon-16x16.png',
          'https://goflow.plumbing/apple-touch-icon.png'
        ]);
  }

  private getSearchAction(): SearchAction {
    return {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://goflow.plumbing/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    } as SearchAction;
  }

  public build(): WithContext<WebSite> {
    return super.build();
  }
}
