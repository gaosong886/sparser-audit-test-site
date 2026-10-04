import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishTarget, renderHtml, renderRobots, renderSitemap } from "./site.mjs";

const directory = dirname(fileURLToPath(import.meta.url));
const documents = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/work/", ["work/index.html", "text/html; charset=utf-8"]],
  ["/about/", ["about/index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/assets/process.svg", ["assets/process.svg", "image/svg+xml"]],
]);

function publicOrigin(request, configuredOrigin) {
  if (configuredOrigin) {
    const configured = new URL(configuredOrigin);
    if (!["http:", "https:"].includes(configured.protocol)) {
      throw new Error("SITE_ORIGIN must use HTTP or HTTPS.");
    }
    return configured.origin;
  }
  const forwardedHost = request.headers["x-forwarded-host"];
  const host = String(forwardedHost ?? request.headers.host ?? "127.0.0.1:3050")
    .split(",")[0].trim();
  const forwardedProtocol = String(request.headers["x-forwarded-proto"] ?? "")
    .split(",")[0].trim();
  const localHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const protocol = forwardedProtocol === "https" || !localHost ? "https" : "http";
  return new URL(`${protocol}://${host}`).origin;
}

export function createSiteServer({ siteOrigin = process.env.SITE_ORIGIN } = {}) {
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(request.method ?? "")) {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain" });
      response.end("Method not allowed");
      return;
    }
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1:3050");
      const pathname = decodeURIComponent(url.pathname);
      if (["/work", "/about"].includes(pathname)) {
        response.writeHead(308, { Location: `${pathname}/${url.search}` });
        response.end();
        return;
      }
      const origin = publicOrigin(request, siteOrigin);
      const target = publishTarget(origin);
      let content;
      let contentType;
      if (pathname === "/robots.txt") {
        content = renderRobots(target);
        contentType = "text/plain; charset=utf-8";
      } else if (pathname === "/sitemap.xml") {
        content = renderSitemap(target);
        contentType = "application/xml; charset=utf-8";
      } else {
        const entry = documents.get(pathname);
        if (!entry) {
          response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("This page does not exist. Return to the Fieldnote Studio homepage.");
          return;
        }
        const [file, type] = entry;
        content = await readFile(join(directory, "public", file), "utf8");
        if (type.startsWith("text/html")) content = renderHtml(content, target);
        contentType = type;
      }
      response.writeHead(200, { "Content-Type": contentType });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("The requested address could not be read.");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3050);
  const server = createSiteServer();
  server.listen(port, "127.0.0.1", () => {
    console.info(`Fieldnote Studio test website: http://127.0.0.1:${port}`);
  });
  server.on("error", (error) => {
    console.error(`The test website could not start: ${error.message}`);
    process.exitCode = 1;
  });
  const stop = () => server.close(() => { process.exitCode = 0; });
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
