"use client";

import {
  ArrowUpRight,
  Building2,
  FileText,
  Landmark,
  LayoutGrid,
  LineChart,
  Percent,
  Ruler,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
  calculateAmortisman,
  calculateHizmetBedeli,
  calculateKaksInsaat,
  calculateKiraArtisi,
  calculateMortgage,
  calculateNetM2,
  calculateTapuHarci,
  calculateTaksTaban,
} from "@/lib/calculations";
import {
  digitsOnly,
  formatMoneyInputFromDigits,
  formatPercent,
  formatTRY,
  formatTurkishInteger,
  parseTurkishMoney,
  parseTurkishPercent,
} from "@/lib/calculator-format";
import { cn } from "@/lib/utils";

const TOOL_CARD =
  "flex flex-col justify-between rounded-2xl border border-white/5 bg-[#151f23] p-4 shadow-sm transition-all hover:border-white/10 md:p-5";

const FIELD_LABEL = "mb-1.5 block text-xs font-medium text-white/60";

const FIELD_INPUT =
  "w-full rounded-lg border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white transition-all focus:border-[#b38c56] focus:ring-1 focus:ring-[#b38c56]";

function ToolCard({
  title,
  icon: Icon,
  children,
  result,
  resultLabel,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  result: string;
  resultLabel: string;
}) {
  return (
    <article className={TOOL_CARD}>
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/90">
          <Icon className="h-4 w-4 shrink-0 text-[#b38c56]" strokeWidth={1.75} />
          {title}
        </h2>
        <div className="space-y-3">{children}</div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#09090b] p-4">
        <span className="text-center text-2xl font-bold tracking-tight text-[#b38c56]">
          {result}
        </span>
        <span className="mt-1 text-center text-[11px] uppercase tracking-widest text-white/40 md:text-[10px]">
          {resultLabel}
        </span>
      </div>
    </article>
  );
}

function MoneyField({
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
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) =>
          onChange(formatMoneyInputFromDigits(digitsOnly(e.target.value)))
        }
        className={cn(FIELD_INPUT, "tabular-nums")}
      />
    </div>
  );
}

function DecimalField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d,]/g, ""))}
        className={cn(FIELD_INPUT, "tabular-nums")}
      />
      {hint ? (
        <p className="mt-1 text-[10px] text-white/30">{hint}</p>
      ) : null}
    </div>
  );
}

function NumberField({
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
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        className={cn(FIELD_INPUT, "tabular-nums")}
      />
    </div>
  );
}

function SegmentToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
            value === option.id
              ? "border-[#b38c56]/40 bg-[#b38c56]/10 text-[#d4b07a]"
              : "border-white/10 bg-[#09090b] text-white/50 hover:border-white/20",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CreditTool() {
  const [tutar, setTutar] = useState("3.000.000");
  const [vade, setVade] = useState("120");
  const [faiz, setFaiz] = useState("2,89");

  const result = useMemo(() => {
    const sonuc = calculateMortgage(
      parseTurkishMoney(tutar),
      Number(vade),
      parseTurkishPercent(faiz),
    );
    return sonuc ? formatTRY(sonuc.aylikTaksit) : "—";
  }, [tutar, vade, faiz]);

  return (
    <ToolCard
      title="Kredi Hesaplayıcı"
      icon={Landmark}
      result={result}
      resultLabel="Aylık Taksit"
    >
      <MoneyField
        id="kredi-tutar"
        label="Kredi Tutarı (TL)"
        value={tutar}
        onChange={setTutar}
      />
      <NumberField
        id="kredi-vade"
        label="Vade (Ay)"
        value={vade}
        onChange={setVade}
      />
      <DecimalField
        id="kredi-faiz"
        label="Aylık Faiz Oranı (%)"
        value={faiz}
        onChange={setFaiz}
      />
    </ToolCard>
  );
}

