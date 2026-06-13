import { AdminBillingView } from "@/components/admin/AdminBillingView";
import { fetchLiveAdminSubscribers } from "@/lib/admin/live-data";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const subscribers = await fetchLiveAdminSubscribers();
  return <AdminBillingView initialRows={subscribers} />;
}
