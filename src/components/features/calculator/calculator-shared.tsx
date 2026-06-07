"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  digitsOnly,
  formatMoneyInputFromDigits,
  parseTurkishMoney,
  parseTurkishPercent,
} from "@/lib/calculator-format";

export const CALC_CARD =
  "relative overflow-hidden rounded-2xl border border-border/50 bg-parsel-panel p-6";

export const CALC_INPUT =
  "w-full rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm text-foreground transition-colors outline-none focus:border-[#b38c56]";

export const CALC_LABEL = "mb-1.5 block text-xs font-medium text-foreground/45";

export function CalculatorCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className={CALC_CARD}>
      <header className="mb-5">
        <h2 className="text-base font-semibold text-foreground/90">{title}</h2>
        <p className="mt-1 text-xs text-foreground/35">{description}</p>
      </header>
      {children}
    </article>
  );
}

export function MoneyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={CALC_LABEL}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ₺
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatMoneyInputFromDigits(digitsOnly(e.target.value)))}
          className={cn(CALC_INPUT, "pl-8 tabular-nums")}
        />
      </div>
    </div>
  );
}

export function PercentInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={CALC_LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d,]/g, "");
            onChange(raw);
          }}
          className={cn(CALC_INPUT, "pr-8 tabular-nums")}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}

export function ResultBox({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="mt-4 rounded-xl bg-foreground/5 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-parsel-gold">
        {value}
      </p>
      {subValue ? (
        <p className="mt-1 text-xs text-foreground/35">{subValue}</p>
      ) : null}
    </div>
  );
}

export function ResultGrid({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function parseMoneyField(formatted: string) {
  return parseTurkishMoney(formatted);
}

export function parsePercentField(formatted: string) {
  return parseTurkishPercent(formatted);
}
