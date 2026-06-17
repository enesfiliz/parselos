import { AlertCircle } from "lucide-react";

export function DashboardDbError() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-border/80 bg-parsel-card/60 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <AlertCircle className="size-4" strokeWidth={1.75} />
          </span>
          <div className="space-y-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Veritabanı bağlantısı kurulamadı
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Dashboard verileri şu anda yüklenemiyor. Bağlantı geçici olarak
                kullanılamıyor olabilir; ekibimiz bu durumu güvenli şekilde takip eder.
              </p>
            </div>

            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Oturumu kapatıp tekrar giriş yapın</li>
              <li>Sayfayı yenileyin</li>
              <li>Sorun devam ederse destek ekibiyle iletişime geçin</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
