"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import {
  LicenseBadge,
  RoleBadge,
} from "@/components/features/account/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { memberRoleLabel } from "@/lib/account/permissions";
import { cn } from "@/lib/utils";
import type { AgentRoleType, LicenseVerificationStatus, TenantMemberRole } from "@prisma/client";

type TeamMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
  roleType: AgentRoleType;
  tenantMemberRole: TenantMemberRole;
  licenseStatus: LicenseVerificationStatus;
  licenseNumber: string | null;
  lastActiveAt: string;
  _count: { deals: number; fsboLeads: number };
};

type Invite = {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  olusturulmaTarihi: string;
};

type TeamPanelProps = {
  canManage: boolean;
  currentAgentId: string;
};

export function TeamPanel({ canManage, currentAgentId }: TeamPanelProps) {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [joinCode, setJoinCode] = useState(
    () => searchParams.get("invite")?.toUpperCase() ?? "",
  );
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, inviteRes] = await Promise.all([
        fetch("/api/account/team"),
        canManage ? fetch("/api/account/invites") : Promise.resolve(null),
      ]);

      if (teamRes.ok) {
        const data = (await teamRes.json()) as {
          members: TeamMember[];
          tenant: { name: string };
        };
        setMembers(data.members);
        setTenantName(data.tenant.name);
      }

      if (inviteRes?.ok) {
        const data = (await inviteRes.json()) as { invites: Invite[] };
        setInvites(data.invites.filter((i) => i.isActive));
      }
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function createInvite() {
    setCreatingInvite(true);
    try {
      const res = await fetch("/api/account/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxUses: 10, expiresInDays: 30 }),
      });
      const data = (await res.json()) as { invite?: Invite; error?: string };
      if (!res.ok) throw new Error(data.error);
      toast.success("Davet kodu oluşturuldu", {
        description: data.invite?.code,
      });
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Oluşturulamadı");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function revokeInvite(id: string) {
    const res = await fetch(`/api/account/invites/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.message("Davet iptal edildi");
      void load();
    }
  }

  async function removeMember(agentId: string) {
    const res = await fetch(`/api/account/team/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove" }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Kaldırılamadı");
      return;
    }
    toast.success("Üye ofisten ayrıldı");
    void load();
  }

  async function joinOffice() {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch("/api/account/invites/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message ?? "Ofise katıldınız");
      setJoinCode("");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Katılım başarısız");
    } finally {
      setJoining(false);
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code);
    toast.success("Kopyalandı", { description: code });
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!canManage ? (
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h3 className="font-outfit text-lg font-semibold">Ofise Katıl</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Brokerınızdan aldığınız davet kodunu girerek {tenantName || "ofise"}{" "}
            bağlanın.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="PSL-XXXXXX"
              className="font-mono uppercase tracking-widest"
            />
            <Button
              type="button"
              onClick={joinOffice}
              disabled={joining}
              className="shrink-0 sm:min-w-36"
            >
              {joining ? <Loader2 className="size-4 animate-spin" /> : "Katıl"}
            </Button>
          </div>
        </section>
      ) : null}

      {canManage ? (
        <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-outfit text-lg font-semibold">Davet Kodları</h3>
              <p className="text-sm text-muted-foreground">
                Danışmanlarınız bu kodla ofisinize katılabilir.
              </p>
            </div>
            <Button
              type="button"
              onClick={createInvite}
              disabled={creatingInvite}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {creatingInvite ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Yeni Davet Kodu
            </Button>
          </div>

          {invites.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Henüz aktif davet kodu yok. Yeni kod oluşturun.
            </p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/80 px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-base font-bold tracking-widest text-foreground">
                      {invite.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invite.usedCount}/{invite.maxUses} kullanım ·{" "}
                      {invite.expiresAt
                        ? new Date(invite.expiresAt).toLocaleDateString("tr-TR")
                        : "—"}{" "}
                      sona erer
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(invite.code)}
                    >
                      <Copy className="size-3.5" />
                      Kopyala
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => revokeInvite(invite.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-outfit text-lg font-semibold">
            Ekip Üyeleri ({members.length})
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => load()}>
            <RefreshCw className="size-3.5" />
            Yenile
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Üye</th>
                <th className="pb-3 pr-4 font-medium">Rol</th>
                <th className="pb-3 pr-4 font-medium">Yetki</th>
                <th className="pb-3 pr-4 font-medium">Fırsat</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const name =
                  [member.firstName, member.lastName].filter(Boolean).join(" ") ||
                  member.email ||
                  "—";
                const isSelf = member.id === currentAgentId;

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      isSelf && "bg-primary/5",
                    )}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {memberRoleLabel(member.tenantMemberRole)}
                        {isSelf ? " · Siz" : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <RoleBadge role={member.roleType} compact />
                    </td>
                    <td className="py-3 pr-4">
                      <LicenseBadge status={member.licenseStatus} />
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                      {member._count.deals}
                    </td>
                    <td className="py-3 text-right">
                      {canManage &&
                      !isSelf &&
                      member.tenantMemberRole !== "OWNER" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeMember(member.id)}
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
