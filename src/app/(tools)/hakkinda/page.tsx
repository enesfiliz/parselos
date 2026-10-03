import type { Metadata } from "next";
import Link from "next/link";

import { OG_IMAGE } from "@/components/tools/arac-metadata";
import { ARACLAR } from "@/components/tools/tools-config";

export const metadata: Metadata = {
  title: "Hakkında",
  description:
    "ParselOS Hesap neden var? Emlak ve günlük hayat için ücretsiz hesaplama araçlarını kim yapıyor, site nasıl ayakta duruyor — kısa ve dürüst cevap.",
  alternates: { canonical: "https://parselos.com/hakkinda" },
  openGraph: { url: "https://parselos.com/hakkinda", images: [OG_IMAGE] },
};

export default function HakkindaPage() {
  const aracSayisi = ARACLAR.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Hakkında</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        ParselOS Hesap; komisyon, kira, tapu harcı, KDV, kredi ve daha fazlası
        için {aracSayisi} ücretsiz hesaplama aracını tek yerde toplayan bir
        hesaplama portalıdır.
      </p>

      <section className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Neden yaptık?
          </h2>
          <p className="mt-2">
            Bir emlak danışmanının günü hesapla geçer: komisyon kaç kira,
            tapu harcı kimin payı, kira artış tavanı ne, bu ilanın m² birim
            fiyatı emsallerine uygun mu? Aynı sorular gündelik hayatta da
            vardır: KDV dahil fiyat, kredi taksiti, iki tarih arası gün.
            Cevapları bulmak için üyelik doldurmak, reklam kırpıp form
            bırakmak zorunda kalmamalısınız. Biz de hiçbir şey istemeyen,
            hızlı ve sade araçlar yaptık.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Site nasıl ayakta duruyor?
          </h2>
          <p className="mt-2">
            Sunucu ve alan adı giderlerini reklamlar karşılıyor. Bundan
            başka gelir modeli yok: verileriniz satılmıyor, hesap
            tutulmuyor, sonuçlar tarayıcınızda üretiliyor. Ayda{" "}
            <Link
              href="/araclar"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              tüm araçlar
            </Link>{" "}
            için tek kuruş ödemiyorsunuz. İsterseniz{" "}
            <Link
              href="/destek"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              destek olabilirsiniz
            </Link>
            ; zorunlu değil, paylaşım da yeterli destek.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Rakamlar ne kadar güvenilir?
          </h2>
          <p className="mt-2">
            Hesaplar güncel mevzuat varsayımlarıyla (komisyon tavanı, tapu
            harcı oranı, kira artış tavanı gibi) yapılır ve ilgili araçlarda
            dayanak açıkça yazar. Yasal ve mali mevzuat değişir; kritik
            işlemlerinizde bir meslek danışmanıyla teyit edin. Bu sayfadaki
            hiçbir şey yasal veya mali tavsiye değildir.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            ParselOS ile ilişkisi nedir?
          </h2>
          <p className="mt-2">
            Bu portal, gayrimenkul profesyonelleri için geliştirilen ParselOS
            ürün ailesinin ücretsiz hesap tarafıdır. Günlük operasyonunu
            (portföy, müşteri, komisyon takibi) tek yerde yürütmek isteyenler
            için asıl ürün ayrıdır; buradaki araçlar ise herkes için
            açıktır.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            İletişim
          </h2>
          <p className="mt-2">
            Hata bildirimi, eksik araç önerisi veya iş birliği için:{" "}
            <a
              href="mailto:destek@parselos.com"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              destek@parselos.com
            </a>
          </p>
        </div>
      </section>

      <aside className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <p className="text-sm font-semibold text-foreground">
          Bir araçta eksik veya yanlış bir şey mi gördünüz?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Yazın — düzeltelim. Yeni hesap önerileri de aynı adrese.
        </p>
      </aside>
    </div>
  );
}
