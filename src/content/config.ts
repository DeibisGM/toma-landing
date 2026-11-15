import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    image: z.string(),
    author: z.string().default('Equipo Toma'),
    readTime: z.string().default('5 min de lectura'),
    featured: z.boolean().default(false)
  })
});

export const collections = { blog };
