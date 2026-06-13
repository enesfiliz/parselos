import Image from "next/image";

import { cn } from "@/lib/utils";

const PAYMENT_BRANDS = [
  {
    src: "/payments/iyzico.svg",
    alt: "iyzico ile öde",
    width: 72,
    height: 20,
    className: "h-5 w-[4.5rem]",
  },
  {
    src: "/payments/visa.svg",
    alt: "Visa",
    width: 56,
    height: 36,
    className: "h-6 w-[3.5rem]",
  },
  {
    src: "/payments/mastercard.svg",
    alt: "Mastercard",
    width: 44,
    height: 28,
    className: "h-7 w-[2.75rem]",
  },
  {
    src: "/payments/troy.svg",
    alt: "Troy",
    width: 64,
    height: 22,
    className: "h-5 w-[4rem]",
  },
] as const;

export function PaymentBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-3", className)}
      aria-label="Ödeme yöntemleri: iyzico, Visa, Mastercard, Troy"
    >
      {PAYMENT_BRANDS.map((brand) => (
        <div
          key={brand.alt}
          className="flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
        >
          <Image
            src={brand.src}
            alt={brand.alt}
            width={brand.width}
            height={brand.height}
            className={cn("object-contain object-center", brand.className)}
          />
        </div>
      ))}
    </div>
  );
}
