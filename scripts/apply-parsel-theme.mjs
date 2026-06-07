import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");

const replacements = [
  [/bg-\[#09090b\]/g, "bg-parsel-bg"],
  [/bg-\[#18181b\]\/95/g, "bg-parsel-card/95"],
  [/bg-\[#18181b\]\/50/g, "bg-parsel-card/80"],
  [/bg-\[#18181b\]/g, "bg-parsel-card"],
  [/text-\[#09090b\]/g, "text-parsel-bg"],
  [/text-\[#C9B896\]/g, "text-parsel-gold"],
  [/border-\[#C9B896\]/g, "border-parsel-gold"],
  [/bg-\[#C9B896\]/g, "bg-parsel-gold"],
  [/hover:bg-\[#D4C4A8\]/g, "hover:bg-parsel-gold/90"],
  [/hover:bg-\[#C9B896\]/g, "hover:bg-parsel-gold/90"],
  [/hover:text-\[#7cb342\]/g, "hover:text-parsel-primaryHover"],
  [/text-\[#7cb342\]/g, "text-parsel-primary"],
  [/ring-\[#C9B896\]/g, "ring-parsel-gold"],
  [/border-zinc-800\/80/g, "border-parsel-border/80"],
  [/border-zinc-800\/50/g, "border-parsel-border/50"],
  [/border-zinc-800/g, "border-parsel-border"],
  [/border-zinc-700/g, "border-parsel-border"],
  [/bg-zinc-900\/40/g, "bg-parsel-card/60"],
  [/bg-zinc-900/g, "bg-parsel-card"],
  [/bg-zinc-800\/80/g, "bg-parsel-border/40"],
  [/bg-zinc-800\/50/g, "bg-parsel-border/30"],
  [/bg-zinc-800/g, "bg-parsel-border/50"],
  [/text-zinc-100/g, "text-parsel-textMain"],
  [/text-zinc-400/g, "text-parsel-textMuted"],
  [/text-zinc-500/g, "text-parsel-textMuted"],
  [/text-zinc-300/g, "text-parsel-textMuted"],
  [/text-zinc-600/g, "text-parsel-textMuted/80"],
  [/hover:text-zinc-100/g, "hover:text-parsel-textMain"],
  [/hover:text-zinc-300/g, "hover:text-parsel-textMain"],
  [/hover:border-zinc-700/g, "hover:border-parsel-border"],
  [/hover:border-zinc-800/g, "hover:border-parsel-border"],
  [/hover:bg-zinc-900/g, "hover:bg-parsel-card"],
  [/font-\[family-name:var\(--font-plus-jakarta\)\]/g, "font-sans"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx|ts|css)$/.test(name) && !name.includes("clerk-appearance")) {
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

walk(SRC);
console.log("Parsel theme tokens applied under src/");
