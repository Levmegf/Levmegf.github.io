# Levmegf 博客源码

Hexo + Butterfly 主题的个人博客源码。发布方式为 **GitHub Actions 自动构建 → GitHub Pages**，
支持三种写作方式：本地 Markdown、网页后台（Decap CMS）、手机浏览器。

- 线上地址：https://levmegf.github.io/
- 仓库：https://github.com/Levmegf/Levmegf.github.io

---

## 一、技术栈

| 组成 | 说明 |
| --- | --- |
| [Hexo](https://hexo.io/zh-cn/) 8.1 | 静态站点生成器 |
| [Butterfly](https://butterfly.js.org/) 5.7 | 主题（仍在活跃维护） |
| GitHub Actions | 推送后自动构建并部署到 Pages |
| Decap CMS | 浏览器可视化写作后台，挂在 `/admin/` |

## 二、目录结构

```
.
├── .github/workflows/pages.yml   # 自动构建 + 部署
├── _config.yml                   # Hexo 主配置
├── _config.butterfly.yml         # Butterfly 主题配置（改这里，别改 node_modules）
├── package.json                  # 依赖与命令
├── scaffolds/                    # 新建文章的模板
├── source/
│   ├── _posts/                   # 文章（Markdown）
│   ├── about/  categories/  tags/  # 独立页面
│   ├── admin/                    # Decap CMS 后台（config.yml 在这里）
│   └── img/                      # 图片资源
└── themes/                       # 空目录；主题走 npm 安装
```

> 主题通过 npm 安装（`hexo-theme-butterfly`），所以 `themes/` 是空的，升级只需
> `npm update hexo-theme-butterfly`。

---

## 三、首次迁移：把现有仓库改造成「源码仓库」

现在仓库里存放的是**生成后的 HTML**，需要改成存放源码。

```bash
# 1. 克隆现有仓库
git clone https://github.com/Levmegf/Levmegf.github.io.git
cd Levmegf.github.io

# 2. 留一条备份分支（万一要回头找旧文件）
git branch backup-generated && git push origin backup-generated

# 3. 删掉旧的生成产物（这些以后由 CI 自动生成）
git rm -r archives css js live2dw 2022 2023 index.html atom.xml sitemap.txt sitemap.xml
#   注意：img/ 里如果有你还想保留的图片，先挪到 source/img/ 再删
git rm -r 2026   # 这个文件是误提交的，顺手清掉

# 4. 把本项目的源码文件复制到仓库根目录（覆盖进来）
#    即把 blog-source/ 下的所有内容拷到 Levmegf.github.io/ 下

# 5. 本地装依赖并预览
npm install
npm run server        # 打开 http://localhost:4000 检查

# 6. 提交并推送
git add .
git commit -m "refactor: 迁移为 Hexo 源码仓库 + Actions 自动部署"
git push
```

**最后一步（关键）**：到仓库 `Settings > Pages > Source`，把发布源改成 **GitHub Actions**。
之后每次 `git push`，Actions 会自动构建并发布。

---

## 四、日常写作：三种方式

### 方式 1：本地 Markdown（最常用）

```bash
npm run new "我的标题"      # 生成 source/_posts/我的标题.md
npm run server             # 本地预览 http://localhost:4000
git add . && git commit -m "post: 我的标题" && git push   # 推送后约 1 分钟自动上线
```

文章头部（front-matter）字段：

```yaml
---
title: 我的标题
date: 2026-09-28 15:30:00
tags: [随笔]
categories: [生活]
description: 用于 SEO 摘要和分享卡片
cover: /img/uploads/xxx.jpg   # 可选，文章封面
---
```

### 方式 2：网页后台 Decap CMS

部署完成后访问 **https://levmegf.github.io/admin/**，登录后即可像写公众号一样
在线编辑、上传图片、点按钮发布。

后台配置文件在 `source/admin/config.yml`。

> ⚠️ Decap 用 GitHub 登录必须有认证服务（GitHub 的硬性要求）。当前采用
> **方案 A：Decap Turbo 托管认证**，配置已完成，还差一步——填 `turbo_site_id`。

**方案 A：Decap Turbo 托管认证（当前采用）**

1. 到 https://turbo.decapcms.org/signup 注册（Free 档：1 站点 1 席位，永久免费，不用信用卡）
2. **先连 Git**：组织侧边栏 `Git connection` → 安装 Turbo GitHub App，
   授权给 `Levmegf` 账号（可只勾 `Levmegf.github.io` 这一个仓库）
3. **再建站点**：`Sites` → 新建，按下面填：

   | 字段 | 填什么 |
   | --- | --- |
   | Site name | 随便，比如 `Levmegf Blog` |
   | Git provider | `GitHub` |
   | Repo | `Levmegf/Levmegf.github.io` |
   | Branch | `master` |
   | Config path | `source/admin/config.yml`（**仓库相对路径**，不是网址） |
   | Admin interface URL(s) | `https://levmegf.github.io/admin/` |

4. 建好后打开该站点 → **Overview** 页 → 复制 **Site ID**（一串 UUID）
5. 把 `source/admin/config.yml` 里的 `REPLACE_WITH_TURBO_SITE_ID` 换成这串 ID，
   提交推送，等 Actions 跑完即可登录

**方案 B：自建 Cloudflare Worker OAuth 代理（完全免费，无第三方）**

不想依赖 Turbo 时改用这条，把 `config.yml` 的 `backend` 换回 `name: github`
并补上 `repo: Levmegf/Levmegf.github.io`：

1. 在 GitHub 建一个 OAuth App：`Settings > Developer settings > OAuth Apps`
   - Homepage URL：`https://levmegf.github.io`
   - Authorization callback URL：`https://你的worker.workers.dev/callback`
2. 用 [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) 模板部署一个
   Cloudflare Worker，填入 Client ID / Secret
3. 把 Worker 地址填进 `config.yml` 的 `base_url`

> 顺带一提：Decap 的配置文件与 [Sveltia CMS](https://github.com/sveltia/sveltia-cms)
> 完全兼容，后者更轻、移动端体验更好，且认证走 Cloudflare Worker 即可，不需要 beta 版。
> 想换的话，把 `source/admin/index.html` 里的 CDN 地址换成 Sveltia 的即可。

### 方式 3：手机发布

- **手机浏览器**打开 `https://levmegf.github.io/admin/`（配合方案 A/B 已可登录）
- 或直接打开 GitHub 仓库 → `source/_posts/` → `Add file > Create new file`，写 Markdown 提交

---

## 五、自定义指南

| 想改什么 | 去哪里改 |
| --- | --- |
| 站点标题 / 副标题 / 作者 | `_config.yml` 顶部 |
| 导航菜单、头像、背景图 | `_config.butterfly.yml` 的 `menu` / `avatar` / `index_img` |
| 主题色、字体、圆角 | 直接写进 `source/css/custom.css`（已自动引入，改完 push 即生效） |
| 评论 | `_config.butterfly.yml` 的 `comments` + `giscus`（见文件内注释） |
| 访问量统计 | `busuanzi` 段，已默认开启 |
| 站内搜索 | `local_search` 段，已默认开启 |
| 页脚年份 / 版权 | `footer` 段 |

改完 `push` 即自动生效，无需本地构建。

---

## 六、常见问题

**Q：想绑定自定义域名？**
在仓库 `Settings > Pages > Custom domain` 填域名，然后在 `source/` 下新建 `CNAME` 文件
（内容为你的域名），并把 `_config.yml` 的 `url` 改成 `https://你的域名`。

**Q：构建失败，提示 sitemap 插件相关错误？**
`hexo-generator-sitemap` 版本较旧（依赖 hexo-util v2）。如遇报错，先执行
`npm uninstall hexo-generator-sitemap` 并从 `_config.yml` 删掉 `sitemap:` 段即可，
其余功能不受影响。

**Q：图片怎么放？**
统一放 `source/img/`（后台后台上传的会进 `source/img/uploads/`），Markdown 里写
`![说明](/img/uploads/xxx.jpg)`。建议别再依赖外部图床（旧站的 `s2.loli.net` 链接已不稳定）。

**Q：原来的音乐播放器没了？**
Butterfly 5.x 已移除内置的 APlayer/Meting。如需恢复，参考主题文档
[《移除内建 APlayer / Meting 后的替代方法》](https://butterfly.js.org/) 注入外部播放器。

**Q：文章 URL 会变吗？**
不变。`permalink` 仍为 `:year/:month/:day/:title/`，两篇旧文的文件名保持中文，URL 与原来一致。

---

## 七、后续可选的优化

- 绑定自定义域名 + 强制 HTTPS，修正 SEO 的 canonical 地址
- 文章多起来后把本地搜索换成 Algolia
- 加 `hexo-wordcount` 显示字数与阅读时长（`_config.butterfly.yml` 里 `wordcount.enable` 改 true）
- 想更现代的框架（Astro / Hugo）时可再迁移，但当前配置已足够日常使用