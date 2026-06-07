"use client";

import { Target, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

type MatchScoreBadgeProps = {
  percent: number;
  className?: string;
  icon?: "zap" | "target";
  compact?: boolean;
};

export function MatchScoreBadge({
  percent,
  className,
  icon = "zap",
  compact = false,
}: MatchScoreBadgeProps) {
  const Icon = icon === "target" ? Target : Zap;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      <Icon className={cn(compact ? "size-2.5" : "size-3")} strokeWidth={2.25} />
      %{percent} Eşleşme
    </span>
  );
}
