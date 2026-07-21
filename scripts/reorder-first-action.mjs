import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/stories.ts");
let src = await readFile(file, "utf8");

// New display order by ORIGINAL page number (1-based).
// 1st=whose is that(11), 2nd=oh lovely(16), 3rd=when go(18), 4th=say hello(6),
// then the rest in their existing order.
const order = [11, 16, 18, 6, 1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 19, 20];

const startIdx = src.indexOf(`id: "first-action-sentences",`);
const pagesStart = src.indexOf("pages: [\n", startIdx) + "pages: [\n".length;
const pagesEnd = src.indexOf("\n    ],", pagesStart);
const body = src.slice(pagesStart, pagesEnd);

// Split into blocks — each page object starts with "      { image: fasImg(".
const lines = body.split("\n");
const blocks = [];
let cur = null;
for (const line of lines) {
  if (/^\s{6}\{ image: fasImg\(/.test(line)) {
    if (cur) blocks.push(cur);
    cur = [line];
  } else if (cur) {
    cur.push(line);
  }
}
if (cur) blocks.push(cur);

if (blocks.length !== 20) throw new Error(`Expected 20 page blocks, got ${blocks.length}`);

const reordered = order.map((n) => blocks[n - 1].join("\n")).join("\n");
src = src.slice(0, pagesStart) + reordered + src.slice(pagesEnd);
await writeFile(file, src);
console.log("✅ Reordered First Action Sentences pages:", order.join(", "));
