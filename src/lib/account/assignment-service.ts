import "server-only";



import { canManageTeam } from "@/lib/account/permissions";

import {

  buildAssignmentNotificationDedupeKey,

  isGlobalOrphanAgentId,

  isTenantAssignableDeal,

} from "@/lib/account/tenant-assignment";

import { requireCurrentAgent } from "@/lib/auth/agent";

import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";

import { prisma } from "@/lib/prisma";



export type AssignmentResourceType = "deal" | "client";



async function assertManager() {

  const actor = await requireCurrentAgent();

  const { tenant } = await getOrCreateTenantForAgent(actor.id);

  if (!canManageTeam(actor, tenant)) {

    throw new Error("Bu işlem için ofis yönetici yetkisi gerekli.");

  }

  return { actor, tenant };

}



async function tenantAgentIds(tenantId: string) {

  const agents = await prisma.agent.findMany({

    where: { tenantId },

    select: { id: true },

  });

  return agents.map((item) => item.id);

}



async function assertAssigneeInTenant(tenantId: string, assigneeAgentId: string) {

  const assignee = await prisma.agent.findFirst({

    where: { id: assigneeAgentId, tenantId },

    select: { id: true, tenantMemberRole: true },

  });



  if (!assignee) {
    throw new Error("Atanacak danışman bu ofiste bulunamadı.");
  }

  return assignee;

}



async function assertTenantDeal(dealId: string, tenantId: string) {

  const agentIds = await tenantAgentIds(tenantId);

  const deal = await prisma.deal.findFirst({

    where: { id: dealId },

    include: { client: true, property: true, agent: true },

  });



  if (!deal) {

    throw new Error("Fırsat bulunamadı.");

  }



  if (isGlobalOrphanAgentId(deal.agentId)) {

    throw new Error("Bu kayıt ofis havuzuna dahil değil.");

  }



  if (!isTenantAssignableDeal(deal, agentIds)) {

    throw new Error("Bu fırsat bu ofise ait değil.");

  }



  return deal;

}



async function assertTenantClient(clientId: string, tenantId: string) {

  const agentIds = await tenantAgentIds(tenantId);

  const deals = await prisma.deal.findMany({

    where: { clientId },

    include: { client: true },

  });



  const tenantDeals = deals.filter((deal) => isTenantAssignableDeal(deal, agentIds));



  if (tenantDeals.length === 0) {

    throw new Error("Müşteri bulunamadı.");

  }



  return tenantDeals;

}



async function createAssignmentNotification(input: {

  toAgentId: string;

  tenantId: string;

  resourceType: AssignmentResourceType;

  resourceId: string;

  auditId: string;

  title: string;

  message: string;

  href: string;

}) {

  const dedupeKey = buildAssignmentNotificationDedupeKey({

    resourceType: input.resourceType,

    resourceId: input.resourceId,

    assigneeAgentId: input.toAgentId,

    auditId: input.auditId,

  });



  await prisma.agentNotification.upsert({

    where: {

      agentId_dedupeKey: {

        agentId: input.toAgentId,

        dedupeKey,

      },

    },

    create: {

      agentId: input.toAgentId,

      tenantId: input.tenantId,

      type: "assignment",

      priority: "normal",

      title: input.title,

      message: input.message,

      href: input.href,

      dedupeKey,

    },

    update: {

      title: input.title,

      message: input.message,

      href: input.href,

      dismissed: false,

      read: false,

    },

  });

}



export async function assignDealToAgent(input: {

  dealId: string;

  assigneeAgentId: string;

}) {

  const { actor, tenant } = await assertManager();

  await assertAssigneeInTenant(tenant.id, input.assigneeAgentId);



  const deal = await assertTenantDeal(input.dealId, tenant.id);

  const fromAgentId = deal.agentId;



  const audit = await prisma.$transaction(async (tx) => {

    await tx.deal.update({

      where: { id: deal.id },

      data: { agentId: input.assigneeAgentId },

    });



    return tx.assignmentAudit.create({

      data: {

        tenantId: tenant.id,

        actorAgentId: actor.id,

        fromAgentId,

        toAgentId: input.assigneeAgentId,

        resourceType: "deal",

        resourceId: deal.id,

      },

    });

  });



  if (input.assigneeAgentId !== actor.id) {

    await createAssignmentNotification({

      toAgentId: input.assigneeAgentId,

      tenantId: tenant.id,

      resourceType: "deal",

      resourceId: deal.id,

      auditId: audit.id,

      title: "Yeni fırsat ataması",

      message: `${deal.client.adSoyad} — ${deal.property.ilanBasligi}`,

      href: "/deals",

    });

  }



  return { ok: true };

}



