import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import tailwind from '@astrojs/tailwind'

import { remarkUploads, uploadsIntegration } from './uploads.mjs'

// https://astro.build/config
export default defineConfig({
  // 用户站，根路径直接发布，无需配置 base
  site: 'https://levmegf.github.io',
  integrations: [
    mdx(),
    sitemap({
      // /admin 是纯前端后台，没有可索引内容，排除掉免得污染 sitemap
      filter: (page) => !page.includes('/admin'),
    }),
    tailwind(),
    // 把后台上传的原图额外提供到 /images/uploads/，供 Decap 读图
    uploadsIntegration(),
  ],
  // 图片统一交给 sharp：构建期转 WebP、按需生成多尺寸，清晰度和体积都能控
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  // 站内链接进入视口就预取，点开即达，省掉一次白屏等待
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    // 体积小的 CSS 直接内联进 HTML，少一个阻塞渲染的请求
    inlineStylesheets: 'auto',
  },
  markdown: {
    // 把后台写下的 /images/uploads/xxx.png 改写成可被优化的相对路径
    remarkPlugins: [remarkUploads],
    shikiConfig: {
      // 亮色 / 暗色各一套配色，跟随站点主题切换
      themes: {
        light: 'catppuccin-latte',
        dark: 'poimandres',
      },
    },
  },
})