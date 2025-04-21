import type { 
  WithContext,
  Thing,
  Plumber,
  WebPage,
  Organization,
  Article,
  ItemList,
  SearchResultsPage,
  AboutPage,
  ContactPage,
  FAQPage,
  OpeningHoursSpecification,
  PostalAddress,
  GeoCoordinates,
  State,
  AdministrativeArea,
  OfferCatalog,
  Offer,
  Person,
  Brand,
  EducationalOccupationalCredential,
  QuantitativeValue,
  ContactPoint,
  SearchAction,
  CommunicateAction,
  EntryPoint,
  Service,
  GeoShape,
  GeoCircle,
  Question,
  Answer
} from 'schema-dts';

// Define our base types using schema-dts
export type Schema =
  | WithContext<Plumber>
  | WithContext<WebPage>
  | WithContext<Organization>
  | WithContext<Article>
  | WithContext<ItemList>
  | WithContext<SearchResultsPage>
  | WithContext<AboutPage>
  | WithContext<ContactPage>
  | WithContext<FAQPage>
  | WithContext<Thing>;

// Re-export common types we use throughout the app
export type { 
  Plumber,
  WebPage,
  Organization,
  Article,
  ItemList,
  SearchResultsPage,
  AboutPage,
  ContactPage,
  FAQPage,
  OpeningHoursSpecification,
  PostalAddress,
  GeoCoordinates,
  State,
  AdministrativeArea,
  OfferCatalog,
  Offer,
  Person,
  Brand,
  EducationalOccupationalCredential,
  QuantitativeValue,
  ContactPoint,
  SearchAction,
  CommunicateAction,
  EntryPoint,
  Service,
  GeoShape,
  GeoCircle,
  Question,
  Answer
};

// Helper type for JSON-LD context
export type WithSchemaContext<T extends Thing> = WithContext<T>;
