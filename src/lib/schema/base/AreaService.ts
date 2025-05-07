import type { ServiceArea, City } from '../types/area';
import { getCitiesForRegion, type Region } from '../../../data/cities';

export class AreaService {
  private static instance: AreaService;

  private constructor() {}

  public static getInstance(): AreaService {
    if (!AreaService.instance) {
      AreaService.instance = new AreaService();
    }
    return AreaService.instance;
  }

  private createServiceArea(region: Region): ServiceArea {
    return {
      '@type': 'AdministrativeArea',
      name: region,
      description: `Plumbing services throughout ${region}: water heaters, drain clogs, emergency repairs, and plumbing installations.`,
      containsPlace: getCitiesForRegion(region).map(cityName => ({
        '@type': 'City',
        name: cityName
      }))
    };
  }

  public getServiceAreas(): ServiceArea[] {
    return [
      this.createServiceArea('Sonoma County'),
      this.createServiceArea('Marin County')
    ];
  }
}
