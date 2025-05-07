export const SONOMA_COUNTY_CITIES = [
  'Cloverdale',
  'Cotati',
  'Healdsburg',
  'Petaluma',
  'Rohnert Park',
  'Santa Rosa',
  'Sebastopol',
  'Sonoma',
  'Windsor',
  'Bloomfield',
  'Bodega',
  'Forestville',
  'Geyserville',
  'Glen Ellen',
  'Guerneville',
  'Jenner',
  'Kenwood',
  'Larkfield-Wikiup',
  'Occidental'
];

export const MARIN_COUNTY_CITIES = [
  'San Rafael',
  'Novato',
  'Mill Valley',
  'Larkspur',
  'San Anselmo',
  'Tamalpais-Homestead Valley',
  'Corte Madera',
  'Tiburon',
  'Fairfax',
  'Sausalito',
  'Kentfield',
  'Lucas Valley-Marinwood',
  'Strawberry',
  'Santa Venetia',
  'Marin City',
  'Sleepy Hollow',
  'Ross',
  'Belvedere',
  'Lagunitas-Forest Knolls',
  'Bolinas',
  'Black Point-Green Point',
  'Woodacre',
  'Inverness'
];

export type Region = 'Sonoma County' | 'Marin County';

export function getCitiesForRegion(region: Region): string[] {
  return region === 'Sonoma County' ? SONOMA_COUNTY_CITIES : MARIN_COUNTY_CITIES;
}
