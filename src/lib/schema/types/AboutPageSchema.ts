import type { WithContext, WebPage, Plumber } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';
import { OrganizationSchema } from './OrganizationSchema';

interface AboutPageDetails {
  url: string;
  name: string;
  description: string;
  mainEntity?: {
    '@type': string;
    '@id': string;
  };
}

export class AboutPageSchema extends GoFlowSchema<WebPage> {
  private details: AboutPageDetails;

  private orgSchema: WithContext<Plumber>;

  private constructor(details: AboutPageDetails, orgSchema: WithContext<Plumber>) {
    super();
    this.details = details;
    this.orgSchema = orgSchema;
  }

  public static async create(details: AboutPageDetails): Promise<AboutPageSchema> {
    const organization = await OrganizationSchema.create();
    const orgSchema = organization.build();
    return new AboutPageSchema(details, orgSchema);
  }

  build(): WithContext<WebPage> {
    this.setType('AboutPage')
        .setId(`${this.details.url}#webpage`)
        .addProperty('url', this.details.url)
        .addProperty('name', this.details.name)
        .addProperty('description', this.details.description)
        // Reference organization by @id to avoid duplicating org details on every page
        .addProperty('provider', { '@id': this.organizationId });

    if (this.details.mainEntity) {
      this.addProperty('mainEntity', this.details.mainEntity);
    }

    return super.build();
  }

  public addGeoFocus(city: { name: string; id?: string; description?: string }): this {
    const areaNode = city.id
      ? { '@type': 'AdministrativeArea', '@id': city.id, name: city.name, description: city.description }
      : { '@type': 'AdministrativeArea', name: city.name, description: city.description };

    this.addProperty('about', areaNode)
        .addProperty('contentLocation', { '@type': 'Place', name: `${city.name}, CA` })
        .addProperty('spatialCoverage', { '@type': 'AdministrativeArea', name: city.name });
    return this;
  }
}
