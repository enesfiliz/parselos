import { DashboardShell } from "@/components/layout/DashboardShell";
import { ensureCurrentAgent } from "@/lib/auth/agent";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await ensureCurrentAgent();
  } catch (error) {
    console.error("[dashboard-layout] agent sync failed", error);
  }

  return <DashboardShell>{children}</DashboardShell>;
}
