import { NextResponse } from "next/server";

import { getBrokerOfficeMetrics } from "@/lib/account/broker-metrics";
import { canViewBrokerMetrics } from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

export async function GET() {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    if (!canViewBrokerMetrics(agent, tenant)) {
      return NextResponse.json(
        { error: "Ofis metriklerine erişim yetkiniz yok." },
        { status: 403 },
      );
    }

    const metrics = await getBrokerOfficeMetrics(tenant.id);
    return NextResponse.json({ tenant: { id: tenant.id, name: tenant.name }, metrics });
  } catch (error) {
    console.error("[GET /api/account/broker-metrics]", error);
    return NextResponse.json({ error: "Metrikler alınamadı." }, { status: 500 });
  }
}
