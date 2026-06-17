"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PoolDeal = {
  id: string;
  clientName: string;
  propertyTitle: string;
  stage: string;
  currentAssignee: string;
};

type PoolClient = {
  id: string;
  adSoyad: string;
};

type HistoryRow = {
  id: string;
  resourceType: string;
  resourceId: string;
  actorName: string;
  fromName: string;
  toName: string;
  createdAt: string;
};

type TeamMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

type AssignmentData = {
  unassignedDeals: PoolDeal[];
  unassignedClients: PoolClient[];
  history: HistoryRow[];
};

function memberLabel(member: TeamMember) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
  return name || member.email || "Danışman";
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function OfficeAssignmentPanel() {
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [data, setData] = useState<AssignmentData | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [assigneeByResource, setAssigneeByResource] = useState<Record<string, string>>({});

  useEffect(() => {
    void (async () => {
      try {
        const [assignRes, teamRes] = await Promise.all([
          fetch("/api/account/assignments"),
          fetch("/api/account/team"),
        ]);

        if (!assignRes.ok) {
          const body = (await assignRes.json()) as { error?: string };
          throw new Error(body.error ?? "Atama verileri yüklenemedi.");
        }

        const assignBody = (await assignRes.json()) as { data: AssignmentData };
        setData(assignBody.data);

        if (teamRes.ok) {
          const teamBody = (await teamRes.json()) as { members?: TeamMember[] };
          setTeam(teamBody.members ?? []);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Atama verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAssign(
    resourceType: "deal" | "client",
    resourceId: string,
  ) {
    const assigneeAgentId = assigneeByResource[`${resourceType}:${resourceId}`];
    if (!assigneeAgentId) {
      toast.error("Lütfen bir danışman seçin.");
      return;
    }

    setAssigning(`${resourceType}:${resourceId}`);
    try {
      const res = await fetch("/api/account/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, resourceId, assigneeAgentId }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Atama yapılamadı.");
      }
      toast.success("Atama tamamlandı.");
      const [assignRes, teamRes] = await Promise.all([
        fetch("/api/account/assignments"),
        fetch("/api/account/team"),
      ]);
      if (assignRes.ok) {
        const assignBody = (await assignRes.json()) as { data: AssignmentData };
        setData(assignBody.data);
      }
      if (teamRes.ok) {
        const teamBody = (await teamRes.json()) as { members?: TeamMember[] };
        setTeam(teamBody.members ?? []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Atama yapılamadı.");
    } finally {
      setAssigning(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-parsel-panel px-6 py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasPool =
    data.unassignedDeals.length > 0 || data.unassignedClients.length > 0;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm">
        <div className="mb-4 flex items-center gap-2">
          <ArrowRightLeft className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Kaynak atama</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Ofis havuzundaki fırsat ve müşteri kayıtlarını danışmanlara atayın veya yeniden
          atayın.
        </p>

        {!hasPool ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            Atanmaya hazır kayıt bulunmuyor.
          </p>
        ) : (
          <div className="space-y-4">
            {data.unassignedDeals.map((deal) => {
              const key = `deal:${deal.id}`;
              return (
                <div
                  key={deal.id}
                  className="rounded-xl border border-border/60 bg-parsel-elevated p-4"
                >
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground">{deal.clientName}</p>
                    <p className="text-xs text-muted-foreground">{deal.propertyTitle}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Mevcut: {deal.currentAssignee}
                    </p>
                  </div>
                  <AssignRow
                    resourceKey={key}
                    team={team}
                    assigneeByResource={assigneeByResource}
                    setAssigneeByResource={setAssigneeByResource}
                    assigning={assigning === key}
                    onAssign={() => handleAssign("deal", deal.id)}
                  />
                </div>
              );
            })}

            {data.unassignedClients.map((client) => {
              const key = `client:${client.id}`;
              return (
                <div
                  key={client.id}
                  className="rounded-xl border border-border/60 bg-parsel-elevated p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <UserRound className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{client.adSoyad}</p>
                  </div>
                  <AssignRow
                    resourceKey={key}
                    team={team}
                    assigneeByResource={assigneeByResource}
                    setAssigneeByResource={setAssigneeByResource}
                    assigning={assigning === key}
                    onAssign={() => handleAssign("client", client.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Son atama geçmişi</h3>
        {data.history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz atama kaydı yok.</p>
        ) : (
          <ul className="space-y-2">
            {data.history.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border/50 bg-parsel-elevated px-3 py-2.5 text-xs"
              >
                <p className="font-medium text-foreground">
                  {row.resourceType === "deal" ? "Fırsat" : "Müşteri"} — {row.toName}
                </p>
                <p className="text-muted-foreground">
                  {row.fromName} → {row.toName} · {row.actorName} · {formatWhen(row.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AssignRow({
  resourceKey,
  team,
  assigneeByResource,
  setAssigneeByResource,
  assigning,
  onAssign,
}: {
  resourceKey: string;
  team: TeamMember[];
  assigneeByResource: Record<string, string>;
  setAssigneeByResource: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  assigning: boolean;
  onAssign: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        )}
        value={assigneeByResource[resourceKey] ?? ""}
        onChange={(event) =>
          setAssigneeByResource((prev) => ({
            ...prev,
            [resourceKey]: event.target.value,
          }))
        }
      >
        <option value="">Danışman seçin</option>
        {team.map((member) => (
          <option key={member.id} value={member.id}>
            {memberLabel(member)}
          </option>
        ))}
      </select>
      <Button
        type="button"
        className="shrink-0"
        disabled={assigning}
        onClick={onAssign}
      >
        {assigning ? <Loader2 className="size-4 animate-spin" /> : "Ata"}
      </Button>
    </div>
  );
}
