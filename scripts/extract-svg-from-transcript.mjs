import fs from "node:fs";
import path from "node:path";

const transcript = path.resolve(
  "C:/Users/Enes/.cursor/projects/c-Users-Enes-Desktop-parselos/agent-transcripts/0a011f0a-10ff-4457-90b4-1b751fe4947f/0a011f0a-10ff-4457-90b4-1b751fe4947f.jsonl",
);
const outDir = path.resolve("public/brand");

const lines = fs.readFileSync(transcript, "utf8").split("\n");
const userLine = lines.find((l) => l.includes("0 0 244 200") && l.includes("ADIM 1"));
if (!userLine) {
  console.error("User message line not found");
  process.exit(1);
}
const parsed = JSON.parse(userLine);
const text = parsed.message.content.find((c) => c.type === "text")?.text ?? "";

function extractSvg(viewBox) {
  const startMarker = "<svg version=\"1.1\"";
  const idx = text.indexOf(`viewBox="${viewBox}"`);
  if (idx < 0) return null;
  const svgStart = text.lastIndexOf(startMarker, idx);
  const end = text.indexOf("</svg>]", svgStart);
  if (svgStart < 0 || end < 0) return null;
  let raw = text.slice(svgStart, end + 6);
  raw = raw.replace(/^\[<svg/, "<svg").replace(/\]$/, "");
  return raw
    .replace(/\s+width="100%"/g, "")
    .replace(/\s+enable-background="[^"]*"/g, "")
    .replace(/\s+xml:space="preserve"/g, "")
    .replace(/\s+xmlns:xlink="[^"]*"/g, "");
}

fs.mkdirSync(outDir, { recursive: true });

const appIcon = extractSvg("0 0 244 200");
const logo = extractSvg("0 0 1295 465");

if (appIcon) {
  fs.writeFileSync(path.join(outDir, "app-icon.svg"), appIcon);
  console.log("app-icon.svg", appIcon.length);
} else {
  console.log("app-icon: NOT FOUND");
}

if (logo) {
  fs.writeFileSync(path.join(outDir, "logo.svg"), logo);
  console.log("logo.svg", logo.length);
} else {
  console.log("logo: NOT FOUND");
}
