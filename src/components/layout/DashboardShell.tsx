"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const ParselCopilot = dynamic(
  () =>
    import("@/components/ParselCopilot").then((mod) => mod.ParselCopilot),
  { ssr: false },
);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-parsel-canvas text-foreground antialiased">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(84,114,54,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(84,114,54,0.12),transparent)]"
          aria-hidden
        />

        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>

      <ParselCopilot />
    </div>
  );
}
