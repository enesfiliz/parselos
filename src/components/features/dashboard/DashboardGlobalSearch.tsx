"use client";

import { FileText, Kanban, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DashboardSearchItem } from "@/lib/dashboard-command-center";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  DashboardSearchItem["type"],
  { label: string; icon: typeof User }
> = {
  musteri: { label: "Müşteri", icon: User },
  firsat: { label: "Fırsat", icon: Kanban },
  ilan: { label: "İlan", icon: FileText },
};

type DashboardGlobalSearchProps = {
  index: DashboardSearchItem[];
  className?: string;
};

export function DashboardGlobalSearch({
  index,
  className,
}: DashboardGlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) closePalette();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePalette, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return index.slice(0, 12);
    return index
      .filter(
        (item) =>
          item.title.toLocaleLowerCase("tr-TR").includes(q) ||
          item.subtitle.toLocaleLowerCase("tr-TR").includes(q) ||
          TYPE_META[item.type].label.toLocaleLowerCase("tr-TR").includes(q),
      )
      .slice(0, 12);
  }, [index, query]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className={cn(
          "flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-white/5 bg-[#151f23] px-3 text-left text-sm text-white/40 transition-all duration-300 hover:border-white/10 sm:max-w-md",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">Müşteri, fırsat veya ilan ara…</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#151f23] p-0 text-zinc-100 sm:max-w-lg">
          <DialogHeader className="border-b border-white/5 px-4 py-3">
            <DialogTitle className="sr-only">Global arama</DialogTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Müşteri, fırsat, ilan…"
                className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={closePalette}
                className="text-white/30 hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <ul className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center text-xs text-white/35">
                Eşleşen kayıt bulunamadı.
              </li>
            ) : (
              filtered.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={closePalette}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[#09090b]">
                        <Icon className="h-3.5 w-3.5 text-white/45" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white/85">
                          {item.title}
                        </span>
                        <span className="block truncate text-[11px] text-white/40">
                          {meta.label} · {item.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
