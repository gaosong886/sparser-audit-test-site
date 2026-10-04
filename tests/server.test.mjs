import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createSiteServer } from "../server.mjs";

const server = createSiteServer({ siteOrigin: "https://fieldnote.example" });
let origin;
before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

for (const path of ["/", "/work/", "/about/"]) {
  test(`${path}: serves crawlable HTML with a public canonical`, async () => {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    const html = await response.text();
    assert.ok(html.includes(`href="https://fieldnote.example${path}"`));
    assert.ok(html.includes("Sparser test website"));
    assert.ok(!html.includes("{{SITE_ORIGIN}}"));
  });
}

test("sitemap lists only the three demo pages and robots allows crawling", async () => {
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.equal([...sitemap.matchAll(/<url>/g)].length, 3);
  for (const path of ["/", "/work/", "/about/"]) {
    assert.ok(sitemap.includes(`<loc>https://fieldnote.example${path}</loc>`));
  }
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.ok(robots.includes("Allow: /"));
  assert.ok(robots.includes("Sitemap: https://fieldnote.example/sitemap.xml"));
});

test("source, secrets, unknown files, and mutation requests are not served", async () => {
  for (const path of ["/.env", "/server.mjs", "/package.json", "/not-found", "/assets/missing.svg"]) {
    assert.equal((await fetch(`${origin}${path}`)).status, 404, path);
  }
  assert.equal((await fetch(origin, { method: "POST" })).status, 405);
});

test("page aliases redirect and HEAD returns headers without a body", async () => {
  const redirect = await fetch(`${origin}/about`, { redirect: "manual" });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "/about/");
  const head = await fetch(origin, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});
