import Link from "next/link";

import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Logo } from "@/components/ui/Logo";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/95 px-6 py-4 lg:px-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/araclar" aria-label="ParselOS Hesap Araçları">
            <Logo className="h-10 w-auto max-w-[160px]" />
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <Link
              href="/araclar"
              className="hidden min-h-11 items-center px-2 font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Tüm Araçlar
            </Link>
            <Link
              href="/destek"
              className="inline-flex min-h-11 items-center px-2 font-medium text-muted-foreground hover:text-foreground"
            >
              Destek
            </Link>
            <Link
              href="/hakkinda"
              className="hidden min-h-11 items-center px-2 font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Hakkında
            </Link>
          </nav>
        </div>
      </header>
      <main className="py-12 lg:py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
