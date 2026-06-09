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
        className="hidden h-full w-[17rem] shrink-0 flex-col border-r border-border/60 bg-sidebar shadow-parsel-sm dark:bg-[#11181c] md:flex"
        aria-label="Ana menü"
      >
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          showCloseButton
          className="border-border bg-parsel-panel p-0 md:hidden"
        >
          <SidebarNav onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
