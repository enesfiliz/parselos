import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  ["bg-[#09090b]", "bg-background"],
  ["bg-[#050505]", "bg-parsel-admin"],
  ["bg-[#0A0A0A]", "bg-parsel-elevated"],
  ["bg-[#151f23]", "bg-parsel-panel"],
  ["bg-[#18181b]", "bg-card"],
  ["bg-[#0f1417]", "bg-parsel-sunken"],
  ["bg-[#12181c]", "bg-parsel-sunken"],
  ["bg-[#111a1f]", "bg-parsel-sunken"],
  ["bg-[#1f1f23]", "bg-parsel-elevated"],
  ["border-zinc-800/80", "border-border"],
  ["border-zinc-800", "border-border"],
  ["border-white/5", "border-border/50"],
  ["border-white/10", "border-border"],
  ["border-white/[0.04]", "border-border/40"],
  ["border-white/[0.06]", "border-border/60"],
  ["text-zinc-100", "text-foreground"],
  ["text-zinc-50", "text-foreground"],
  ["text-zinc-200", "text-foreground"],
  ["text-zinc-300", "text-foreground/90"],
  ["text-zinc-400", "text-muted-foreground"],
  ["text-zinc-500", "text-muted-foreground"],
  ["text-zinc-600", "text-muted-foreground"],
  ["hover:text-zinc-100", "hover:text-foreground"],
  ["hover:text-zinc-200", "hover:text-foreground"],
  ["hover:bg-white/5", "hover:bg-foreground/5"],
  ["hover:bg-white/[0.04]", "hover:bg-foreground/[0.04]"],
  ["hover:bg-white/[0.02]", "hover:bg-foreground/[0.02]"],
  ["text-[#b38c56]", "text-parsel-gold"],
  ["bg-[#b38c56]", "bg-parsel-gold"],
  ["hover:bg-[#c2985e]", "hover:brightness-110"],
  ["hover:border-[#b38c56]", "hover:border-parsel-gold"],
  ["bg-zinc-950/60", "bg-parsel-sunken/80"],
  ["bg-zinc-950/50", "bg-parsel-sunken/70"],
  ["bg-zinc-900/80", "bg-card/80"],
  ["bg-zinc-900/50", "bg-card/50"],
  ["bg-zinc-800/80", "bg-border/80"],
  ["bg-zinc-800", "bg-border"],
  ["border-zinc-700", "border-border"],
  ["hover:border-zinc-700", "hover:border-border"],
  ["border-parsel-border", "border-border"],
  ["text-parsel-textMuted", "text-muted-foreground"],
  ["text-parsel-textMain", "text-foreground"],
  ["text-parsel-bg", "text-background"],
  ["from-[#09090b]", "from-background"],
  ["to-[#09090b]", "to-background"],
  ["hover:bg-zinc-900/50", "hover:bg-accent/50"],
  ["border border-zinc-700 bg-zinc-900", "border border-border bg-accent"],
  ["text-white/90", "text-foreground/90"],
  ["text-white/80", "text-foreground/80"],
  ["text-white/70", "text-foreground/70"],
  ["text-white/60", "text-muted-foreground"],
  ["text-white/50", "text-muted-foreground"],
  ["text-white/40", "text-muted-foreground"],
  ["text-white/30", "text-muted-foreground"],
  ["text-white/20", "text-muted-foreground"],
  ["bg-white/10", "bg-foreground/10"],
  ["bg-white/5", "bg-foreground/5"],
  ["hover:bg-white/10", "hover:bg-foreground/10"],
  ["hover:text-white", "hover:text-foreground"],
  ["border-white/[0.08]", "border-border/60"],
  ["border-white/[0.05]", "border-border/50"],
  ["text-white ", "text-foreground "],
  [" text-white", " text-foreground"],
];

const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

let totalChanges = 0;

for (const file of walk(ROOT)) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      totalChanges += count;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log("updated:", path.relative(process.cwd(), file));
  }
}

console.log(`\nDone. ${totalChanges} token replacements.`);
