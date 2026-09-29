import Link from "next/link";

import { AdSenseScript, ReklamAlani } from "@/components/tools/ReklamAlani";
import { ARACLAR, type AracTanimi } from "@/components/tools/tools-config";

export type SSS = { soru: string; cevap: string };

export function AracSayfasi({
  arac,
  hesaplayici,
  icerik,
  ssclar,
  iliskili,
}: {
  arac: AracTanimi;
  hesaplayici: React.ReactNode;
  icerik: React.ReactNode;
  ssclar: SSS[];
  iliskili: string[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: arac.baslik,
        url: `https://parselos.com/araclar/${arac.slug}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: arac.kisaAciklama,
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
      },
      {
        "@type": "FAQPage",
        mainEntity: ssclar.map((s) => ({
          "@type": "Question",
          name: s.soru,
          acceptedAnswer: { "@type": "Answer", text: s.cevap },
        })),
      },
    ],
  };

  const iliskiliAraclar = ARACLAR.filter(
    (a) => a.slug !== arac.slug && iliskili.includes(a.slug),
  );

  return (
    <article className="mx-auto w-full max-w-3xl px-6">
      <AdSenseScript />
      <nav
        aria-label="Menü yolu"
        className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"
      >
        <Link href="/araclar" className="min-h-11 hover:text-foreground">
          Hesap Araçları
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{arac.kisaAd}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {arac.baslik}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {arac.kisaAciklama} Üyelik yok, kurulum yok — girin ve saniyeler
          içinde hesaplayın.
        </p>
      </header>

      <section className="mb-10" aria-label="Hesaplama aracı">
        {hesaplayici}
      </section>

      <ReklamAlani slot={`${arac.slug}-ust`} />

      <section className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
        {icerik}
      </section>

      {ssclar.length > 0 ? (
        <section className="mt-10" aria-label="Sıkça sorulan sorular">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Sıkça sorulan sorular
          </h2>
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-card">
            {ssclar.map((s) => (
              <details key={s.soru} className="group px-5 py-4">
                <summary className="min-h-11 cursor-pointer list-none text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary marker:hidden">
                  {s.soru}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.cevap}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <ReklamAlani slot={`${arac.slug}-alt`} />

      {iliskiliAraclar.length > 0 ? (
        <section className="mt-10" aria-label="İlgili araçlar">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Diğer hesap araçları
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {iliskiliAraclar.map((a) => (
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
        </section>
      ) : null}

      <aside className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <p className="text-sm font-semibold text-foreground">
          Bu hesapları her gün mü yapıyorsunuz?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Bu hesapları her gün yeniden kurmak yerine portföy, müşteri ve
          komisyon takibini tek yerde yürütün.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          ParselOS&apos;u inceleyin
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          Araçlar işinize yarıyorsa{" "}
          <Link
            href="/destek"
            className="font-medium text-foreground underline underline-offset-4"
          >
            destek olabilirsiniz
          </Link>
          ; reklamlar dışında hiçbir şeyiniz istenmez.
        </p>
      </aside>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
