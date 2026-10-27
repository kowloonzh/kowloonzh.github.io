# 井久的博客

基于 [AstroPaper](https://github.com/satnaing/astro-paper)（Astro 7）。push 到 `main` 后，GitHub Actions 会构建并部署到 `gh-pages` 分支。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 构建到 dist/
```

## 写文章

文章都放在 `src/content/posts/`，文件名就是 URL：`foo.md` 对应 `/posts/foo/`。

### Markdown

```markdown
---
title: 文章标题
pubDatetime: 2026-10-27T10:00:00+08:00
description: 一句话摘要（会显示在列表和 SEO 里）
tags: [编程, Go]
# slug: custom-url        # 可选：覆盖文件名生成的 URL
# featured: true          # 可选：首页精选
# draft: true             # 可选：草稿，不发布
---

正文……
```

图片放在 `src/content/posts/_assets/<slug>/`，用 `![](./_assets/<slug>/x.png)` 引用（以 `_` 开头的目录和文件不会被当成文章）。

### HTML

`.html` 文件也可以直接作为文章，有两种写法：

1. **HTML 片段**（没有 `<html>`/`<body>`）：内联渲染，样式和 Markdown 文章一致。
2. **完整 HTML 文档**（AI 生成的独立页面）：保留它自己的样式和脚本，放在一个自动撑高的 iframe 里，不会和博客样式互相干扰。

元数据可以写在文件开头的 `---` YAML 块里（字段同上）；不写的话会从页面里读取：

| 字段          | 读取来源                                  |
| ------------- | ----------------------------------------- |
| `title`       | `<title>`                                 |
| `description` | `<meta name="description" content="…">`   |
| `tags`        | `<meta name="keywords" content="a, b">`   |
| `pubDatetime` | `<meta name="date" content="2026-10-27">` |

## 一条命令发布：v2blog

```bash
v2blog post.md                 # 发布 Markdown
v2blog report.html             # 发布 HTML
v2blog post.md my-slug         # 指定 URL
V2BLOG_DRY_RUN=1 v2blog post.md  # 只检查，不提交
```

脚本会补齐缺失的 `pubDatetime`/`description`，复制文章引用到的本地图片，提交并推送到 `main`，然后输出文章地址。CI 部署完成后（约 1–2 分钟）就能打开。
