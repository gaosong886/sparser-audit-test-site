import assert from "node:assert/strict";
import { test } from "node:test";
import { readPage, visibleText } from "./helpers.mjs";

for (const [page, topic, slogan] of [
  ["index.html", /Fieldnote.*fictional independent design studio.*websites/i, "Make room for the useful."],
  ["about/index.html", /Fieldnote Studio.*testing how Sparser/i, "Better questions. Clearer work."],
]) {
  test(`${page}: descriptive H1 and preserved supporting slogan`, async () => {
    const html = await readPage(page);
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    assert.equal(headings.length, 1);
    assert.match(visibleText(headings[0][1]), topic);
    const supporting = [...html.matchAll(/<p\b[^>]*class="display-title"[^>]*>([\s\S]*?)<\/p>/gi)];
    assert.equal(supporting.length, 1);
    assert.equal(visibleText(supporting[0][1]), slogan);
  });
}
