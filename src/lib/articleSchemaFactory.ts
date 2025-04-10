import type { CollectionEntry } from 'astro:content';
import type { ArticleSchema } from '../types/schema';
import { businessInfo } from './schema';

export function createArticleSchema(article: CollectionEntry<'articles'>): ArticleSchema {
  // Determine if this is a technical article
  const isTechnical = article.data.category === 'maintenance' || 
                     article.data.tags?.some(tag => 
                       ['maintenance', 'repair', 'installation', 'troubleshooting'].includes(tag));

  return {
    "@context": "https://schema.org",
    "@type": isTechnical ? "TechArticle" : "Article",
    "headline": article.data.title,
    "description": article.data.description,
    "datePublished": new Date(article.data.pubDate).toISOString(),
    "dateModified": article.data.updatedDate ? 
      new Date(article.data.updatedDate).toISOString() : 
      new Date(article.data.pubDate).toISOString(),
    "author": {
      "@id": "https://goflow.plumbing/#business",
      ...businessInfo
    },
    "publisher": {
      "@id": "https://goflow.plumbing/#business",
      ...businessInfo
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://goflow.plumbing/articles/${article.slug}`
    },
    "image": article.data.heroImage || "https://goflow.plumbing/GoFlow2.jpg",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "keywords": article.data.tags || [],
    "articleSection": article.data.category || "plumbing",
    "genre": "Professional Services",
    ...(isTechnical ? {
      "proficiencyLevel": "Beginner",
      "dependencies": "Basic plumbing tools and knowledge",
      "about": {
        "@type": "Thing",
        "name": article.data.title,
        "description": `Technical guide about ${article.data.title.toLowerCase()}`
      }
    } : {}),
    "audience": {
      "@type": "Audience",
      "audienceType": "Homeowners and property managers"
    },
    "abstract": article.data.description,
    "backstory": "Helping homeowners maintain their plumbing systems effectively"
  };
}
