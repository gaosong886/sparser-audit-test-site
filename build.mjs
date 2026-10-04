import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { publishTarget, renderHtml, renderRobots, renderSitemap } from "./site.mjs";

const root = dirname(fileURLToPath(import.meta.url));
export const publishedFiles = [
  "index.html", "work/index.html", "about/index.html", "styles.css", "assets/process.svg",
  "robots.txt", "sitemap.xml", ".nojekyll", ".gitattributes",
];

export async function buildSite({ origin, basePath = "", outputDirectory = join(root, ".local/pages") }) {
  const target = publishTarget(origin, basePath);
  const output = resolve(outputDirectory);
  for (const file of publishedFiles) {
    const destination = join(output, file);
    await mkdir(dirname(destination), { recursive: true });
    if (file.endsWith(".html")) {
      await writeFile(destination, renderHtml(await readFile(join(root, "public", file), "utf8"), target));
    } else if (file === "robots.txt") {
      await writeFile(destination, renderRobots(target));
    } else if (file === "sitemap.xml") {
      await writeFile(destination, renderSitemap(target));
    } else if (file === ".nojekyll") {
      await writeFile(destination, "");
    } else if (file === ".gitattributes") {
      await writeFile(destination, "* text=auto eol=lf\n");
    } else {
      await copyFile(join(root, "public", file), destination);
    }
  }
  return { directory: output, url: `${target.origin}${target.basePath}/`, files: publishedFiles };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    origin: { type: "string" }, "base-path": { type: "string", default: "" },
  } });
  if (!values.origin) throw new Error("Pass --origin with the public site's origin.");
  const result = await buildSite({ origin: values.origin, basePath: values["base-path"] });
  console.log(`Built ${result.files.length} static files for ${result.url}`);
  console.log(`Output: ${result.directory}`);
}
