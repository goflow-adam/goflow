import type { WithContext, Thing, AdministrativeArea, Place, City } from 'schema-dts';
import { SONOMA_COUNTY_CITIES, MARIN_COUNTY_CITIES } from '../../../data/cities';

type SchemaType = string | { '@type': string };

type SchemaData = Partial<Thing> & {
  '@type'?: string;
  '@id'?: string;
  '@context'?: 'https://schema.org';
};

type AreaConfig = {
  name: string;
  description: string;
  cities: string[];
};

export abstract class GoFlowSchema<T extends Thing> {
  protected readonly context = 'https://schema.org' as const;
  protected readonly organizationId = 'https://goflow.plumbing/#organization' as const;
  protected data: SchemaData = {};

  private readonly serviceAreas: AreaConfig[] = [
    {
      name: 'Sonoma County',
      description: 'Plumbing services throughout Sonoma County: water heaters, drain clogs, emergency repairs, and plumbing installations.',
      cities: SONOMA_COUNTY_CITIES
    },
    {
      name: 'Marin County',
      description: 'Plumbing services throughout Marin County: water heaters, drain clogs, emergency repairs, and plumbing installations.',
      cities: MARIN_COUNTY_CITIES
    }
  ];

  constructor() {
    this.data['@context'] = this.context;
  }

  protected setType(type: SchemaType): this {
    this.data['@type'] = typeof type === 'string' ? type : type['@type'];
    return this;
  }

  protected setId(id: string): this {
    this.data['@id'] = id;
    return this;
  }

  protected addProperty(key: string, value: unknown): this {
    (this.data as Record<string, unknown>)[key] = value;
    return this;
  }

  protected getAreaServed(): WithContext<AdministrativeArea>[] {
    return this.serviceAreas.map(area => ({
      '@context': this.context,
      '@type': 'AdministrativeArea',
      'name': area.name,
      'description': area.description,
      'containsPlace': area.cities.map(city => ({
        '@type': 'City',
        'name': city
      }))
    }));
  }

  protected validate(): boolean {
    // Basic validation
    if (!this.data['@context']) return false;
    if (!this.data['@type']) return false;
    return true;
  }

  public build(): WithContext<T> {
    if (!this.validate()) {
      throw new Error('Schema validation failed');
    }
    return this.data as WithContext<T>;
  }
}
