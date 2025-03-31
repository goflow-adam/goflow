import { defineCollection, z } from 'astro:content';

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  linkText: z.string().optional(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  schema: z.record(z.any()).optional(), // For JSON-LD schema
});

const services = defineCollection({
  schema: baseSchema.extend({
    featured: z.boolean().default(false),
  }),
});

const regions = defineCollection({
  schema: baseSchema.extend({
    region: z.string(),
    containsPlace: z.array(z.string()).optional(),
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
  schema: baseSchema,
});

export const collections = {
  services,
  regions,
  articles,
  pages,
};
