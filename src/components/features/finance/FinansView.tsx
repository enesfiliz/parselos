"use client";

import { Landmark, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  calculateCreditSimulation,
  calculateRoiAmortization,
  formatCurrency,
  formatNumber,
  formatPercent,
  parseTurkishNumber,
} from "@/lib/finance-calculations";
import { cn } from "@/lib/utils";

function MetricBlock({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          "font-semibold tabular-nums tracking-tight text-neutral-900",
          highlight ? "text-2xl" : "text-lg",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FinansView() {
  const [krediTutari, setKrediTutari] = useState("2500000");
  const [faizOrani, setFaizOrani] = useState("3.25");
  const [vadeAy, setVadeAy] = useState("120");

  const [satisFiyati, setSatisFiyati] = useState("8500000");
  const [aylikKira, setAylikKira] = useState("35000");
  const [degerArtis, setDegerArtis] = useState("12");

  const credit = useMemo(() => {
    return calculateCreditSimulation(
      parseTurkishNumber(krediTutari),
      parseTurkishNumber(faizOrani),
      Math.round(parseTurkishNumber(vadeAy)),
    );
  }, [krediTutari, faizOrani, vadeAy]);

  const roi = useMemo(() => {
    return calculateRoiAmortization(
      parseTurkishNumber(satisFiyati),
      parseTurkishNumber(aylikKira),
      parseTurkishNumber(degerArtis),
    );
  }, [satisFiyati, aylikKira, degerArtis]);

  const chartData = useMemo(() => {
    if (!credit) return [];
    return credit.schedule.map((row) => ({
      ay: `${row.ay}. Ay`,
      anapara: Math.round(row.anapara),
      faiz: Math.round(row.faiz),
    }));
  }, [credit]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Landmark className="size-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
            Finans & Kredi
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Finansal Hesaplayıcılar
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Kredi yükünü ve yatırım geri dönüşünü modern FinTech arayüzüyle
          modelleyin. Tüm rakamlar anlık güncellenir.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gelişmiş Kredi Simülatörü */}
        <Card className="border-border/60 shadow-lg ring-1 ring-neutral-100/80">
          <CardHeader className="border-b border-border/50 pb-5">
            <CardTitle className="text-base font-medium">
              Gelişmiş Kredi Simülatörü
            </CardTitle>
            <CardDescription>
              Eşit taksitli ödeme planı ve anapara–faiz erimesi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="kredi-tutari">Kredi Tutarı (TL)</Label>
                <Input
                  id="kredi-tutari"
                  value={krediTutari}
                  onChange={(e) => setKrediTutari(e.target.value)}
                  placeholder="2.500.000"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faiz-orani">Faiz Oranı (Aylık %)</Label>
                <Input
                  id="faiz-orani"
                  value={faizOrani}
                  onChange={(e) => setFaizOrani(e.target.value)}
                  placeholder="3,25"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vade-ay">Vade (Ay)</Label>
                <Input
                  id="vade-ay"
                  value={vadeAy}
                  onChange={(e) => setVadeAy(e.target.value)}
                  placeholder="120"
                  className="h-10"
                />
              </div>
            </div>

            {credit ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricBlock
                    label="Aylık Taksit"
                    value={formatCurrency(credit.aylikTaksit)}
                    highlight
                  />
                  <MetricBlock
                    label="Toplam Geri Ödeme"
                    value={formatCurrency(credit.toplamGeriOdeme)}
                  />
                  <MetricBlock
                    label="Toplam Faiz Yükü"
                    value={formatCurrency(credit.toplamFaizYuku)}
                  />
                </div>

                <Separator />

                <div className="h-56 w-full">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                    Anapara & Faiz Erimesi
                  </p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="anaparaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#171717" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#171717" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="faizFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#737373" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#737373" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="ay"
                        tick={{ fill: "#a3a3a3", fontSize: 10 }}
                        interval="preserveStartEnd"
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fill: "#a3a3a3", fontSize: 10 }}
                        width={56}
                        tickFormatter={(v) =>
                          v >= 1_000_000
                            ? `${(v / 1_000_000).toFixed(1)}M`
                            : v >= 1000
                              ? `${(v / 1000).toFixed(0)}K`
                              : String(v)
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value ?? 0)),
                          name === "anapara" ? "Anapara" : "Faiz",
                        ]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e5e5e5",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="anapara"
                        stackId="1"
                        stroke="#171717"
                        fill="url(#anaparaFill)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="faiz"
                        stackId="1"
                        stroke="#737373"
                        fill="url(#faizFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Geçerli kredi tutarı, faiz ve vade girin.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ROI & Amortisman */}
        <Card className="border-border/60 shadow-lg ring-1 ring-neutral-100/80">
          <CardHeader className="border-b border-border/50 pb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-neutral-500" strokeWidth={1.5} />
              <div>
                <CardTitle className="text-base font-medium">
                  ROI & Amortisman Motoru
                </CardTitle>
                <CardDescription>
                  Kira getirisi ve değer artışına göre geri dönüş
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="satis-fiyati">Gayrimenkul Satış Fiyatı (TL)</Label>
                <Input
                  id="satis-fiyati"
                  value={satisFiyati}
                  onChange={(e) => setSatisFiyati(e.target.value)}
                  placeholder="8.500.000"
                  className="h-10"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aylik-kira">Beklenen Aylık Kira (TL)</Label>
                  <Input
                    id="aylik-kira"
                    value={aylikKira}
                    onChange={(e) => setAylikKira(e.target.value)}
                    placeholder="35.000"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deger-artis">Yıllık Değer Artış Tahmini (%)</Label>
                  <Input
                    id="deger-artis"
                    value={degerArtis}
                    onChange={(e) => setDegerArtis(e.target.value)}
                    placeholder="12"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {roi ? (
              <>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                    Amortisman Süresi
                  </p>
                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    <div>
                      <span className="text-5xl font-semibold tabular-nums tracking-tighter text-neutral-900">
                        {formatNumber(roi.amortismanAy, 0)}
                      </span>
                      <span className="ml-2 text-lg text-neutral-500">ay</span>
                    </div>
                    <Badge variant="secondary" className="text-sm font-normal tabular-nums">
                      ≈ {formatNumber(roi.amortismanYil, 1)} yıl
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Sadece kira geliri ile yatırımın kendini amorti etme süresi (basit
                    geri dönüş modeli).
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-900/10 bg-neutral-900 px-5 py-6 text-white">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
                      Kira Çarpanı
                    </p>
                    <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                      {formatNumber(roi.kiraCarpani, 1)}
                    </p>
                    <p className="mt-1 text-xs text-white/60">yıl (brüt)</p>
                  </div>

                  <div className="space-y-3">
                    <MetricBlock
                      label="Yıllık Brüt Getiri"
                      value={formatPercent(roi.yillikBrutGetiri)}
                    />
                    <MetricBlock
                      label="10 Yıl Sonra Tahmini Değer"
                      value={formatCurrency(roi.onYillikDegerTahmini)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Geçerli satış fiyatı ve aylık kira girin.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
