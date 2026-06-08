import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
