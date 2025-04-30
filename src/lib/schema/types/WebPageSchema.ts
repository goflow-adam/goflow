import type { WithContext, WebPage, ListItem, BreadcrumbList, Thing } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';

interface WebPageDetails {
  url: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage' | 'FAQPage';
  mainEntity?: Thing;
}

export class WebPageSchema extends GoFlowSchema<WebPage> {
  private constructor(details: WebPageDetails) {
    super();
    this.initialize(details);
  }

  public static async create(details: WebPageDetails): Promise<WebPageSchema> {
    return new WebPageSchema(details);
  }

  private initialize(details: WebPageDetails): void {
    this.setType(details.type || 'WebPage')
        .setId(`${details.url}#webpage`)
        .addProperty('url', details.url)
        .addProperty('name', details.name)
        .addProperty('description', details.description);

    if (details.mainEntity) {
      this.addProperty('mainEntity', details.mainEntity);
    }
  }

  public addBreadcrumbList(items: Array<{ name: string; url: string; }>): this {
    const breadcrumb: BreadcrumbList = {
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'WebPage',
          'name': item.name,
          'url': item.url
        } as WebPage
      } as ListItem))
    };

    this.addProperty('breadcrumb', breadcrumb);
    return this;
  }

  public build(): WithContext<WebPage> {
    return super.build();
  }
}
