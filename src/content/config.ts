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

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  linkText: z.string().optional(),
  menuText: z.string().optional(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false)
});

const services = defineCollection({
  schema: baseSchema.extend({
    featured: z.boolean().default(false),
  }),
});

const regions = defineCollection({
  schema: baseSchema.extend({
    region: z.string(),
    containsPlace: z.array(
      z.union([
        z.tuple([z.string()]),
        z.tuple([z.string(), z.boolean()])
      ])
    ).optional(),
    includeInMenu: z.boolean().default(false),
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
