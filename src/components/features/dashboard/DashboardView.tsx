import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  FileStack,
  LineChart,
  Minus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { panelCardInteractive } from "@/lib/glass-panel";
import { cn } from "@/lib/utils";

export type DashboardMetric = {
  value: number;
  current: number;
  previous: number;
};

export type DashboardActivity = {
  id: string;
  type: "musteri" | "ekspertiz" | "ilan";
  title: string;
  detail: string;
  href: string;
  olusturulmaTarihi: string;
};

export type DashboardUser = {
  firstName: string | null;
  fullName: string | null;
};

type DashboardViewProps = {
  user: DashboardUser;
  metrics: {
    toplamMusteri: DashboardMetric;
    aktifEkspertiz: DashboardMetric;
    bekleyenRaporlar: DashboardMetric;
    aylikGoruntulenme: DashboardMetric;
  };
  sonAktiviteler: DashboardActivity[];
};

const ACTIVITY_LABELS: Record<DashboardActivity["type"], string> = {
  musteri: "Müşteri",
  ekspertiz: "Ekspertiz",
  ilan: "İlan",
};

const METRIC_CARDS: {
  key: keyof DashboardViewProps["metrics"];
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "toplamMusteri", label: "Toplam Müşteri", icon: Users },
  { key: "aktifEkspertiz", label: "Aktif Ekspertiz", icon: LineChart },
  { key: "bekleyenRaporlar", label: "Bekleyen Raporlar", icon: FileStack },
  { key: "aylikGoruntulenme", label: "Aylık Görüntülenme", icon: Eye },
];

const PANEL_CARD = panelCardInteractive;

function formatToday() {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getGreetingName(firstName?: string | null, fullName?: string | null) {
  if (firstName?.trim()) return firstName.trim();
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0];
  return null;
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) {
      return { label: "Değişim yok", positive: true, flat: true };
    }
    return { label: "Bu ay yeni", positive: true, flat: false };
  }

  const pct = Math.round(((current - previous) / previous) * 100);

  if (pct === 0) {
    return { label: "Değişim yok", positive: true, flat: true };
  }

  return {
    label: `${pct > 0 ? "+" : ""}${pct}% geçen aya göre`,
    positive: pct > 0,
    flat: false,
  };
}

function TrendBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const trend = calcTrend(current, previous);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        trend.flat
          ? "bg-parsel-border/40 text-muted-foreground"
          : trend.positive
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400",
      )}
    >
      {trend.flat ? (
        <Minus className="size-3" strokeWidth={2} />
      ) : trend.positive ? (
        <ArrowUpRight className="size-3" strokeWidth={2} />
      ) : (
        <ArrowDownRight className="size-3" strokeWidth={2} />
      )}
      {trend.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  current,
  previous,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  current: number;
  previous: number;
}) {
  return (
    <article className={cn(PANEL_CARD, "p-6")}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon
          className="size-[18px] shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
      </div>
      <p className="mt-4 text-3xl font-medium tabular-nums tracking-tight text-foreground">
        {value.toLocaleString("tr-TR")}
      </p>
      <div className="mt-4">
        <TrendBadge current={current} previous={previous} />
      </div>
    </article>
  );
}

export function DashboardView({
  user,
  metrics,
  sonAktiviteler,
}: DashboardViewProps) {
  const greetingName = getGreetingName(user.firstName, user.fullName);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header>
        <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground">
          {greetingName ? `Hoş geldin, ${greetingName}` : "Hoş geldin"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{formatToday()}</p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {METRIC_CARDS.map(({ key, label, icon }) => {
          const metric = metrics[key];
          return (
            <StatCard
              key={key}
              label={label}
              value={metric.value}
              icon={icon}
              current={metric.current}
              previous={metric.previous}
            />
          );
        })}
      </section>

      <section className={cn(PANEL_CARD, "overflow-hidden")}>
        <div className="border-b border-border/80 px-6 py-5 md:px-8 md:py-6">
          <h2 className="text-base font-semibold text-foreground">
            Son Aktiviteler
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Müşteri, ekspertiz ve ilan kayıtlarından güncel hareketler
          </p>
        </div>

        {sonAktiviteler.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground md:px-8">
            Henüz aktivite yok. İlk müşterinizi veya ekspertiz raporunuzu
            ekleyerek başlayın.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/80">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:px-8">
                    Tür
                  </th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:px-8">
                    Başlık
                  </th>
                  <th className="hidden px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell md:px-8">
                    Detay
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground md:px-8">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody>
                {sonAktiviteler.map((activity) => (
                  <tr
                    key={`${activity.type}-${activity.id}`}
                    className="border-b border-border transition-colors last:border-0 hover:bg-card/50"
                  >
                    <td className="px-6 py-5 md:px-8">
                      <span className="inline-flex rounded-md border border-border bg-border/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {ACTIVITY_LABELS[activity.type]}
                      </span>
                    </td>
                    <td className="px-6 py-5 md:px-8">
                      <Link
                        href={activity.href}
                        className="font-medium text-foreground transition-colors hover:text-parsel-primaryHover"
                      >
                        {activity.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                        {activity.detail}
                      </p>
                    </td>
                    <td className="hidden px-6 py-5 text-muted-foreground sm:table-cell md:px-8">
                      {activity.detail}
                    </td>
                    <td className="px-6 py-5 text-right text-xs tabular-nums text-muted-foreground md:px-8">
                      <time dateTime={activity.olusturulmaTarihi}>
                        {formatDateTime(activity.olusturulmaTarihi)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
