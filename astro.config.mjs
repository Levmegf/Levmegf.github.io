import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  // 用户站，根路径直接发布，无需配置 base
  site: 'https://levmegf.github.io',
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    shikiConfig: {
      // 亮色 / 暗色各一套配色，跟随站点主题切换
      themes: {
        light: 'catppuccin-latte',
        dark: 'poimandres',
      },
    },
  },
})