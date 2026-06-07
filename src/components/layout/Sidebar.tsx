"use client";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      <aside
        className="hidden h-full w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-[#09090b] md:flex"
        aria-label="Ana menü"
      >
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          showCloseButton
          className="border-zinc-800/80 bg-[#09090b] p-0 md:hidden"
        >
          <SidebarNav onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
