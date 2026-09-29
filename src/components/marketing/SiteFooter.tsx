import Link from "next/link";

import { AppIcon } from "@/components/ui/AppIcon";

const ARAC_LINKLERI = [
  { href: "/araclar/komisyon-hesaplama", label: "Komisyon Hesaplama" },
  { href: "/araclar/kira-artisi-hesaplama", label: "Kira Artışı" },
  { href: "/araclar/tapu-harci-hesaplama", label: "Tapu Harcı" },
  { href: "/araclar/kdv-hesaplama", label: "KDV Hesaplama" },
  { href: "/araclar/konut-kredisi-hesaplama", label: "Konut Kredisi" },
  { href: "/araclar", label: "Tüm Araçlar" },
] as const;

const LEGAL_LINKS = [
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kvkk", label: "KVKK Aydınlatma" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-parsel-sunken/40 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
          <div>
            <span className="mb-4 flex items-center gap-2 text-foreground">
              <AppIcon className="size-[18px] shrink-0" />
              <span className="font-outfit text-lg font-bold">ParselOS Hesap</span>
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Emlak ve günlük hayat için ücretsiz hesaplama araçları. Üyelik
              yok, ücret yok, kayıt tutma yok. Sitenin giderleri reklamlarla
              karşılanır; gerisi bizde kalmaz.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Sık kullanılan araçlar
            </p>
            <ul className="space-y-2">
              {ARAC_LINKLERI.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Yasal ve iletişim
            </p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/destek"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Destek ol
                </Link>
              </li>
              <li>
                <a
                  href="mailto:destek@parselos.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  destek@parselos.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>ParselOS © {new Date().getFullYear()}. Tüm hakları saklıdır.</span>
          <span>
            Hesaplamalar bilgilendirme amaçlıdır; kritik işlemlerinizi
            mesleki müşavirinizle teyit edin.
          </span>
        </div>
      </div>
    </footer>
  );
}
