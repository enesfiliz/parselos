import { cn } from "@/lib/utils";

type ParselAiGlyphProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizeMap = {
  sm: "size-4",
  md: "size-5",
} as const;

export function ParselAiGlyph({ size = "md", className }: ParselAiGlyphProps) {
  const dim = sizeMap[size];

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", dim, className)}
      aria-hidden
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full border-[1.5px] border-white/20 bg-gradient-to-tr from-[#b38c56] to-transparent animate-[spin_4s_linear_infinite]",
          dim,
        )}
      />
      <span
        className={cn(
          "absolute inset-[2px] rounded-full border border-border opacity-90 animate-[spin_6s_linear_infinite_reverse]",
          dim,
        )}
        style={{
          background:
            "conic-gradient(from 200deg, transparent 0deg, rgba(179,140,86,0.55) 110deg, transparent 220deg)",
        }}
      />
      <span
        className={cn(
          "absolute inset-[5px] rounded-full bg-parsel-elevated border border-border/60",
          size === "sm" ? "inset-[3px]" : "inset-[5px]",
        )}
      />
    </span>
  );
}
