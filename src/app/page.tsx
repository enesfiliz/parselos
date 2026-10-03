import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Logo } from "@/components/ui/Logo";
import { AdSenseScript, ReklamAlani } from "@/components/tools/ReklamAlani";
import { OG_IMAGE } from "@/components/tools/arac-metadata";
import { ARACLAR } from "@/components/tools/tools-config";

export const metadata: Metadata = {
  title: "Ücretsiz Hesap Araçları — KDV, Yüzde, Kredi, Emlak",
  description:
    "Türkiye'nin ücretsiz hesap masası: KDV, yüzde, kredi taksiti, bileşik faiz, emlak komisyonu, kira artışı ve tapu harcı hesapları. Üyelik yok, ücret yok, sınır yok.",
  alternates: { canonical: "https://parselos.com/" },
  openGraph: { url: "https://parselos.com/", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "ParselOS",
        url: "https://parselos.com/",
        logo: {
          "@type": "ImageObject",
          url: "https://parselos.com/brand/icon-192.png",
        },
        description:
          "Emlak ve günlük hayat için ücretsiz hesap araçları sunan ParselOS Hesap portalı.",
      },
      {
        "@type": "WebSite",
        name: "ParselOS Hesap",
        url: "https://parselos.com/",
        inLanguage: "tr-TR",
        publisher: { "@type": "Organization", name: "ParselOS" },
        description:
          "Günlük ve gayrimenkul hesapları için ücretsiz, üyeliksiz hesap araçları.",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AdSenseScript />
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo className="h-10 w-auto max-w-[160px]" />
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a
              href="#araclar"
              className="hidden min-h-11 items-center px-3 font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Araçlar
            </a>
            <a
              href="#ucretsiz"
              className="hidden min-h-11 items-center px-3 font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Neden ücretsiz?
            </a>
            <Link
              href="/destek"
              className="hidden min-h-11 items-center px-3 font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Destek
            </Link>
            <Link
              href="/araclar"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Hesaplamaya başla
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-16 lg:pt-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            ParselOS Hesap
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Herkesin işine yarayan hesaplar,
            <span className="text-muted-foreground"> tek sayfada, ücretsiz.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            KDV mi hesaplayacaksın, kredi taksiti mi; emlak komisyonu mu, kira
            artışı mı — gir, hesapla, çık. E-posta istemeziz, üyelik açtırmayız,
            kullanım limiti koymayız.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#araclar"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              {ARACLAR.length} aracı keşfet
            </a>
            <Link
              href="/araclar/komisyon-hesaplama"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
            >
              Emlak komisyonu hesapla
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {ARACLAR.length} araç · ₺0 · kurulum yok · sonuçlar anında
          </p>
        </section>

        <section id="araclar" className="border-t border-border/50 bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Tüm araçlar
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Günlük hayattan ve gayrimenkul masasından — hepsi tarayıcıda,
              hepsi ücretsiz.
            </p>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Günlük hesaplar
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ARACLAR.filter((a) => a.kategori === "gunluk").map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/araclar/${a.slug}`}
                    className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {a.baslik}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {a.kisaAciklama}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Emlak ve gayrimenkul hesapları
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ARACLAR.filter((a) => a.kategori === "gayrimenkul").map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/araclar/${a.slug}`}
                    className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {a.baslik}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {a.kisaAciklama}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ReklamAlani slot="anasayfa-orta" />

        <section id="ucretsiz" className="border-t border-border/50">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Bedava olan bir şey nasıl ayakta durur?
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Reklamlarla. Sayfalarda ölçülü reklam alanları tutuyoruz; siz
                para vermiyorsunuz, bize reklam verenler veriyor. Karşılığında
                e-posta da istemiyoruz, verinizi de satmıyoruz — hesabınız
                tarayıcınızda kalır, hiçbir şey sunucuya gitmez.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Model basit: ne kadar çok kişi doğru hesap yaparsa, bu sayfa o
                kadar ayakta kalır. O yüzden sayıyı hızla büyütmek yerine her
                aracı kusursuz yapmaya çalışıyoruz.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">
                Emlak profesyoneli misiniz?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Bu hesapları her gün yapıyorsanız; portföy, müşteri ve komisyon
                takibini tek yerde yürüten ParselOS&apos;u inceleyin.
              </p>
              <Link
                href="/araclar"
                className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
              >
                Önce araçları deneyin
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
