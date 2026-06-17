"use client";

import { OfficeAssignmentPanel } from "@/components/features/account/OfficeAssignmentPanel";
import { BrokerMetricsPanel } from "@/components/features/account/BrokerMetricsPanel";

export function BrokerOperationsPanel({
  canManageAssignments = true,
  expanded = false,
}: {
  canManageAssignments?: boolean;
  expanded?: boolean;
}) {
  return (
    <div className="space-y-6">
      {!expanded ? (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Ofis operasyonu
        </p>
        <h2 className="font-outfit mt-2 text-xl font-semibold text-foreground">
          Broker ofis izleme merkezi
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Aktif danışmanlar, pipeline dağılımı, atanmamış müşteri ve fırsatlar ile son
          atama hareketlerini tek ekranda takip edin.
        </p>
      </section>
      ) : null}

      <BrokerMetricsPanel />
      {canManageAssignments ? <OfficeAssignmentPanel /> : (
        <section className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Atama paneli</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Fırsat ve müşteri atamaları yalnızca ofis yöneticileri tarafından yapılabilir.
          </p>
        </section>
      )}
    </div>
  );
}
