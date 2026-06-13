import {
  Archive,
  Briefcase,
  Calculator,
  CalendarDays,
  CreditCard,
  FileText,
  Kanban,
  LayoutDashboard,
  LineChart,
  Mic,
  PenTool,
  ScanLine,
  Radar,
  Settings,
  Users,
  Wallet,
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
      { label: "Finans", href: "/finans", icon: Wallet },
    ],
  },
  {
    label: "İstihbarat",
    items: [
      { label: "FSBO Radarı", href: "/fsbo-radar", icon: ScanLine },
      { label: "İmar Radarı", href: "/imar-radari", icon: Radar },
    ],
  },
  {
    label: "Araçlar",
    items: [
      { label: "Tapu AI", href: "/tapu-ai", icon: FileText },
      { label: "İlan Asistanı", href: "/ilan-asistani", icon: PenTool },
      { label: "Ekspertiz", href: "/ekspertiz", icon: LineChart },
      { label: "Ekspertiz Arşivi", href: "/arsiv", icon: Archive },
      { label: "Sesli CRM", href: "/sesli-crm", icon: Mic },
    ],
  },
];

/** Sidebar alt bölümü — hesap ve abonelik */
export const dashboardFooterNavItems: DashboardNavItem[] = [
  { label: "Hesap", href: "/account", icon: Settings },
  { label: "Abonelik", href: "/billing", icon: CreditCard },
];

/** Mobil tek dokunuş hızlı erişim */
export const mobileQuickNavItems: DashboardNavItem[] = [
  { label: "Sesli CRM", href: "/sesli-crm", icon: Mic },
];

export const dashboardNavItems: DashboardNavItem[] = dashboardNavGroups.flatMap(
  (group) => group.items,
);

export const allDashboardNavItems: DashboardNavItem[] = [
  ...dashboardNavItems,
  ...dashboardFooterNavItems,
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDashboardPageTitle(pathname: string) {
  const match = allDashboardNavItems.find((item) =>
    isNavItemActive(pathname, item.href),
  );
  return match?.label ?? "Panel";
}
