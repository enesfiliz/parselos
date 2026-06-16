import { AdminAccessForm } from "@/components/admin/AdminAccessForm";
import {
  getConfiguredAdminPassword,
  logAdminPasswordMisconfiguration,
} from "@/lib/admin/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminAccessPage() {
  const passwordConfigured = Boolean(getConfiguredAdminPassword());

  if (!passwordConfigured) {
    logAdminPasswordMisconfiguration("GET /admin/access");
  }

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 px-4">
      {!passwordConfigured ? (
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100"
        >
          <p className="font-medium">Super admin parolası yapılandırılmamış</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            <code className="rounded bg-black/5 px-1 py-0.5 text-xs dark:bg-white/10">
              ADMIN_ACCESS_PASSWORD
            </code>{" "}
            ortam değişkenini Vercel veya{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-xs dark:bg-white/10">
              .env.local
            </code>{" "}
            içine tanımlayın. İsteğe bağlı imza için{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-xs dark:bg-white/10">
              ADMIN_SESSION_SECRET
            </code>{" "}
            kullanılabilir.
          </p>
        </div>
      ) : null}
      <AdminAccessForm passwordConfigured={passwordConfigured} />
    </div>
  );
}
