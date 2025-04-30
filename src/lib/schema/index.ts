// Import schema types
import type { Thing } from 'schema-dts';

// Import schema classes
import { GoFlowSchema } from './base/GoFlowSchema';
import { OrganizationSchema } from './types/OrganizationSchema';
import { ServiceSchema } from './types/ServiceSchema';
import { ArticleSchema } from './types/ArticleSchema';
import { FAQSchema } from './types/FAQSchema';
import { WebPageSchema } from './types/WebPageSchema';

// Create singleton instance of OrganizationSchema
const organizationSchema = await OrganizationSchema.create();

// Export schema interfaces
export interface ServiceDetails {
  slug: string;
  title: string;
  description: string;
  offers?: Array<{ name: string; description: string; }>;
}

export interface ArticleDetails {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishDate: Date;
  modifyDate?: Date;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface WebPageDetails {
  url: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage' | 'FAQPage';
  mainEntity?: Thing;
}

// Export schema classes
export { GoFlowSchema };
export { OrganizationSchema };
export { ServiceSchema };
export { ArticleSchema };
export { FAQSchema };
export { WebPageSchema };

// Export schema instances
export { organizationSchema };

// Export factory functions
export function createOrganizationSchema() {
  return organizationSchema.build();
}

export async function createServiceSchema(details: ServiceDetails) {
  const schema = await ServiceSchema.create(details);
  return await schema.build();
}

export async function createArticleSchema(details: ArticleDetails) {
  const schema = await ArticleSchema.create(details);
  return await schema.build();
}

export async function createFAQSchema(questions: FAQItem[]) {
  const schema = await FAQSchema.create(questions);
  return await schema.build();
}

export async function createWebPageSchema(details: WebPageDetails) {
  const schema = await WebPageSchema.create(details);
  return await schema.build();
}
