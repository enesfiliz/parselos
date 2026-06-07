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
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "border border-border bg-zinc-900 text-foreground"
                    : "border border-transparent text-muted-foreground hover:border-border hover:bg-card/50 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-[17px] shrink-0 transition-colors",
                  active
                    ? "text-parsel-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Gayrimenkul operasyonları · Parselos
        </p>
      </div>
    </div>
  );
}
