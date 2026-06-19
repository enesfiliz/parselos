import { RadarLoader } from "@/components/ui/RadarLoader";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  className?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
};

export function PageLoader({
  label,
  className,
  fullScreen = false,
  size = "sm",
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "Yükleniyor"}
      className={cn(
        "flex w-full flex-col items-center justify-center text-center",
        fullScreen
          ? "fixed inset-0 z-50 bg-background/90 backdrop-blur-sm"
          : "min-h-[calc(100dvh-11rem)]",
        className,
      )}
    >
      <RadarLoader size={size} />
      {label ? (
        <p className="mt-2 text-[10px] font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}
    </div>
  );
}
