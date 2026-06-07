import { getSourceBadge } from "@/lib/fsbo/fsbo-media";
import { cn } from "@/lib/utils";

export function FsboSourceBadge({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const badge = getSourceBadge(source);

  return (
    <span
      title={badge.label}
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md text-[11px] font-bold shadow-sm",
        badge.className,
        className,
      )}
    >
      {badge.letter}
    </span>
  );
}
