import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  // 用 schema 约束 frontmatter，Decap 后台的字段需与此保持一致
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
  }),
})

export const collections = { blog }