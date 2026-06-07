"use client";

import { Bell, Clock, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  INITIAL_NOTIFICATIONS,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications/mock-notifications";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  NotificationKind,
  {
    icon: typeof Clock;
    iconClassName: string;
    badgeClassName: string;
  }
> = {
  urgent: {
    icon: Clock,
    iconClassName: "text-amber-400",
    badgeClassName: "border-amber-500/20 bg-amber-500/10",
  },
  intelligence: {
    icon: MapPin,
    iconClassName: "text-emerald-400",
    badgeClassName: "border-emerald-500/20 bg-emerald-500/10",
  },
  opportunity: {
    icon: FileText,
    iconClassName: "text-sky-300",
    badgeClassName: "border-sky-500/20 bg-sky-500/10",
  },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  }

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    );
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="relative text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        onClick={() => setOpen((current) => !current)}
        aria-label="Bildirimler"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-label="Bildirim merkezi"
          className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-xl border border-border/50 bg-parsel-panel shadow-2xl duration-200 md:w-80"
        >
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground/90">Bildirimler</h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Tümünü Okundu İşaretle
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground">Güncel</span>
            )}
          </div>

          <ul className="flex max-h-80 flex-col overflow-y-auto">
            {notifications.map((notification) => {
              const meta = KIND_META[notification.kind];
              const Icon = meta.icon;

              return (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    onClick={() => markRead(notification.id)}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.04]",
                      !notification.read && "bg-white/[0.02]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        meta.badgeClassName,
                      )}
                    >
                      <Icon
                        className={cn("h-3.5 w-3.5", meta.iconClassName)}
                        strokeWidth={1.75}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-right text-[9px] text-muted-foreground">
                        {notification.timeAgo}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
