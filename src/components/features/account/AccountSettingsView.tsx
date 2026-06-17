"use client";

import { useCallback, useState, type ReactNode } from "react";
import { UserProfile } from "@clerk/nextjs";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Save,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useParselTheme } from "@/components/providers/ThemeProvider";
import { BrokerMetricsPanel } from "@/components/features/account/BrokerMetricsPanel";
import { OfficeAssignmentPanel } from "@/components/features/account/OfficeAssignmentPanel";
import {
  LicenseBadge,
  PlanBadge,
  RoleBadge,
} from "@/components/features/account/RoleBadge";
import { TeamPanel } from "@/components/features/account/TeamPanel";
import { BillingView } from "@/components/features/billing/BillingView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AGENT_ROLE_ACCENT,
  AGENT_ROLE_DESCRIPTIONS,
  AGENT_ROLE_LABELS,
  ORGANIZATION_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/account/labels";
import {
  canManageOfficeInvites,
  canManageTeam,
  canSelectAgentRoleType,
  canViewBrokerMetrics,
  isBrokerOfficeTenant,
  memberRoleLabel,
} from "@/lib/account/permissions";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import { cn } from "@/lib/utils";
import { TTBS_OFFICIAL_VERIFY_URL } from "@/lib/account/ttbs-constants";
import type {
  AgentRoleType,
  LicenseVerificationStatus,
  TenantMemberRole,
  TenantOrganizationType,
  TenantPlanType,
  TenantStatus,
} from "@/lib/account/types";

type ProfileData = {
  agent: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    roleType: AgentRoleType;
    tenantMemberRole: TenantMemberRole;
    tenantId: string | null;
    professionalTitle: string | null;
    phone: string | null;
    licenseNumber: string | null;
    licenseStatus: LicenseVerificationStatus;
    licenseRejectReason: string | null;
    city: string | null;
  };
  tenant: {
    id: string;
    name: string;
    planType: TenantPlanType;
    status: TenantStatus;
    organizationType: TenantOrganizationType;
    taxNumber: string | null;
    address: string | null;
    phone: string | null;
    city: string | null;
    website: string | null;
  };
};

type AccountSettingsViewProps = { initialData: ProfileData };

type TabConfig = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  brokerOnly?: boolean;
};

const BASE_TABS: TabConfig[] = [
  { id: "genel", label: "Genel", icon: LayoutDashboard },
  { id: "profil", label: "Profil", icon: UserRound },
  { id: "kurum", label: "Kurum & Yetki", icon: Building2 },
  { id: "ekip", label: "Ekip", icon: Users },
  { id: "metrikler", label: "Ofis Metrikleri", icon: BarChart3, brokerOnly: true },
  { id: "abonelik", label: "Abonelik", icon: CreditCard },
  { id: "guvenlik", label: "Güvenlik", icon: Shield },
];

type TabId =
  | "genel"
  | "profil"
  | "kurum"
  | "ekip"
  | "metrikler"
  | "abonelik"
  | "guvenlik";

const selectClassName =
  "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 dark:bg-background/80";

