# Levmegf 的博客

个人博客，基于 [Astro](https://astro.build/) + [void-astro](https://github.com/eAntillon/void-astro) 主题。
站点地址：https://levmegf.github.io/

> 这个仓库原先跑的是 Hexo + Butterfly。2026-09 整体迁移到 Astro，
> 旧版本完整保留在 `hexo-archive` 分支，随时可以回滚。

## 技术栈

| 用途 | 方案 |
| --- | --- |
| 静态站点框架 | Astro 4 |
| 样式 | TailwindCSS 3 |
| 内容 | Astro 内容集合（Markdown） |
| 后台 | Decap CMS（Turbo 托管认证） |
| 评论 | Giscus（GitHub Discussions） |
| 搜索 | 构建期生成 JSON 索引 + 前端本地检索 |
| 部署 | GitHub Actions → GitHub Pages |

## 目录结构

```
.
├── .github/workflows/
│   ├── pages.yml           # push 到 master 时构建并部署到 Pages
│   └── astro-check.yml     # 只在 astro 分支跑构建校验，不部署
├── public/
│   ├── admin/              # Decap CMS 后台（/admin/）
│   ├── images/uploads/     # 后台上传的图片
│   └── 2022/ 2023/ ...     # Hexo 时代旧链接的跳转页
├── src/
│   ├── components/         # 页头、页脚、图标、目录、评论等
│   ├── content/blog/       # 文章（Markdown）
│   ├── layouts/BlogPost.astro
│   ├── pages/              # 路由：首页 / 文章 / 归档 / 分类 / 标签 / 搜索 / 关于
│   ├── consts.ts           # 站点信息与 Giscus 配置
│   └── styles/global.css
└── astro.config.mjs
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
npm run check      # Astro + TypeScript 类型检查
```

## 写文章

### 方式一：网页后台（推荐）

打开 https://levmegf.github.io/admin/ ，用 GitHub 账号登录后可视化编辑，
保存即提交到仓库，CI 会自动重新构建部署。

后台字段与 `src/content/config.ts` 里的 schema 一一对应：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| 标题 | 是 | 文章标题 |
| 简介 | 是 | 列表页摘要 |
| 发布日期 | 是 | 决定排序与归档年份 |
| 更新日期 | 否 | 有则显示「更新于」 |
| 分类 | 否 | 单个，出现在「分类」页 |
| 标签 | 否 | 多个，出现在「标签」页 |
| 封面图 | 否 | 上传到 `public/images/uploads/` |
| 正文 | 是 | Markdown |

> 后台的文件名沿用中文标题（`slug.encoding: unicode`）。
> 文件名就是文章的 URL，改动文件名等于改动链接。

### 方式二：直接写 Markdown

在 `src/content/blog/` 新建 `文章名.md`：

```markdown
---
title: 文章标题
description: 一句话简介
pubDate: 2026-09-30 12:00:00
category: 随笔
tags:
  - 生活
---

正文……
```

改完 `git push` 到 `master`，CI 会自动部署。

## 部署

推送到 `master` 即触发 `.github/workflows/pages.yml`：
`npm install` → `npm run build` → 上传 `dist/` → 发布到 GitHub Pages。

Pages 的发布源需为 **GitHub Actions**（Settings → Pages → Build and deployment）。

## 评论

Giscus 已接入，配置在 `src/consts.ts` 的 `GISCUS`。
仓库 Discussions 已开启，评论归类在 `Announcements`。
两个 id 留空时评论组件自动不渲染，不影响构建。

## 从 Hexo 迁移的说明

- 旧文章 URL 形如 `/2022/12/07/形容/`，新站是 `/blog/形容/`。
  旧地址在 `public/` 下留了跳转页，老链接不会 404。
- 旧站备份：`hexo-archive` 分支（对应迁移前的最后一次提交）。
- 迁移前后台（Decap）继续沿用 Turbo 托管认证，配置已按 Astro 的
  内容集合调整，`/admin/` 路径不变。

## 许可

主题 void-astro 为 MIT 协议，见 `LICENSE`。