import { Radio, Satellite } from "lucide-react";

type FsboEmptyStateProps = {
  variant?: "listening" | "filtered";
};

export function FsboEmptyState({ variant = "listening" }: FsboEmptyStateProps) {
  const isListening = variant === "listening";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-parsel-gold/10" />
        <div className="relative flex size-20 items-center justify-center rounded-full border border-[#b38c56]/25 bg-parsel-panel">
          {isListening ? (
            <Satellite className="size-9 text-parsel-gold" strokeWidth={1.25} />
          ) : (
            <Radio className="size-9 text-muted-foreground" strokeWidth={1.25} />
          )}
        </div>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-parsel-gold">
        {isListening ? "Sistem Dinlemede" : "Sonuç Bulunamadı"}
      </p>
      <h3 className="mt-2 font-outfit text-lg font-semibold text-foreground">
        {isListening
          ? "Henüz yeni ilan düşmedi"
          : "Filtrelere uygun sinyal yok"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {isListening
          ? "Scraper-bot yeni FSBO ilanları gönderdiğinde gelen kutusu otomatik dolacak. Geliştirme modunda önizleme kartları yüklendi."
          : "Filtreleri gevşetin veya radarı yeniden çalıştırın."}
      </p>

      {isListening ? (
        <div className="mt-6 flex items-center gap-2 rounded-full border border-border/50 bg-parsel-sunken px-4 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-muted-foreground">Bot bağlantısı bekleniyor</span>
        </div>
      ) : null}
    </div>
  );
}
