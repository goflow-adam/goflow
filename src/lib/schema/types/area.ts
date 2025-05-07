export interface City {
  '@type': 'City';
  name: string;
}

export interface ServiceArea {
  '@type': 'AdministrativeArea';
  name: string;
  description: string;
  containsPlace: City[];
}

export interface AreaServed {
  areaServed: ServiceArea[];
}
