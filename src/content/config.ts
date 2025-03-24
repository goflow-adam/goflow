import { defineCollection, z } from 'astro:content';

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
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
  schema: baseSchema,
});

const pages = defineCollection({
  schema: baseSchema,
});

export const collections = {
  services,
  regions,
  pages,
};
