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
        className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card md:flex dark:bg-background"
        aria-label="Ana menü"
      >
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          showCloseButton
          className="border-border bg-background p-0 md:hidden"
        >
          <SidebarNav onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
