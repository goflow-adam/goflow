import { defineCollection, z } from 'astro:content';

const personSchema = z.object({
  name: z.string(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  jobTitle: z.string(),
  description: z.string(),
  image: z.string().optional(),
  email: z.string().optional(),
  telephone: z.string().optional(),
  url: z.string().optional(),
  address: z.object({
    streetAddress: z.string(),
    addressLocality: z.string(),
    addressRegion: z.string(),
    postalCode: z.string(),
    addressCountry: z.string(),
  }).optional(),
  alumniOf: z.array(z.object({
    name: z.string(),
    degree: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  award: z.array(z.string()).optional(),
  hasCredential: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    dateIssued: z.date().optional(),
  })).optional(),
  socialProfiles: z.array(z.object({
    type: z.enum(['LinkedIn', 'Facebook', 'Twitter', 'Instagram']),
    url: z.string(),
  })).optional(),
});

const keywordSchema = z.object({
  term: z.string(),
  priority: z.number().int().min(1).max(10).default(5),
});

const baseSchema = z.object({
  title: z.string(),
  name: z.string().optional(),
  description: z.string(),
  linkText: z.string().optional(),
  menuText: z.string().optional(),
  breadcrumbDisplayText: z.string().optional(),
  position: z.number().int().optional(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  schema: z.any().optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  includeInMenu: z.boolean().default(false),
  keywords: z.array(z.union([z.string(), keywordSchema])).optional(),
  relatedWords: z.array(z.string()).optional(),
});

const services = defineCollection({
  schema: baseSchema.extend({
    location: z.string().optional(),
    featured: z.boolean().default(false),
    timeRequired: z.string().default('PT3H'),  // Default to 3 hours if not specified
    offers: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })).optional(),
  }),
});

const regions = defineCollection({
  schema: baseSchema.extend({
    region: z.string(),
    regionParent: z.string().optional(),
    location: z.string().optional(),
    featureTitle: z.string().optional(),
  }),
});

const articles = defineCollection({
  schema: baseSchema.extend({
    category: z.enum(['maintenance', 'repair', 'installation', 'emergency', 'general', 'pricing']),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().optional(),
  }),
});

const pages = defineCollection({
  schema: baseSchema.extend({
    teamMembers: z.array(personSchema).optional(),
    companyValues: z.array(z.object({
      name: z.string(),
      description: z.string(),
      items: z.array(z.string()).optional(),
    })).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      dateIssued: z.date().optional(),
      validUntil: z.date().optional(),
    })).optional(),
  }),
});

export const collections = {
  services,
  regions,
  articles,
  pages,
};
