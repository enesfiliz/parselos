"use client";

import {
  FileText,
  Kanban,
  Map,
  ScanLine,
  User,
} from "lucide-react";

import type { ActivityFeedItem } from "@/lib/dashboard-command-center";
import { cn } from "@/lib/utils";

const WIDGET_CARD =
  "rounded-2xl border border-white/5 bg-[#151f23] p-3 md:p-4";

const ICONS = {
  note: FileText,
  deal: Kanban,
  imar: Map,
  musteri: User,
  fsbo: ScanLine,
} as const;

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function ActivityFeedWidget({
  items,
  className,
}: {
  items: ActivityFeedItem[];
  className?: string;
}) {
  return (
    <section className={cn(WIDGET_CARD, "flex flex-col", className)}>
      <div className="mb-2 shrink-0">
        <h2 className="text-sm font-medium tracking-wide text-white/70">
          Son Aktiviteler
        </h2>
        <p className="text-[11px] text-white/35 md:text-[10px]">Canlı sistem akışı</p>
      </div>

      <ul className="custom-scrollbar flex max-h-[200px] flex-col gap-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-white/5 px-3 py-10 text-center text-xs text-white/35">
            Henüz sistem aktivitesi yok.
          </li>
        ) : (
          items.map((item, index) => {
            const Icon = ICONS[item.type];
            return (
              <li key={item.id} className="relative flex shrink-0 gap-3">
                {index < items.length - 1 ? (
                  <span className="absolute left-[15px] top-9 h-[calc(100%+4px)] w-px bg-white/5" />
                ) : null}
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[#09090b]">
                  <Icon className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-xs text-white/60">{item.message}</p>
                  <p className="mt-0.5 text-[11px] text-white/30 md:text-[10px]">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
