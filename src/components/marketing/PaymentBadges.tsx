import Image from "next/image";

import { cn } from "@/lib/utils";

const CARD_BRANDS = [
  {
    src: "/payments/visa.svg",
    alt: "Visa",
    width: 56,
    height: 36,
    className: "h-6 w-[3.25rem]",
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
    className: "h-5 w-[3.75rem]",
  },
] as const;

type PaymentBadgesProps = {
  className?: string;
  variant?: "bar" | "grid";
};

export function PaymentBadges({ className, variant = "bar" }: PaymentBadgesProps) {
  if (variant === "bar") {
    return (
      <div
        className={cn(
          "inline-flex max-w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center",
          className,
        )}
        aria-label="Güvenli ödeme: iyzico ile Öde, Visa, Mastercard, Troy"
      >
        <div className="flex min-h-12 items-center justify-center rounded-xl bg-white px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] dark:bg-white">
          <Image
            src="/payments/iyzico-ile-ode.svg"
            alt="iyzico ile Öde"
            width={320}
            height={48}
            className="h-8 w-auto max-w-[min(100%,20rem)] object-contain object-left"
            priority={false}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {CARD_BRANDS.map((brand) => (
            <div
              key={brand.alt}
              className="flex h-11 min-w-[4.5rem] items-center justify-center rounded-lg bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] dark:bg-white"
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
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-3", className)}
      aria-label="Ödeme yöntemleri: iyzico, Visa, Mastercard, Troy"
    >
      <div className="flex h-11 min-w-[12rem] items-center justify-center rounded-lg bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] dark:bg-white">
        <Image
          src="/payments/iyzico-ile-ode.svg"
          alt="iyzico ile Öde"
          width={200}
          height={32}
          className="h-6 w-auto object-contain"
        />
      </div>
      {CARD_BRANDS.map((brand) => (
        <div
          key={brand.alt}
          className="flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] dark:bg-white"
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
