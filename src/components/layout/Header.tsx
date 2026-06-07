"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/AppIcon";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { parselClerkAppearance } from "@/lib/clerk-appearance";
import { getDashboardPageTitle } from "@/lib/dashboard-nav";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getDashboardPageTitle(pathname);

  return (
    <header className="shrink-0 border-b border-zinc-800/80 bg-[#09090b]">
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 md:hidden"
            onClick={onMenuClick}
            aria-label="Menüyü aç"
          >
            <Menu className="size-[18px]" strokeWidth={1.75} />
          </Button>

          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm"
          >
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 truncate text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <AppIcon className="size-5 shrink-0" />
              ParselOS
            </Link>
            <ChevronRight
              className="size-3.5 shrink-0 text-zinc-500"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="truncate font-medium text-zinc-100">
              {pageTitle}
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationCenter />
          <UserButton
            appearance={parselClerkAppearance}
            userProfileProps={{ appearance: parselClerkAppearance }}
          />
        </div>
      </div>
    </header>
  );
}
