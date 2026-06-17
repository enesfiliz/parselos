"use client";

import { Bell, Clock, FileText, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";
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
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleNotifications =
    filter === "unread"
      ? notifications.filter((item) => !item.read)
      : notifications;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications");
      const json = (await response.json()) as {
        data?: AppNotification[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Bildirimler yüklenemedi.");
      }
      setNotifications(json.data ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Bildirimler yüklenemedi.",
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) void loadNotifications();
      return next;
    });
  }

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

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    setOpen(false);
  }

  async function dismissNotification(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    });
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="relative text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        onClick={toggleOpen}
        aria-label="Bildirimler"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-label="Bildirim merkezi"
          className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-xl border border-border/50 bg-parsel-panel shadow-2xl duration-200 md:w-80"
        >
          <div className="border-b border-border/50 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground/90">Bildirimler</h2>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Tümünü okundu işaretle
                </button>
              ) : (
                <span className="text-[10px] text-muted-foreground">Güncel</span>
              )}
            </div>
            <div className="mt-2 flex gap-1 rounded-lg bg-parsel-elevated/80 p-1">
              {(
                [
                  { id: "all", label: "Tümü" },
                  { id: "unread", label: `Okunmamış (${unreadCount})` },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors",
                    filter === item.id
                      ? "bg-parsel-panel text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Yükleniyor…
            </div>
          ) : error ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">{error}</p>
          ) : visibleNotifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {filter === "unread" ? "Okunmamış bildirim yok." : "Henüz bildirim yok."}
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col overflow-y-auto">
              {visibleNotifications.map((notification) => {
                const meta = KIND_META[notification.kind];
                const Icon = meta.icon;
                const content = (
                  <>
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
                      <p className="text-xs font-medium text-foreground">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-[9px] text-muted-foreground">
                          {notification.timeAgo}
                        </p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void dismissNotification(notification.id);
                          }}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Arşivle
                        </button>
                      </div>
                    </div>
                  </>
                );

                return (
                  <li key={notification.id}>
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        onClick={() => void markRead(notification.id)}
                        className={cn(
                          "flex gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.04]",
                          !notification.read && "bg-white/[0.02]",
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void markRead(notification.id)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.04]",
                          !notification.read && "bg-white/[0.02]",
                        )}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
