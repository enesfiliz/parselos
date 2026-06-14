import { Loader2 } from "lucide-react";

export function DealsLoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-parsel-gold" />
    </div>
  );
}
