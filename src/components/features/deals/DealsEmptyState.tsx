"use client";

export type DealsEmptyStateProps = {
  onCreateDeal: () => void;
};

export function DealsEmptyState({ onCreateDeal }: DealsEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border/50 bg-parsel-panel px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">
        Henüz fırsat yok.{" "}
        <button
          type="button"
          onClick={onCreateDeal}
          className="font-semibold text-parsel-gold hover:underline"
        >
          İlk fırsatı ekleyin
        </button>{" "}
        veya FSBO Radarından pipeline&apos;a gönderin.
      </p>
    </div>
  );
}
