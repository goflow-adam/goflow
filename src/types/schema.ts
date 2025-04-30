import type { WithContext, Thing, FAQPage, Question, WebPage, Service, Article } from 'schema-dts';

export interface BaseSchema {
  "@context": "https://schema.org";
  "@type": string;
  "@id"?: string;
}

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

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface Offer {
  "@type": "Offer";
  priceCurrency?: string;
  availability?: string;
  areaServed?: GeoCircle;
  priceRange?: string;
}

export interface OfferCatalog {
  "@type": "OfferCatalog";
  name: string;
  itemListElement: Array<{
    "@type": "Offer";
    itemOffered: {
      "@type": "Service";
      name: string;
      description: string;
    };
  }>;
}

export interface HomeAndConstructionBusiness {
  "@type": "HomeAndConstructionBusiness";
  name: string;
  description: string;
  address: PostalAddress;
  telephone: string;
  url: string;
  areaServed?: string[] | AdministrativeArea[];
}

export interface SearchAction {
  "@type": "SearchAction";
  target: string;
  "query-input": string;
}

export interface ContactPoint {
  "@type": "ContactPoint";
  telephone: string;
  contactType: string;
  areaServed?: AdministrativeArea[];
  availableLanguage?: string[];
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
  contactPoint: ContactPoint[];
  geo?: GeoCoordinates;
  areaServed?: string[] | AdministrativeArea[] | {
    "@type": "State";
    name: string;
    containsPlace: Array<{
      "@type": "AdministrativeArea";
      name: string;
    }>;
  };
  serviceArea?: {
    "@type": "GeoCircle";
    geoMidpoint: GeoCoordinates;
    geoRadius: string;
  };
  openingHoursSpecification?: Array<OpeningHoursSpecification>;
  priceRange?: string;
  sameAs?: string[];
  paymentAccepted?: string[];
  currenciesAccepted?: string;
  hasOfferCatalog?: OfferCatalog;
}

export interface FAQPageSchema extends BaseSchema {
  "@type": "FAQPage";
  mainEntity: Question[];
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
          "@type": "AdministrativeArea";
          name: string;
          description: string;
          containsPlace?: string[];
        };
        url: string;
      };
    }>;
  };
}

export interface ServiceSchema extends BaseSchema {
  "@type": "Service";
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
        "@type": "AdministrativeArea";
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
      "@type": "AdministrativeArea";
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

export interface Person {
  "@type": "Person";
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  description?: string;
}

export interface ArticleAuthor extends Person {
  "@context": "https://schema.org";
}

export interface ArticlePublisher {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: {
    "@type": "ImageObject";
    url: string;
  };
}

export interface ArticleSchema extends BaseSchema {
  "@type": "TechArticle" | "Article";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: Omit<ArticleAuthor, '@context'>;
  publisher: ArticlePublisher;
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
  "@type": "AdministrativeArea";
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
  provider: PlumberSchema;
  mainEntity?: {
    "@type": "ItemList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      item: {
        "@type": "Service";
        name: string;
        description: string;
        url: string;
        provider: { "@id": string };
        areaServed: Array<{
          "@type": string;
          name: string;
          description: string;
        }>;
      };
    }>;
  };
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
          "@type": "AdministrativeArea";
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
        "@type": "AdministrativeArea";
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
      "@type": "EducationalOccupationalCredential";
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
  url: string;
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
        "@type": "EducationalOccupationalCredential";
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
        "@type": "AdministrativeArea";
        name: string;
      }>;
    };
    address?: PostalAddress;
    telephone?: string;
    email?: string;
    priceRange?: string;
    image?: string;
    url?: string;
    contactPoint?: ContactPoint[];
    geo?: GeoCoordinates;
    openingHoursSpecification?: OpeningHoursSpecification[];
    paymentAccepted?: string[];
    currenciesAccepted?: string;
  };
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
  | WithContext<WebPage>
  | WithContext<Service>
  | WithContext<Article>
  | WithContext<FAQPage>
  | Schema[];
