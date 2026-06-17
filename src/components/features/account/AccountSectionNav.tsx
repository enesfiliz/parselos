"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type AccountTabId =
  | "genel"
  | "profil"
  | "kurum"
  | "ekip"
  | "abonelik"
  | "guvenlik";

type TabConfig = {
  id: AccountTabId;
  label: string;
  icon: LucideIcon;
  group: "Hesap" | "Ofis" | "Plan";
};

const ACCOUNT_TABS: TabConfig[] = [
  { id: "genel", label: "Genel bakış", icon: LayoutDashboard, group: "Hesap" },
  { id: "profil", label: "Kişisel bilgiler", icon: UserRound, group: "Hesap" },
  { id: "guvenlik", label: "Güvenlik", icon: Shield, group: "Hesap" },
  { id: "kurum", label: "Ofis bilgileri", icon: Building2, group: "Ofis" },
  { id: "ekip", label: "Ekip ve davetler", icon: Users, group: "Ofis" },
  { id: "abonelik", label: "Abonelik", icon: CreditCard, group: "Plan" },
];

const TAB_GROUPS = ["Hesap", "Ofis", "Plan"] as const;

export function getAccountTabMeta(tabId: AccountTabId) {
  const tab = ACCOUNT_TABS.find((item) => item.id === tabId);
  return tab ? { tab, group: tab.group } : null;
}

type AccountSectionNavProps = {
  activeTab: AccountTabId;
  onTabChange: (tabId: AccountTabId) => void;
  children?: ReactNode;
};

export function AccountSectionNav({
  activeTab,
  onTabChange,
  children,
}: AccountSectionNavProps) {
  const activeMeta = getAccountTabMeta(activeTab);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,13rem)_1fr] lg:items-start lg:gap-8">
      <div className="space-y-3 lg:sticky lg:top-24">
        <label htmlFor="account-tab-select" className="sr-only">
          Hesap bölümü
        </label>
        <select
          id="account-tab-select"
          value={activeTab}
          onChange={(event) => onTabChange(event.target.value as AccountTabId)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 lg:hidden"
        >
          {TAB_GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {ACCOUNT_TABS.filter((tab) => tab.group === group).map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <nav
          aria-label="Hesap bölümleri"
          className="hidden space-y-5 lg:block"
        >
          {TAB_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group}
              </p>
              <div className="space-y-0.5">
                {ACCOUNT_TABS.filter((tab) => tab.group === group).map(
                  ({ id, label, icon: Icon }) => {
                    const selected = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onTabChange(id)}
                        aria-current={selected ? "page" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          selected
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </nav>

        {activeMeta ? (
          <p className="text-xs text-muted-foreground lg:hidden">
            {activeMeta.group} · {activeMeta.tab.label}
          </p>
        ) : null}
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
