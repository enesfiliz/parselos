"use client";

import {
  Activity,
  Database,
  FileStack,
  LineChart,
  PenLine,
  ScanText,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardRecentClient = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  olusturulmaTarihi: string;
};

const HAFTALIK_AKTIVITE = [
  { gun: "Pzt", islem: 6 },
  { gun: "Sal", islem: 9 },
  { gun: "Çar", islem: 7 },
  { gun: "Per", islem: 11 },
  { gun: "Cum", islem: 14 },
  { gun: "Cmt", islem: 5 },
  { gun: "Paz", islem: 4 },
];

const HIZLI_ISLEMLER = [
  {
    label: "Yeni Ekspertiz",
    href: "/ekspertiz",
    icon: LineChart,
  },
  {
    label: "Sözleşme/Tapu Oku",
    href: "/tapu-ai",
    icon: ScanText,
  },
  {
    label: "İlan Metni Yaz",
    href: "/ilan-asistani",
    icon: PenLine,
  },
  {
    label: "Müşteri Ekle",
    href: "/musteriler",
    icon: UserPlus,
  },
] as const;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <Card className="border-border/60 shadow-sm ring-1 ring-neutral-100/80">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-neutral-50 text-neutral-600">
          <Icon className="size-[18px]" strokeWidth={1.5} />
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardView({
  toplamMusteri,
  toplamRapor,
  sonMusteriler,
}: {
  toplamMusteri: number;
  toplamRapor: number;
  sonMusteriler: DashboardRecentClient[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="size-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
            Komuta Merkezi
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Operasyon özeti, hızlı erişim ve son kayıtlar tek ekranda.
        </p>
      </header>

      {/* Üst satır — özet metrikler */}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Toplam Müşteri"
          value={toplamMusteri}
          icon={Users}
        />
        <MetricCard
          label="Üretilen Rapor"
          value={toplamRapor}
          icon={FileStack}
        />
        <Card className="border-border/60 shadow-sm ring-1 ring-neutral-100/80">
          <CardContent className="flex items-start justify-between gap-4 p-6">
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Sistem Durumu
              </p>
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)]" />
                </span>
                <p className="text-sm font-medium text-neutral-800">
                  Tüm Servisler Aktif
                </p>
              </div>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-neutral-50 text-neutral-600">
              <Database className="size-[18px]" strokeWidth={1.5} />
            </span>
          </CardContent>
        </Card>
      </section>

      {/* Orta — hızlı işlemler */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HIZLI_ISLEMLER.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto min-h-[4.5rem] flex-col gap-2 rounded-xl border-border/60 px-4 py-5 shadow-sm hover:bg-neutral-50/80",
            )}
          >
            <Icon className="size-[18px] text-neutral-600" strokeWidth={1.5} />
            <span className="text-center text-sm font-medium">{label}</span>
          </Link>
        ))}
      </section>

      {/* Alt satır — aktivite & son kayıtlar */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-neutral-100/80">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="size-4 text-neutral-500" strokeWidth={1.5} />
              Son Eklenen Müşteriler
            </CardTitle>
            <CardDescription>Veritabanındaki en güncel 5 kayıt</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sonMusteriler.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground">
                Henüz müşteri kaydı yok. Hızlı işlemlerden ekleyebilirsiniz.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {sonMusteriler.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-neutral-50/60"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {client.adSoyad}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {client.telefon || client.email || "İletişim bilgisi yok"}
                      </p>
                    </div>
                    <time
                      dateTime={client.olusturulmaTarihi}
                      className="shrink-0 text-xs tabular-nums text-muted-foreground"
                    >
                      {formatDate(client.olusturulmaTarihi)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            {sonMusteriler.length > 0 && (
              <div className="border-t border-border/40 px-6 py-3">
                <Link
                  href="/musteriler"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 px-2 text-muted-foreground",
                  )}
                >
                  Tüm müşteriler →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-1 ring-neutral-100/80">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Activity className="size-4 text-neutral-500" strokeWidth={1.5} />
              Haftalık Aktivite
            </CardTitle>
            <CardDescription>Platform işlem yoğunluğu (örnek veri)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-56 min-h-[14rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height={224}>
                <BarChart data={HAFTALIK_AKTIVITE} barSize={28}>
                  <CartesianGrid
                    stroke="#e5e5e5"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="gun"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a3a3a3", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    tick={{ fill: "#a3a3a3", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    formatter={(value) => [`${value ?? 0} işlem`, "Aktivite"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e5e5e5",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="islem"
                    fill="#171717"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
