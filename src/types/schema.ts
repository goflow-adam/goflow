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
  "@type": "AdministrativeArea" | "County" | "City";
  name: string;
  description?: string;
  containsPlace?: string[];
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
  areaServed?: string[] | AdministrativeArea[] | {
    "@type": "State";
    name: string;
    containsPlace: Array<{
      "@type": "County";
      name: string;
    }>;
  };
  serviceArea?: {
    "@type": "GeoCircle";
    geoMidpoint: GeoCoordinates;
    geoRadius: string;
  };
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
  hasOfferCatalog?: {
    "@type": "OfferCatalog";
    name: string;
    itemListElement: Array<{
      "@type": "Offer";
      itemOffered: {
        "@type": "PlumbingService";
        name: string;
        description: string;
      };
    }>;
  };
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
  "@type": "Service" | "PlumbingService";
  name: string;
  description: string;
  provider: { "@id": string };
  telephone?: string;
  priceRange?: string;
  address?: PostalAddress;
  image?: string;
  areaServed: Array<AdministrativeArea | { "@id": string } | string>;
  offers?: {
    "@type": "Offer";
    priceCurrency: string;
    availability: string;
    areaServed: GeoCircle;
    priceRange?: string;
  };
  serviceOutput?: {
    "@type": "HomeAndConstructionBusiness";
    name: string;
    description: string;
    address: PostalAddress;
    telephone: string;
    url: string;
    areaServed?: string[] | AdministrativeArea[] | {
      "@type": "State";
      name: string;
      containsPlace: Array<{
        "@type": "County";
        name: string;
      }>;
    };
  };
  category?: string;
  timeRequired?: string;
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
  areaServed?: string[] | AdministrativeArea[] | {
    "@type": "State";
    name: string;
    containsPlace: Array<{
      "@type": "County";
      name: string;
    }>;
  };
  openingHoursSpecification?: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  sameAs?: string[];
}

export interface ArticleSchema extends BaseSchema {
  "@type": "TechArticle" | "Article";
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
  proficiencyLevel?: "Beginner" | "Expert" | "Intermediate";
  dependencies?: string;
  about?: {
    "@type": "Thing";
    name: string;
    description: string;
  };
  audience?: {
    "@type": "Audience";
    audienceType: string;
  };
  abstract?: string;
  backstory?: string;
}

export interface AdministrativeAreaReference {
  "@context": "https://schema.org";
  "@type": "County" | "City";
  "@id": string;
  name: string;
  description: string;
  containsPlace?: string[];
}

export interface WebPageSchema extends BaseSchema {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description: string;
  provider: { "@id": string };
  about: Array<{
    "@type": "PlumbingService";
    name: string;
    description: string;
    url: string;
    provider: { "@id": string };
    areaServed: Array<{ "@id": string }>;
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
          "@type": "County" | "City";
          name: string;
          description: string;
          containsPlace?: string[];
        };
        url: string;
      };
    }>;
  };
}

export interface ContactPageSchema extends BaseSchema {
  "@type": "ContactPage";
  name: string;
  description: string;
  mainEntity: {
    "@type": "Organization" | "Plumber";
    "@id": string;
    name: string;
    image: string;
    telephone?: string;
    priceRange?: string;
    address?: PostalAddress;
    contactPoint: Array<{
      "@type": "ContactPoint";
      contactType: string;
      telephone?: string;
      email?: string;
      availableLanguage?: string[];
      areaServed?: AdministrativeArea[];
      hoursAvailable?: Array<{
        "@type": "OpeningHoursSpecification";
        dayOfWeek: string[];
        opens: string;
        closes: string;
      }>;
    }>;
    potentialAction?: Array<{
      "@type": "CommunicateAction";
      name: string;
      target: {
        "@type": "EntryPoint";
        urlTemplate: string;
        actionPlatform: string[];
      };
    }>;
  };
}

export interface AboutPageSchema extends BaseSchema {
  "@type": "AboutPage";
  name: string;
  description: string;
  mainEntity: {
    "@type": "Organization" | "Plumber";
    "@id": string;
    name: string;
    description: string;
    foundingDate: string;
    areaServed?: {
      "@type": "State";
      name: string;
      containsPlace: Array<{
        "@type": "County";
        name: string;
      }>;
    };
    founder: Array<{
      "@type": "Person";
      name: string;
      jobTitle: string;
      description?: string;
      url?: string;
      image?: string;
    }>;
    numberOfEmployees?: {
      "@type": "QuantitativeValue";
      value: number;
    };
    award?: string[];
    hasCredential?: Array<{
      "@type": "Credential";
      name: string;
      credentialCategory: string;
      validFrom?: string;
    }>;
    slogan?: string;
    brand?: {
      "@type": "Brand";
      name: string;
      description: string;
      logo?: string;
    };
  };
}

export interface TeamPageSchema extends BaseSchema {
  "@type": "AboutPage";
  name: string;
  description: string;
  mainEntity: {
    "@type": "Plumber";
    "@id": string;
    name: string;
    description: string;
    employee: Array<{
      "@type": "Person";
      name: string;
      jobTitle: string;
      description: string;
      url: string;
      image: string;
      hasCredential?: Array<{
        "@type": "Credential";
        name: string;
        credentialCategory: string;
        validFrom?: string;
      }>;
    }>;
    numberOfEmployees: {
      "@type": "QuantitativeValue";
      value: number;
    };
    areaServed?: {
      "@type": "State";
      name: string;
      containsPlace: Array<{
        "@type": "County";
        name: string;
      }>;
    };
  } & Omit<PlumberSchema, "@type">;
}

export type Schema = 
  | (PlumberSchema & { "@context": string })
  | FAQPageSchema 
  | ServiceSchema 
  | WebSiteSchema 
  | OrganizationSchema 
  | ArticleSchema 
  | WebPageSchema
  | SearchResultsPageSchema
  | AdministrativeAreaReference
  | ContactPageSchema
  | AboutPageSchema
  | TeamPageSchema
  | Schema[];
