import { cn } from "@/lib/utils";

type RadarLoaderProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function RadarLoader({ className, size = "sm" }: RadarLoaderProps) {
  return (
    <div
      className={cn(
        "parsel-radar-loader",
        size === "sm" && "parsel-radar-loader--sm",
        size === "lg" && "parsel-radar-loader--lg",
        className,
      )}
      aria-hidden
    >
      <span />
    </div>
  );
}
