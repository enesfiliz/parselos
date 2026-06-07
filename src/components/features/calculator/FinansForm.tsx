"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateKomisyon,
  calculateTapuHarci,
  type KomisyonDetayi,
} from "@/lib/calculations";

function formatTL(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function parsePositive(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function KomisyonCard({
  title,
  detay,
}: {
  title: string;
  detay: KomisyonDetayi;
}) {
  return (
    <Card className="border-border/60 shadow-none ring-border/60">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-zinc-400">KDV Hariç (%2)</span>
          <span className="text-lg font-semibold tracking-tight">
            {formatTL(detay.kdvHaric)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-zinc-400">KDV (%20)</span>
          <span className="text-base font-medium">{formatTL(detay.kdvTutari)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-border/50 pt-4">
          <span className="text-sm font-medium">KDV Dahil</span>
          <span className="text-2xl font-semibold tracking-tight">
            {formatTL(detay.kdvDahil)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinansForm() {
  const [satisBedeli, setSatisBedeli] = useState("");

  const sonuc = useMemo(() => {
    const bedel = parsePositive(satisBedeli);
    if (bedel === null) return null;

    return {
      komisyon: calculateKomisyon(bedel),
      tapuHarci: calculateTapuHarci(bedel),
    };
  }, [satisBedeli]);

  return (
    <div className="space-y-12">
      <div className="max-w-md space-y-2">
        <Label htmlFor="satis-bedeli">Satış Bedeli (TL)</Label>
        <Input
          id="satis-bedeli"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="5.000.000"
          value={satisBedeli}
          onChange={(e) => setSatisBedeli(e.target.value)}
          className="h-11"
        />
      </div>

      {sonuc ? (
        <div className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <KomisyonCard
              title="Alıcı Komisyonu"
              detay={sonuc.komisyon.aliciKomisyonu}
            />
            <KomisyonCard
              title="Satıcı Komisyonu"
              detay={sonuc.komisyon.saticiKomisyonu}
            />
          </div>

          <Card className="border-border/60 shadow-none ring-border/60">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-medium">
                Tapu Harcı (%4 Toplam)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Alıcı Payı (%2)</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatTL(sonuc.tapuHarci.aliciPayi)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Satıcı Payı (%2)</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatTL(sonuc.tapuHarci.saticiPayi)}
                </p>
              </div>
              <div className="space-y-2 sm:border-l sm:border-border/50 sm:pl-6">
                <p className="text-sm font-medium">Toplam Tapu Harcı</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatTL(sonuc.tapuHarci.toplam)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 px-8 py-14 text-center">
          <p className="text-sm text-zinc-400">
            Hesaplama için geçerli bir satış bedeli girin.
          </p>
        </div>
      )}
    </div>
  );
}
