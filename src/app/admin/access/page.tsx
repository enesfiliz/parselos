import { AdminAccessForm } from "@/components/admin/AdminAccessForm";

export const dynamic = "force-dynamic";

export default function AdminAccessPage() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <AdminAccessForm />
    </div>
  );
}
