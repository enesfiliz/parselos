"use client";

import {
  Calculator,
  CircleDollarSign,
  Landmark,
  Percent,
  TrendingUp,
} from "lucide-react";
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

import {
  CHART_COLORS,
  CHART_PERIOD_OPTIONS,
  METRIC_CARD,
  PANEL_CARD,
  sliceChartPeriod,
  type ChartPeriod,
} from "@/components/features/finance/finans-ui-helpers";
import { Badge } from "@/components/ui/badge";
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

type FinancePanel = "credit" | "roi";

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
    <div className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3">
      <p className="parsel-section-label text-[10px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums tracking-tight text-foreground",
          highlight ? "text-2xl" : "text-lg",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FinansView() {
  const [activePanel, setActivePanel] = useState<FinancePanel>("credit");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("24");

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
    const rows = credit.schedule.map((row) => ({
      ay: `${row.ay}. Ay`,
      anapara: Math.round(row.anapara),
      faiz: Math.round(row.faiz),
    }));
    return sliceChartPeriod(rows, chartPeriod);
  }, [credit, chartPeriod]);

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-3">
          <p className="parsel-section-label text-primary">Finans kontrolü</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="parsel-page-title text-foreground">Finans</h1>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-parsel-panel px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-parsel-sm">
              Canlı simülasyon
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Kredi yükünüzü ve yatırım geri dönüşünü modelleyin. Tüm rakamlar girdi
            değiştikçe anlık güncellenir.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Aylık taksit</p>
            <p className="parsel-metric-value mt-2 text-parsel-gold">
              {credit ? formatCurrency(credit.aylikTaksit) : "—"}
            </p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Toplam faiz</p>
            <p className="parsel-metric-value mt-2 text-foreground">
              {credit ? formatCurrency(credit.toplamFaizYuku) : "—"}
            </p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Brüt getiri</p>
            <p className="parsel-metric-value mt-2 text-primary">
              {roi ? formatPercent(roi.yillikBrutGetiri) : "—"}
            </p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Amortisman</p>
            <p className="parsel-metric-value mt-2 text-foreground">
              {roi ? `${formatNumber(roi.amortismanAy, 0)} ay` : "—"}
            </p>
          </article>
        </section>

        <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-2 shadow-parsel-sm sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "credit" as const, label: "Kredi", icon: Landmark },
                { id: "roi" as const, label: "ROI", icon: TrendingUp },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePanel(item.id)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors",
                  activePanel === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className={cn(
              PANEL_CARD,
              activePanel !== "credit" && "hidden lg:block",
            )}
          >
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Landmark className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Kredi simülatörü
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Eşit taksitli ödeme planı ve anapara–faiz erimesi
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="kredi-tutari">Kredi tutarı (TL)</Label>
                  <Input
                    id="kredi-tutari"
                    value={krediTutari}
                    onChange={(e) => setKrediTutari(e.target.value)}
                    placeholder="2.500.000"
                    className="h-11 border-border/60 bg-parsel-elevated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faiz-orani">Faiz oranı (aylık %)</Label>
                  <Input
                    id="faiz-orani"
                    value={faizOrani}
                    onChange={(e) => setFaizOrani(e.target.value)}
                    placeholder="3,25"
                    className="h-11 border-border/60 bg-parsel-elevated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vade-ay">Vade (ay)</Label>
                  <Input
                    id="vade-ay"
                    value={vadeAy}
                    onChange={(e) => setVadeAy(e.target.value)}
                    placeholder="120"
                    className="h-11 border-border/60 bg-parsel-elevated"
                  />
                </div>
              </div>

              {credit ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricBlock
                      label="Aylık taksit"
                      value={formatCurrency(credit.aylikTaksit)}
                      highlight
                    />
                    <MetricBlock
                      label="Toplam geri ödeme"
                      value={formatCurrency(credit.toplamGeriOdeme)}
                    />
                    <MetricBlock
                      label="Toplam faiz yükü"
                      value={formatCurrency(credit.toplamFaizYuku)}
                    />
                  </div>

                  <Separator className="bg-border/60" />

                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="parsel-section-label text-muted-foreground">
                        Dönemsel erime
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {CHART_PERIOD_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setChartPeriod(option.value)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                              chartPeriod === option.value
                                ? "border-primary/25 bg-primary/10 text-primary"
                                : "border-border/60 bg-parsel-elevated text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="anaparaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.primary}
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.primary}
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                            <linearGradient id="faizFill" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.gold}
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.gold}
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            stroke={CHART_COLORS.grid}
                            strokeDasharray="4 4"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="ay"
                            tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={24}
                          />
                          <YAxis
                            tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
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
                              border: `1px solid ${CHART_COLORS.grid}`,
                              fontSize: 12,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="anapara"
                            stackId="1"
                            stroke={CHART_COLORS.primary}
                            fill="url(#anaparaFill)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="faiz"
                            stackId="1"
                            stroke={CHART_COLORS.gold}
                            fill="url(#faizFill)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-parsel-elevated/60 px-4 py-10 text-center">
                  <Calculator className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.25} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Geçerli kredi tutarı, faiz ve vade girin.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section
            className={cn(PANEL_CARD, activePanel !== "roi" && "hidden lg:block")}
          >
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <TrendingUp className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    ROI & amortisman
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kira getirisi ve değer artışına göre geri dönüş
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="satis-fiyati">Gayrimenkul satış fiyatı (TL)</Label>
                  <Input
                    id="satis-fiyati"
                    value={satisFiyati}
                    onChange={(e) => setSatisFiyati(e.target.value)}
                    placeholder="8.500.000"
                    className="h-11 border-border/60 bg-parsel-elevated"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="aylik-kira">Beklenen aylık kira (TL)</Label>
                    <Input
                      id="aylik-kira"
                      value={aylikKira}
                      onChange={(e) => setAylikKira(e.target.value)}
                      placeholder="35.000"
                      className="h-11 border-border/60 bg-parsel-elevated"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deger-artis">Yıllık değer artışı (%)</Label>
                    <Input
                      id="deger-artis"
                      value={degerArtis}
                      onChange={(e) => setDegerArtis(e.target.value)}
                      placeholder="12"
                      className="h-11 border-border/60 bg-parsel-elevated"
                    />
                  </div>
                </div>
              </div>

              {roi ? (
                <>
                  <div className="rounded-2xl border border-border/60 bg-parsel-elevated p-5">
                    <p className="parsel-section-label text-muted-foreground">
                      Amortisman süresi
                    </p>
                    <div className="mt-4 flex flex-wrap items-end gap-4">
                      <div>
                        <span className="text-5xl font-semibold tabular-nums tracking-tighter text-foreground">
                          {formatNumber(roi.amortismanAy, 0)}
                        </span>
                        <span className="ml-2 text-lg text-muted-foreground">ay</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="border-border/60 bg-parsel-panel text-sm font-normal tabular-nums"
                      >
                        ≈ {formatNumber(roi.amortismanYil, 1)} yıl
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      Sadece kira geliri ile yatırımın kendini amorti etme süresi (basit
                      geri dönüş modeli).
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-6">
                      <p className="flex items-center gap-1.5 parsel-section-label text-[10px] text-muted-foreground">
                        <CircleDollarSign className="size-3" />
                        Kira çarpanı
                      </p>
                      <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                        {formatNumber(roi.kiraCarpani, 1)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">yıl (brüt)</p>
                    </div>

                    <div className="space-y-3">
                      <MetricBlock
                        label="Yıllık brüt getiri"
                        value={formatPercent(roi.yillikBrutGetiri)}
                      />
                      <MetricBlock
                        label="10 yıl sonra tahmini değer"
                        value={formatCurrency(roi.onYillikDegerTahmini)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-parsel-elevated/60 px-4 py-10 text-center">
                  <Percent className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.25} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Geçerli satış fiyatı ve aylık kira girin.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
