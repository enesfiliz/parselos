import Link from "next/link";

import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Logo } from "@/components/ui/Logo";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/95 px-6 py-4 lg:px-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" aria-label="Ana sayfa">
            <Logo className="h-10 w-auto max-w-[160px]" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Giriş
          </Link>
        </div>
      </header>
      <main className="px-6 py-12 lg:px-12 lg:py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
