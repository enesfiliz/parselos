"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 duration-300 supports-backdrop-filter:backdrop-blur-sm",
        "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[min(18.5rem,90vw)] flex-col",
          "border-r border-border bg-parsel-card/95 shadow-2xl shadow-black/40 outline-none",
          "backdrop-blur-xl duration-300",
          "data-open:animate-in data-open:slide-in-from-left data-open:fade-in-0",
          "data-closed:animate-out data-closed:slide-out-to-left data-closed:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Kapat</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </SheetPortal>
  );
}

export { Sheet, SheetContent, SheetPortal, SheetOverlay };