export async function assignClientToAgent(input: {

  clientId: string;

  assigneeAgentId: string;

}) {

  const { actor, tenant } = await assertManager();

  await assertAssigneeInTenant(tenant.id, input.assigneeAgentId);



  const deals = await assertTenantClient(input.clientId, tenant.id);



  const audit = await prisma.$transaction(async (tx) => {

    let lastAuditId = "";



    for (const deal of deals) {

      const fromAgentId = deal.agentId;

      const row = await tx.assignmentAudit.create({

        data: {

          tenantId: tenant.id,

          actorAgentId: actor.id,

          fromAgentId,

          toAgentId: input.assigneeAgentId,

          resourceType: "client",

          resourceId: input.clientId,

        },

      });

      lastAuditId = row.id;



      await tx.deal.update({

        where: { id: deal.id },

        data: { agentId: input.assigneeAgentId },

      });

    }



    return { id: lastAuditId };

  });



  if (input.assigneeAgentId !== actor.id) {

    await createAssignmentNotification({

      toAgentId: input.assigneeAgentId,

      tenantId: tenant.id,

      resourceType: "client",

      resourceId: input.clientId,

      auditId: audit.id,

      title: "Yeni müşteri ataması",

      message: deals[0]!.client.adSoyad,

      href: "/customers",

    });

  }



  return { ok: true, dealCount: deals.length };

}



export async function listUnassignedForTenant() {

  const { tenant } = await assertManager();

  const agents = await prisma.agent.findMany({

    where: { tenantId: tenant.id },

    select: { id: true, tenantMemberRole: true },

  });

  const tenantAgentIdsList = agents.map((agent) => agent.id);

  const officePoolIds = agents

    .filter((agent) => agent.tenantMemberRole === "OWNER")

    .map((agent) => agent.id);



  const assignableAgentIds =

    officePoolIds.length > 0 ? officePoolIds : tenantAgentIdsList;



  const [poolDeals, tenantClients] = await Promise.all([

    prisma.deal.findMany({

      where: {

        agentId: { in: assignableAgentIds },

      },

      take: 20,

      orderBy: { guncellenmeTarihi: "desc" },

      include: { client: true, property: true, agent: true },

    }),

    prisma.client.findMany({

      where: {

        deals: { some: { agentId: { in: tenantAgentIdsList } } },

      },

      take: 20,

      orderBy: { guncellenmeTarihi: "desc" },

      select: {

        id: true,

        adSoyad: true,

        deals: {

          where: { agentId: { in: tenantAgentIdsList } },

          select: { agentId: true },

          take: 1,

        },

      },

    }),

  ]);



  return {

    unassignedDeals: poolDeals.map((deal) => ({

      id: deal.id,

      clientName: deal.client.adSoyad,

      propertyTitle: deal.property.ilanBasligi,

      stage: deal.stage,

      currentAssignee:

        [deal.agent?.firstName, deal.agent?.lastName].filter(Boolean).join(" ") ||

        "Atanmamış",

    })),

    unassignedClients: tenantClients.map((client) => ({

      id: client.id,

      adSoyad: client.adSoyad,

    })),

    teamAgents: agents.map((agent) => ({ id: agent.id })),

  };

}



export async function listAssignmentHistoryForTenant(limit = 15) {

  const { tenant } = await assertManager();



  const rows = await prisma.assignmentAudit.findMany({

    where: { tenantId: tenant.id },

    orderBy: { createdAt: "desc" },

    take: limit,

  });



  const agentIds = [

    ...new Set(

      rows.flatMap((row) =>

        [row.actorAgentId, row.fromAgentId, row.toAgentId].filter(

          (id): id is string => Boolean(id),

        ),

      ),

    ),

  ];



  const agents = await prisma.agent.findMany({

    where: { id: { in: agentIds } },

    select: { id: true, firstName: true, lastName: true, email: true },

  });

  const agentName = new Map(

    agents.map((agent) => [

      agent.id,

      [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||

        agent.email ||

        "Danışman",

    ]),

  );



  return rows.map((row) => ({

    id: row.id,

    resourceType: row.resourceType,

    resourceId: row.resourceId,

    actorName: agentName.get(row.actorAgentId) ?? "—",

    fromName: row.fromAgentId ? (agentName.get(row.fromAgentId) ?? "—") : "—",

    toName: agentName.get(row.toAgentId) ?? "—",

    createdAt: row.createdAt.toISOString(),

  }));

}


