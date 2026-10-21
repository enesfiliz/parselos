import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { ARACLAR } from "@/components/tools/tools-config";

export default function NotFound() {
  const oneCikanlar = ARACLAR.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/50">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/araclar" aria-label="ParselOS Hesap Araçları">
            <Logo className="h-10 w-auto max-w-[160px]" />
          </Link>
          <Link
            href="/destek"
            className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Destek
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <p className="text-sm font-semibold text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Aradığınız hesap burada yok
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Adres değişmiş olabilir. Tüm hesap araçlarını tek listeden
          bulabilirsiniz:
        </p>
        <Link
          href="/araclar"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Tüm hesaplara göz at
        </Link>
        <h2 className="mt-10 text-lg font-semibold text-foreground">
          En çok kullanılanlar
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {oneCikanlar.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/araclar/${a.slug}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
              >
                {a.baslik}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
