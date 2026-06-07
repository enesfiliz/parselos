import {
  BookOpen,
  Brain,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Aboneler & Faturalandırma",
    href: "/admin/subscribers",
    icon: CreditCard,
  },
  {
    label: "Fatura & Gelir Kontrolü",
    href: "/admin/billing",
    icon: Receipt,
  },
  {
    label: "Parsel AI Motor Kontrolü",
    href: "/admin/ai-settings",
    icon: Brain,
  },
  {
    label: "Parsel AI Metrikleri",
    href: "/admin/ai-metrics",
    icon: Sparkles,
  },
  {
    label: "İçerik Yönetimi (Eğitim/Blog)",
    href: "/admin/content",
    icon: BookOpen,
  },
  {
    label: "Sistem & Kod Konfigürasyonları",
    href: "/admin/system",
    icon: Settings,
  },
];

export function isAdminNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
