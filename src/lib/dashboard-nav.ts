import {
  Archive,
  Briefcase,
  Calculator,
  CalendarDays,
  FileText,
  Kanban,
  LayoutDashboard,
  LineChart,
  PenTool,
  ScanLine,
  Radar,
  Radio,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Komuta",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operasyon",
    items: [
      { label: "Fırsatlar", href: "/deals", icon: Kanban },
      { label: "Müşteriler", href: "/customers", icon: Users },
      { label: "Ajanda", href: "/calendar", icon: CalendarDays },
      { label: "Portföylerim", href: "/portfolios", icon: Briefcase },
      { label: "Hesaplayıcılar", href: "/calculators", icon: Calculator },
    ],
  },
  {
    label: "İstihbarat",
    items: [
      { label: "FSBO Radarı", href: "/fsbo-radar", icon: ScanLine },
      { label: "İmar Radarı", href: "/imar-radari", icon: Radar },
      { label: "İstihbarat Haritası", href: "/radar", icon: Radio },
    ],
  },
  {
    label: "Araçlar",
    items: [
      { label: "Tapu AI", href: "/tapu-ai", icon: FileText },
      { label: "İlan Asistanı", href: "/ilan-asistani", icon: PenTool },
      { label: "Ekspertiz", href: "/ekspertiz", icon: LineChart },
      { label: "Ekspertiz Arşivi", href: "/arsiv", icon: Archive },
    ],
  },
];

export const dashboardNavItems: DashboardNavItem[] = dashboardNavGroups.flatMap(
  (group) => group.items,
);

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const extraPageTitles: Array<{ prefix: string; title: string }> = [
  { prefix: "/account", title: "Hesap & Abonelik" },
  { prefix: "/billing", title: "Abonelik" },
];

export function getDashboardPageTitle(pathname: string) {
  const extra = extraPageTitles.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
  );
  if (extra) return extra.title;

  const match = dashboardNavItems.find((item) => isNavItemActive(pathname, item.href));
  return match?.label ?? "Panel";
}
