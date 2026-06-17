"use client";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  showBrokerOfficeNav?: boolean;
};

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
  showBrokerOfficeNav = false,
}: SidebarProps) {
  return (
    <>
      <aside
        className="hidden h-full w-[17rem] shrink-0 flex-col border-r border-border/60 bg-sidebar shadow-parsel-sm md:flex"
        aria-label="Ana menü"
      >
        <SidebarNav showBrokerOfficeNav={showBrokerOfficeNav} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          showCloseButton
          className="w-[min(100vw-1rem,18rem)] border-border bg-parsel-panel p-0 md:hidden"
        >
          <SidebarNav
            onNavigate={() => onMobileOpenChange(false)}
            showBrokerOfficeNav={showBrokerOfficeNav}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
