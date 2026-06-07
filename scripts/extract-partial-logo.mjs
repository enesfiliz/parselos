import fs from "node:fs";
import path from "node:path";

const transcript = path.resolve(
  "C:/Users/Enes/.cursor/projects/c-Users-Enes-Desktop-parselos/agent-transcripts/0a011f0a-10ff-4457-90b4-1b751fe4947f/0a011f0a-10ff-4457-90b4-1b751fe4947f.jsonl",
);
const out = path.resolve("public/brand/logo.svg");

const lines = fs.readFileSync(transcript, "utf8").split("\n");
const userLine = lines.find((l) => l.includes("ADIM 1"));
const text = JSON.parse(userLine).message.content.find((c) => c.type === "text").text;

const start = text.indexOf('viewBox="0 0 1295 465"');
const svgStart = text.lastIndexOf("<svg version", start);
let chunk = text.slice(svgStart);

// Truncated message — cut at last complete </path>
const lastPath = chunk.lastIndexOf("</path>");
if (lastPath > 0) {
  chunk = chunk.slice(0, lastPath + 7) + "\n</svg>\n";
}

chunk = chunk
  .replace(/^\[<svg/, "<svg")
  .replace(/\s+width="100%"/g, "")
  .replace(/\s+enable-background="[^"]*"/g, "")
  .replace(/\s+xml:space="preserve"/g, "")
  .replace(/\s+xmlns:xlink="[^"]*"/g, "");

chunk = chunk.replaceAll('fill="#000000"', 'fill="none"');
for (const c of ["#151F23", "#152024", "#070E13"]) {
  chunk = chunk.replaceAll(`fill="${c}"`, 'fill="currentColor"');
}

fs.writeFileSync(out, chunk);
console.log("logo.svg bytes", fs.statSync(out).size);