function TapuTool() {
  const [bedel, setBedel] = useState("5.000.000");

  const result = useMemo(() => {
    const tutar = parseTurkishMoney(bedel);
    if (tutar <= 0) return "—";
    const sonuc = calculateTapuHarci(tutar);
    return formatTRY(sonuc.toplam, 0);
  }, [bedel]);

  return (
    <ToolCard
      title="Tapu Harcı"
      icon={FileText}
      result={result}
      resultLabel="Toplam Harç · Alıcı %2 + Satıcı %2"
    >
      <MoneyField
        id="tapu-bedel"
        label="Satış Bedeli (TL)"
        value={bedel}
        onChange={setBedel}
      />
    </ToolCard>
  );
}

function CommissionTool() {
  const [bedel, setBedel] = useState("5.000.000");
  const [tip, setTip] = useState<"sale" | "rent">("sale");

  const { result, label } = useMemo(() => {
    const tutar = parseTurkishMoney(bedel);
    const sonuc = calculateHizmetBedeli(tutar, tip);
    if (!sonuc) return { result: "—", label: "Hizmet Bedeli" };

    if (tip === "rent") {
      return {
        result: formatTRY(sonuc.kiralikKomisyonu!.kdvDahil),
        label: "1 Kira + KDV",
      };
    }

    return {
      result: formatTRY(sonuc.toplamHizmetBedeli),
      label: "Alıcı + Satıcı · %2+%2 KDV",
    };
  }, [bedel, tip]);

  return (
    <ToolCard
      title="Komisyon"
      icon={Percent}
      result={result}
      resultLabel={label}
    >
      <SegmentToggle
        value={tip}
        options={[
          { id: "sale", label: "Satılık" },
          { id: "rent", label: "Kiralık" },
        ]}
        onChange={setTip}
      />
      <MoneyField
        id="komisyon-bedel"
        label={tip === "sale" ? "İşlem Bedeli (TL)" : "Aylık Kira (TL)"}
        value={bedel}
        onChange={setBedel}
      />
    </ToolCard>
  );
}

function RoiTool() {
  const [deger, setDeger] = useState("8.500.000");
  const [kira, setKira] = useState("28.500");

  const { result, label } = useMemo(() => {
    const sonuc = calculateAmortisman(
      parseTurkishMoney(deger),
      parseTurkishMoney(kira),
    );
    if (!sonuc) return { result: "—", label: "Geri Dönüş & Getiri" };
    return {
      result: `${sonuc.geriDonusYil} yıl ${sonuc.geriDonusAy} ay`,
      label: `Brüt Getiri ${formatPercent(sonuc.yillikBrutGetiri)}`,
    };
  }, [deger, kira]);

  return (
    <ToolCard
      title="ROI / Amortisman"
      icon={TrendingUp}
      result={result}
      resultLabel={label}
    >
      <MoneyField
        id="roi-deger"
        label="Mülk Değeri (TL)"
        value={deger}
        onChange={setDeger}
      />
      <MoneyField
        id="roi-kira"
        label="Tahmini Aylık Kira (TL)"
        value={kira}
        onChange={setKira}
      />
    </ToolCard>
  );
}

function TaksTool() {
  const [arsa, setArsa] = useState("1.250");
  const [taks, setTaks] = useState("0,30");

  const result = useMemo(() => {
    const m2 = parseTurkishMoney(arsa);
    const oran = parseTurkishPercent(taks);
    const taban = calculateTaksTaban(m2, oran);
    return taban ? `${formatTurkishInteger(taban)} m²` : "—";
  }, [arsa, taks]);

  return (
    <ToolCard
      title="TAKS"
      icon={LayoutGrid}
      result={result}
      resultLabel="Maks. Zemin Oturumu"
    >
      <MoneyField
        id="taks-arsa"
        label="Arsa Alanı (m²)"
        value={arsa}
        onChange={setArsa}
      />
      <DecimalField
        id="taks-oran"
        label="TAKS Oranı"
        value={taks}
        onChange={setTaks}
        hint="Örn: 0,30"
      />
    </ToolCard>
  );
}

