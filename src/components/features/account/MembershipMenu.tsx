"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  Building2,
  CreditCard,
  KeyRound,
  LogOut,
  Settings,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  LicenseBadge,
  PlanBadge,
  RoleBadge,
} from "@/components/features/account/RoleBadge";
import { Button } from "@/components/ui/button";
import { ORGANIZATION_TYPE_LABELS, STATUS_LABELS } from "@/lib/account/labels";
import { cn } from "@/lib/utils";
import type {
  AgentRoleType,
  LicenseVerificationStatus,
  TenantPlanType,
  TenantStatus,
} from "@prisma/client";

type SummaryData = {
  agent: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    roleType: AgentRoleType;
    licenseStatus: LicenseVerificationStatus;
    licenseNumber: string | null;
  };
  tenant: {
    name: string;
    planType: TenantPlanType;
    status: TenantStatus;
    organizationType: string;
  };
  capabilities: {
    canManageTeam: boolean;
    canManageOfficeInvites: boolean;
    canViewBrokerMetrics: boolean;
  };
  stats: {
    teamCount: number;
    activeInvites: number;
    dealCount: number;
  };
};

type MenuLink = {
  href: string;
  label: string;
  description: string;
  icon: typeof Settings;
  accent?: string;
};

const STATIC_LINKS: MenuLink[] = [
  {
    href: "/account",
    label: "Üyelik Paneli",
    description: "Profil, kurum ve yetki ayarları",
    icon: Settings,
  },
  {
    href: "/account?tab=kurum",
    label: "Kurum & Yetki",
    description: "TTYB belgesi ve ofis bilgileri",
    icon: Building2,
  },
  {
    href: "/account?tab=abonelik",
    label: "Abonelik",
    description: "Plan ve paket bilgileri",
    icon: CreditCard,
  },
  {
    href: "/account?tab=guvenlik",
    label: "Güvenlik",
    description: "Şifre ve oturum yönetimi",
    icon: Shield,
  },
];

export function MembershipMenu({ className }: { className?: string }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/account/summary", { cache: "no-store" });
      if (!res.ok) {
        setSummaryError(true);
        return;
      }
      setSummary((await res.json()) as SummaryData);
      setSummaryError(false);
    } catch {
      setSummaryError(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user || fetchedRef.current) return;
    fetchedRef.current = true;
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [isLoaded, user, loadSummary]);

  useEffect(() => {
    if (open && !summary && !summaryError) {
      queueMicrotask(() => {
        void loadSummary();
      });
    }
  }, [open, summary, summaryError, loadSummary]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (!open) return;
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const displayName =
    [summary?.agent.firstName, summary?.agent.lastName].filter(Boolean).join(" ") ||
    user?.fullName ||
    "Kullanıcı";

  const email =
    summary?.agent.email ?? user?.primaryEmailAddress?.emailAddress ?? "";

  const menuLinks = useMemo(() => {
    const teamLink: MenuLink = summary?.capabilities.canManageOfficeInvites
      ? {
          href: "/account?tab=ekip",
          label: "Ekip Yönetimi",
          description: "Davet kodu oluştur, üyeleri yönet",
          icon: Users,
          accent: "text-amber-600 dark:text-amber-400",
        }
      : {
          href: "/account?tab=ekip",
          label: "Ofise Katıl",
          description: "Davet kodu ile ofise bağlan",
          icon: UserPlus,
        };

    const metricsLink: MenuLink[] = summary?.capabilities.canViewBrokerMetrics
      ? [
          {
            href: "/ofis-operasyonu",
            label: "Ofis İzleme",
            description: "Ekip performansı ve pipeline",
            icon: BarChart3,
            accent: "text-primary",
          },
        ]
      : [];

    return [
      STATIC_LINKS[0]!,
      STATIC_LINKS[1]!,
      teamLink,
      ...metricsLink,
      STATIC_LINKS[2]!,
      STATIC_LINKS[3]!,
    ];
  }, [summary?.capabilities.canManageOfficeInvites, summary?.capabilities.canViewBrokerMetrics]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Üyelik menüsü"
        aria-expanded={open}
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-1.5rem,360px)] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 pb-3 pt-4">
            <div className="flex gap-3">
              <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-base font-semibold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-outfit text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
                {summary ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <RoleBadge role={summary.agent.roleType} compact />
                    <PlanBadge plan={summary.tenant.planType} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 min-h-[88px] rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
              {summary ? (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Kurum
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {summary.tenant.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ORGANIZATION_TYPE_LABELS[
                          summary.tenant.organizationType as keyof typeof ORGANIZATION_TYPE_LABELS
                        ]}{" "}
                        · {STATUS_LABELS[summary.tenant.status]}
                      </p>
                    </div>
                    <LicenseBadge status={summary.agent.licenseStatus} />
                  </div>
                  {summary.agent.licenseNumber ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <KeyRound className="size-3 shrink-0" />
                      <span className="truncate font-mono">{summary.agent.licenseNumber}</span>
                    </div>
                  ) : null}
                  <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-border/50 pt-2">
                    <StatPill label="Ekip" value={summary.stats.teamCount} />
                    <StatPill label="Fırsat" value={summary.stats.dealCount} />
                    <StatPill label="Davet" value={summary.stats.activeInvites} />
                  </div>
                </>
              ) : summaryError ? (
                <p className="flex h-full items-center text-xs text-muted-foreground">
                  Özet yüklenemedi.
                </p>
              ) : (
                <div className="space-y-2 py-1">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav className="max-h-[280px] overflow-y-auto p-1.5">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/70"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <item.icon
                    className={cn("size-3.5 text-muted-foreground", item.accent)}
                    strokeWidth={1.75}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-1.5">
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="size-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-background/80 px-1.5 py-1 text-center">
      <p className="text-sm font-semibold tabular-nums leading-none text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
