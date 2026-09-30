import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts'

// 正文里的链接与图片是 /_astro/xxx.webp、/blog/xxx/ 这类站内绝对路径。
// RSS 阅读器拿到的是一份脱离站点的文档，这些路径会失效，得换成完整 URL。
function absolutize(html, origin) {
  return html
    .replaceAll('href="/', `href="${origin}/`)
    .replaceAll('src="/', `src="${origin}/`)
    .replace(/srcset="([^"]*)"/g, (_, list) => {
      const candidates = list
        .split(',')
        .map((part) => part.trim().replace(/^\//, `${origin}/`))
        .join(', ')
      return `srcset="${candidates}"`
    })
}

export async function GET(context) {
  const origin = context.site.origin
  const container = await AstroContainer.create()

  // getCollection 不保证顺序，这里显式按发布日期倒序，
  // 否则阅读器会把旧文排在前面当成最新。
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await post.render()
      // 容器按「文档」模式渲染，会在片段前加一个 doctype；RSS 只要正文片段。
      const html = (await container.renderToString(Content)).replace(
        /^<!DOCTYPE html>/,
        ''
      )
      return {
        ...post.data,
        link: `/blog/${post.slug}/`,
        content: absolutize(html, origin),
      }
    })
  )

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
  })
}