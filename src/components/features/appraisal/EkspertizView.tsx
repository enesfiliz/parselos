"use client";

import dynamic from "next/dynamic";
import {
  Clock,
  Database,
  Download,
  FileText,
  Landmark,
  Loader2,
  Map,
  MapPin,
  Percent,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppraisalReport } from "@/lib/types/appraisal";
import { cn } from "@/lib/utils";

const SatelliteMap = dynamic(
  () => import("./SatelliteMap").then((mod) => mod.SatelliteMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-950">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Uydu bağlantısı kuruluyor…
        </p>
      </div>
    ),
  },
);

interface AppraisalForm {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  brutMetrekare: string;
  netMetrekare: string;
  ozellikler: string;
}

const emptyForm: AppraisalForm = {
  il: "",
  ilce: "",
  mahalle: "",
  ada: "",
  parsel: "",
  brutMetrekare: "",
  netMetrekare: "",
  ozellikler: "",
};

function buildAddressLabel(form: AppraisalForm) {
  const adaParsel =
    form.ada || form.parsel
      ? `Ada ${form.ada || "—"} · Parsel ${form.parsel || "—"}`
      : "";
  return [form.mahalle, form.ilce, form.il, adaParsel].filter(Boolean).join(" · ");
}

function farkTone(fark: string) {
  if (fark.includes("+")) return "text-emerald-600";
  if (fark.includes("-")) return "text-red-500";
  return "text-neutral-500";
}

