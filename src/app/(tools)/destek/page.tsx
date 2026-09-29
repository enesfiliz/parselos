import type { Metadata } from "next";
import Link from "next/link";

import { ReklamAlani } from "@/components/tools/ReklamAlani";

export const metadata: Metadata = {
  title: "Destek Ol",
  description:
    "ParselOS Hesap araçları tamamen ücretsiz. Beğendiğiniz araçları bize destek olarak da sürdürülebilir kılabilirsiniz.",
  alternates: { canonical: "https://parselos.com/destek" },
};

const destekUrl = process.env.NEXT_PUBLIC_SUPPORT_URL as string | undefined;

export default function DestekPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6">
      <nav aria-label="Menü yolu" className="mb-6 text-sm text-muted-foreground">
        <Link href="/araclar" className="hover:text-foreground">
          Hesap Araçları
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Destek</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bu araçlar işinize yaradıysa
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          ParselOS Hesap; üyelik istemez, hesap sormaz, arkası yarın oynamaz.
          Sayfalar reklamla dönüyor — isterseniz bir de doğrudan destek
          olabilirsiniz. Küçük katkınız, yeni araçların ve güncel mevzuat
          rakamların devamı demek.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            En kolay destek: paylaşın
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Bir aracı müşterinizle, meslektaş grubunuzla veya sosyal
            hesabınızla paylaşmanız en az reklam geliri kadar değerli: böylece
            doğru insanlara ulaşıyoruz.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Doğrudan destek
          </h2>
          {destekUrl ? (
            <a
              href={destekUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Destek ol
            </a>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Destek bağlantısı hazırlanıyor. Kısa süre içinde burada olacak —
              o zamana kadar paylaşarak destek yeter.
            </p>
          )}
        </div>
      </div>

      <ReklamAlani slot="destek-alt" />

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        Ödeme yapmadan önce{" "}
        <Link href="/gizlilik-politikasi" className="underline underline-offset-4">
          gizlilik ilkelerimizi
        </Link>{" "}
        okuyabilirsiniz: bu site hiçbir hesap işleminizde sizden veri toplamaz.
      </p>
    </article>
  );
}
