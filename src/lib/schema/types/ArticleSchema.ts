import type { WithContext, Article, WebPage } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

interface ArticleDetails {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishDate: Date;
  modifyDate?: Date;
  author?: string;
}

export class ArticleSchema extends GoFlowSchema<Article> {
  private constructor(details: ArticleDetails) {
    super();
    this.setType('Article')
        .setId(`${details.url}#article`)
        .addProperty('name', details.title)
        .addProperty('headline', details.title)
        .addProperty('description', details.description)
        //.addProperty('image', details.imageUrl || 'https://goflow.plumbing/GoFlow2.jpg')
        .addProperty('datePublished', details.publishDate.toISOString())
        .addProperty('mainEntityOfPage', {
          '@type': 'WebPage',
          '@id': details.url
        } as WebPage);

    if (details.modifyDate) {
      this.addProperty('dateModified', details.modifyDate.toISOString());
    }
  }

  public static async create(details: ArticleDetails): Promise<ArticleSchema> {
    const schema = new ArticleSchema(details);
    const organization = await OrganizationSchema.create();
    const orgSchema = await organization.build();
    
    schema.addProperty('author', orgSchema);
    schema.addProperty('publisher', orgSchema);
    
    return schema;
  }

  public build(): WithContext<Article> {
    return super.build();
  }
}
