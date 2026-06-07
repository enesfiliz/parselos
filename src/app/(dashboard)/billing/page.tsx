import { BillingView } from "@/components/features/billing/BillingView";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const agent = await requireCurrentAgent();
  const { tenant } = await getOrCreateTenantForAgent(agent.id);

  return (
    <BillingView
      currentPlan={tenant.planType}
      currentStatus={tenant.status}
    />
  );
}
