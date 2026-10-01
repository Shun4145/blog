import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    notes: defineCollection({
      type: 'page',
      source: { include: 'notes/**/*.md', prefix: '' },
      schema: z.object({
        path: z.string(), source: z.string().optional(), kind: z.string(), section: z.string(),
        weight: z.number().optional(), tags: z.array(z.string()).default([]),
        date: z.string().nullable().optional(), lastmod: z.string().nullable().optional(),
        featured: z.boolean().default(false), draft: z.boolean().default(false),
        planned: z.array(z.string()).optional(), toc: z.boolean().optional(),
      }),
    }),
  },
})
