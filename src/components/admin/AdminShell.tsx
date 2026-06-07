"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { parselClerkAppearance } from "@/lib/clerk-appearance";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-zinc-100 antialiased">
      <aside
        className="hidden h-full w-72 shrink-0 flex-col border-r border-emerald-500/10 bg-[#050505] md:flex"
        aria-label="Super Admin menü"
      >
        <AdminSidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          showCloseButton
          className="border-emerald-500/10 bg-[#050505] p-0 md:hidden"
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
              className="text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-200 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Admin menüsünü aç"
            >
              <Menu className="size-[18px]" strokeWidth={1.75} />
            </Button>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400/70">
              Founder Console
            </p>
          </div>
          <UserButton
            appearance={parselClerkAppearance}
            userProfileProps={{ appearance: parselClerkAppearance }}
          />
        </header>

        <main className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
