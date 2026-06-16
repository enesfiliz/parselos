import { ListFilter } from "lucide-react";

type FsboEmptyStateProps = {
  variant?: "empty" | "filtered";
};

export function FsboEmptyState({ variant = "empty" }: FsboEmptyStateProps) {
  const isFiltered = variant === "filtered";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-parsel-elevated">
        <ListFilter className="size-7 text-primary/80" strokeWidth={1.5} />
      </div>

      <p className="parsel-section-label text-primary">
        {isFiltered ? "Sonuç bulunamadı" : "Henüz takip kaydı yok"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">
        {isFiltered
          ? "Filtrelere uygun fırsat bulunamadı"
          : "İlk fırsatınızı manuel ekleyin"}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isFiltered
          ? "Filtreleri gevşetin veya yeni bir takip kaydı oluşturun."
          : "Kaynak linki isteğe bağlıdır. Başlık, fiyat, konum ve notları siz girersiniz; otomatik veri çekme kullanılmaz."}
      </p>
    </div>
  );
}
