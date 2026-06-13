import { AdminSystemView } from "@/components/admin/AdminSystemView";
import { fetchLiveAdminMetrics } from "@/lib/admin/live-data";

export const dynamic = "force-dynamic";

export default async function AdminSystemPage() {
  const metrics = await fetchLiveAdminMetrics();
  return <AdminSystemView metrics={metrics} />;
}
