export const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export const PANEL_CARD =
  "parsel-surface rounded-2xl border border-border/60 bg-parsel-panel shadow-parsel-sm";

/** Brand tokens from ui-style-guide — chart SVG requires concrete values */
export const CHART_COLORS = {
  primary: "#4a6b2f",
  gold: "#8a6428",
  grid: "#d8d8d4",
  muted: "#52525b",
} as const;

export type ChartPeriod = "12" | "24" | "all";

export const CHART_PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "12", label: "12 ay" },
  { value: "24", label: "24 ay" },
  { value: "all", label: "Tüm vade" },
];

export function sliceChartPeriod<T>(rows: T[], period: ChartPeriod) {
  if (period === "all") return rows;
  return rows.slice(0, Number(period));
}
