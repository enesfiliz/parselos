"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/AppIcon";
import { HeaderUserButton } from "@/components/layout/HeaderUserButton";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getDashboardPageTitle } from "@/lib/dashboard-nav";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getDashboardPageTitle(pathname);

  return (
    <header className="parsel-shell-header sticky top-0 z-20 shrink-0">
      <div className="flex h-[3.75rem] items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:bg-foreground/5 hover:text-foreground md:hidden"
            onClick={onMenuClick}
            aria-label="Menüyü aç"
          >
            <Menu className="size-[18px]" strokeWidth={1.75} />
          </Button>

          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-1.5"
          >
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <AppIcon className="size-5 shrink-0" />
              <span className="hidden sm:inline">ParselOS</span>
            </Link>
            <div className="flex min-w-0 items-center gap-1.5">
              <ChevronRight
                className="hidden size-3.5 shrink-0 text-muted-foreground sm:block"
                strokeWidth={1.75}
                aria-hidden
              />
              <h1 className="truncate font-outfit text-base font-bold tracking-tight text-foreground sm:text-lg">
                {pageTitle}
              </h1>
            </div>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/sesli-crm"
            aria-label="Sesli CRM — sesli not ekle"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary md:hidden"
          >
            <Mic className="size-[18px]" strokeWidth={1.85} />
          </Link>
          <ThemeToggle />
          <NotificationCenter />
          <HeaderUserButton />
        </div>
      </div>
    </header>
  );
}