export function AccountSettingsView({ initialData }: AccountSettingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useParselTheme();
  const clerkAppearance = getClerkAppearance(resolvedTheme);

  const showBrokerMetrics = canViewBrokerMetrics(
    initialData.agent,
    initialData.tenant,
  );
  const manageTeam = canManageTeam(initialData.agent, initialData.tenant);
  const selectAgentRole = canSelectAgentRoleType(
    initialData.agent,
    initialData.tenant,
  );
  const manageOfficeInvites = canManageOfficeInvites(
    {
      tenantId: initialData.agent.tenantId,
      tenantMemberRole: initialData.agent.tenantMemberRole,
    },
    initialData.tenant,
  );

  const tabs = BASE_TABS.filter(
    (tab) => !tab.brokerOnly || showBrokerMetrics,
  );

  const tabFromUrl = (searchParams.get("tab") as TabId | null) ?? "genel";
  const activeTab: TabId = tabs.some((t) => t.id === tabFromUrl) ? tabFromUrl : "genel";
  const [saving, setSaving] = useState(false);
  const [verifyingLicense, setVerifyingLicense] = useState(false);

  const [form, setForm] = useState({
    firstName: initialData.agent.firstName ?? "",
    lastName: initialData.agent.lastName ?? "",
    email: initialData.agent.email ?? "",
    roleType: initialData.agent.roleType,
    professionalTitle: initialData.agent.professionalTitle ?? "",
    phone: initialData.agent.phone ?? "",
    licenseNumber: initialData.agent.licenseNumber ?? "",
    licenseStatus: initialData.agent.licenseStatus,
    licenseRejectReason: initialData.agent.licenseRejectReason,
    city: initialData.agent.city ?? "",
    tenantName: initialData.tenant.name,
    organizationType: initialData.tenant.organizationType,
    taxNumber: initialData.tenant.taxNumber ?? "",
    address: initialData.tenant.address ?? "",
    tenantPhone: initialData.tenant.phone ?? "",
    tenantCity: initialData.tenant.city ?? "",
    website: initialData.tenant.website ?? "",
  });

  const onTabChange = useCallback(
    (value: string) => {
      const tab = value as TabId;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/account?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          roleType: form.roleType,
          professionalTitle: form.professionalTitle || null,
          phone: form.phone || null,
          licenseNumber: form.licenseNumber || null,
          city: form.city || null,
          tenantName: form.tenantName,
          organizationType: form.organizationType,
          taxNumber: form.taxNumber || null,
          address: form.address || null,
          tenantPhone: form.tenantPhone || null,
          tenantCity: form.tenantCity || null,
          website: form.website || null,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Kayıt başarısız.");
      toast.success("Bilgiler kaydedildi");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function submitLicenseVerification() {
    if (!form.licenseNumber.trim()) {
      toast.error("Yetki belge numarası girin");
      return;
    }
    setVerifyingLicense(true);
    try {
      const res = await fetch("/api/account/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: form.licenseNumber,
          businessName: form.tenantName,
          city: form.tenantCity || form.city,
        }),
      });
      const data = (await res.json()) as {
        agent?: {
          licenseStatus: LicenseVerificationStatus;
          licenseRejectReason: string | null;
        };
        message?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error);
      if (data.agent) {
        setForm((f) => ({
          ...f,
          licenseStatus: data.agent!.licenseStatus,
          licenseRejectReason: data.agent!.licenseRejectReason,
        }));
      }
      toast.success(data.message ?? "İşlem tamamlandı");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Doğrulama başarısız");
    } finally {
      setVerifyingLicense(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/12 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              ParselOS Üyelik
            </p>
            <h1 className="font-outfit text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Hesap & Ofis Yönetimi
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Profilinizi, yetki belgenizi, ekip yapınızı ve ofis metriklerinizi
              tek merkezden yönetin.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <RoleBadge role={form.roleType} />
              <PlanBadge plan={initialData.tenant.planType} />
              <LicenseBadge status={form.licenseStatus} />
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {STATUS_LABELS[initialData.tenant.status]}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-background/80 p-4 backdrop-blur-sm md:min-w-[220px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Kurum
            </p>
            <p className="mt-1 font-outfit text-lg font-semibold text-foreground">
              {form.tenantName}
            </p>
            <p className="text-xs text-muted-foreground">
              {ORGANIZATION_TYPE_LABELS[form.organizationType]}
            </p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={onTabChange} className="gap-6">
        <div className="md:hidden">
          <label htmlFor="account-tab-select" className="sr-only">
            Bölüm seçin
          </label>
          <select
            id="account-tab-select"
            value={activeTab}
            onChange={(event) => onTabChange(event.target.value)}
            className={selectClassName}
          >
            {tabs.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <TabsList className="hidden h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/60 p-1.5 md:flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="gap-2 rounded-xl px-4 py-2.5 data-active:bg-card data-active:shadow-sm"
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="genel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              title="Üyelik Durumu"
              value={STATUS_LABELS[initialData.tenant.status]}
              sub={PLAN_LABELS_SHORT[initialData.tenant.planType]}
            />
            <OverviewCard
              title="Yetki Belgesi"
              value={LICENSE_SHORT[form.licenseStatus]}
              sub={form.licenseNumber || "Numara girilmedi"}
            />
            <OverviewCard
              title={
                isBrokerOfficeTenant(initialData.tenant) ? "Ofis Rolü" : "Hesap Türü"
              }
              value={memberRoleLabel(
                initialData.agent.tenantMemberRole,
                initialData.tenant,
              )}
              sub={AGENT_ROLE_LABELS[form.roleType]}
            />
          </div>
          {form.licenseStatus !== "VERIFIED" ? (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <p className="text-sm font-medium text-foreground">
                Yetki belgeniz henüz onaylanmadı
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Kurum & Yetki sekmesinden TTYB numaranızı girip doğrulama
                başlatın.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => onTabChange("kurum")}
              >
                Yetki Belgesine Git
              </Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="profil" className="space-y-6">
          <CardSection title="Kişisel Bilgiler" icon={UserRound}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ad">
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </Field>
              <Field label="Soyad">
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </Field>
              <Field label="E-posta" hint="Clerk hesabınızdan yönetilir">
                <Input value={form.email} disabled />
              </Field>
              <Field label="Telefon">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+90 5xx xxx xx xx"
                />
              </Field>
              <Field label="Şehir">
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </Field>
              <Field label="Ünvan">
                <Input
                  value={form.professionalTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, professionalTitle: e.target.value }))
                  }
                />
              </Field>
            </div>
          </CardSection>

          {selectAgentRole ? (
            <CardSection title="Sistem Rolü" icon={BadgeCheck}>
              <div className="grid gap-3 md:grid-cols-3">
                {(Object.keys(AGENT_ROLE_LABELS) as AgentRoleType[]).map((role) => {
                  const selected = form.roleType === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, roleType: role }))}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        selected
                          ? "border-primary/40 bg-primary/8 shadow-sm ring-1 ring-primary/20"
                          : "border-border hover:border-primary/20 hover:bg-muted/40",
                      )}
                    >
                      <RoleBadge role={role} compact className="mb-2" />
                      <p
                        className={cn(
                          "text-xs leading-relaxed",
                          selected ? AGENT_ROLE_ACCENT[role] : "text-muted-foreground",
                        )}
                      >
                        {AGENT_ROLE_DESCRIPTIONS[role]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardSection>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
              Rolünüz ofis yöneticiniz tarafından belirlenir. Mevcut rol:{" "}
              <RoleBadge role={form.roleType} compact className="ml-1 inline-flex" />
            </div>
          )}

          <SaveBar saving={saving} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="kurum" className="space-y-6">
          <CardSection title="Yetki Belgesi (TTYB)" icon={KeyRound}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <LicenseBadge status={form.licenseStatus} />
                {form.licenseRejectReason ? (
                  <span className="text-xs text-destructive">
                    {form.licenseRejectReason}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Field label="Yetki Belge Numarası">
                  <Input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        licenseNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Örn. 1234567890"
                    className="font-mono tracking-wide"
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={submitLicenseVerification}
                    disabled={verifyingLicense}
                    className="h-10 w-full md:w-auto"
                  >
                    {verifyingLicense ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="size-4" />
                    )}
                    Doğrulamayı Başlat
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  Doğrulama T.C. Ticaret Bakanlığı{" "}
                  <strong className="font-medium text-foreground">TTBS</strong> kayıtları
                  üzerinden yapılır. Resmi kamu API&apos;si olmadığı için sorgu CAPTCHA
                  korumalıdır; otomatik eşleşme olmazsa kaydınız 1 iş günü içinde
                  incelenir.
                </p>
                <a
                  href={TTBS_OFFICIAL_VERIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  TTBS resmi belge sorgulama →
                </a>
              </div>
            </div>
          </CardSection>

          <CardSection title="Kurumsal Bilgiler" icon={Building2}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Kurum / Ofis Adı">
                <Input
                  value={form.tenantName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tenantName: e.target.value }))
                  }
                />
              </Field>
              <Field label="Kuruluş Türü">
                <select
                  className={selectClassName}
                  value={form.organizationType}
                  disabled={!manageTeam}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      organizationType: e.target.value as TenantOrganizationType,
                    }))
                  }
                >
                  {(Object.keys(ORGANIZATION_TYPE_LABELS) as TenantOrganizationType[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {ORGANIZATION_TYPE_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Vergi No">
                <Input
                  value={form.taxNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, taxNumber: e.target.value }))
                  }
                />
              </Field>
              <Field label="Kurum Telefonu">
                <Input
                  value={form.tenantPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tenantPhone: e.target.value }))
                  }
                />
              </Field>
              <Field label="Web Sitesi" className="md:col-span-2">
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                  placeholder="https://"
                />
              </Field>
              <Field label="Adres" className="md:col-span-2">
                <textarea
                  className={cn(selectClassName, "min-h-24 py-2")}
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </Field>
            </div>
          </CardSection>

          <SaveBar saving={saving} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="ekip">
          <TeamPanel
            currentAgentId={initialData.agent.id}
            agent={{
              id: initialData.agent.id,
              tenantId: initialData.agent.tenantId,
              tenantMemberRole: initialData.agent.tenantMemberRole,
            }}
            tenant={initialData.tenant}
            canManageInvites={manageOfficeInvites}
          />
        </TabsContent>

        <TabsContent value="metrikler" className="space-y-6">
          <BrokerMetricsPanel />
          {manageTeam ? <OfficeAssignmentPanel /> : null}
        </TabsContent>

        <TabsContent value="abonelik">
          <BillingView
            embedded
            currentPlan={initialData.tenant.planType}
            currentStatus={initialData.tenant.status}
          />
        </TabsContent>

        <TabsContent value="guvenlik">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-card px-6 py-4">
              <h2 className="font-outfit text-lg font-semibold">Hesap Güvenliği</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Şifre, iki adımlı doğrulama ve oturum yönetimi
              </p>
            </div>
            <div className="parsel-clerk-profile bg-card">
              {activeTab === "guvenlik" ? (
                <UserProfile
                  routing="hash"
                  appearance={{
                    ...clerkAppearance,
                    elements: {
                      ...clerkAppearance.elements,
                      rootBox: "w-full bg-card",
                      card: "shadow-none border-0 rounded-none bg-card",
                      cardBox: "bg-card",
                      navbar: "border-r border-border bg-card",
                      pageScrollBox: "bg-card",
                      scrollBox: "bg-card",
                      page: "bg-card",
                      profilePage: "bg-card",
                    },
                  }}
                />
              ) : null}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PLAN_LABELS_SHORT = {
  FREE: "Ücretsiz plan",
  PRO: "Pro plan",
  PREMIUM: "Premium plan",
};

const LICENSE_SHORT: Record<LicenseVerificationStatus, string> = {
  NONE: "Gönderilmedi",
  PENDING: "İnceleniyor",
  VERIFIED: "Onaylı",
  REJECTED: "Reddedildi",
};

function OverviewCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 font-outfit text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function CardSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-4 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="font-outfit text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SaveBar({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end rounded-2xl border border-border bg-muted/30 p-4">
      <Button type="button" onClick={onSave} disabled={saving} className="min-w-40">
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <Save className="size-4" />
            Kaydet
          </>
        )}
      </Button>
    </div>
  );
}