function KaksTool() {
  const [arsa, setArsa] = useState("1.250");
  const [kaks, setKaks] = useState("1,50");

  const result = useMemo(() => {
    const m2 = parseTurkishMoney(arsa);
    const oran = parseTurkishPercent(kaks);
    const insaat = calculateKaksInsaat(m2, oran);
    return insaat ? `${formatTurkishInteger(insaat)} m²` : "—";
  }, [arsa, kaks]);

  return (
    <ToolCard
      title="KAKS / Emsal"
      icon={Building2}
      result={result}
      resultLabel="Toplam İnşaat Alanı"
    >
      <MoneyField
        id="kaks-arsa"
        label="Arsa Alanı (m²)"
        value={arsa}
        onChange={setArsa}
      />
      <DecimalField
        id="kaks-oran"
        label="Emsal (KAKS) Oranı"
        value={kaks}
        onChange={setKaks}
        hint="Örn: 1,50"
      />
    </ToolCard>
  );
}

function NetBrutTool() {
  const [brut, setBrut] = useState("145");
  const [kayip, setKayip] = useState("28");

  const result = useMemo(() => {
    const brutM2 = parseTurkishMoney(brut);
    const kayipPct = parseTurkishPercent(kayip);
    const net = calculateNetM2(brutM2, kayipPct);
    return net ? `${formatTurkishInteger(net)} m²` : "—";
  }, [brut, kayip]);

  return (
    <ToolCard
      title="Net / Brüt m²"
      icon={Ruler}
      result={result}
      resultLabel="Tahmini Net Alan"
    >
      <MoneyField
        id="net-brut"
        label="Brüt Alan (m²)"
        value={brut}
        onChange={setBrut}
      />
      <DecimalField
        id="net-kayip"
        label="Süpürülebilir Alan Kaybı (%)"
        value={kayip}
        onChange={setKayip}
        hint="Genelde %25 – %30"
      />
    </ToolCard>
  );
}

function RentIncreaseTool() {
  const [kira, setKira] = useState("18.500");
  const [artis, setArtis] = useState("65");

  const result = useMemo(() => {
    const mevcut = parseTurkishMoney(kira);
    const oran = parseTurkishPercent(artis);
    const yeni = calculateKiraArtisi(mevcut, oran);
    return yeni ? formatTRY(yeni) : "—";
  }, [kira, artis]);

  return (
    <ToolCard
      title="Kira Artışı"
      icon={ArrowUpRight}
      result={result}
      resultLabel="Yeni Kira Bedeli"
    >
      <MoneyField
        id="kira-mevcut"
        label="Mevcut Kira (TL)"
        value={kira}
        onChange={setKira}
      />
      <DecimalField
        id="kira-artis"
        label="Artış Oranı (%)"
        value={artis}
        onChange={setArtis}
        hint="TÜFE / yasal sınır"
      />
    </ToolCard>
  );
}

export function CalculatorsView() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <header className="mb-4 border-b border-white/5 pb-4 md:mb-6">
        <div className="mb-2 flex items-center gap-2 text-[#b38c56]">
          <LineChart className="h-4 w-4" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] md:text-[10px]">
            Finans & Operasyon
          </span>
        </div>
        <h1 className="font-outfit text-xl font-semibold tracking-tight text-white/90 md:text-2xl">
          Hesaplama Araçları
        </h1>
        <p className="mt-1 text-sm text-white/40">
          8 modül · anlık hesaplama · gayrimenkul profesyonelleri için
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <CreditTool />
        <TapuTool />
        <CommissionTool />
        <RoiTool />
        <TaksTool />
        <KaksTool />
        <NetBrutTool />
        <RentIncreaseTool />
      </div>
    </div>
  );
}
