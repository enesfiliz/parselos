/**
 * app-icon.svg → favicon / PWA / app/icon.png
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SVG = path.join(ROOT, "public/brand/app-icon.svg");
const BG = "#09090b";

const outputs = [
  { file: "public/brand/favicon-32.png", size: 32 },
  { file: "public/brand/icon-192.png", size: 192 },
  { file: "public/brand/icon-512.png", size: 512 },
  { file: "public/brand/apple-touch-icon.png", size: 180 },
  { file: "src/app/icon.png", size: 32 },
  { file: "src/app/apple-icon.png", size: 180 },
];

async function render(size, outPath) {
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(SVG)
    .resize(size, size, {
      fit: "contain",
      background: BG,
    })
    .png()
    .toFile(outPath);
  console.log("✓", path.relative(ROOT, outPath), `${size}px`);
}

for (const { file, size } of outputs) {
  await render(size, path.join(ROOT, file));
}
