"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import { useTheme } from "next-themes";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const clerkAppearance = getClerkAppearance(resolvedTheme);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-parsel-admin text-foreground antialiased">
      <aside
        className="hidden h-full w-72 shrink-0 flex-col border-r border-emerald-500/10 bg-parsel-admin md:flex"
        aria-label="Super Admin menü"
      >
        <AdminSidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          showCloseButton
          className="border-emerald-500/10 bg-parsel-admin p-0 md:hidden"
        >
          <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-emerald-500/10 px-4 md:h-16 md:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-200 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Admin menüsünü aç"
            >
              <Menu className="size-[18px]" strokeWidth={1.75} />
            </Button>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400/70">
              Founder Console
            </p>
          </div>
          <ThemeToggle className="hover:text-emerald-200" />
          <UserButton
            appearance={clerkAppearance}
            userProfileProps={{ appearance: clerkAppearance }}
          />
        </header>

        <main className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
