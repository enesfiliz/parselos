import { redirect } from "next/navigation";
import { Suspense } from "react";

import { OfficeOperationsView } from "@/components/features/account/OfficeOperationsView";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { canManageTeam, canViewBrokerMetrics } from "@/lib/account/permissions";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

export const dynamic = "force-dynamic";

export default async function OfficeOperationsPage() {
  const agent = await requireCurrentAgent();
  const { tenant } = await getOrCreateTenantForAgent(agent.id);

  if (!canViewBrokerMetrics(agent, tenant)) {
    redirect("/account?tab=abonelik");
  }

  return (
    <Suspense fallback={null}>
      <OfficeOperationsView
        canManageAssignments={canManageTeam(agent, tenant)}
        tenantName={tenant.name}
      />
    </Suspense>
  );
}
