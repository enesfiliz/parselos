/**
 * Marka şablonu → ayrı PNG'ler + beyaz arka plan temizleme
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SRC =
  "C:/Users/Enes/.cursor/projects/c-Users-Enes-Desktop-parselos/assets/c__Users_Enes_AppData_Roaming_Cursor_User_workspaceStorage_ceaad41b98f231ded702d363e58faf6b_images_image-08c2c431-19a5-4aee-8c44-c624baf2a93a.png";
const OUT = path.join(ROOT, "public", "brand");

const CROPS = [
  { name: "icon-mark-raw.png", left: 38, top: 82, width: 268, height: 175 },
  {
    name: "logo-horizontal-raw.png",
    left: 262,
    top: 95,
    width: 445,
    height: 168,
  },
  { name: "app-icon-ios-light.png", left: 48, top: 348, width: 158, height: 158 },
  { name: "app-icon-ios-green.png", left: 206, top: 348, width: 158, height: 158 },
  { name: "app-icon-ios-dark.png", left: 364, top: 348, width: 158, height: 158 },
  { name: "favicon-circle.png", left: 522, top: 348, width: 158, height: 158 },
  { name: "app-icon-android.png", left: 680, top: 348, width: 158, height: 158 },
];

/** Beyaz / açık gri pikselleri şeffaf yap (koyu zemin için) */
async function removeLightBackground(inputPath, outputPath, threshold = 248) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function cropTrim(region, outPath) {
  await sharp(SRC).extract(region).trim({ threshold: 14 }).png().toFile(outPath);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const crop of CROPS) {
    await cropTrim(crop, path.join(OUT, crop.name));
    console.log("✓", crop.name);
  }

  await removeLightBackground(
    path.join(OUT, "icon-mark-raw.png"),
    path.join(OUT, "icon-mark.png"),
  );
  console.log("✓ icon-mark.png (transparent)");

  // Yatay logo: sadece açık zemin referansı — koyu UI'da kullanılmayacak
  await removeLightBackground(
    path.join(OUT, "logo-horizontal-raw.png"),
    path.join(OUT, "logo-horizontal-light.png"),
  );
  console.log("✓ logo-horizontal-light.png");

  const dark = path.join(OUT, "app-icon-ios-dark.png");
  const mark = path.join(OUT, "icon-mark.png");

  await sharp(dark).resize(512, 512).png().toFile(path.join(OUT, "icon-512.png"));
  await sharp(dark).resize(192, 192).png().toFile(path.join(OUT, "icon-192.png"));
  await sharp(dark).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  await sharp(mark).resize(32, 32).png().toFile(path.join(OUT, "favicon-32.png"));
  await sharp(dark).resize(32, 32).png().toFile(path.join(ROOT, "src", "app", "icon.png"));
  await sharp(dark)
    .resize(180, 180)
    .png()
    .toFile(path.join(ROOT, "src", "app", "apple-icon.png"));

  console.log("✓ favicon / app icons");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
