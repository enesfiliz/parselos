import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PortfolioNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-parsel-canvas px-4">
      <div className="parsel-surface max-w-md rounded-2xl border border-border/60 bg-parsel-panel p-8 text-center shadow-parsel-sm">
        <p className="parsel-section-label text-primary">Portföy bulunamadı</p>
        <h1 className="mt-3 text-lg font-semibold text-foreground">
          Bu portföye erişiminiz yok veya kayıt mevcut değil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Başka bir danışmanın portföyüne doğrudan URL ile erişilemez. Kendi
          portföy listenize dönebilirsiniz.
        </p>
        <Link
          href="/portfolios"
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Portföylere dön
        </Link>
      </div>
    </div>
  );
}
