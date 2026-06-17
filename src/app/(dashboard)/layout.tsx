import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { canViewBrokerMetrics } from "@/lib/account/permissions";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const agent = await requireCurrentAgent();
  const { tenant } = await getOrCreateTenantForAgent(agent.id);
  const showBrokerOfficeNav = canViewBrokerMetrics(agent, tenant);

  return (
    <DashboardShell showBrokerOfficeNav={showBrokerOfficeNav}>
      {children}
    </DashboardShell>
  );
}
