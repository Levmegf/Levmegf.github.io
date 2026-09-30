// 站点级全局数据，任何组件都可以 import 使用。

export const SITE_TITLE = 'Levmegf'
export const SITE_DESCRIPTION = '做生活的高手'
export const SITE_AUTHOR = 'Levmegf'
// 页脚版权起始年份
export const SITE_START_YEAR = 2022
export const SITE_GITHUB = 'https://github.com/Levmegf'

// Giscus 评论：基于 GitHub Discussions，零后端。
// 开启步骤见 README：仓库开启 Discussions → 到 giscus.app 拿到 repo_id 与 category_id。
// 两个 id 留空时评论组件不渲染，站点照常构建。
export const GISCUS = {
  repo: 'Levmegf/Levmegf.github.io',
  repoId: 'R_kgDOHL8Q7A',
  category: 'Announcements',
  categoryId: 'DIC_kwDOHL8Q7M4DGsyX',
}