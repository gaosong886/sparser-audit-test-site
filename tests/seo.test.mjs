import assert from "node:assert/strict";
import { test } from "node:test";
import { attributes, readPage, visibleText } from "./helpers.mjs";

test("homepage has one useful meta description", async () => {
  const html = await readPage("index.html");
  const descriptions = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => attributes(match[0])).filter((meta) => meta.name?.toLowerCase() === "description");
  assert.equal(descriptions.length, 1, "Add one homepage meta description without changing visible copy.");
  assert.ok(descriptions[0].content?.length >= 50, "Describe the fictional studio and this demo meaningfully.");
  assert.ok(descriptions[0].content.length <= 200, "Keep the description concise.");
});

test("Work page identifies its main topic with one H1", async () => {
  const html = await readPage("work/index.html");
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(headings.length, 1, "Promote the existing page heading to H1; preserve its text and appearance.");
  assert.equal(visibleText(headings[0][1]), "Small projects. Thoughtful outcomes.");
});

test("About process diagram has meaningful alternative text", async () => {
  const html = await readPage("about/index.html");
  const diagram = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((match) => attributes(match[0])).find((image) => image.src === "/assets/process.svg");
  assert.ok(diagram, "Preserve the original process image.");
  assert.ok(typeof diagram.alt === "string" && diagram.alt.length >= 15,
    "Add alternative text describing the process diagram.");
  for (const word of ["listen", "frame", "make"]) {
    assert.ok(diagram.alt.toLowerCase().includes(word), `The diagram includes the ${word} stage.`);
  }
});
