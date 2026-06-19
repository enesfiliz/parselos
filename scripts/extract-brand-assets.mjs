/**
 * ParselOS brand sheet -> transparent logo, mark, favicon and app icons.
 *
 * The horizontal wordmark is kept as a high-resolution transparent PNG to
 * preserve the original letterforms. The mark is also exported as clean SVG in
 * public/brand/parselos-mark.svg for vector usage.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SRC = "C:/Users/Enes/Desktop/WhatsApp Image 2026-06-16 at 05.22.30.jpeg";
const OUT = path.join(ROOT, "public", "brand");

const LOGO_CROP = { left: 226, top: 126, width: 1186, height: 266 };
const MARK_CROP = { left: 232, top: 130, width: 226, height: 232 };

const APP_ICON_CROPS = [
  { name: "app-icon-ios-light.png", left: 58, top: 806, width: 126, height: 126 },
  { name: "app-icon-ios-green.png", left: 237, top: 806, width: 126, height: 126 },
  { name: "app-icon-ios-dark.png", left: 412, top: 806, width: 126, height: 126 },
  { name: "app-icon-android.png", left: 766, top: 806, width: 126, height: 126 },
];

const MINI_FAVICON_SVG = Buffer.from(`
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <path fill="#547236" d="M1 1h6v5H1z"/>
  <path fill="#7A9F45" d="M9 1h6v4l-6 2z"/>
  <path fill="#254D2B" d="M1 8h7v7H1z"/>
  <path fill="#B88A4A" d="M9 10h6v5H9z"/>
  <path fill="#F7F7F3" d="M7 1h2v14H7z"/>
  <path fill="#F7F7F3" d="M1 6h14v2H1z"/>
  <path fill="#F7F7F3" d="M8 8h2v2H8z"/>
</svg>
`);

function createIco(entries) {
  let offset = 6 + entries.length * 16;
  const header = Buffer.alloc(offset);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const pos = 6 + index * 16;
    header[pos] = entry.size === 256 ? 0 : entry.size;
    header[pos + 1] = entry.size === 256 ? 0 : entry.size;
    header[pos + 2] = 0;
    header[pos + 3] = 0;
    header.writeUInt16LE(1, pos + 4);
    header.writeUInt16LE(32, pos + 6);
    header.writeUInt32LE(entry.buffer.length, pos + 8);
    header.writeUInt32LE(offset, pos + 12);
    offset += entry.buffer.length;
  }

  return Buffer.concat([header, ...entries.map((entry) => entry.buffer)]);
}

function isNearWhite(r, g, b, threshold = 244) {
  return r >= threshold && g >= threshold && b >= threshold;
}

async function extractTransparent(region, outputPath, width) {
  const buffer = await sharp(SRC)
    .extract(region)
    .resize({ width, withoutEnlargement: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = buffer;
  for (let i = 0; i < data.length; i += 4) {
    if (isNearWhite(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function createDarkWordmark(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    const x = (i / 4) % info.width;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const isWordmarkArea = x > 318;
    const isGreen = g > r * 1.08 && g > b * 1.05 && max > 52;
    const isGold = r > 120 && g > 82 && b < 112 && r >= g * 0.92;
    const isBrandColor = isGreen || isGold;

    if (isWordmarkArea || (!isBrandColor && (max < 185 || sat < 0.28))) {
      const tone = max < 95 ? 245 : max < 145 ? 230 : 204;
      data[i] = tone;
      data[i + 1] = tone;
      data[i + 2] = Math.min(255, tone + 7);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  await sharp(SRC).png().toFile(path.join(OUT, "brand-sheet-source.png"));
  await extractTransparent(LOGO_CROP, path.join(OUT, "logo-horizontal.png"), 1420);
  await sharp(path.join(OUT, "logo-horizontal.png")).png().toFile(path.join(OUT, "logo-horizontal-raw.png"));
  await createDarkWordmark(
    path.join(OUT, "logo-horizontal.png"),
    path.join(OUT, "logo-horizontal-light.png"),
  );
  await extractTransparent(MARK_CROP, path.join(OUT, "icon-mark.png"), 1024);
  await sharp(path.join(OUT, "icon-mark.png")).png().toFile(path.join(OUT, "icon-mark-raw.png"));

  for (const crop of APP_ICON_CROPS) {
    await sharp(SRC)
      .extract(crop)
      .resize(512, 512)
      .png()
      .toFile(path.join(OUT, crop.name));
  }

  const mark = path.join(OUT, "icon-mark.png");
  await sharp(mark).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(OUT, "parselos-mark-512.png"));
  await sharp(mark).resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(OUT, "parselos-mark-192.png"));
  await sharp(path.join(OUT, "app-icon-ios-dark.png")).resize(512, 512).png().toFile(path.join(OUT, "icon-512.png"));
  await sharp(path.join(OUT, "app-icon-ios-dark.png")).resize(192, 192).png().toFile(path.join(OUT, "icon-192.png"));
  await sharp(path.join(OUT, "app-icon-ios-light.png")).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  await writeFile(path.join(OUT, "favicon.svg"), MINI_FAVICON_SVG);
  const favicon16 = await sharp(MINI_FAVICON_SVG).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(MINI_FAVICON_SVG).resize(32, 32, { kernel: "nearest" }).png().toBuffer();
  await writeFile(path.join(OUT, "favicon-16.png"), favicon16);
  await writeFile(path.join(OUT, "favicon-32.png"), favicon32);
  const ico = createIco([
    { size: 16, buffer: favicon16 },
    { size: 32, buffer: favicon32 },
  ]);
  await writeFile(path.join(ROOT, "src", "app", "favicon.ico"), ico);
  await writeFile(path.join(ROOT, "public", "favicon.ico"), ico);
  await sharp(path.join(OUT, "icon-512.png")).png().toFile(path.join(ROOT, "src", "app", "icon.png"));
  await sharp(path.join(OUT, "app-icon-ios-light.png")).resize(180, 180).png().toFile(path.join(ROOT, "src", "app", "apple-icon.png"));

  console.log("Brand assets generated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
