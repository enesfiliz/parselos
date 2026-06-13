import { AdminCommandCenterView } from "@/components/admin/AdminCommandCenterView";
import {
  fetchLiveAdminMetrics,
  fetchLiveRecentAgents,
} from "@/lib/admin/live-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [metrics, recent] = await Promise.all([
    fetchLiveAdminMetrics(),
    fetchLiveRecentAgents(),
  ]);

  return <AdminCommandCenterView metrics={metrics} recent={recent} />;
}
