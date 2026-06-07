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

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Hesaplama Araçları", href: "/calculators", icon: Calculator },
  { label: "Yetkili Portföylerim", href: "/portfolios", icon: Briefcase },
  { label: "Ajanda", href: "/calendar", icon: CalendarDays },
  { label: "Fırsatlar", href: "/deals", icon: Kanban },
  { label: "FSBO Radarı", href: "/fsbo-radar", icon: ScanLine },
  { label: "Tapu AI", href: "/tapu-ai", icon: FileText },
  { label: "İmar Radarı", href: "/imar-radari", icon: Radar },
  { label: "İstihbarat Radarı", href: "/radar", icon: Radio },
  { label: "İlan Asistanı", href: "/ilan-asistani", icon: PenTool },
  { label: "Ekspertiz", href: "/ekspertiz", icon: LineChart },
  { label: "Ekspertiz Arşivi", href: "/arsiv", icon: Archive },
  { label: "Müşteriler", href: "/customers", icon: Users },
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDashboardPageTitle(pathname: string) {
  const match = dashboardNavItems.find((item) => isNavItemActive(pathname, item.href));
  return match?.label ?? "Panel";
}
