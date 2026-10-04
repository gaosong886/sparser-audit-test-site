export const pagePaths = ["/", "/work/", "/about/"];

export function publishTarget(origin, basePath = "") {
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Use an HTTP(S) origin without credentials, path, query, or fragment.");
  }
  const base = basePath.replace(/\/$/, "");
  if (base && (!/^\/[A-Za-z0-9_/-]+$/.test(base) || base.includes("//"))) {
    throw new Error("Use an empty base path or a slash-prefixed repository path.");
  }
  return { origin: url.origin, basePath: base };
}

export function renderHtml(html, target) {
  return html.replaceAll("{{SITE_ORIGIN}}", `${target.origin}${target.basePath}`)
    .replace(/\b(href|src)=(['"])\/(?!\/)/gi, (_match, name, quote) =>
      `${name}=${quote}${target.basePath}/`);
}

export function renderSitemap(target) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pagePaths.map((path) => `  <url><loc>${target.origin}${target.basePath}${path}</loc></url>`).join("\n") +
    "\n</urlset>\n";
}

export function renderRobots(target) {
  return `User-agent: *\nAllow: /\nSitemap: ${target.origin}${target.basePath}/sitemap.xml\n`;
}
