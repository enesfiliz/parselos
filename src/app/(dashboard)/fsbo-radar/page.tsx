import { FsboRadarView } from "@/components/features/fsbo/FsboRadarView";
import { agentOwnershipFilter, requireCurrentAgent } from "@/lib/auth/agent";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

export const dynamic = "force-dynamic";

export default async function FsboRadarPage() {
  let initialLeads: FsboLeadData[] = [];
  let fetchError: string | null = null;

  try {
    const agent = await requireCurrentAgent();

    const leads = await prisma.fsboLead.findMany({
      where: {
        isDiscarded: false,
        promotedDealId: null,
        ...agentOwnershipFilter(agent.id),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    initialLeads = leads.map(serializeFsboLead);
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "Veritabanı bağlantı hatası";
    console.error("[fsbo-radar/page]", error);
  }

  return (
    <FsboRadarView initialLeads={initialLeads} fetchError={fetchError} />
  );
}
