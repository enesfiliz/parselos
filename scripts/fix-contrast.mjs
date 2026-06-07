import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");

const replacements = [
  [/text-neutral-900/g, "text-zinc-50"],
  [/text-neutral-700/g, "text-zinc-300"],
  [/text-neutral-400/g, "text-zinc-500"],
  [/text-neutral-300/g, "text-zinc-500"],
  [/border-neutral-100/g, "border-parsel-border"],
  [/border-neutral-200/g, "border-parsel-border"],
  [/border-neutral-300/g, "border-parsel-border"],
  [/bg-neutral-50\/50/g, "bg-parsel-card/50"],
  [/bg-neutral-50\/60/g, "bg-parsel-card/50"],
  [/bg-neutral-50/g, "bg-parsel-card/40"],
  [/bg-neutral-100\/80/g, "bg-parsel-card/60"],
  [/bg-neutral-100/g, "bg-parsel-card/40"],
  [/ring-neutral-100\/80/g, "ring-parsel-border/80"],
  [/ring-neutral-100/g, "ring-parsel-border"],
  [/ring-neutral-200\/60/g, "ring-parsel-border/60"],
  [/\bbg-white shadow-sm\b/g, "border border-parsel-border bg-parsel-card shadow-sm"],
  [/border-neutral-300 bg-white/g, "border-parsel-border bg-parsel-card"],
  [/bg-parsel-border\/50\/30/g, "bg-parsel-border/30"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      if (p.includes("EkspertizView") && !p.includes("components")) continue;
      let content = fs.readFileSync(p, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
        from.lastIndex = 0;
      }
      if (changed) fs.writeFileSync(p, content);
    }
  }
}

walk(ROOT);

// table + feature views (ekspertiz handled separately for UI-only paths)
for (const rel of [
  "components/ui/table.tsx",
  "components/features/archive/ArsivView.tsx",
  "components/features/finance/FinansView.tsx",
  "components/features/clients/MusterilerView.tsx",
  "components/features/dashboard/DashboardDbError.tsx",
  "components/features/radar/ImarRadariView.tsx",
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, "utf8");
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
    from.lastIndex = 0;
  }
  fs.writeFileSync(p, content);
}

// Ekspertiz — yalnızca koyu panel (form), rapor önizlemesi beyaz kalır
const eks = path.join(ROOT, "components/features/appraisal/EkspertizView.tsx");
let eksContent = fs.readFileSync(eks, "utf8");
eksContent = eksContent.replace(
  /className="h-10 w-full border-neutral-300 bg-white shadow-sm"/g,
  'className="h-10 w-full border-parsel-border bg-parsel-card text-zinc-50 shadow-sm"',
);
eksContent = eksContent.replace(
  /className="border-neutral-300 bg-white shadow-sm"/g,
  'className="border-parsel-border bg-parsel-card text-zinc-50 shadow-sm"',
);
eksContent = eksContent.replace(
  /return <Clock className="size-5 text-neutral-400"/g,
  'return <Clock className="size-5 text-zinc-500"',
);
eksContent = eksContent.replace(
  /return <Percent className="size-5 text-neutral-400"/g,
  'return <Percent className="size-5 text-zinc-500"',
);
eksContent = eksContent.replace(
  /flex-1 overflow-y-auto rounded-2xl bg-neutral-100\/80 p-6 ring-1 ring-neutral-200\/60/g,
  "flex-1 overflow-y-auto rounded-2xl bg-parsel-card/40 p-6 ring-1 ring-parsel-border/60",
);
fs.writeFileSync(eks, eksContent);

console.log("Contrast fixes applied.");
