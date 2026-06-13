import { AdminAiMetricsView } from "@/components/admin/AdminAiMetricsView";
import { fetchLiveAdminMetrics } from "@/lib/admin/live-data";

export const dynamic = "force-dynamic";

export default async function AdminAiMetricsPage() {
  const metrics = await fetchLiveAdminMetrics();
  return <AdminAiMetricsView metrics={metrics} />;
}
