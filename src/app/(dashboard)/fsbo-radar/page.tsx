import { FsboRadarView } from "@/components/features/fsbo/FsboRadarView";
import { agentOwnershipFilter, requireCurrentAgent } from "@/lib/auth/agent";
import { DEFAULT_FSBO_REGIONS } from "@/lib/fsbo/fsbo-sync-targets";
import { MOCK_FSBO_PREVIEW_LEADS } from "@/lib/fsbo/mock-fsbo-preview-leads";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";
import type { FsboLeadData, FsboWatchRegionData } from "@/lib/types/fsbo-lead";

export const dynamic = "force-dynamic";

const fallbackRegions: FsboWatchRegionData[] = DEFAULT_FSBO_REGIONS.map(
  (label, index) => ({
    id: `region-default-${index}`,
    label,
  }),
);

export default async function FsboRadarPage() {
  let initialRegions = fallbackRegions;
  let initialLeads: FsboLeadData[] = MOCK_FSBO_PREVIEW_LEADS;
  let dbLeadCount = 0;
  let useMock = true;
  let fetchError: string | null = null;

  try {
    const agent = await requireCurrentAgent();

    const [regions, leads] = await Promise.all([
      prisma.fsboWatchRegion.findMany({ orderBy: { label: "asc" } }),
      prisma.fsboLead.findMany({
        where: {
          isRead: false,
          isDiscarded: false,
          ...agentOwnershipFilter(agent.id),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    initialRegions =
      regions.length > 0
        ? regions.map((region) => ({
            id: region.id,
            label: region.label,
          }))
        : fallbackRegions;

    const serializedLeads = leads.map(serializeFsboLead);
    dbLeadCount = serializedLeads.length;
    useMock = dbLeadCount === 0;
    initialLeads = useMock ? MOCK_FSBO_PREVIEW_LEADS : serializedLeads;
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "Veritabanı bağlantı hatası";
    console.error("[fsbo-radar/page] Prisma hatası:", error);
  }

  return (
    <FsboRadarView
      initialLeads={initialLeads}
      initialRegions={initialRegions}
      useMock={useMock}
      dbLeadCount={dbLeadCount}
      fetchError={fetchError}
    />
  );
}
