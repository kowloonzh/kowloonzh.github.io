import { glob as globFiles, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { parseFrontmatter } from "@astrojs/markdown-remark";
import type { Loader, LoaderContext } from "astro/loaders";

/**
 * Loads `.html` posts into the same collection as markdown posts.
 *
 * Metadata comes from a leading YAML frontmatter block (`---`), falling back to
 * `<title>`, `<meta name="description">`, `<meta name="keywords">` (tags) and
 * `<meta name="date">` (pubDatetime) so a plain AI-generated page works as-is.
 *
 * - A fragment (no <html>/<body>) is rendered inline, styled like markdown.
 * - A full document keeps its own styles/scripts and is embedded in an
 *   auto-height iframe, so it can't clash with the site's CSS.
 */
export function withHtmlPosts(base: Loader, dir: string): Loader {
  return {
    name: "posts-with-html",
    load: async context => {
      await base.load(context);
      const root = resolve(context.config.root.pathname, dir);
      await loadAll(context, root);

      context.watcher?.on("all", async (event, path) => {
        if (!path.endsWith(".html") || !path.startsWith(root)) return;
        if (event === "unlink") {
          context.store.delete(toId(root, path));
          return;
        }
        if (event === "add" || event === "change") {
          await loadOne(context, root, path);
        }
      });
    },
  };
}

async function loadAll(context: LoaderContext, root: string) {
  for await (const rel of globFiles("**/*.html", { cwd: root })) {
    const name = rel.split("/").pop() ?? "";
    if (name.startsWith("_")) continue;
    await loadOne(context, root, resolve(root, rel));
  }
}

function toId(root: string, path: string) {
  return relative(root, path).replace(/\.html$/, "");
}

async function loadOne(context: LoaderContext, root: string, path: string) {
  const raw = await readFile(path, "utf-8");
  const { frontmatter, content } = parseFrontmatter(raw);
  const html = content.trim();

  const meta = (name: string) =>
    html
      .match(
        new RegExp(
          `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
          "i"
        )
      )?.[1]
      ?.trim();

  const fallback: Record<string, unknown> = {
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(),
    description: meta("description"),
    tags: meta("keywords")
      ?.split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean),
    pubDatetime: meta("date"),
  };
  const merged = { ...stripUndefined(fallback), ...frontmatter };
  if (typeof merged.pubDatetime === "string") {
    merged.pubDatetime = new Date(merged.pubDatetime);
  }

  const slug = typeof merged.slug === "string" ? merged.slug : undefined;
  const id = slug ?? toId(root, path);
  const filePath = relative(context.config.root.pathname, path);
  const data = await context.parseData({ id, data: merged, filePath });

  context.store.set({
    id,
    data,
    body: html,
    filePath,
    digest: context.generateDigest(raw),
    rendered: { html: render(html), metadata: { frontmatter: merged } },
  });
}

function stripUndefined(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== "")
  );
}

function isFullDocument(html: string) {
  return /<!doctype\s+html|<html[\s>]|<body[\s>]/i.test(html);
}

function render(html: string) {
  if (!isFullDocument(html)) return html;

  const srcdoc = html.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  // Plain text copy so pagefind can index what's inside the iframe.
  const text = html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/</g, "&lt;");

  const fit =
    "var d=this.contentDocument;if(!d)return;var f=this;" +
    "var r=function(){f.style.height=d.documentElement.scrollHeight+'px'};" +
    "r();new ResizeObserver(r).observe(d.documentElement)";

  return (
    `<iframe class="html-post-frame" srcdoc="${srcdoc}" ` +
    `style="width:100%;border:0;display:block;min-height:60vh" ` +
    `loading="eager" onload="${fit}"></iframe>` +
    `<div class="sr-only" aria-hidden="true">${text}</div>`
  );
}
