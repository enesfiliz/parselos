import { Suspense } from "react";

import { AccountSettingsView } from "@/components/features/account/AccountSettingsView";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const agent = await requireCurrentAgent();
  const { tenant } = await getOrCreateTenantForAgent(agent.id);

  return (
    <Suspense fallback={null}>
      <AccountSettingsView
        initialData={{
          agent: {
            id: agent.id,
            email: agent.email,
            firstName: agent.firstName,
            lastName: agent.lastName,
            imageUrl: agent.imageUrl,
            roleType: agent.roleType,
            tenantMemberRole: agent.tenantMemberRole,
            tenantId: agent.tenantId,
            professionalTitle: agent.professionalTitle,
            phone: agent.phone,
            licenseNumber: agent.licenseNumber,
            licenseStatus: agent.licenseStatus,
            licenseRejectReason: agent.licenseRejectReason,
            city: agent.city,
          },
          tenant: {
            id: tenant.id,
            name: tenant.name,
            planType: tenant.planType,
            status: tenant.status,
            organizationType: tenant.organizationType,
            taxNumber: tenant.taxNumber,
            address: tenant.address,
            phone: tenant.phone,
            city: tenant.city,
            website: tenant.website,
          },
        }}
      />
    </Suspense>
  );
}
