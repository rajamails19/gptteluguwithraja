// Crop every slide image in a story folder to the 16:7 slide frame.
//
// Usage:
//   node scripts/crop-slides-16-7.mjs                       (defaults to first-action-sentences)
//   node scripts/crop-slides-16-7.mjs first-action-sentences
//   node scripts/crop-slides-16-7.mjs path/to/any/folder
//
// - Center-crops each *.png / *.jpg to 16:7 (matches the reader's slide frame).
// - Skips files that are already 16:7 (idempotent — safe to re-run).
// - Skips *-original.* backups, and saves a one-time *-original.* backup before
//   the first crop so nothing is ever lost.

import { readdir, copyFile, stat } from "node:fs/promises";
import { resolve, extname, basename, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = resolve(new URL("..", import.meta.url).pathname);

const RATIO_W = 16;
const RATIO_H = 7;

const arg = process.argv[2] || "first-action-sentences";
// Accept either a bare book name or a full/relative path.
const folder = arg.includes("/")
  ? resolve(root, arg)
  : resolve(root, "src/assets/stories", arg);

try {
  await stat(folder);
} catch {
  console.error(`❌ Folder not found: ${folder}`);
  process.exit(1);
}

async function dims(file) {
  const { stdout } = await run("sips", [
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    file,
  ]);
  const w = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const h = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return { w, h };
}

const entries = await readdir(folder);
const images = entries.filter(
  (f) => /\.(png|jpe?g)$/i.test(f) && !/-original\.(png|jpe?g)$/i.test(f),
);

if (images.length === 0) {
  console.log("No slide images found to crop.");
  process.exit(0);
}

let cropped = 0;
let skipped = 0;

for (const name of images) {
  const file = resolve(folder, name);
  const { w, h } = await dims(file);
  if (!w || !h) {
    console.log(`  ? ${name} — could not read size, skipping`);
    continue;
  }

  const targetH = Math.round((w * RATIO_H) / RATIO_W);
  if (Math.abs(h - targetH) <= 2) {
    skipped++;
    continue; // already 16:7
  }

  // One-time backup before the first crop.
  const ext = extname(name);
  const stem = basename(name, ext);
  const backup = resolve(dirname(file), `${stem}-original${ext}`);
  try {
    await stat(backup);
  } catch {
    await copyFile(file, backup);
  }

  await run("sips", ["-c", String(targetH), String(w), file, "--out", file]);
  console.log(`  ✂️  ${name}: ${w}x${h} → ${w}x${targetH}`);
  cropped++;
}

console.log(
  `\n✅ Done. Cropped ${cropped}, already-16:7 ${skipped}. Folder: ${folder}`,
);
