import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = dirname(dirname(fileURLToPath(import.meta.url)));
export const pages = ["index.html", "work/index.html", "about/index.html"];
export const readPage = (path) => readFile(join(root, "public", path), "utf8");

export function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)]
    .map((match) => [match[1].toLowerCase(), match[3]]));
}

export function visibleText(markup) {
  return markup.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&").replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<").replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"').replaceAll("&#39;", "'")
    .replace(/\s+/g, " ").trim();
}

export function protectedContent(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
  return {
    text: visibleText(body),
    links: [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map((match) => ({ href: attributes(match[1]).href, text: visibleText(match[2]) })),
    images: [...body.matchAll(/<img\b[^>]*>/gi)].map((match) => {
      const { src, width, height } = attributes(match[0]);
      return { src, width, height };
    }),
  };
}
