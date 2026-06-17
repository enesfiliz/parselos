"use client";

import Link from "next/link";
import { ArrowRightLeft, BarChart3, Kanban, Users } from "lucide-react";

import { BrokerOperationsPanel } from "@/components/features/account/BrokerOperationsPanel";

type OfficeOperationsViewProps = {
  canManageAssignments: boolean;
  tenantName: string;
};

export function OfficeOperationsView({
  canManageAssignments,
  tenantName,
}: OfficeOperationsViewProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          Broker Ofis
        </p>
        <h1 className="font-outfit mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ofis Operasyon Merkezi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {tenantName} için danışman performansı, pipeline dağılımı, atanmamış
          kayıtlar ve son atama hareketlerini tek ekranda izleyin.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLinkCard
          href="/deals"
          icon={Kanban}
          title="Fırsat pipeline"
          description="Kanban üzerinden aşama yönetimi"
        />
        <QuickLinkCard
          href="/customers"
          icon={Users}
          title="Müşteri listesi"
          description="Ofis geneli müşteri kayıtları"
        />
        <QuickLinkCard
          href="/account?tab=ekip"
          icon={ArrowRightLeft}
          title="Ekip yönetimi"
          description="Davetler ve üye rolleri"
        />
      </section>

      <BrokerOperationsPanel canManageAssignments={canManageAssignments} expanded />
    </div>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof BarChart3;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/5"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
