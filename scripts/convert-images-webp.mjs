import { readdir, stat, readFile, writeFile, unlink } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const dirs = ["src/assets/stories", "src/assets/covers"];

// Recursively collect .png/.jpg files.
async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(png|jpe?g)$/i.test(name)) out.push(full);
  }
  return out;
}

let before = 0;
let after = 0;
let count = 0;

for (const rel of dirs) {
  const abs = resolve(root, rel);
  const files = await walk(abs);
  for (const file of files) {
    const orig = (await stat(file)).size;
    const outFile = file.replace(/\.(png|jpe?g)$/i, ".webp");
    // Cap width at 1920 (retina-safe for the ~1200px display), never upscale.
    await sharp(file)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outFile);
    const size = (await stat(outFile)).size;
    await unlink(file); // remove the original png/jpg
    before += orig;
    after += size;
    count++;
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
  `Converted ${count} images: ${mb(before)}MB → ${mb(after)}MB (saved ${mb(before - after)}MB)`,
);

// ── Update import paths in stories.ts (image imports only) ──────────────────
const storiesFile = resolve(root, "src/data/stories.ts");
let src = await readFile(storiesFile, "utf8");
// Only lines that reference assets/stories or assets/covers get .png/.jpg → .webp
src = src.replace(
  /(@\/assets\/(?:stories|covers)\/[^"']*?)\.(png|jpe?g)(["'])/g,
  "$1.webp$3",
);
// Glob pattern for first-action slides
src = src.replace(
  /first-action-sentences\/slide\*\.png/g,
  "first-action-sentences/slide*.webp",
);
await writeFile(storiesFile, src);
console.log("✅ Updated image import paths + glob in stories.ts");
