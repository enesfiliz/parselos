"use client";

import { useState } from "react";

import { ParselCopilot } from "@/components/ParselCopilot";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090b] text-zinc-100 antialiased">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <ParselCopilot />
    </div>
  );
}
