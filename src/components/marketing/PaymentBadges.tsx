import { PaymentBandSvg } from "@/components/marketing/PaymentBandSvg";
import { cn } from "@/lib/utils";

type PaymentBadgesProps = {
  className?: string;
  size?: "default" | "compact";
};

export function PaymentBadges({
  className,
  size = "default",
}: PaymentBadgesProps) {
  return (
    <div
      className={cn("inline-flex max-w-full", className)}
      aria-label="Güvenli ödeme: iyzico ile Öde, Mastercard, Visa, American Express, Troy"
    >
      <div
        className={cn(
          "overflow-hidden rounded-lg px-2 py-1.5 ring-1",
          "bg-zinc-950 ring-black/10 dark:bg-black dark:ring-white/10",
        )}
      >
        <PaymentBandSvg size={size} />
      </div>
    </div>
  );
}
