"use client";

import { cn } from "@/lib/utils";

type AdminAiToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function AdminAiToggle({
  checked,
  disabled = false,
  onChange,
  label,
}: AdminAiToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        checked
          ? "border-emerald-500/40 bg-emerald-500/20"
          : "border-white/10 bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full shadow-sm transition-transform",
          checked
            ? "translate-x-[22px] bg-emerald-300"
            : "translate-x-1 bg-zinc-500",
        )}
      />
    </button>
  );
}
