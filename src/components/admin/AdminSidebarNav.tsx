"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

import {
  adminNavItems,
  isAdminNavItemActive,
} from "@/lib/admin/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarNav({ onNavigate, className }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-emerald-500/10 px-5">
        <span className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
          <Shield className="size-4 text-emerald-400" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide text-zinc-100">
            ParselOS
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
            Super Admin
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {adminNavItems.map(({ label, href, icon: Icon }) => {
          const active = isAdminNavItemActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active
                  ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                  : "border border-transparent text-zinc-400 hover:border-emerald-500/10 hover:bg-emerald-500/5 hover:text-zinc-100",
              )}
            >
              <Icon
                className={cn(
                  "size-[17px] shrink-0 transition-colors",
                  active
                    ? "text-emerald-400"
                    : "text-zinc-500 group-hover:text-emerald-300/80",
                )}
                strokeWidth={1.75}
              />
              <span className="leading-snug">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-emerald-500/10 px-5 py-4">
        <p className="text-[11px] leading-relaxed text-zinc-500">
          God Mode · Kurucu komuta katmanı
        </p>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex text-[11px] text-emerald-400/80 transition-colors hover:text-emerald-300"
        >
          CRM&apos;e dön →
        </Link>
      </div>
    </div>
  );
}
