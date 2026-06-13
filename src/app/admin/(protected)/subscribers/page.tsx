import { AdminSubscribersView } from "@/components/admin/AdminSubscribersView";
import { fetchLiveAdminSubscribers } from "@/lib/admin/live-data";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await fetchLiveAdminSubscribers();
  return <AdminSubscribersView initialRows={subscribers} />;
}
