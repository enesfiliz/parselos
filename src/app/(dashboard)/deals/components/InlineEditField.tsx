"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InlineEditFieldProps = {
  label: string;
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  accent?: boolean;
  mono?: boolean;
  type?: "text" | "number";
};

export function InlineEditField({
  label,
  value,
  onSave,
  placeholder = "—",
  accent,
  mono,
  type = "text",
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="group/field">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="h-8 border-white/10 bg-[#0f1417] text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={commit}
            className="text-[#b38c56] hover:bg-[#b38c56]/10"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={cancel}
            className="text-zinc-500"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group/field w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-sm text-zinc-200",
            accent && "text-[#b38c56]",
            mono && "font-mono text-xs",
            !value && "text-zinc-600",
          )}
        >
          {value || placeholder}
        </p>
        <Pencil className="size-3 shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover/field:opacity-100" />
      </div>
    </button>
  );
}

type InlineEditSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
  accent?: boolean;
};

export function InlineEditSelect({
  label,
  value,
  options,
  onSave,
  accent,
}: InlineEditSelectProps) {
  const [editing, setEditing] = useState(false);
  const display = options.find((o) => o.value === value)?.label ?? value;

  if (editing) {
    return (
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          {label}
        </p>
        <select
          autoFocus
          value={value}
          onChange={(e) => {
            onSave(e.target.value);
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          className="h-8 w-full rounded-lg border border-white/10 bg-[#0f1417] px-2.5 text-sm text-zinc-100 outline-none focus:border-[#b38c56]/40 focus:ring-2 focus:ring-[#b38c56]/20"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/field w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm text-zinc-200", accent && "text-[#b38c56]")}>
          {display}
        </p>
        <Pencil className="size-3 shrink-0 text-zinc-700 opacity-0 transition-opacity group-hover/field:opacity-100" />
      </div>
    </button>
  );
}
