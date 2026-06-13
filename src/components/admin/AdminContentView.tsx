import Link from "next/link";
import { BookOpen, ExternalLink, FileText } from "lucide-react";

const LEGAL_PAGES = [
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kvkk", label: "KVKK Aydınlatma" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade" },
];

export function AdminContentView() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
          İçerik
        </p>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          İçerik Yönetimi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yasal sayfalar ve statik içerik bağlantıları.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <FileText className="size-4" />
            <h2 className="text-sm font-semibold text-foreground">Yasal Dokümanlar</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {LEGAL_PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {page.label}
                  <ExternalLink className="size-3.5 opacity-60" />
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <BookOpen className="size-4" />
            <h2 className="text-sm font-semibold text-foreground">Eğitim / Blog</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Blog modülü henüz aktif değil. İçerik güncellemeleri şimdilik{" "}
            <code className="rounded bg-background px-1.5 py-0.5 text-xs">
              src/lib/legal/documents.ts
            </code>{" "}
            ve landing bileşenleri üzerinden yapılır.
          </p>
        </article>
      </section>
    </div>
  );
}
