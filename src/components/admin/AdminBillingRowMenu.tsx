"use client";

import { useEffect, useRef, useState } from "react";
import { Gift, MoreHorizontal, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { AdminBillingSubscriber } from "@/lib/admin/mock-billing";
import { cn } from "@/lib/utils";

type AdminBillingRowMenuProps = {
  subscriber: AdminBillingSubscriber;
  onCancelPayment: (subscriber: AdminBillingSubscriber) => void;
  onGrantFreeAccess: (subscriber: AdminBillingSubscriber) => void;
};

const MENU_ITEMS = [
  {
    id: "cancel",
    label: "Ödemeyi İptal Et",
    icon: XCircle,
    tone: "danger" as const,
  },
  {
    id: "free",
    label: "Ücretsiz Erişim Tanımla",
    icon: Gift,
    tone: "highlight" as const,
  },
];

export function AdminBillingRowMenu({
  subscriber,
  onCancelPayment,
  onGrantFreeAccess,
}: AdminBillingRowMenuProps) {
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

  function handleAction(actionId: string) {
    switch (actionId) {
      case "cancel":
        onCancelPayment(subscriber);
        toast.warning("Ödeme iptal edildi", {
          description: `${subscriber.name} için Iyzico aboneliği durduruldu (simülasyon).`,
        });
        break;
      case "free":
        onGrantFreeAccess(subscriber);
        toast.success("Ücretsiz erişim tanımlandı", {
          description: `${subscriber.name} Free tier dışı kurucu erişimi aldı.`,
        });
        break;
      default:
        break;
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
        aria-label={`${subscriber.name} fatura işlemleri`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-emerald-500/15 bg-parsel-elevated py-1 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                  item.tone === "highlight" &&
                    "text-emerald-200 hover:bg-emerald-500/10",
                  item.tone === "danger" &&
                    "text-red-300/90 hover:bg-red-500/10",
                )}
                onClick={() => handleAction(item.id)}
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
