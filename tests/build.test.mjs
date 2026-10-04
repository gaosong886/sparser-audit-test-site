import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { buildSite, publishedFiles } from "../build.mjs";
import { publishTarget, renderHtml } from "../site.mjs";
import { attributes, readPage, root, visibleText } from "./helpers.mjs";

const target = publishTarget("https://gaosong886.github.io", "/sparser-audit-test-site");

test("static output uses the project base path without changing content or fixing defects implicitly", async () => {
  const result = await buildSite({ ...target, outputDirectory: join(root, ".local/pages-test") });
  assert.equal(result.files.length, 9);
  assert.deepEqual(result.files, publishedFiles);
  for (const page of ["index.html", "work/index.html", "about/index.html"]) {
    const original = await readPage(page);
    const built = await readFile(join(result.directory, page), "utf8");
    assert.ok(!built.includes("{{SITE_ORIGIN}}"));
    assert.ok(built.includes('href="/sparser-audit-test-site/styles.css"'));
    assert.ok(built.includes('href="/sparser-audit-test-site/work/"'));
    assert.ok(built.includes('href="https://gaosong886.github.io/sparser-audit-test-site/'));
    assert.equal(visibleText(built), visibleText(original));
    assert.equal([...built.matchAll(/<h1\b/gi)].length, [...original.matchAll(/<h1\b/gi)].length);
    const alts = (html) => [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => attributes(match[0]).alt);
    assert.deepEqual(alts(built), alts(original));
    const metas = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
    assert.deepEqual(metas(built), metas(original));
  }
  const sitemap = await readFile(join(result.directory, "sitemap.xml"), "utf8");
  for (const path of ["/", "/work/", "/about/"]) {
    assert.ok(sitemap.includes(`<loc>https://gaosong886.github.io/sparser-audit-test-site${path}</loc>`));
  }
});

test("base-path rewriting preserves anchors, external URLs, and protocol-relative assets", () => {
  const input = '<a href="#main">Skip</a><a href="https://example.com/">External</a><img src="//example.com/asset.svg"><a href="/">Home</a>';
  assert.equal(renderHtml(input, target), input.replace('href="/"', 'href="/sparser-audit-test-site/"'));
});

test("publishing rejects credentials and malformed origins or paths", () => {
  for (const origin of ["https://user:password@example.com", "file:///tmp/", "https://example.com/path", "https://example.com/?secret=value"]) {
    assert.throws(() => publishTarget(origin));
  }
  for (const path of ["repo", "/../repo", "/repo//sub", '/repo"']) {
    assert.throws(() => publishTarget("https://example.com", path));
  }
});
