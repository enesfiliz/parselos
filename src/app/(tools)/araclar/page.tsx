import type { Metadata } from "next";
import Link from "next/link";

import { OG_IMAGE } from "@/components/tools/arac-metadata";
import { ARACLAR } from "@/components/tools/tools-config";

export const metadata: Metadata = {
  title: "Hesap Araçları",
  description:
    "KDV, yüzde, kredi taksiti, bileşik faiz gibi günlük hesaplar; komisyon, kira, tapu harcı ve imar gibi emlak hesapları — ücretsiz, üyeliksiz, sınırsız.",
  alternates: { canonical: "https://parselos.com/araclar" },
  openGraph: { url: "https://parselos.com/araclar", images: [OG_IMAGE] },
};

function AracKartlari({ liste }: { liste: typeof ARACLAR }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {liste.map((a) => (
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
  );
}

export default function AraclarPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "ParselOS Hesap Araçları",
        itemListElement: ARACLAR.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.baslik,
          url: `https://parselos.com/araclar/${a.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Ana Sayfa",
            item: "https://parselos.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Hesap Araçları",
            item: "https://parselos.com/araclar",
          },
        ],
      },
    ],
  };

  const gunluk = ARACLAR.filter((a) => a.kategori === "gunluk");
  const emlak = ARACLAR.filter((a) => a.kategori === "gayrimenkul");

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <h1 className="text-3xl font-semibold tracking-tight">Hesap Araçları</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Günlük hayattaki yüzde, KDV ve kredi hesaplarından emlak işlemlerindeki
        komisyon, kira ve tapu harcı hesaplarına kadar — saniyeler içinde,
        üyeliksiz. Sonuçları olduğunuz kişiyle paylaşabilirsiniz.
      </p>

      <section aria-label="Günlük hesaplar">
        <h2 className="text-xl font-semibold text-foreground">
          Günlük hesaplar
        </h2>
        <AracKartlari liste={gunluk} />
      </section>

      <section aria-label="Emlak hesapları" className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          Emlak ve gayrimenkul hesapları
        </h2>
        <AracKartlari liste={emlak} />
      </section>

      <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Bu araçlar kimin için?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Alışverişte indirim hesaplamak isteyen bir tüketiciden, müşteri
          görüşmesinde komisyon konuşan bir emlak danışmanına kadar herkes için.
          Bu araçların kim tarafından ve neden yapıldığını{" "}
          <Link
            href="/hakkinda"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Hakkında
          </Link>{" "}
          sayfasında anlattık. Hesaplamalar yasal bilgi yerine geçmez; kritik
          işlemlerinizi mesleki müşavirinizle teyit edin.
        </p>
      </section>
    </div>
  );
}
