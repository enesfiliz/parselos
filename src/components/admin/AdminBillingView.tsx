"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Wallet,
} from "lucide-react";

import { AdminBillingRowMenu } from "@/components/admin/AdminBillingRowMenu";
import {
  ADMIN_ACTIVE_BILLING_SUBSCRIBERS,
  ADMIN_BILLING_METRICS,
  type AdminBillingSubscriber,
} from "@/lib/admin/mock-billing";
import { cn } from "@/lib/utils";

function planBadgeClass(plan: AdminBillingSubscriber["plan"]) {
  switch (plan) {
    case "Premium":
      return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
    case "Pro":
      return "border-blue-400/30 bg-blue-500/10 text-blue-200";
    default:
      return "border-zinc-600/40 bg-border/40 text-muted-foreground";
  }
}

function statusMeta(status: AdminBillingSubscriber["status"]) {
  switch (status) {
    case "pending":
      return { label: "Bekliyor", dot: "bg-amber-400", text: "text-amber-300" };
    case "cancelled":
      return { label: "İptal", dot: "bg-red-400", text: "text-red-300" };
    default:
      return { label: "Aktif", dot: "bg-emerald-400", text: "text-emerald-300" };
  }
}

export function AdminBillingView() {
  const [query, setQuery] = useState("");
  const [subscribers, setSubscribers] = useState(ADMIN_ACTIVE_BILLING_SUBSCRIBERS);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return subscribers;
    return subscribers.filter(
      (row) =>
        row.name.toLowerCase().includes(normalized) ||
        row.email.toLowerCase().includes(normalized),
    );
  }, [query, subscribers]);

  function handleCancelPayment(subscriber: AdminBillingSubscriber) {
    setSubscribers((current) =>
      current.map((row) =>
        row.id === subscriber.id
          ? { ...row, status: "cancelled", nextPaymentDate: "—" }
          : row,
      ),
    );
  }

  function handleGrantFreeAccess(subscriber: AdminBillingSubscriber) {
    setSubscribers((current) =>
      current.map((row) =>
        row.id === subscriber.id
          ? {
              ...row,
              plan: "Free",
              status: "active",
              nextPaymentDate: "Kurucu erişimi",
              mrrTL: 0,
            }
          : row,
      ),
    );
  }

  const metrics = ADMIN_BILLING_METRICS;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
          God Mode · Finans
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Fatura & Gelir Kontrol Merkezi
        </h1>
        <p className="text-sm text-foreground0">
          Iyzico abonelikleri, MRR ve kurucu müdahale paneli
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-parsel-elevated xl:col-span-2">
          <div className="flex flex-col gap-4 border-b border-border/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Aktif Aboneler</h2>
              <p className="mt-0.5 text-xs text-foreground0">
                {filtered.length} kayıt listeleniyor
              </p>
            </div>
            <label className="relative block w-full sm:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground0"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ofis veya e-posta ara..."
                className="w-full rounded-lg border border-border bg-white/[0.02] py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-foreground0 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              />
            </label>
          </div>

          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-[10px] uppercase tracking-[0.16em] text-foreground0">
                  <th className="px-5 py-4 font-medium md:px-6">İsim</th>
                  <th className="px-4 py-4 font-medium">Başlangıç</th>
                  <th className="px-4 py-4 font-medium">Sonraki Ödeme</th>
                  <th className="px-4 py-4 font-medium">Durum</th>
                  <th className="px-5 py-4 font-medium md:px-6" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const status = statusMeta(row.status);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.03] transition-colors hover:bg-foreground/[0.02]"
                    >
                      <td className="px-5 py-4 md:px-6">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-foreground">
                              {row.name}
                            </p>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                planBadgeClass(row.plan),
                              )}
                            >
                              {row.plan}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-foreground0">
                            {row.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/90">
                        {row.startDate}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/90">
                        {row.nextPaymentDate}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 text-xs font-medium",
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
                      <td className="px-5 py-4 md:px-6">
                        <AdminBillingRowMenu
                          subscriber={row}
                          onCancelPayment={handleCancelPayment}
                          onGrantFreeAccess={handleGrantFreeAccess}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-foreground0">
              Aramaya uygun abone bulunamadı.
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="size-4 text-emerald-400" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold text-foreground">
                Finansal Metrikler
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground0">
                  Bu Ayın Cirosu
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {metrics.monthlyRevenue}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="size-3" strokeWidth={2} />
                  {metrics.monthlyRevenueChange}
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground0">
                  İptal Oranı
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {metrics.cancellationRate}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="size-3" strokeWidth={2} />
                  {metrics.cancellationChange}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-4">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-300/80">
                  <AlertCircle className="size-3" strokeWidth={1.75} />
                  Bekleyen Ödemeler
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {metrics.pendingPayments}
                </p>
                <p className="mt-1 text-xs text-foreground0">
                  {metrics.pendingCount} abonelik tahsilat bekliyor
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-parsel-elevated p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground0">
              Iyzico Senkron
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Webhook ve callback entegrasyonu hazır. Canlı anahtarlar tanımlandığında
              bu panel gerçek tenant verisine bağlanacak.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
