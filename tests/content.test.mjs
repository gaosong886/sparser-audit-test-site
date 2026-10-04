import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { pages, protectedContent, readPage, root } from "./helpers.mjs";

const baseline = JSON.parse(await readFile(join(root, "tests/content-baseline.json"), "utf8"));

for (const page of pages) {
  test(`${page}: preserve original visible copy, links, and image sources`, async () => {
    assert.deepEqual(protectedContent(await readPage(page)), baseline.pages[page]);
  });
  test(`${page}: all three page routes remain reachable through navigation`, async () => {
    const html = await readPage(page);
    const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i)?.[1] ?? "";
    for (const href of ["/", "/work/", "/about/"]) {
      assert.ok(header.includes(`href="${href}"`), `Keep navigation to ${href}`);
    }
    assert.ok(html.includes('id="main"'), "Keep the skip-link target");
    assert.ok(html.includes("Fictional studio and concept work"), "Keep the demonstration disclosure");
  });
}

test("the original process diagram is preserved", async () => {
  const diagram = await readFile(join(root, "public/assets/process.svg"));
  assert.equal(createHash("sha256").update(diagram).digest("hex"), baseline.processDiagramSha256);
});
