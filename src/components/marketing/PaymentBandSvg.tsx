"use client";

import { useParselTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type PaymentBandSvgProps = {
  className?: string;
  size?: "default" | "compact";
};

export function PaymentBandSvg({ className, size = "default" }: PaymentBandSvgProps) {
  const { resolvedTheme } = useParselTheme();
  const isDark = resolvedTheme === "dark";
  const heightClass = size === "compact" ? "h-[1.375rem] sm:h-6" : "h-6 sm:h-7";
  const subFill = isDark ? "#d4d4d8" : "#52525b";
  const visaFill = isDark ? "#93c5fd" : "#1A1F71";
  const troyFill = isDark ? "#a1a1aa" : "#4B5563";

  return (
    <svg
      viewBox="0 0 520 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
      className={cn("w-auto max-w-[min(100vw-4rem,22rem)]", heightClass, className)}
    >
      <path fill="#1E64FF" d="M6 8 18 20 6 32V8Z" />
      <text
        x="24"
        y="25"
        fontFamily="system-ui,-apple-system,Segoe UI,sans-serif"
        fontSize="15"
        fontWeight="700"
        fill="#4DA3FF"
      >
        iyzico
      </text>
      <text
        x="88"
        y="25"
        fontFamily="system-ui,-apple-system,Segoe UI,sans-serif"
        fontSize="11"
        fontWeight="500"
        fill={subFill}
      >
        ile Öde
      </text>
      <circle cx="168" cy="20" r="11" fill="#EB001B" />
      <circle cx="182" cy="20" r="11" fill="#F79E1B" fillOpacity="0.95" />
      <text
        x="208"
        y="26"
        fontFamily="Georgia,serif"
        fontSize="17"
        fontWeight="700"
        fontStyle="italic"
        fill={visaFill}
      >
        VISA
      </text>
      <rect x="268" y="8" width="52" height="24" rx="3" fill="#2E77BC" />
      <text
        x="294"
        y="17"
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize="5.5"
        fontWeight="700"
        fill="#fff"
      >
        AMERICAN
      </text>
      <text
        x="294"
        y="24"
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize="5.5"
        fontWeight="700"
        fill="#fff"
      >
        EXPRESS
      </text>
      <text
        x="340"
        y="26"
        fontFamily="system-ui,sans-serif"
        fontSize="16"
        fontWeight="700"
        fill={troyFill}
      >
        troy
      </text>
      <circle cx="358" cy="20" r="6" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
      <path d="M358 14v12" stroke="#38BDF8" strokeWidth="1.5" />
    </svg>
  );
}
