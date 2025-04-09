export interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

export interface GeoCircle {
  "@type": "GeoCircle";
  geoMidpoint: GeoCoordinates;
  geoRadius: string;
}

export interface AdministrativeArea {
  "@type": "AdministrativeArea";
  name: string;
}

export interface City {
  "@type": "City";
  name: string;
  containedInPlace?: AdministrativeArea;
}

export interface BaseSchema {
  "@context": "https://schema.org";
  "@type": string;
  "@id"?: string;
}

export interface PlumberSchema extends BaseSchema {
  "@type": "Plumber";
  name: string;
  url: string;
  telephone: string;
  email?: string;
  image?: string;
  description?: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  areaServed?: string[] | Array<{
    "@type": "State" | "City";
    name: string;
  }>;
  serviceArea?: GeoCircle;
  openingHoursSpecification?: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  priceRange?: string;
  sameAs?: string[];
  paymentAccepted?: string[];
  currenciesAccepted?: string;
}

export interface Question {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface FAQPageSchema extends BaseSchema {
  "@type": "FAQPage";
  mainEntity: Question[];
}

export interface ServiceSchema extends BaseSchema {
  "@type": "Service";
  name: string;
  serviceProvider: Omit<PlumberSchema, '@context'>;
  areaServed: string[];
  serviceType: string;
  url: string;
}

export interface WebSiteSchema extends BaseSchema {
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface OrganizationSchema extends BaseSchema {
  "@type": "Organization";
  name: string;
  url: string;
  telephone: string;
  address: PostalAddress;
  location?: GeoCoordinates;
  priceRange?: string;
  areaServed?: string[] | Array<{
    "@type": "State" | "City";
    name: string;
  }>;
  openingHoursSpecification?: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  sameAs?: string[];
}

export interface ArticleSchema extends BaseSchema {
  "@type": "Article";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: Omit<PlumberSchema, '@context'>;
  publisher: Omit<PlumberSchema, '@context'>;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  image: string;
  inLanguage: string;
  isAccessibleForFree: boolean;
  keywords: string[];
  wordCount?: number;
  articleSection: string;
  genre: string;
}

export interface WebPageSchema extends BaseSchema {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description: string;
  provider: { "@id": string };
  about: Array<{
    "@type": "Service";
    name: string;
    description: string;
    url: string;
    provider: { "@id": string };
    areaServed: Array<{
      "@type": "AdministrativeArea";
      name: string;
      description: string;
      containsPlace?: string[];
    }>;
  }>;
}

export interface SearchResultsPageSchema extends BaseSchema {
  "@type": "SearchResultsPage";
  mainEntity: {
    "@type": "Plumber";
    name: string;
    areaServed: Array<{
      "@type": "ListItem";
      position: number;
      item: {
        "@type": "Service";
        name: string;
        description: string;
        provider: { "@id": string };
        areaServed: {
          "@type": "County";
          name: string;
          description: string;
          containsPlace?: string[];
        };
        url: string;
      };
    }>;
  };
}

export type Schema = 
  | PlumberSchema 
  | FAQPageSchema 
  | ServiceSchema 
  | WebSiteSchema 
  | OrganizationSchema 
  | ArticleSchema 
  | WebPageSchema
  | SearchResultsPageSchema
  | Schema[];
