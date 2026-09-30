import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

// 构建时生成静态索引，前端直接拉这个 JSON 做本地检索。
// 不走 Pagefind：它对中文分词支持一般，这里用子串匹配更贴合中文内容。
export const GET: APIRoute = async () => {
  const posts = await getCollection('blog')
  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    category: post.data.category ?? '',
    tags: post.data.tags ?? [],
    date: post.data.pubDate.toISOString(),
    body: (post.body ?? '').replace(/\s+/g, ' ').slice(0, 2000),
  }))

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}