function KarlilikIcon({ baslik }: { baslik: string }) {
  if (baslik.toLowerCase().includes("kira")) {
    return <Clock className="size-5 text-neutral-400" strokeWidth={1.5} />;
  }
  return <Percent className="size-5 text-neutral-400" strokeWidth={1.5} />;
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function EditorialSection({
  icon: Icon,
  kicker,
  title,
  content,
  breakBefore = false,
}: {
  icon: LucideIcon;
  kicker: string;
  title: string;
  content: string;
  breakBefore?: boolean;
}) {
  const paragraphs = splitParagraphs(content);

  return (
    <section
      className={cn(
        "editorial-section rounded-2xl bg-white px-8 py-10 shadow-lg ring-1 ring-neutral-100/80 print:break-inside-avoid print:px-6 print:py-6 print:shadow-none",
        breakBefore && "print:break-before-page",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-100">
          <Icon className="size-5 text-neutral-600" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {kicker}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-5">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${title}-${index}`}
            className="text-[15px] leading-[1.85] text-neutral-700"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function formatReportDate() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function ReportCoverPage({ form }: { form: AppraisalForm }) {
  const konum = [form.il, form.ilce].filter(Boolean).join(", ") || "—";
  const adaParsel =
    form.ada || form.parsel
      ? `Ada ${form.ada || "—"} · Parsel ${form.parsel || "—"}`
      : "—";

  return (
    <div
      className={cn(
        "report-cover relative mb-6 flex min-h-[297mm] w-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-900 p-16 text-white shadow-xl",
        "print:mb-0 print:min-h-[297mm] print:w-full print:rounded-none print:p-12 print:shadow-none print:break-after-page",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_55%)]" />

      {/* Üst — Logolar */}
      <div className="relative flex items-start justify-between gap-6 print:break-inside-avoid">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl border border-white/15 bg-white/5">
            <Sparkles className="size-6 text-white/90" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              Platform
            </p>
            <p className="text-lg font-semibold tracking-tight">Parselos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              Abone / Firma
            </p>
            <p className="text-sm text-white/70">Logo Alanı</p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
            <span className="text-[9px] uppercase tracking-widest text-white/40">
              Logo
            </span>
          </div>
        </div>
      </div>

      {/* Orta — Başlık */}
      <div className="relative space-y-6 py-8 print:break-inside-avoid">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">
          Resmi Değerleme Dosyası
        </p>
        <h1 className="max-w-2xl text-4xl font-extralight leading-tight tracking-tight text-white md:text-5xl">
          Gayrimenkul Değerleme ve Bölge Analiz Raporu
        </h1>
        <div className="space-y-2 border-l border-white/20 pl-5">
          <p className="text-sm font-light text-white/80">{konum}</p>
          <p className="text-lg font-medium tracking-tight text-white">{adaParsel}</p>
          {form.mahalle.trim() && (
            <p className="text-sm text-white/60">{form.mahalle} Mahallesi</p>
          )}
        </div>
      </div>

      {/* Alt — Hazırlayan */}
      <div className="relative flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-end sm:justify-between print:break-inside-avoid">
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
            Hazırlayan
          </p>
          <p className="text-xl font-medium tracking-tight">Enes Filiz</p>
          <p className="text-sm font-light text-white/65">
            Gayrimenkul Değerleme Danışmanı
          </p>
          <p className="text-sm text-white/50">enes@parselos.com · +90 532 000 00 00</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
            Rapor Tarihi
          </p>
          <p className="mt-1 text-sm font-light text-white/80">{formatReportDate()}</p>
        </div>
      </div>
    </div>
  );
}

function BentoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-100/80 print:break-inside-avoid print:p-4 print:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PropertyOverviewCard({ form }: { form: AppraisalForm }) {
  const konum = [form.mahalle, form.ilce, form.il].filter(Boolean).join(", ") || "—";
  const adaParsel =
    form.ada || form.parsel
      ? `${form.ada || "—"}/${form.parsel || "—"}`
      : "—";

  const locationFields = [
    { icon: Map, label: "Konum", value: konum },
    { icon: MapPin, label: "Ada / Parsel", value: adaParsel },
  ];

  return (
    <BentoCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            Mülk Künyesi
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900">
            Property Overview
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          Form Verileri
        </Badge>
      </div>

      <Separator className="my-5" />

      <Table>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell className="w-40 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              Brüt Alan
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-normal tabular-nums">
                {form.brutMetrekare ? `${form.brutMetrekare} m²` : "—"}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              Net Alan
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal tabular-nums">
                {form.netMetrekare ? `${form.netMetrekare} m²` : "—"}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Separator className="my-5" />

      <div className="grid gap-5 sm:grid-cols-2">
        {locationFields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 ring-1 ring-neutral-100">
              <Icon className="size-4 text-neutral-500" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                {label}
              </p>
              <p className="text-sm font-medium leading-snug text-neutral-900">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {form.ozellikler.trim() && (
        <>
          <Separator className="my-5" />
          <div className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              Özellikler
            </p>
            <div className="flex flex-wrap gap-2">
              {form.ozellikler
                .split(/[,;]+/)
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => (
                  <Badge key={item} variant="secondary" className="font-normal">
                    {item}
                  </Badge>
                ))}
            </div>
          </div>
        </>
      )}
    </BentoCard>
  );
}

function BentoReport({
  report,
  address,
  form,
  mapCenter,
}: {
  report: AppraisalReport;
  address: string;
  form: AppraisalForm;
  mapCenter: { enlem: number; boylam: number } | null;
}) {
  const mapLat = mapCenter?.enlem ?? report.lokasyon.enlem;
  const mapLng = mapCenter?.boylam ?? report.lokasyon.boylam;

  const radarData = report.radar_metrikleri.map((item) => ({
    kategori: item.kategori,
    puan: item.puan,
    fullMark: 100,
  }));

  return (
    <article className="report-document bento-report mx-auto w-full max-w-4xl space-y-3 print:mx-0 print:max-w-none print:space-y-2">
      <div className="grid gap-3 print:gap-2">
        {/* Hero — Uydu */}
        <div className="report-map-card relative col-span-full h-[340px] overflow-hidden rounded-2xl shadow-lg print:h-[400px] print:break-inside-avoid print:rounded-lg print:shadow-none">
          <SatelliteMap
            lat={mapLat}
            lng={mapLng}
            className="z-0 h-full w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

          <div className="absolute inset-x-0 top-5 flex items-start justify-between px-6">
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 backdrop-blur-md">
              <Sparkles className="size-3.5 text-white" strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/90">
                Parselos Değerleme
              </span>
            </div>
          </div>

          <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md rounded-2xl border border-white/25 bg-white/70 px-5 py-4 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                Mülk Adresi
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-neutral-900">
                {address || "Konum bilgisi"}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                {mapLat.toFixed(5)}°N · {mapLng.toFixed(5)}°E
                {mapCenter ? " · TKGM" : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-white/25 bg-white/70 px-6 py-4 backdrop-blur-xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                Tahmini Değer
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
                {report.fiyat_analizi.tahmini_deger}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Ort. {report.fiyat_analizi.ortalama_m2_fiyat}
              </p>
            </div>
          </div>
        </div>

        {/* Mülk Künyesi — form verileri */}
        <PropertyOverviewCard form={form} />

        {/* Skor & Radar */}
        <div className="grid gap-3 md:grid-cols-2 print:gap-2 print:break-inside-avoid">
          <BentoCard className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Yatırım Skoru
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-7xl font-semibold tabular-nums tracking-tighter text-neutral-900">
                  {report.genel_skor}
                </span>
                <span className="mb-3 text-lg text-neutral-400">/ 100</span>
              </div>
            </div>
            <div className="space-y-2 border-t border-neutral-100 pt-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                Uzman Görüşü
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {report.uzman_gorusu}
              </p>
            </div>
          </BentoCard>

          <BentoCard>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Lokasyon Metrikleri
            </p>
            <div className="report-chart h-64 w-full print:h-56 print:break-inside-avoid">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis
                    dataKey="kategori"
                    tick={{ fill: "#737373", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#a3a3a3", fontSize: 9 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Puan"
                    dataKey="puan"
                    stroke="#16a34a"
                    fill="#22c55e"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
        </div>

        {/* Emsal CMA */}
        <BentoCard>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Karşılaştırmalı Piyasa Analizi
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900">
                Emsal Değerlendirmesi (CMA)
              </h3>
            </div>
            <TrendingUp className="size-5 text-neutral-300" strokeWidth={1.5} />
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Rakip Mülk</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead className="text-right">Fark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.emsal_analizi.map((row) => (
                <TableRow key={row.rakip_mulk}>
                  <TableCell className="font-medium text-neutral-900">
                    {row.rakip_mulk}
                  </TableCell>
                  <TableCell>{row.fiyat}</TableCell>
                  <TableCell
                    className={cn("text-right font-medium tabular-nums", farkTone(row.fark))}
                  >
                    {row.fark}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </BentoCard>

        {/* Finansal İnfografikler */}
        <div className="grid gap-3 sm:grid-cols-2 print:gap-2 print:break-inside-avoid">
          {report.karlilik_oranlari.map((item) => (
            <BentoCard key={item.baslik} className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-100">
                <KarlilikIcon baslik={item.baslik} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  {item.baslik}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
                  {item.deger}
                </p>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Editorial — uzun format metinler */}
      <div className="col-span-full space-y-4 pt-1 print:space-y-3 print:pt-0">
        <div className="flex items-center gap-4 px-2 print:break-inside-avoid">
          <Separator className="flex-1" />
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-400">
            Detaylı Analiz Raporu
          </p>
          <Separator className="flex-1" />
        </div>

        <EditorialSection
          icon={Landmark}
          kicker="Bölüm I"
          title="Detaylı Bölge Analizi"
          content={report.detayli_bolge_analizi}
        />

        <EditorialSection
          icon={ShieldAlert}
          kicker="Bölüm II"
          title="Yatırım ve Risk Raporu"
          content={report.yatirim_ve_risk_raporu}
          breakBefore
        />

        <EditorialSection
          icon={FileText}
          kicker="Bölüm III"
          title="Fiyat Analizi Gerekçesi"
          content={report.fiyat_analizi_gerekcesi}
          breakBefore
        />
      </div>

      <footer className="px-2 pt-4 print:break-inside-avoid">
        <p className="text-[10px] leading-relaxed text-neutral-400">
          Bu rapor Parselos AI tarafından üretilmiştir. Yatırım kararı öncesinde
          bağımsız SPK lisanslı ekspertiz raporu alınması önerilir.
        </p>
      </footer>
    </article>
  );
}

const PRINT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 0;
  }
  @media print {
    html, body {
      width: 210mm;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .print-container {
      width: 210mm !important;
      max-width: 210mm !important;
      padding: 10mm !important;
      margin: 0 auto !important;
      box-sizing: border-box !important;
    }
    .report-cover {
      width: 100% !important;
      min-height: 277mm !important;
      page-break-after: always !important;
      break-after: page !important;
    }
    .report-document {
      box-shadow: none !important;
      max-width: none !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .report-map-card,
    .report-chart,
    .editorial-section,
    .rounded-2xl.bg-white {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .leaflet-container {
      height: 400px !important;
      width: 100% !important;
      min-height: 400px !important;
    }
    .recharts-responsive-container,
    .recharts-wrapper,
    .recharts-surface {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`;

export function EkspertizView() {
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<AppraisalForm>(emptyForm);
  const [report, setReport] = useState<AppraisalReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingArchive, setIsSavingArchive] = useState(false);
  const [isTkgmLoading, setIsTkgmLoading] = useState(false);
  const [tkgmKoordinatlar, setTkgmKoordinatlar] = useState<[number, number] | null>(
    null,
  );
  const [tkgmNotice, setTkgmNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addressLabel = useMemo(() => buildAddressLabel(form), [form]);

  const mapCenter = useMemo(() => {
    if (!tkgmKoordinatlar) return null;
    return { enlem: tkgmKoordinatlar[0], boylam: tkgmKoordinatlar[1] };
  }, [tkgmKoordinatlar]);

  const canGenerate =
    form.brutMetrekare.trim().length > 0 && form.netMetrekare.trim().length > 0;

  const locationFields: Array<keyof AppraisalForm> = [
    "il",
    "ilce",
    "mahalle",
    "ada",
    "parsel",
  ];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Parselos_Degerleme_Raporu",
    pageStyle: PRINT_PAGE_STYLE,
  });

  function updateField<K extends keyof AppraisalForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setReport(null);

    if (locationFields.includes(key)) {
      setTkgmKoordinatlar(null);
      setTkgmNotice(null);
    }
  }

  async function handleTkgmQuery() {
    setTkgmNotice(null);
    setError(null);
    setIsTkgmLoading(true);

    try {
      const response = await fetch("/api/tkgm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          il: form.il,
          ilce: form.ilce,
          mahalle: form.mahalle,
          ada: form.ada,
          parsel: form.parsel,
        }),
      });

      const payload: unknown = await response.json();

      if (
        !payload ||
        typeof payload !== "object" ||
        !("success" in payload)
      ) {
        throw new Error("TKGM yanıtı okunamadı.");
      }

      if (!payload.success) {
        const message =
          "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Manuel giriş gerekli.";
        setTkgmNotice(message);
        return;
      }

      const m2 =
        "m2" in payload && typeof payload.m2 === "number" ? payload.m2 : null;
      const koordinatlar =
        "koordinatlar" in payload &&
        Array.isArray(payload.koordinatlar) &&
        payload.koordinatlar.length === 2
          ? (payload.koordinatlar as [number, number])
          : null;

      if (!m2 || !koordinatlar) {
        setTkgmNotice("TKGM verisi eksik döndü. Manuel giriş gerekli.");
        return;
      }

      const alanText =
        Number.isInteger(m2) ? String(m2) : m2.toFixed(2).replace(/\.?0+$/, "");

      setForm((prev) => ({
        ...prev,
        brutMetrekare: alanText,
        netMetrekare: alanText,
      }));
      setTkgmKoordinatlar(koordinatlar);
      setTkgmNotice("TKGM kayıtları alındı — alan ve koordinatlar otomatik dolduruldu.");
      setReport(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "TKGM sorgusu başarısız oldu.";
      setTkgmNotice(`${message} Manuel giriş gerekli.`);
    } finally {
      setIsTkgmLoading(false);
    }
  }

  async function handleSaveArchive() {
    if (!report) return;

    setIsSavingArchive(true);

    try {
      const baslik =
        [form.mahalle, form.ilce, "Değerleme Raporu"].filter(Boolean).join(" · ") ||
        "Gayrimenkul Değerleme Raporu";

      const response = await fetch("/api/appraisals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik,
          ada: form.ada.trim(),
          parsel: form.parsel.trim(),
          m2: `Brüt: ${form.brutMetrekare} m² · Net: ${form.netMetrekare} m²`,
          jsonVerisi: {
            report,
            form,
            tkgmKoordinatlar,
            archivedAt: new Date().toISOString(),
          },
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Rapor arşive kaydedilemedi.";
        throw new Error(message);
      }

      toast.success("Rapor başarıyla arşive eklendi.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Rapor arşive kaydedilemedi.";
      toast.error(message);
    } finally {
      setIsSavingArchive(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/appraisal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Değerleme raporu oluşturulamadı.";
        throw new Error(message);
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("data" in payload) ||
        !payload.data
      ) {
        throw new Error("API yanıtı geçerli bir rapor verisi içermiyor.");
      }

      setReport(payload.data as AppraisalReport);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Değerleme raporu oluşturulamadı.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8">
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLE }} />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Akıllı Değerleme
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Uzun formatlı editorial rapor, gerçek uydu haritası ve tutarlı emsal
          analizi ile profesyonel değerleme.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-10">
        {/* Sol Kolon — Form */}
        <Card className="h-fit border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-5">
            <CardTitle className="text-base font-medium">Mülk Bilgileri</CardTitle>
            <CardDescription>Değerleme girdileri</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="il">İl</Label>
              <Input
                id="il"
                placeholder="Kocaeli"
                value={form.il}
                onChange={(e) => updateField("il", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ilce">İlçe</Label>
              <Input
                id="ilce"
                placeholder="Gölcük"
                value={form.ilce}
                onChange={(e) => updateField("ilce", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mahalle">Mahalle</Label>
              <Input
                id="mahalle"
                placeholder="Merkez"
                value={form.mahalle}
                onChange={(e) => updateField("mahalle", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ada">Ada</Label>
                <Input
                  id="ada"
                  placeholder="124"
                  value={form.ada}
                  onChange={(e) => updateField("ada", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parsel">Parsel</Label>
                <Input
                  id="parsel"
                  placeholder="8"
                  value={form.parsel}
                  onChange={(e) => updateField("parsel", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-neutral-300 bg-white shadow-sm"
              onClick={() => void handleTkgmQuery()}
              disabled={
                isTkgmLoading ||
                !form.il.trim() ||
                !form.ilce.trim() ||
                !form.mahalle.trim() ||
                !form.ada.trim() ||
                !form.parsel.trim()
              }
            >
              {isTkgmLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  TKGM Sorgulanıyor…
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  TKGM&apos;den Sorgula
                </>
              )}
            </Button>

            {tkgmNotice && (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  tkgmKoordinatlar
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-900",
                )}
              >
                {tkgmNotice}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="brut-metrekare">Brüt Alan (m²)</Label>
                <Input
                  id="brut-metrekare"
                  placeholder="145"
                  value={form.brutMetrekare}
                  onChange={(e) => updateField("brutMetrekare", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="net-metrekare">Net Alan (m²)</Label>
                <Input
                  id="net-metrekare"
                  placeholder="128"
                  value={form.netMetrekare}
                  onChange={(e) => updateField("netMetrekare", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ozellikler">Özellikler</Label>
              <textarea
                id="ozellikler"
                placeholder="3+1, 12 yaşında, güneybatı cephe, otoparklı…"
                value={form.ozellikler}
                onChange={(e) => updateField("ozellikler", e.target.value)}
                rows={3}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="button"
              className="h-11 w-full"
              onClick={() => void handleGenerate()}
              disabled={isGenerating || !canGenerate}
            >
              {isGenerating ? "Analiz ediliyor…" : "Değerleme Raporu Oluştur"}
            </Button>
            {!canGenerate && (
              <p className="text-center text-xs text-muted-foreground">
                Brüt ve net alan doldurulmadan rapor oluşturulamaz. TKGM sorgusu
                veya manuel giriş yapın.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sağ Kolon — Bento Rapor Masası */}
        <div className="flex min-h-[85vh] flex-col gap-4">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleSaveArchive()}
              disabled={!report || isSavingArchive}
              className="border-neutral-300 bg-white shadow-sm"
            >
              {isSavingArchive ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Kaydediliyor…
                </>
              ) : (
                <>
                  <Database className="size-4" />
                  Raporu Arşive Kaydet
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePrint()}
              disabled={!report}
            >
              <Download className="size-4" />
              PDF İndir
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-neutral-100/80 p-6 ring-1 ring-neutral-200/60 print:m-0 print:bg-white print:p-0 print:ring-0">
            <div ref={printRef} className="print-container mx-auto w-full max-w-4xl">
              {report ? (
                <>
                  <ReportCoverPage form={form} />
                  <BentoReport
                    report={report}
                    address={addressLabel}
                    form={form}
                    mapCenter={mapCenter}
                  />
                </>
              ) : (
                <div className="mx-auto flex min-h-[480px] max-w-4xl items-center justify-center rounded-2xl bg-white p-12 shadow-lg ring-1 ring-neutral-100">
                  <div className="max-w-sm space-y-3 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-400">
                      Bento Rapor Masası
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-500">
                      {isGenerating
                        ? "Yapay zeka tutarlı fiyat modeli, emsal verileri ve uzun format analiz metinlerini hazırlıyor…"
                        : "Formu doldurup rapor oluşturduğunuzda özet pano, uydu haritası ve detaylı editorial bölümler burada görüntülenecek."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
