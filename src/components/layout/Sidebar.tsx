"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Calculator,
  FileText,
  Landmark,
  LayoutDashboard,
  LineChart,
  Mic,
  PenTool,
  Radar,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Hesaplayıcılar", href: "/hesaplayicilar", icon: Calculator },
  { label: "Finans & Kredi", href: "/finans", icon: Landmark },
  { label: "Sesli CRM", href: "/sesli-crm", icon: Mic },
  { label: "Tapu AI", href: "/tapu-ai", icon: FileText },
  { label: "İmar Radarı", href: "/imar-radari", icon: Radar },
  { label: "İlan Asistanı", href: "/ilan-asistani", icon: PenTool },
  { label: "Ekspertiz", href: "/ekspertiz", icon: LineChart },
  { label: "Ekspertiz Arşivi", href: "/arsiv", icon: Archive },
  { label: "Müşteriler", href: "/musteriler", icon: Users },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-8 pt-10 pb-12">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-4" strokeWidth={1.75} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Parselos
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={[
                "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              ].join(" ")}
            >
              <Icon
                className={[
                  "size-[18px] shrink-0 transition-colors",
                  active
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                ].join(" ")}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 py-10">
        <p className="text-xs leading-relaxed text-sidebar-foreground/40">
          Gayrimenkul operasyonlarınız için tek platform.
        </p>
      </div>
    </aside>
  );
}
