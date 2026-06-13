import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/admin");
  }

  return (
    <div className="min-h-screen bg-parsel-admin text-foreground">{children}</div>
  );
}
