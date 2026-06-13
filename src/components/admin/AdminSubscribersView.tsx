"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";

import { AdminSubscriberRowMenu } from "@/components/admin/AdminSubscriberRowMenu";
import { Button } from "@/components/ui/button";
import type { LiveAdminSubscriber } from "@/lib/admin/live-data";
import { cn } from "@/lib/utils";

type SubscriberPlanFilter = "all" | "Pro" | "Premium" | "Free" | "suspended";

const PLAN_FILTERS: Array<{ id: SubscriberPlanFilter; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "Free", label: "Ücretsiz" },
  { id: "Pro", label: "Pro" },
  { id: "Premium", label: "Premium" },
  { id: "suspended", label: "Askıya Alınanlar" },
];

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function planBadgeClass(plan: LiveAdminSubscriber["plan"]) {
  switch (plan) {
    case "Premium":
      return "border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 to-[#b38c56]/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.12)]";
    case "Pro":
      return "border-blue-400/30 bg-blue-500/10 text-blue-200";
    default:
      return "border-zinc-600/40 bg-border/40 text-muted-foreground";
  }
}

function statusMeta(status: LiveAdminSubscriber["status"]) {
  switch (status) {
    case "active":
      return { label: "Aktif", dot: "bg-emerald-400", text: "text-emerald-300" };
    case "blocked":
      return { label: "Engelli", dot: "bg-red-400", text: "text-red-300" };
    case "suspended":
      return { label: "Askıda", dot: "bg-amber-400", text: "text-amber-300" };
    default:
      return { label: "Pasif", dot: "bg-zinc-500", text: "text-muted-foreground" };
  }
}

function exportSubscribersCsv(rows: LiveAdminSubscriber[]) {
  const header = [
    "Ofis",
    "E-posta",
    "Plan",
    "AI Token",
    "Deal Sayısı",
    "Durum",
    "Son Giriş",
  ];

  const body = rows.map((row) =>
    [
      row.name,
      row.email,
      row.plan,
      row.aiTokensUsed,
      row.dealCount,
      row.status,
      row.lastLoginLabel,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csv = [header.join(","), ...body].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `parselos-aboneler-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminSubscribersView({
  initialRows,
}: {
  initialRows: LiveAdminSubscriber[];
}) {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<SubscriberPlanFilter>("all");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialRows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery);

      const matchesPlan =
        planFilter === "all" ||
        (planFilter === "suspended"
          ? row.status === "suspended"
          : row.plan === planFilter);

      return matchesQuery && matchesPlan;
    });
  }, [initialRows, planFilter, query]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
          God Mode · Lisanslar
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Aboneler ve Lisans Yönetimi
        </h1>
        <p className="text-sm text-muted-foreground">
          {filteredRows.length} kayıt listeleniyor
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ofis veya e-posta ara..."
              className="w-full rounded-lg border border-border bg-white/[0.02] py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </label>

          <select
            value={planFilter}
            onChange={(event) =>
              setPlanFilter(event.target.value as SubscriberPlanFilter)
            }
            className="h-10 min-w-[180px] rounded-lg border border-border bg-white/[0.02] px-3 text-sm text-foreground focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            aria-label="Paket filtresi"
          >
            {PLAN_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id} className="bg-parsel-elevated">
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-emerald-500/20 bg-emerald-500/5 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
          onClick={() => {
            exportSubscribersCsv(filteredRows);
            toast.success("CSV dışa aktarıldı", {
              description: `${filteredRows.length} abone indirildi.`,
            });
          }}
        >
          <Download className="size-4" strokeWidth={1.75} />
          CSV Olarak Dışa Aktar
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-parsel-elevated">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-4 font-medium md:px-6">Müşteri / Ofis</th>
                <th className="px-4 py-4 font-medium">Plan & Lisans</th>
                <th className="px-4 py-4 font-medium">Tüketim / Metrik</th>
                <th className="px-4 py-4 font-medium">Durum</th>
                <th className="px-4 py-4 font-medium">Son Giriş</th>
                <th className="px-5 py-4 font-medium md:px-6" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const status = statusMeta(row.status);

                return (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-200">
                          {initialsFromName(row.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {row.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.email}
                            {row.tenantName ? ` · ${row.tenantName}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                          planBadgeClass(row.plan),
                        )}
                      >
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">
                        {row.dealCount} aktif fırsat
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.city ?? "Şehir belirtilmemiş"}
                        {row.memberCount > 0 ? ` · ${row.memberCount} üye` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 text-sm",
                          status.text,
                        )}
                      >
                        <span
                          className={cn("size-2 rounded-full", status.dot)}
                          aria-hidden
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {row.lastLoginLabel}
                    </td>
                    <td className="px-5 py-4 md:px-6">
                      <AdminSubscriberRowMenu subscriber={row} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Filtrelere uygun abone bulunamadı.
          </div>
        ) : null}
      </div>
    </div>
  );
}
