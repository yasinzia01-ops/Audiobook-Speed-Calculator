import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts live in src/content/blog/<slug>.md and are served at /<slug>/.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // <title> tag. Defaults to "<title> - Audiobook Speed Calculator".
    seoTitle: z.string().optional(),
    description: z.string().optional(),
    published: z.coerce.date(),
    modified: z.coerce.date().optional(),
    author: z.string().default('sarah-thelistener'),
    category: z.string(),
    // Featured image in /public/images (1424x752 WebP; add a -768.webp copy for cards).
    image: z.string(),
    imageAlt: z.string().default(''),
    // Which of the two article designs to use: "libby" (cluster posts) or "guide".
    design: z.enum(['libby', 'guide']),
    breadcrumb: z.array(z.object({ label: z.string(), href: z.string().optional() })).optional(),
    tag: z.string().optional(),
    readTime: z.string().optional(),
    updated: z.string().optional(),
    readingMinutes: z.number().optional(),
    // Pulls the article up under the header, as the Elementor widget margin did.
    offsetTop: z.number().optional(),
  }),
});

export const collections = { blog };
