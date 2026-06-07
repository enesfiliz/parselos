import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const BRAND = path.join(ROOT, "public/brand");
const UI = path.join(ROOT, "src/components/ui");

function prepareSvg(raw, { darkGaps = false } = {}) {
  let svg = raw.trim();
  if (svg.startsWith("[<svg")) svg = svg.slice(1);
  if (svg.endsWith("]")) svg = svg.slice(0, -1);

  svg = svg
    .replace(/\s+width="100%"/g, "")
    .replace(/\s+enable-background="[^"]*"/g, "")
    .replace(/\s+xml:space="preserve"/g, "")
    .replace(/\s+xmlns:xlink="[^"]*"/g, "")
    .replace(/\s+x="0px"/g, "")
    .replace(/\s+y="0px"/g, "")
    .replace(/\s+id="Layer_1"/g, "");

  if (darkGaps) {
    svg = svg.replaceAll('fill="#000000"', 'fill="#09090b"');
  } else {
    // Tam tuval maskesi — koyu zeminde görünmez olmalı
    svg = svg.replaceAll('fill="#000000"', 'fill="none"');
    for (const c of ["#151F23", "#152024", "#070E13"]) {
      svg = svg.replaceAll(`fill="${c}"`, 'fill="currentColor"');
    }
  }

  return svg;
}

function escapeForTemplate(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function writeComponent(fileName, exportName, svgPath, options) {
  const raw = fs.readFileSync(svgPath, "utf8");
  const svg = prepareSvg(raw, options);
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 100 100";

  const inner = svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();

  const defaultClass =
    exportName === "Logo" ? "h-8 w-auto" : "w-8 h-8";

  const content = `import { cn } from "@/lib/utils";

const ${exportName.toUpperCase()}_MARKUP = \`${escapeForTemplate(inner)}\`;

export type ${exportName}Props = {
  className?: string;
};

export const ${exportName} = ({
  className = "${defaultClass}",
}: ${exportName}Props) => (
  <svg
    viewBox="${viewBox}"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className={cn("shrink-0", className)}
    dangerouslySetInnerHTML={{ __html: ${exportName.toUpperCase()}_MARKUP }}
  />
);
`;

  fs.writeFileSync(path.join(UI, fileName), content);
  console.log("wrote", fileName, `(${inner.length} chars inner)`);
}

fs.mkdirSync(UI, { recursive: true });

writeComponent("AppIcon.tsx", "AppIcon", path.join(BRAND, "app-icon.svg"), {
  darkGaps: true,
});
writeComponent("Logo.tsx", "Logo", path.join(BRAND, "logo.svg"), {
  darkGaps: false,
});
