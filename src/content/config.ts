import { defineCollection, z } from 'astro:content'

// Decap 的 public_folder 是 /images/uploads，封面图写进 frontmatter 的是绝对路径；
// 而 Astro 的 image() 只解析相对路径（绝对路径会被当成 public/ 里的静态文件原样输出）。
// 这里先改写成相对路径再交给 image()，路径与 uploads.mjs 里的 PUBLIC_PREFIX 对应。
const UPLOADS_PREFIX = '/images/uploads/'
const UPLOADS_RELATIVE = '../../assets/uploads/'

const resolveUpload = (value: unknown) =>
  typeof value === 'string' && value.startsWith(UPLOADS_PREFIX)
    ? UPLOADS_RELATIVE + value.slice(UPLOADS_PREFIX.length)
    : value

const blog = defineCollection({
  type: 'content',
  // 用 schema 约束 frontmatter，Decap 后台的字段需与此保持一致。
  // 写成函数形式才能拿到 image() 助手，把封面图路径转成可优化的图片对象。
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.preprocess(resolveUpload, image().optional()),
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
    }),
})

export const collections = { blog }