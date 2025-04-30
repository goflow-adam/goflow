import type { WithContext, CollectionPage, Thing } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';

interface ArticleListDetails {
  url: string;
  name: string;
  description: string;
  mainEntity: Thing;
}

export class ArticleListSchema extends GoFlowSchema<CollectionPage> {
  private constructor(details: ArticleListDetails) {
    super();
    this.initialize(details);
  }

  public static async create(details: ArticleListDetails): Promise<ArticleListSchema> {
    return new ArticleListSchema(details);
  }

  private initialize(details: ArticleListDetails): void {
    this.setType('CollectionPage')
        .setId(`${details.url}#webpage`)
        .addProperty('url', details.url)
        .addProperty('name', details.name)
        .addProperty('description', details.description)
        .addProperty('mainEntity', details.mainEntity);
  }

  public async build(): Promise<WithContext<CollectionPage>> {
    // Skip area served for article pages
    if (!this.validate()) {
      throw new Error('Schema validation failed');
    }
    return this.data;
  }
}
