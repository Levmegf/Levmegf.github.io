import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Decap 后台上传的图片存这里
const UPLOAD_DIR = 'src/assets/uploads'
// 后台读图用的公开路径，与 public/admin/config.yml 的 public_folder 保持一致
const PUBLIC_PREFIX = '/images/uploads/'

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
}

/**
 * Decap 写进 Markdown 的是 /images/uploads/xxx.png 这种绝对路径，
 * Astro 会把它当 public/ 静态文件原样拷贝，完全不做优化。
 * 这里在解析 Markdown 时把它改写成指向 src/assets/uploads 的相对路径，
 * 交给 Astro 的 sharp 管线处理（转 WebP、出多尺寸、补宽高）。
 */
export function remarkUploads() {
  return (tree, file) => {
    if (typeof file?.path !== 'string') return
    const dir = path.dirname(file.path)
    const root = path.resolve(UPLOAD_DIR)

    const walk = (node) => {
      if (
        node.type === 'image' &&
        typeof node.url === 'string' &&
        node.url.startsWith(PUBLIC_PREFIX)
      ) {
        const abs = path.join(
          root,
          decodeURIComponent(node.url.slice(PUBLIC_PREFIX.length))
        )
        if (fs.existsSync(abs)) {
          node.url = path.relative(dir, abs).split(path.sep).join('/')
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(walk)
    }

    walk(tree)
  }
}

/**
 * 把原图额外提供到 /images/uploads/，供 Decap 后台读图：
 * - 构建后拷进 dist，线上后台（/admin/）的媒体库与图片预览才有图可显示；
 * - 开发时用中间件提供同样的路径，本地开后台也能看到缩略图。
 * 代价是原图在产物里多存一份。它只被后台读，访客走的仍是优化后的 WebP。
 */
export function uploadsIntegration() {
  const root = path.resolve(UPLOAD_DIR)

  return {
    name: 'uploads-public',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!fs.existsSync(root)) return
        const dest = fileURLToPath(new URL('images/uploads/', dir))
        await fs.promises.mkdir(dest, { recursive: true })
        await fs.promises.cp(root, dest, { recursive: true })
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? ''
          if (!url.startsWith(PUBLIC_PREFIX)) return next()
          const file = path.join(
            root,
            decodeURIComponent(url.slice(PUBLIC_PREFIX.length).split('?')[0])
          )
          if (!file.startsWith(root) || !fs.existsSync(file)) return next()
          res.setHeader(
            'Content-Type',
            MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
          )
          fs.createReadStream(file).pipe(res)
        })
      },
    },
  }
}