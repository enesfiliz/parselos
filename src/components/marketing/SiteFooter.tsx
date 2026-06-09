import Link from "next/link";

import { AppIcon } from "@/components/ui/AppIcon";
import { PaymentBadges } from "@/components/marketing/PaymentBadges";

const LEGAL_LINKS = [
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kvkk", label: "KVKK Aydınlatma" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-parsel-sunken/40 px-6 py-14 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <span className="mb-4 flex items-center gap-2.5 text-foreground">
              <AppIcon className="size-6" />
              <span className="font-outfit text-lg font-bold">ParselOS</span>
            </span>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Gayrimenkul danışmanları ve ofisler için operasyon platformu.
              Abonelikler dijital hizmet olarak anında teslim edilir.
            </p>
            <div className="mt-6">
              <PaymentBadges />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Yasal
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
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              İletişim
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:destek@parselos.com" className="hover:text-foreground">
                  destek@parselos.com
                </a>
              </li>
              <li>Hafta içi 09:00 – 18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>ParselOS © {new Date().getFullYear()}. Tüm hakları saklıdır.</span>
          <span>Ödeme altyapısı: iyzico · Dijital hizmet teslimi</span>
        </div>
      </div>
    </footer>
  );
}
