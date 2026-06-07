"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import {
  dashboardNavItems,
  isNavItemActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-[4.5rem] shrink-0 items-center px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex transition-opacity hover:opacity-90"
          aria-label="ParselOS ana sayfa"
        >
          <Logo className="h-14 w-auto max-w-[240px] text-foreground" />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {dashboardNavItems.map(({ label, href, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-all duration-200",
                active
                  ? "border-primary/30 bg-accent font-semibold text-accent-foreground shadow-[inset_3px_0_0_0_var(--primary)] dark:border-border dark:bg-zinc-800 dark:text-foreground"
                  : "border-transparent font-medium text-zinc-600 hover:border-border hover:bg-muted/80 hover:text-foreground dark:text-muted-foreground dark:hover:bg-card/80",
              )}
            >
              <Icon
                className={cn(
                  "size-[17px] shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-zinc-500 group-hover:text-foreground dark:text-muted-foreground",
                )}
                strokeWidth={2}
              />
              <span className="leading-snug">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-muted-foreground">
          Gayrimenkul operasyonları · Parselos
        </p>
      </div>
    </div>
  );
}
