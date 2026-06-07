"use client";

import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateImar } from "@/lib/calculations";

function formatAlan(value: number) {
  return (
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value) +
    " m²"
  );
}

function parsePositive(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60 shadow-none ring-border/60">
      <CardContent className="space-y-3 pt-8 pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </p>
        <p className="text-4xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ImarForm() {
  const [arsaM2, setArsaM2] = useState("");
  const [taks, setTaks] = useState("");
  const [kaks, setKaks] = useState("");

  const sonuc = useMemo(() => {
    const arsa = parsePositive(arsaM2);
    const taksDeger = parsePositive(taks);
    const kaksDeger = parsePositive(kaks);

    if (arsa === null || taksDeger === null || kaksDeger === null) return null;

    return calculateImar(arsa, taksDeger, kaksDeger);
  }, [arsaM2, taks, kaks]);

  return (
    <div className="space-y-12">
      <div className="grid gap-8 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="arsa-m2">Arsa Alanı (m²)</Label>
          <Input
            id="arsa-m2"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="500"
            value={arsaM2}
            onChange={(e) => setArsaM2(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taks">TAKS Oranı</Label>
          <Input
            id="taks"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.25"
            value={taks}
            onChange={(e) => setTaks(e.target.value)}
            className="h-11"
          />
          <p className="text-xs text-zinc-400">Örn: 0.25</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kaks">KAKS / Emsal Oranı</Label>
          <Input
            id="kaks"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="1.50"
            value={kaks}
            onChange={(e) => setKaks(e.target.value)}
            className="h-11"
          />
          <p className="text-xs text-zinc-400">Örn: 1.50</p>
        </div>
      </div>

      {sonuc ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <ResultCard
            label="Maksimum Taban Oturumu"
            value={formatAlan(sonuc.tabanOturumu)}
          />
          <ResultCard
            label="Toplam İnşaat Alanı"
            value={formatAlan(sonuc.toplamInsaatAlani)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 px-8 py-14 text-center">
          <p className="text-sm text-zinc-400">
            Hesaplama için geçerli arsa alanı, TAKS ve KAKS değerlerini girin.
          </p>
        </div>
      )}
    </div>
  );
}
