// Generates small WebP derivatives of the site's source photos, so grid
// thumbnails, map markers, and nav icons don't ship multi-megabyte
// originals to every visitor. See README's "Image derivatives" section.
//
// Sources live in originals/ (archival, never deployed); derivatives are
// written under the matching public/ folder, which is what actually gets
// served.
//
// Idempotent: skips a derivative if it already exists and is newer than
// its source, so re-running after adding one new photo is fast.
import { mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, parse } from 'node:path';
import sharp from 'sharp';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

// Two-tier directories: a small "thumb" for grids/map markers, a larger
// "full" for the detail dialog. Both are far smaller than the ~1800-3300px
// originals but sharp at up to 2x their CSS box size.
const TWO_TIER_DIRS = [
  { sourceDir: 'originals/pins', outputDir: 'public/pins/optimized', thumbWidth: 240, fullWidth: 640, quality: 82 },
  { sourceDir: 'originals/coffee_bags', outputDir: 'public/coffee_bags/optimized', thumbWidth: 320, fullWidth: 900, quality: 82 }
];

// Single-tier: static nav icons and the home-page portrait, each only
// ever rendered at one size (no detail-view counterpart).
const SINGLE_TIER_FILES = {
  'originals/home_imgs': {
    outputDir: 'public/home_imgs/optimized',
    widths: {
      'projects-closed.PNG': 300, 'projects-open.PNG': 300,
      'long-form-closed.PNG': 300, 'long-form-open.PNG': 300,
      'short-form-closed.PNG': 300, 'short-form-open.PNG': 300,
      'pin-closed.PNG': 300, 'pin-backing.PNG': 300,
      'kettle.PNG': 300, 'record.png': 300,
      'portrait.JPG': 900
    }
  }
};

let generated = 0;
let skipped = 0;

async function needsRebuild(srcPath, destPath) {
  try {
    const [srcStat, destStat] = await Promise.all([stat(srcPath), stat(destPath)]);
    return destStat.mtimeMs < srcStat.mtimeMs;
  } catch {
    return true; // dest doesn't exist yet
  }
}

async function generate(srcPath, destPath, width, quality) {
  if (!(await needsRebuild(srcPath, destPath))) { skipped += 1; return; }
  await mkdir(dirname(destPath), { recursive: true });
  await sharp(srcPath).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(destPath);
  generated += 1;
}

async function processTwoTierDir({ sourceDir, outputDir, thumbWidth, fullWidth, quality }) {
  let entries;
  try {
    entries = await readdir(sourceDir, { withFileTypes: true });
  } catch {
    return; // directory doesn't exist, nothing to do
  }
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (!IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    const { name: base } = parse(entry.name);
    const srcPath = join(sourceDir, entry.name);
    await generate(srcPath, join(outputDir, 'thumb', `${base}.webp`), thumbWidth, quality);
    await generate(srcPath, join(outputDir, 'full', `${base}.webp`), fullWidth, quality);
  }
}

async function processSingleTierFiles() {
  for (const [sourceDir, { outputDir, widths }] of Object.entries(SINGLE_TIER_FILES)) {
    for (const [filename, width] of Object.entries(widths)) {
      const srcPath = join(sourceDir, filename);
      const { name: base } = parse(filename);
      await generate(srcPath, join(outputDir, `${base}.webp`), width, 82);
    }
  }
}

for (const config of TWO_TIER_DIRS) await processTwoTierDir(config);
await processSingleTierFiles();

console.log(`Image derivatives: ${generated} generated, ${skipped} already up to date.`);
