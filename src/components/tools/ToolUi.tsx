"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import { parseSayiTr } from "@/lib/tool-calculations";

export function SayiGirisi({
  label,
  deger,
  onDeger,
  suffix,
  prefix,
  hint,
  sifirOlabilir = false,
}: {
  label: string;
  deger: string;
  onDeger: (v: string) => void;
  suffix?: string;
  prefix?: string;
  hint?: string;
  sifirOlabilir?: boolean;
}) {
  const id = useId();
  const gectersiz =
    deger.trim() !== "" && parseSayiTr(deger, sifirOlabilir) === null;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={hint ? `${id}-hint` : undefined}
          aria-invalid={gectersiz ? true : undefined}
          value={deger}
          onChange={(e) => onDeger(e.target.value)}
          className={cn(
            "h-11 w-full rounded-lg border bg-card px-3 text-base tabular-nums text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
            gectersiz ? "border-destructive" : "border-border",
            prefix && "pl-8",
            suffix && "pr-12",
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SonucKutusu({
  baslik,
  satirlar,
}: {
  baslik?: string;
  satirlar: { etiket: string; deger: string; vurgulu?: boolean }[];
}) {
  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-border bg-card p-5"
    >
      {baslik ? (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {baslik}
        </h3>
      ) : null}
      <dl className="space-y-2.5">
        {satirlar.map((s) => (
          <div
            key={s.etiket}
            className={cn(
              "flex items-baseline justify-between gap-4",
              s.vurgulu
                ? "text-lg font-semibold text-foreground"
                : "text-sm",
            )}
          >
            <dt className={s.vurgulu ? "text-foreground" : "text-muted-foreground"}>
              {s.etiket}
            </dt>
            <dd className="tabular-nums">{s.deger}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function BosDurum({ mesaj }: { mesaj: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground"
    >
      {mesaj}
    </div>
  );
}

export function BilgiNotu({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
      <p className="mb-1 font-medium text-foreground">{baslik}</p>
      {children}
    </div>
  );
}

export const parseSayi = parseSayiTr;
