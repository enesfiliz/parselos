"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { AdminSubscriberRecord } from "@/lib/admin/mock-subscribers";
import { cn } from "@/lib/utils";

type AdminSubscriberRowMenuProps = {
  subscriber: AdminSubscriberRecord;
};

const MENU_ITEMS = [
  {
    id: "plan",
    label: "Paketi Yükselt / Düşür",
    icon: "🔄",
    tone: "default" as const,
  },
  {
    id: "suspend",
    label: "Hesabı Askıya Al / Kapat",
    icon: "🛑",
    tone: "danger" as const,
  },
  {
    id: "impersonate",
    label: "Kullanıcı Olarak Giriş Yap",
    icon: "🕵️‍♂️",
    tone: "highlight" as const,
  },
  {
    id: "logs",
    label: "Detaylı Logları İncele",
    icon: "📊",
    tone: "default" as const,
  },
];

function handleAction(subscriber: AdminSubscriberRecord, actionId: string) {
  switch (actionId) {
    case "plan":
      toast.message("Lisans güncelleme", {
        description: `${subscriber.name} için paket değişikliği paneli açılacak.`,
      });
      break;
    case "suspend":
      toast.warning("Hesap durumu", {
        description: `${subscriber.name} hesabı için askıya alma işlemi kuyruğa alındı.`,
      });
      break;
    case "impersonate":
      toast.success("Impersonate modu", {
        description: `${subscriber.email} paneline God Mode girişi simüle edildi.`,
      });
      break;
    case "logs":
      toast.message("Denetim kayıtları", {
        description: `${subscriber.name} için AI ve oturum logları listeleniyor.`,
      });
      break;
    default:
      break;
  }
}

export function AdminSubscriberRowMenu({
  subscriber,
}: AdminSubscriberRowMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-foreground0 hover:bg-foreground/[0.04] hover:text-foreground"
        aria-label={`${subscriber.name} işlemleri`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-[240px] overflow-hidden rounded-xl border border-emerald-500/15 bg-parsel-elevated py-1 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                item.tone === "highlight" &&
                  "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15",
                item.tone === "danger" &&
                  "text-red-300/90 hover:bg-red-500/10",
                item.tone === "default" &&
                  "text-foreground/90 hover:bg-foreground/[0.04]",
              )}
              onClick={() => {
                handleAction(subscriber, item.id);
                setOpen(false);
              }}
            >
              <span aria-hidden className="text-base leading-none">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
